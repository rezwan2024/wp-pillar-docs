---
id: new-plugin-setup
title: "5.1 New Plugin Setup"
sidebar_label: "• New Plugin Setup"
sidebar_position: 1
---

## Building a New Plugin on WP Pillar

This guide walks through **every step** needed to turn the WP Pillar scaffold into your own, fully independent WordPress plugin — in order, with the reasoning behind each step so you understand *why* it matters, not just *what* to type.

If you only remember one thing from this page: **you are not installing WP Pillar as a dependency — you are copying the whole scaffold and making it yours.** Every file in the scaffold repository, not just the `framework/` folder, is part of your new plugin.

:::tip Before you start
You'll need: **PHP 8.0+**, **Composer**, and **Node.js** (for the frontend build in Step 9). A local WordPress environment (LocalWP, Docker, etc.) is recommended for testing before you deploy anywhere.
:::

---

## Step 1 — Copy the scaffold

Clone the framework repository into your WordPress plugins folder, then detach it from the framework's own git history so you get a clean, independent repository for your plugin:

```bash
cd wp-content/plugins/
git clone https://github.com/rezwan2024/wp-pillar-framework your-plugin-name
cd your-plugin-name
rm -rf .git
git init
git remote remove origin 2>/dev/null || true
```

**What just happened:** you now have a full copy of the scaffold — `framework/`, `app/`, `boot/`, `config/`, `database/`, `composer.json`, everything — living as its own independent plugin with its own fresh git history. Nothing here is linked back to the WP Pillar framework repository anymore; from this point on, it's entirely your plugin's code to edit.

---

## Step 2 — Rename the framework namespace

**Do this immediately, before writing a single line of your own plugin code.** It takes a couple of minutes and prevents a very real, hard-to-debug bug later.

```bash
# Run from your new plugin's root
find . -name "*.php" ! -path "*/vendor/*" \
  -exec sed -i '' 's/WPPillar\\Framework/YourPlugin\\Framework/g' {} \;

sed -i '' 's/WPPillar\\\\Framework/YourPlugin\\\\Framework/g' composer.json

composer dump-autoload
```

Replace `YourPlugin` with a short PascalCase identifier for your plugin — for example, a plugin called "Invoice Manager" might use `InvoiceManager`. Every code sample on this page uses `YourPlugin\Framework\*` and `YourPlugin\App\*` — substitute your real namespace throughout as you copy from these examples.

