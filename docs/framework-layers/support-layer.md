---
id: support-layer
title: "2.5 Support Layer"
sidebar_label: "• Support Layer"
sidebar_position: 5
---

## Support Layer

**Files:** `framework/src/Support/`, `framework/src/Console/Installer.php`, `framework/src/View/View.php`

**ServiceProvider.php** is the abstract base class for all plugin service providers. Service providers are where you wire everything together: `register()` runs first for every provider (bind things into the container — don't call WordPress hooks here, WordPress may not be ready yet), then `boot()` runs for every provider (add WordPress actions/filters, register routes, enqueue assets). Both are called automatically by `Application::register()` and `Application::boot()`.

**Config.php** is a standalone dot-notation config loader (distinct from `Application::getConfig()`, which reads the array you hand it via `setConfig()`). It can load multiple named config files from a directory and merge them under their filename as a top-level key:

```php
$config = new Config('/path/to/config');
$config->load('plugin');            // loads config/plugin.php
$config->get('plugin.name');        // reads $items['plugin']['name']
$config->get('plugin.db_prefix');   // reads $items['plugin']['db_prefix']
$config->set('plugin.version', '2.0.0');
$config->has('plugin.min_php');     // bool
```

**Str.php** provides pure-PHP string utility methods with no WordPress or Laravel dependency, so they're safe to call in any context (including unit tests):

```php
Str::slug('Hello World!');        // 'hello-world'
Str::studly('hello_world');       // 'HelloWorld'
Str::camel('foo-bar-baz');        // 'fooBarBaz'
Str::snake('HelloWorld');         // 'hello_world'
Str::limit('A long string...', 10); // truncates with a '...' suffix
Str::contains($haystack, $needle);
Str::startsWith($value, $prefix);
Str::endsWith($value, $suffix);
```

**View.php** is a minimal PHP template renderer for the rare case where server-side HTML rendering is needed (an admin page mount point, for example) — it throws if the template file doesn't exist and escapes output via `esc_html()` when running inside WordPress.

**Installer.php** (`framework/src/Console/Installer.php`) handles plugin lifecycle hooks. Unlike a plain `register_activation_hook()` callback, every method here takes your plugin's **slug** explicitly, so lifecycle state is tracked per plugin, never shared:

```php
register_activation_hook(__FILE__, static function () {
    require_once __DIR__ . '/boot/app.php';
    Installer::activate(wpillar_config('slug'), $migrations, $seeders);
});

register_deactivation_hook(__FILE__, static function () {
    Installer::deactivate();
});

// register_uninstall_hook() cannot accept a Closure — WordPress serializes
// the callback to the database, and PHP cannot serialize closures. Use a
// named static class method instead:
class YourPluginUninstaller
{
    public static function run(): void
    {
        require_once __DIR__ . '/vendor/autoload.php';
        require_once __DIR__ . '/boot/app.php';
        Installer::uninstall(wpillar_config('slug'), $migrations);
    }
}
register_uninstall_hook(__FILE__, ['YourPluginUninstaller', 'run']);
```

- **`activate($slug, $migrations, $seeders = [])`** — pins the ORM connection to this plugin's slug for the duration, runs only the migrations that haven't already run for this slug (tracked in `wp_options` as `{slug}_ran_migrations`), then runs only the seeders that haven't already run (tracked as `{slug}_ran_seeders`). If a migration fails partway through, everything already applied in this batch is rolled back automatically — see [Database Layer](./database-layer#migrationphp--safe-all-or-nothing-migrations).
- **`deactivate()`** — flushes rewrite rules so WordPress re-registers routes on next load. **Never drops any tables** — deactivating a plugin must never lose a user's data.
- **`uninstall($slug, $migrations)`** — drops plugin tables **only** when the user has explicitly opted in via a `{slug}_delete_data === 'yes'` option (typically a checkbox in your plugin's settings page); otherwise only the plugin's own `wp_options` entries are cleaned up and all data stays in the database. This method only ever runs when a user permanently deletes the plugin, never on a simple deactivate.

**helpers.php** provides a small set of globally available functions — thin, multi-plugin-safe wrappers, not a place to put real logic:

```php
wpillar_app(string $slug = ''): Application     // Application::getInstance($slug), or current() if $slug omitted
wpillar_config(string $slugOrKey, ?string $key = null, mixed $default = null): mixed
                                                 // two-arg form wpillar_config('my-plugin', 'db_prefix') is multi-plugin safe;
                                                 // one-arg legacy form wpillar_config('db_prefix') reads the most recently booted plugin
wpillar_response(): string                      // Response::class, for wpillar_response()::success([...])
wpillar_view(string $template, array $data = []): string  // renders a PHP template via View::render()
wpillar_db(): Capsule                           // the Eloquent Capsule manager (ORM::boot() must already have run)
wpillar_str(): string                           // Str::class, for wpillar_str()::slug('Hello World')
wpillar_request(\WP_REST_Request $wp_request): Request     // wraps a raw WP_REST_Request in the framework's Request object
```

**Prefer the two-argument `wpillar_config('my-plugin-slug', 'key')` form whenever there's any chance another WP Pillar plugin is active on the same site** — the one-argument legacy form is only guaranteed correct for whichever plugin booted most recently.
