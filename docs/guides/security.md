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

### PHP and WordPress Version Checks

The plugin entry file must check PHP and WordPress version requirements before loading anything. If requirements are not met, the plugin shows an admin notice and exits cleanly instead of triggering fatal errors.

```php
// my-plugin.php
defined('ABSPATH') || exit;

if (version_compare(PHP_VERSION, '8.0', '<')) {
    add_action('admin_notices', function() {
        echo '<div class="error"><p>My Plugin requires PHP 8.0 or higher.</p></div>';
    });
    return;
}

if (version_compare(get_bloginfo('version'), '6.0', '<')) {
    add_action('admin_notices', function() {
        echo '<div class="error"><p>My Plugin requires WordPress 6.0 or higher.</p></div>';
    });
    return;
}

require_once __DIR__ . '/vendor/autoload.php';
```

### Safe Uninstall

The `Installer::uninstall()` method runs when a user **permanently deletes** the plugin from WordPress — not on deactivation. Users who deactivate a plugin temporarily must never lose their data.

**WordPress best practice — give users a choice.**

Silently deleting all plugin data on uninstall is not recommended. The correct pattern is to let users decide whether they want to remove their data. WP Pillar plugins implement this through a plugin setting:

```php
// In plugin settings: "Delete all plugin data on uninstall?" checkbox
// Stored as: update_option('myplugin_delete_data_on_uninstall', true/false)
```

When a user deletes the plugin from WordPress, the `uninstall()` method checks this preference:

```php
public static function uninstall(): void
{
    if (!defined('WP_UNINSTALL_PLUGIN')) {
        return;
    }

    // Only delete data if the user explicitly opted in
    $delete_data = get_option('myplugin_delete_data_on_uninstall', false);

    if ($delete_data) {
        // Drop all plugin tables
        Migration::rollback(self::$migrations);
        // Delete all plugin options
        delete_option('myplugin_settings');
        delete_option('myplugin_version');
        delete_option('myplugin_delete_data_on_uninstall');
        // Delete scheduled cron jobs
        wp_clear_scheduled_hook('myplugin_daily_sync');
    }
    // If $delete_data is false: plugin is deleted but data stays in the database.
    // The user can reinstall the plugin later and all their data will still be there.
}
```

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

- [ ] All REST routes registered through WP Pillar Router (nonce auto-verified)
- [ ] Every controller has a Policy assigned
- [ ] PHP 8.0+ check in plugin entry file
- [ ] WordPress 6.0+ check in plugin entry file
- [ ] `defined('ABSPATH') || exit` at top of all PHP files
- [ ] All user input sanitised before use (`sanitize_text_field()`, `absint()`, `wp_kses()`)
- [ ] All database output escaped before display (`esc_html()`, `esc_attr()`)
- [ ] Uninstall hook only runs when `WP_UNINSTALL_PLUGIN` is defined
- [ ] No sensitive data stored in JavaScript (API keys, passwords)
- [ ] All frontend strings go through `wp_localize_script()` — no PHP echoed directly into JS