**Why this matters, in plain terms:** the scaffold ships with the framework classes under the namespace `WPPillar\Framework\*`. In PHP, a namespace + class name uniquely identifies a class — if two different WordPress plugins on the same site both keep the default `WPPillar\Framework\*` namespace, PHP treats them as *the exact same classes*. That means static state (like which database connection is "current," or which plugin's config was loaded last) gets shared between two plugins that have nothing to do with each other. Whichever plugin's code runs last on WordPress's `plugins_loaded` hook can silently overwrite the other plugin's configuration or database connection — and the bug only shows up once a *second* WP Pillar plugin is active on the same site, which makes it very easy to miss during development and very confusing to debug in production.

Renaming the namespace makes your plugin's `Application` and `ORM` classes genuinely distinct PHP classes from any other WP Pillar plugin's classes — even if that other plugin is running the exact same framework code. This is cheap insurance: do it for every plugin you build on WP Pillar, even ones you're sure will never share a site with another WP Pillar plugin.

---

## Step 3 — Rename the plugin entry file and update plugin headers

WordPress convention is for a plugin's main PHP file to match its folder/slug name. Rename `plugin-entry.php`:

```bash
mv plugin-entry.php your-plugin-name.php
```

Then open it and update the header comment block plus the three plugin constants near the top:

```php
/**
 * Plugin Name:       Your Plugin Name
 * Plugin URI:        https://example.com
 * Description:       Your plugin's real description.
 * Version:           1.0.0
 * Requires at least: 6.0
 * Requires PHP:      8.0
 * Author:            Your Name
 * Author URI:        https://example.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       your-plugin-name
 * Domain Path:       /languages
 */

// ... further down in the same file ...

define('YOUR_PLUGIN_VERSION', '1.0.0');
define('YOUR_PLUGIN_PATH',    plugin_dir_path(__FILE__));
define('YOUR_PLUGIN_URL',     plugin_dir_url(__FILE__));
```

**Important detail easy to miss:** the `Text Domain` value in this header must match the `text_domain` key you'll set in `config/plugin.php` (Step 4) **exactly, character for character** — WordPress uses this value to load the correct translation files for your plugin.

While you're in here, also update `composer.json`'s package `name` field (e.g. `"your-name/your-plugin"`) if you haven't already touched it during Step 2's namespace rename.

---

## Step 4 — Configure `config/plugin.php`

This file is your plugin's identity card. Every other part of the framework reads from it — directly or through the `wpillar_config()` helper — so getting it right here saves you from hunting down hardcoded values later.

```php
<?php

declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit;
}

return [
    'name'            => 'Your Plugin Name',
    'slug'            => 'your-plugin-name',
    'version'         => '1.0.0',
    'db_prefix'       => 'yp_',
    'rest_namespace'  => 'your-plugin-name/v1',
    'text_domain'     => 'your-plugin-name',
    'model_namespace' => 'YourPlugin\\App\\Models',
    'min_php'         => '8.0',
    'min_wp'          => '6.0',
];
```

Here's what each field controls and what breaks if you get it wrong:

| Key | What it's for | If it collides with another plugin |
|---|---|---|
| `slug` | Used to build `wp_options` keys, the admin menu slug, and to track which migrations/seeders have already run for this plugin | Admin menus and stored settings can overwrite each other |
| `db_prefix` | Prepended to every table name your plugin creates | Table names collide — one plugin's table could clash with another's |
| `rest_namespace` | The base path for all your REST API routes | Your API routes could collide with another plugin's routes |
| `model_namespace` | The exact PHP namespace your Eloquent models live under | The ORM won't be able to auto-route your models to the right database connection (see Step 6) |
| `text_domain` | Must exactly match the `Text Domain` header in your plugin entry file (Step 3) | Translations silently fail to load |

**Rule of thumb:** pick a `slug` and `db_prefix` you're confident no other plugin on the same site — WP Pillar-based or not — would ever use. A longer, more specific prefix (`invmgr_` rather than `im_`) costs nothing and meaningfully reduces collision risk.

---

## Step 5 — `boot/app.php`: wire the framework to your plugin

This is the file that actually starts your plugin up: it loads your config, boots the database connection, and registers your service provider.

```php
<?php

declare(strict_types=1);

use YourPlugin\App\Providers\AppServiceProvider;
use YourPlugin\Framework\Application;
use YourPlugin\Framework\Database\ORM;

// Load config first so we can pass the slug to getInstance().
$pluginConfig = require __DIR__ . '/../config/plugin.php';

$app = Application::getInstance($pluginConfig['slug']);

// Guard against double-boot within a single request.
if ($app->isBooted()) {
    return $app;
}

$app->setConfig(array_merge($pluginConfig, [
    'plugin_path' => defined('YOUR_PLUGIN_PATH') ? YOUR_PLUGIN_PATH : dirname(__DIR__) . '/',
    'plugin_url'  => defined('YOUR_PLUGIN_URL')  ? YOUR_PLUGIN_URL  : '',
]));

// Bootstrap Eloquent ORM — uses WP DB constants + db_prefix from config.
ORM::boot($app->getConfig());

// Register and boot the application service provider.
$app->register([AppServiceProvider::class]);
$app->boot();

return $app;
```

Walking through what each line is actually doing:

- **`Application::getInstance($pluginConfig['slug'])`** — this always returns *your plugin's own, isolated* `Application` instance, keyed internally by your slug. Passing the slug (rather than calling it with no arguments) is what keeps this instance's config from ever being confused with another WP Pillar plugin's instance, even before you account for Step 2's namespace rename.
- **`if ($app->isBooted()) { return $app; }`** — WordPress can trigger this bootstrap file more than once per request in some setups. This guard makes sure your service providers and `ORM::boot()` only ever run once.
- **`ORM::boot($app->getConfig())`** — this is what actually connects Eloquent to your WordPress database, using WordPress's own `DB_HOST`/`DB_NAME`/`DB_USER`/`DB_PASSWORD` constants plus your `db_prefix`. It also registers your `model_namespace` internally so models can be auto-routed to the correct connection (Step 6).
- **`$app->register([AppServiceProvider::class])` then `$app->boot()`** — every service provider's `register()` method runs first (for binding things into the container), then every provider's `boot()` method runs (for adding WordPress hooks, registering routes, enqueuing scripts). This two-phase order means a provider's `boot()` can safely assume every provider has already finished registering.

This exact pattern works correctly whether your plugin ends up being the only WP Pillar plugin on a site, or one of several — `Application` and `ORM` already isolate everything by slug internally, and Step 2's namespace rename makes that isolation airtight at the PHP class level too.

---

## Step 6 — Models

Every plugin model extends the framework's base `Model` class:

```php
<?php
// app/Models/Invoice.php

declare(strict_types=1);

namespace YourPlugin\App\Models;

if (!defined('ABSPATH')) {
    exit;
}

use YourPlugin\Framework\Database\Model;

class Invoice extends Model
{
    protected $table    = 'invoices'; // ORM prepends your db_prefix automatically
    protected $fillable = ['invoice_number', 'amount'];
}
```

**How the ORM knows which database connection this model belongs to:** every model resolves its connection through `getConnectionName()`, which checks three things in order:

1. **Auto-routing by namespace** — if this model's namespace matches the `model_namespace` you set in `config/plugin.php` (Step 4), the ORM automatically routes it to your plugin's own named connection. For most plugins, this is all you need — as long as every model lives under the namespace you configured, everything just works with zero extra code.
2. **An explicit `$ormSlug` override** — for a model that, for whatever reason, lives *outside* your configured `model_namespace` (e.g. a shared model used by more than one part of a larger codebase), you can pin it explicitly:

   ```php
   abstract class BaseModel extends Model
   {
       protected static ?string $ormSlug = 'your-plugin-name';
   }
   ```

   Have that specific model extend `BaseModel` instead of `Model` directly.
3. **The most recently booted plugin** — the fallback for simple, single-plugin setups.

**Recommendation:** if every one of your models lives cleanly under `model_namespace`, you don't need a `BaseModel` at all — just extend `Model` directly, as in the example above. Only reach for the explicit `$ormSlug` override pattern for the rare model that lives outside that namespace.

---

## Step 7 — Migrations and seeders

### Migrations

Migrations extend `Migration` and **must use `ORM::schema()`**, never the raw `Illuminate\Database\Capsule\Manager` facade directly — the facade resolves to a `default` connection that doesn't exist once multiple named per-plugin connections are registered.

```php
<?php
// database/migrations/CreateInvoicesTable.php

declare(strict_types=1);

namespace YourPlugin\Database\Migrations;

if (!defined('ABSPATH')) {
    exit;
}

use Illuminate\Database\Schema\Blueprint;
use YourPlugin\Framework\Database\Migration;
use YourPlugin\Framework\Database\ORM;

class CreateInvoicesTable extends Migration
{
    public function up(): void
    {
        ORM::schema()->create('invoices', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('invoice_number')->unique();
            $table->decimal('amount', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        ORM::schema()->dropIfExists('invoices');
    }
}
```

### Seeders

Seeders extend `Seeder` and implement a single `run()` method:

```php
<?php
// database/seeders/DefaultDataSeeder.php

declare(strict_types=1);

namespace YourPlugin\Database\Seeders;

if (!defined('ABSPATH')) {
    exit;
}

use YourPlugin\Framework\Database\Seeder;
use YourPlugin\App\Models\Invoice;

class DefaultDataSeeder extends Seeder
{
    public function run(): void
    {
        Invoice::insertOrIgnore([
            'invoice_number' => 'SAMPLE-001',
            'amount'         => 0,
        ]);
    }
}
```

### Registering both — this is the step people forget

**Creating migration and seeder files does nothing on its own.** They only run once you list them in your plugin entry file and pass that list to the `Installer`:

```php
$migrations = [
    YourPlugin\Database\Migrations\CreateInvoicesTable::class,
];

register_activation_hook(__FILE__, static function () use ($migrations) {
    require_once __DIR__ . '/boot/app.php';
    Installer::activate('your-plugin-name', $migrations, [
        new YourPlugin\Database\Seeders\DefaultDataSeeder(),
    ]);
});
```

`Installer::activate()` tracks, per plugin slug, which migration classes and which seeder classes have already run (stored in `wp_options`). This gives you two guarantees for free:

- **Reactivating your plugin never fails with "table already exists."** Only migrations that haven't run yet are executed.
- **Reactivating your plugin never silently re-runs a seeder and overwrites data a user has since changed.** A seeder runs exactly once per plugin install, ever — unless you add a genuinely new seeder later, in which case only that new one runs.

### Gotcha: classmap autoloading

If your `composer.json` autoloads `database/migrations/` and `database/seeders/` via **classmap** rather than PSR-4 — which is how the scaffold ships by default:

```json
"autoload": {
    "psr-4": {
        "YourPlugin\\Framework\\": "framework/src/",
        "YourPlugin\\App\\": "app/"
    },
    "classmap": [
        "database/migrations/",
        "database/seeders/"
    ]
}
```

...remember that classmap entries are **baked into `vendor/composer/autoload_classmap.php` at build time** — unlike PSR-4, they are not resolved dynamically by scanning namespaces at runtime. If you add a new migration or seeder file and forget to regenerate the autoloader, activation will fail with `Class "...Seeder" not found` — even though the file exists on disk with the exact right namespace. This is a real bug that has bitten production plugins built on this framework.

**Rule:** every time you add a file under `database/migrations/` or `database/seeders/`, immediately run:

```bash
composer dump-autoload -o
```

and commit the regenerated `vendor/composer/autoload_classmap.php` / `autoload_static.php` alongside it.

### Gotcha: never deactivate/reactivate to push a schema change on a live site

`Installer::activate()` only runs migrations it hasn't seen before for that plugin slug — it will **not** re-run an existing migration just because you deactivated and reactivated the plugin. If you need to alter a table's structure on a live site, write and run the `ALTER TABLE` SQL directly, or add a genuinely new migration class and register it alongside the old ones. Deactivate/reactivate is not a schema-change mechanism, and treating it as one will silently do nothing.

---

## Step 8 — Controllers, Policies, and routes

The Router supports two ways to protect a route, and you can mix both across your plugin: a single `Policy` class-string (the simplest option, and a good default), or an array of `Middleware` classes for stacking multiple checks (rate limiting, audit logging, etc.) via `Router::group()`.

### A Policy

```php
<?php
// app/Http/Policies/AdminPolicy.php

declare(strict_types=1);

namespace YourPlugin\App\Http\Policies;

if (!defined('ABSPATH')) {
    exit;
}

use YourPlugin\Framework\Auth\Policy;

class AdminPolicy extends Policy
{
    public function authorize(string $capability = 'manage_options'): bool
    {
        return current_user_can('manage_options');
    }
}
```

### A Controller

```php
<?php
// app/Http/Controllers/InvoiceController.php

declare(strict_types=1);

namespace YourPlugin\App\Http\Controllers;

if (!defined('ABSPATH')) {
    exit;
}

use YourPlugin\Framework\Http\Controller;
use YourPlugin\Framework\Http\Request;
use YourPlugin\App\Models\Invoice;
use WP_REST_Response;

class InvoiceController extends Controller
{
    public function index(Request $request): WP_REST_Response
    {
        if (!current_user_can('manage_options')) {
            return new WP_REST_Response(['error' => 'Forbidden'], 403);
        }

        return new WP_REST_Response(Invoice::paginate(25)->toArray(), 200);
    }

    public function store(Request $request): WP_REST_Response
    {
        if (!current_user_can('manage_options')) {
            return new WP_REST_Response(['error' => 'Forbidden'], 403);
        }

        $invoice = Invoice::create([
            'invoice_number' => sanitize_text_field($request->input('invoice_number')),
            'amount'         => (float) $request->input('amount', 0),
        ]);

        return new WP_REST_Response($invoice->toArray(), 201);
    }
}
```

**Notice that `index()` and `store()` both call `current_user_can()` directly, even though `AdminPolicy` already enforces it at the route level.** This is intentional — defense in depth. Never rely on the router's policy check alone; check permissions again inside the controller method itself.

### Routes

```php
<?php
// app/Http/Routes/api.php

declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit;
}

use YourPlugin\App\Http\Policies\AdminPolicy;
use YourPlugin\Framework\Http\Router;

$router = new Router('your-plugin-name/v1', 'YourPlugin\\App\\Http\\Controllers\\');

$router->get('/invoices',  'InvoiceController@index', AdminPolicy::class);
$router->post('/invoices', 'InvoiceController@store',  AdminPolicy::class);
```

Every route registered this way automatically has WordPress's nonce verification applied — a request with a missing or invalid `X-WP-Nonce` header is rejected with a 403 before your controller code ever runs.

### Grouping routes with middleware

For a set of routes that need the same prefix and/or the same stack of middleware checks:

```php
$router->group(['prefix' => '/admin', 'middleware' => [AuditLogMiddleware::class]], function (Router $router) {
    $router->get('/settings', 'SettingsController@index', AdminPolicy::class);
});
```

Groups can be nested — prefixes concatenate and middleware stacks merge from the outside in.

### Public (unauthenticated) routes

If a route genuinely needs to be reachable without a logged-in WordPress user and without a nonce — a public webhook endpoint, for example — use the `public*` route methods instead of the normal ones:

```php
$router->publicGet('/feed', 'FeedController@index');
$router->publicPost('/webhook', 'WebhookController@handle');
```

These skip nonce verification entirely. Use them sparingly, and put your own authentication (a shared secret, signature verification, etc.) inside the controller or a `Middleware` class when you do.

---

## Step 9 — Install and activate

```bash
composer install
```

Then build your frontend — WP Pillar itself ships no JavaScript; the Vue or React stack in `resources/js/` (Vue 3 + Vite is the pattern used by the framework's own example and production plugins) is entirely your plugin's responsibility:

```bash
npm install
npm run dev   # development, with hot reload
npm run build # production build
```

Finally, activate the plugin from the WordPress admin like any other plugin. `Installer::activate()` runs on activation and applies every migration and seeder you registered in Step 7.

---

## Updating the framework later

Because you copied this scaffold in rather than installing it as a Composer package, a fix or new feature pushed to the [wp-pillar-framework](https://github.com/rezwan2024/wp-pillar-framework) repository later doesn't automatically reach plugins you've already built. Each plugin needs to pull the update manually. The scaffold ships with `bin/update-framework.sh` to automate that:

```bash
bash bin/update-framework.sh          # pulls framework/ from main
bash bin/update-framework.sh v1.2     # or pull a specific tag/branch
```

Here's exactly what it does:

1. Detects your plugin's renamed namespace by reading it back out of `framework/src/Application.php` — this is why Step 2's rename has to have already happened before you can run this script.
2. Backs up your current `framework/` folder to `framework.backup.<timestamp>/`.
3. Downloads the requested branch or tag of the framework repository and replaces `framework/` with its fresh copy.
4. Reapplies your namespace rename automatically to the newly pulled files.
5. Regenerates the Composer autoloader.

It **never touches** `app/`, `boot/`, `config/`, `database/`, or your plugin entry file — only `framework/` is ever replaced, and nothing is committed to git for you.

**This is a manual, per-plugin step, not an auto-update.** After running it: review the diff (`diff -rq framework.backup.<timestamp> framework`), test the plugin — at minimum activate/deactivate it on a staging site — then commit, and delete the backup folder once you're satisfied.

---

## Checklist — what makes a plugin actually independent

Before calling a WP Pillar plugin done, run through this list:

| What | Where | Effect if skipped |
|---|---|---|
| Unique `slug` | `config/plugin.php` | Admin menu / `wp_options` keys collide with another plugin |
| Unique `db_prefix` | `config/plugin.php` | Table name collisions |
| Renamed `YourPlugin\Framework\*` namespace | Step 2 | Two plugins share the same PHP class; whichever loads last on `plugins_loaded` can corrupt the other's config/connection |
| `Application::getInstance($slug)` passed a slug, always | Step 5 | Passing no slug resolves to whichever plugin booted most recently — never safe once a second WP Pillar plugin is active |
| `model_namespace` set correctly in config | Step 4 & 6 | Models won't auto-route to your plugin's own DB connection |
| Every migration and seeder registered in the entry file's lists | Step 7 | `Installer` only runs what's listed — creating the file alone does nothing |
| `composer dump-autoload -o` after adding any migration/seeder file | Step 7 | `Class "...Seeder" not found` on activation, even though the file exists |
| `if (!defined('ABSPATH')) { exit; }` at the top of every PHP file | everywhere | Blocks direct file access if someone requests the file's URL directly |
| `current_user_can()` check inside every controller method, not just the route Policy | Step 8 | Defense in depth — don't rely on router middleware alone |
| Never deactivate/reactivate to push a schema change on a live site | Step 7 | Deactivate/reactivate is not idempotent for schema changes — write the `ALTER TABLE` directly instead |

---

## Repository structure

```
my-plugin/                        ← Your plugin root
├── framework/                    ← WP Pillar core (never edit this)
│   └── src/
│       ├── Application.php
│       ├── Database/
│       │   ├── ORM.php
│       │   ├── Model.php
│       │   ├── Migration.php
│       │   └── Seeder.php
│       ├── Http/
│       │   ├── Router.php
│       │   ├── Middleware.php
│       │   ├── Request.php
│       │   ├── Response.php
│       │   └── Controller.php
│       ├── Auth/
│       │   └── Policy.php
│       ├── Console/
│       │   └── Installer.php
│       └── Support/
│           ├── ServiceProvider.php
│           ├── Config.php
│           ├── Str.php
│           └── helpers.php
├── app/                          ← Your plugin logic
│   ├── Providers/AppServiceProvider.php
│   ├── Models/
│   ├── Http/Controllers/
│   ├── Http/Policies/            (or Http/Middleware/)
│   └── Http/Routes/api.php
├── bin/
│   └── update-framework.sh       ← Pulls framework/ updates from the source repo later
├── boot/                         ← Bootstrap — wires framework to your plugin
├── config/                       ← Plugin configuration
├── database/
│   ├── migrations/
│   └── seeders/
├── resources/js/                 ← Vue 3 + Vite frontend (you build this)
├── composer.json                 ← Autoloading + dependencies
└── your-plugin-name.php          ← WordPress plugin entry point
```

> **Rule:** Never edit anything inside `framework/`. All your plugin code lives in `app/`, `boot/`, `config/`, and `database/`.
