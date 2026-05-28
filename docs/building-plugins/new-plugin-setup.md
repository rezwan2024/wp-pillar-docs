---
id: new-plugin-setup
title: "5.1 New Plugin Setup"
sidebar_label: "• New Plugin Setup"
sidebar_position: 1
---

## Building a New Plugin on WP Pillar

Once the WP Pillar framework is verified complete, follow these steps to start any new plugin:

**Step 1 — Copy the framework folder**

```bash
cp -r wp-pillar/framework/ my-new-plugin/framework/
```

**Step 2 — Create the plugin's Composer config**

Update `composer.json` in the new plugin root:
- Change the plugin name
- Update the PSR-4 namespace to match your plugin (e.g. `MyPlugin\\`)
- Keep the same Illuminate dependencies

**Step 3 — Create `config/plugin.php`**

```php
return [
    'name'           => 'My New Plugin',
    'slug'           => 'my-new-plugin',
    'version'        => '1.0.0',
    'text_domain'    => 'my-new-plugin',
    'db_prefix'      => 'mnp_',
    'rest_namespace' => 'my-new-plugin/v1',
    'min_php'        => '8.0',
    'min_wp'         => '6.0',
];
```

**Step 4 — Create `boot/app.php`**

```php
use WPPillar\Framework\Application;
use MyPlugin\Providers\AppServiceProvider;

$app = Application::getInstance();
$app->loadConfig(__DIR__ . '/../config/plugin.php');
$app->register(new AppServiceProvider($app));
$app->boot();
```

**Step 5 — Build `app/Providers/AppServiceProvider.php`**

```php
namespace MyPlugin\Providers;

use WPPillar\Framework\Support\ServiceProvider;
use WPPillar\Framework\Database\ORM;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        ORM::boot($this->app->getConfig('plugin'));
    }

    public function boot(): void
    {
        add_action('rest_api_init', [$this, 'registerRoutes']);
        add_action('admin_menu',   [$this, 'registerAdminMenu']);
        add_action('admin_enqueue_scripts', [$this, 'enqueueAssets']);
    }
}
```

**Step 6 — Delete example files, build real `app/` code**

Remove the example controller and model from the scaffold. Build your plugin's real controllers, models, services, and migrations.

**Step 7 — Run `composer install`**

```bash
cd my-new-plugin
composer install
```

**Step 8 — Build the frontend**

```bash
npm install
npm run dev   # development with hot reload
npm run build # production build
```

**Step 9 — Activate in WordPress**

Upload or symlink the plugin folder to `wp-content/plugins/`. Activate through the WordPress admin. The `Installer::activate()` method runs all migrations automatically.
