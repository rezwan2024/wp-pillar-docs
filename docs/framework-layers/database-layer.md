---
id: database-layer
title: "2.2 Database Layer"
sidebar_label: "• Database Layer"
sidebar_position: 2
---

## Database Layer — Eloquent ORM

**Files:** `framework/src/Database/ORM.php`, `Model.php`, `Migration.php`, `Seeder.php`

This is the most powerful part of WP Pillar and the biggest improvement over traditional WordPress plugin development.

### ORM.php — one shared connection manager, isolated per plugin

`ORM` bootstraps Laravel's Eloquent ORM inside WordPress using the Illuminate Capsule Manager. It reads the WordPress database constants (`DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`) and the plugin's configured `db_prefix`, then registers a **named connection** for that plugin. Call `ORM::boot($config)` once per plugin during initialization (`boot/app.php`).

```php
ORM::boot([
    'slug'            => 'invoice-manager',
    'db_prefix'       => 'invmgr_',
    'model_namespace' => 'InvoiceManager\\App\\Models',
]);
```

**Why a *named*, per-slug connection instead of one global connection:** Eloquent's connection resolver and "booted" flag live as shared static state on Illuminate's own base `Model` class — they are not naturally scoped per plugin. Early on, every WP Pillar plugin created its own `Capsule` and called `bootEloquent()` independently; whichever plugin booted *last* ended up owning that shared resolver for every plugin on the site, so every other plugin's models silently queried the last-booted plugin's tables (with two plugins active — `tw_` prefix and `wpn_` prefix — every query from the first plugin's models ended up hitting the second plugin's `wpn_*` tables instead, throwing `SQLSTATE[42S02]: Table not found`).

The fix, and how `ORM` behaves now:
- **One `Capsule` instance is created and `bootEloquent()` is called exactly once**, shared across every WP Pillar plugin active on the site.
- **Each plugin registers its own named connection**, keyed by its slug, on that shared Capsule — calling `ORM::boot()` again for a second plugin does not disturb the first plugin's connection.
- **Models resolve their own connection by matching their namespace** against a `model_namespace` map built from every `ORM::boot()` call (see `Model.php` below) — so a model always queries its own plugin's tables regardless of which plugin booted most recently.

**Key methods:**

```php
ORM::boot(array $config): void                       // Register this plugin's named connection (safe to call once per plugin)
ORM::schema(?string $slug = null): SchemaBuilder      // Schema builder for CREATE/ALTER/DROP TABLE
ORM::table(string $table, ?string $slug = null): QueryBuilder  // Query builder for a table, prefix applied automatically
ORM::connection(?string $slug = null): Connection     // The underlying Illuminate connection
ORM::resolveSlugForClass(string $class): ?string      // Given a model's FQCN, returns its plugin slug via longest namespace-prefix match
ORM::useSlug(?string $slug): void                     // Pin a slug for the next schema()/table()/connection() call with no explicit slug (used internally by Installer during activation/uninstall)
```

**Why `ORM::schema()` and never the raw `Capsule::schema()` facade:** `Illuminate\Database\Capsule\Manager::schema()` used without a slug resolves to a single `default` connection — which doesn't exist once multiple named per-plugin connections are registered on the shared Capsule. Migrations and any other DDL code must always go through `ORM::schema()`, which resolves the correct connection for the current plugin automatically.

### Model.php — auto-routed to the right connection

`Model` is the base Eloquent model class every plugin model extends. It extends Laravel's `Illuminate\Database\Eloquent\Model` directly, so plugin models inherit everything: `$fillable`, `$casts`, `$timestamps`, relationships (`hasMany`, `belongsTo`, `belongsToMany`), model events (`creating`, `created`, `updating`, `deleted`), scopes, and accessors.

The one thing `Model` overrides is `getConnectionName()` — this is what makes multi-plugin safety work transparently. Resolution order:

1. **Auto-routed by namespace** — if the model's own namespace matches a `model_namespace` registered via `ORM::boot()`, it resolves to that plugin's connection automatically. This is the normal case — as long as your models live under the `model_namespace` you configured, you never have to think about connections at all.
2. **An explicit `static::$ormSlug` override** — for a model that intentionally lives outside the configured `model_namespace`.
3. **`ORM::defaultSlug()`** — the most recently booted plugin, a safe fallback for simple single-plugin setups.

**Example plugin model:**

```php
namespace InvoiceManager\App\Models;

use YourPlugin\Framework\Database\Model;

class Invoice extends Model
{
    protected $table = 'invoices'; // becomes invmgr_invoices via db_prefix

    protected $fillable = [
        'invoice_number', 'amount', 'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'paid_at'    => 'datetime',
    ];

    public function scopeUnpaid($query)
    {
        return $query->where('status', 'unpaid');
    }
}
```

See [New Plugin Setup — Step 6](../building-plugins/new-plugin-setup#step-6--models) for the full explanation of when you'd still want a `BaseModel` with an explicit `$ormSlug`.

### Migration.php — safe, all-or-nothing migrations

`Migration` is the abstract base class every migration extends, implementing `up()` to create/alter tables and `down()` to reverse it. Migrations use Eloquent's Schema Builder via `ORM::schema()` — the same fluent API as Laravel migrations.

`Migration::run($migrations)` (called internally by `Installer::activate()`) wraps the whole batch in a try/catch: **if any migration in the batch fails, every migration that already completed in this same batch is rolled back automatically**, in reverse order, before the failure is re-thrown. Your database is never left half-migrated.

```php
namespace InvoiceManager\Database\Migrations;

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
            $table->enum('status', ['unpaid', 'paid'])->default('unpaid');
            $table->timestamps();
            $table->index('status');
        });
    }

    public function down(): void
    {
        ORM::schema()->dropIfExists('invoices');
    }
}
```

### Seeder.php — idempotent default data

`Seeder` is a small abstract base class with a single method to implement:

```php
abstract class Seeder
{
    abstract public function run(): void;
}
```

Seeders are passed to `Installer::activate()` as the third argument. The `Installer` tracks which seeder classes have already run per plugin slug (in `wp_options`), so **reactivating a plugin never re-runs a seeder that already inserted data** — protecting a user's changes to that data from being silently overwritten. See the [Support Layer](./support-layer) page for how `Installer` ties migrations and seeders together, and [New Plugin Setup — Step 7](../building-plugins/new-plugin-setup#step-7--migrations-and-seeders) for a full seeder example.

**Why no `$wpdb`?** `$wpdb` requires you to write raw SQL strings. Eloquent gives you a full query builder (`->where()`, `->orderBy()`, `->with()`, `->chunk()`), model events, and relationships. The productivity difference for anything beyond simple SELECT queries is significant.

**Important:** `$wpdb` is still available for anything that genuinely needs it — for example, reading from WordPress core tables (`wp_users`, `wp_posts`) where Eloquent models do not exist. WP Pillar does not prevent this. It just means your plugin's own tables are always managed through Eloquent.
