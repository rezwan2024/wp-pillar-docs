---
id: support-layer
title: "2.5 Support Layer"
sidebar_label: "• Support Layer"
sidebar_position: 5
---

## Support Layer

**Files:** `framework/src/Support/`

**ServiceProvider.php** is the base class for all plugin service providers. Service providers are where you wire everything together. They have two methods: `register()` (bind things to the container) and `boot()` (register WordPress hooks, add routes, enqueue assets). Both are called by the Application at startup.

**Config.php** loads PHP config files and provides dot-notation access:

```php
// config/plugin.php returns an array
$config->get('plugin.name');        // 'My Plugin'
$config->get('plugin.db_prefix');   // 'mp_'
$config->get('plugin.version');     // '1.0.0'
```

**Str.php** provides string utility methods commonly needed in plugin development: `slug()`, `studly()`, `camel()`, `snake()`, `truncate()`.

**View.php** is a minimal PHP template renderer for the rare case where server-side HTML rendering is needed (the admin page mount point, for example).

**Installer.php** handles plugin lifecycle hooks:

```php
register_activation_hook(__FILE__,   [Installer::class, 'activate']);
register_deactivation_hook(__FILE__, [Installer::class, 'deactivate']);
register_uninstall_hook(__FILE__,    [Installer::class, 'uninstall']);
```

`activate()` runs all database migrations. `deactivate()` flushes rewrite rules. `uninstall()` drops all plugin tables and removes all plugin options — this is called only when the user explicitly deletes the plugin from WordPress, not on deactivation.

**helpers.php** provides a small set of globally available functions:

```php
wppillar_app(): Application           // Get the application container
wppillar_config(string $key): mixed   // Get a config value
wppillar_request(): Request           // Get the current request
```
