---
id: security
title: "4.1 Security"
sidebar_label: "• Security"
sidebar_position: 1
---

## Security

Security in WP Pillar is not optional. The framework enforces several security patterns at the architectural level.

### Nonce Verification

Every REST API request made by a WP Pillar plugin frontend must include a WordPress nonce. The nonce is generated in PHP at page load, passed to JavaScript via `wp_localize_script()`, and attached to every API request as the `X-WP-Nonce` header.

The Router automatically verifies this nonce for every route it registers. If the nonce is missing or invalid, the request is rejected with a 403 before reaching any controller code.

```php
// Router.php — built-in nonce check (happens automatically for every route)
'permission_callback' => function(WP_REST_Request $request) {
    $nonce = $request->get_header('X-WP-Nonce');
    if (!$nonce || !wp_verify_nonce($nonce, 'wp_rest')) {
        return new WP_Error('rest_forbidden', 'Invalid nonce', ['status' => 403]);
    }
    return $this->policy ? $this->policy->authorize() : true;
}
```

**Why nonces matter:** Without nonce verification, any website can make requests to your plugin's REST endpoints while a logged-in admin is browsing. Nonces tie each request to a specific user session and time window (10 hours by default in WordPress).

### Permission Policies

Nonces confirm the request is legitimate. Policies confirm the user has permission to perform the action.

Every controller should declare a policy. The Policy base class provides `authorize()` which returns a boolean. The framework calls this automatically.

```php
class AdminPolicy extends Policy
{
    public function authorize(): bool
    {
        return current_user_can('manage_options');
    }
}

class EditorPolicy extends Policy
{
    public function authorize(): bool
    {
        return current_user_can('edit_posts');
    }
}
```

Policies can also receive the Request object to make context-aware decisions:

```php
public function authorize(): bool
{
    $user_id = get_current_user_id();
    $item_owner = $this->request->get_param('owner_id');
    return current_user_can('manage_options') || $user_id === (int)$item_owner;
}
```

### PHP, WordPress Version, and Multisite Checks

The plugin entry file runs three checks, **in this exact order**, before anything else loads:

1. **PHP version** — must be checked *first*, before any other code path, because a WordPress function call on an incompatible PHP version can itself trigger a fatal error rather than a clean admin notice.
2. **WordPress version.**
3. **Multisite** — WP Pillar v1.x does not support multisite. Rather than silently running in an unsupported configuration, the scaffold detects `is_multisite()` and deactivates itself with an explanatory notice.

```php
// your-plugin-name.php
defined('ABSPATH') || exit;

// 1 — PHP version check, must be first.
if (version_compare(PHP_VERSION, '8.0', '<')) {
    add_action('admin_notices', static function () {
        echo '<div class="notice notice-error"><p>';
        printf(
            '<strong>Your Plugin</strong> requires PHP 8.0 or higher. Your server is running PHP %s.',
            esc_html(PHP_VERSION)
        );
        echo '</p></div>';
    });
    return;
}

// 2 — WordPress version check.
if (function_exists('get_bloginfo') && version_compare(get_bloginfo('version'), '6.0', '<')) {
    add_action('admin_notices', static function () {
        echo '<div class="notice notice-error"><p><strong>Your Plugin</strong> requires WordPress 6.0 or higher.</p></div>';
    });
    return;
}

// 3 — Multisite is not supported; deactivate rather than run in an unsupported state.
if (function_exists('is_multisite') && is_multisite()) {
    add_action('admin_notices', static function () {
        echo '<div class="notice notice-error"><p><strong>Your Plugin</strong> does not support WordPress Multisite.</p></div>';
    });
    if (function_exists('deactivate_plugins')) {
        deactivate_plugins(plugin_basename(__FILE__));
    }
    return;
}

require_once __DIR__ . '/vendor/autoload.php';
```

Every WP Pillar plugin also defines three constants right after these checks — `{PLUGIN}_VERSION`, `{PLUGIN}_PATH`, `{PLUGIN}_URL` — so addon plugins can detect the dependency and its version before hooking in.

### The uninstall hook must never be a closure

`register_uninstall_hook()` serializes its callback into a WordPress option so it can run in a separate, later request — and **PHP cannot serialize a `Closure`**. Passing one causes a fatal error (`Serialization of 'Closure' is not allowed`) the moment the plugin is deleted. Use a named static class method instead:

```php
class YourPluginUninstaller
{
    public static function run(): void
    {
        require_once __DIR__ . '/vendor/autoload.php';
        require_once __DIR__ . '/boot/app.php';
        \YourPlugin\Framework\Console\Installer::uninstall(wpillar_config('slug'), $migrations);
    }
}

register_uninstall_hook(__FILE__, ['YourPluginUninstaller', 'run']);
```

**Rule for every plugin built on WP Pillar:** `register_activation_hook()` and `register_deactivation_hook()` can use closures safely (they run in the same request, never serialized) — but `register_uninstall_hook()` must always use the `['ClassName', 'method']` array form.

### Safe Uninstall

`Installer::uninstall($slug, $migrations)` runs when a user **permanently deletes** the plugin from WordPress — not on deactivation. Users who deactivate a plugin temporarily must never lose their data. It:

- Drops plugin tables **only** if the `{slug}_delete_data` option is exactly the string `'yes'`.
- Always cleans up the plugin's own `wp_options` entries (`{slug}_delete_data`, `{slug}_installed_at`, `{slug}_ran_migrations`, `{slug}_ran_seeders`) regardless of that choice.

**WordPress best practice — give users a choice.**

Silently deleting all plugin data on uninstall is not recommended. The correct pattern is to let users decide whether they want to remove their data through a plugin setting:

```php
// In plugin settings: "Delete all plugin data on uninstall?" checkbox
// Stored as: update_option('your-plugin-name_delete_data', 'yes' or 'no')
```

Calling `Installer::uninstall()` from your named uninstaller class (see above) is all that's needed — the framework handles checking that option and cleaning up correctly:

```php
class YourPluginUninstaller
{
    public static function run(): void
    {
        require_once __DIR__ . '/vendor/autoload.php';
        require_once __DIR__ . '/boot/app.php';

        Installer::uninstall(wpillar_config('slug'), [
            YourPlugin\Database\Migrations\CreateInvoicesTable::class,
        ]);

        // Anything the framework doesn't know about — your own custom
        // options, scheduled cron jobs — clean up here too, guarded by
        // the same "delete data" preference:
        if (get_option('your-plugin-name_delete_data') === 'yes') {
            wp_clear_scheduled_hook('your-plugin-name_daily_sync');
        }
    }
}
```

If the user never opted in: the plugin is deleted but every table and setting stays in the database, and reinstalling the plugin later restores full access to that data.

**What data can be cleaned on uninstall (when opted in):**

- All custom plugin database tables (`DROP TABLE IF EXISTS`)
- All plugin entries in `wp_options`
- All plugin-specific user meta in `wp_usermeta`
- Any scheduled cron events registered by the plugin

**What must never be deleted:** WordPress core data, posts, users, or any data not created by this plugin.

:::tip
Show the "Delete data on uninstall" option prominently in your plugin's settings page. A good label is: **"Remove all plugin data when deleting"** with a clear warning note underneath: *"Warning: this cannot be undone. All your plugin data will be permanently deleted."*
:::

### Security Checklist

Before declaring a plugin built on WP Pillar production-ready, verify all of the following:

- [ ] All REST routes registered through WP Pillar Router (nonce auto-verified, unless deliberately `public*`)
- [ ] Every controller method also checks `current_user_can()` directly, not just the route Policy
- [ ] PHP version check is the *first* thing the plugin entry file does
- [ ] WordPress version check follows the PHP check
- [ ] Multisite check (`is_multisite()`) deactivates the plugin with a clear notice rather than running unsupported
- [ ] `register_uninstall_hook()` uses a named static class method, never a closure
- [ ] `defined('ABSPATH') || exit` at top of all PHP files
- [ ] All user input sanitised before use (`sanitize_text_field()`, `absint()`, `wp_kses()`)
- [ ] All database output escaped before display (`esc_html()`, `esc_attr()`)
- [ ] Uninstall only drops tables when the user has explicitly opted in (`{slug}_delete_data === 'yes'`)
- [ ] No sensitive data stored in JavaScript (API keys, passwords)
- [ ] All frontend strings go through `wp_localize_script()` — no PHP echoed directly into JS
