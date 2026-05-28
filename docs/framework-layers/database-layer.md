---
id: database-layer
title: "2.2 Database Layer"
sidebar_label: "• Database Layer"
sidebar_position: 2
---

## Database Layer — Eloquent ORM

**Files:** `framework/src/Database/ORM.php`, `Model.php`, `Migration.php`

This is the most powerful part of WP Pillar and the biggest improvement over traditional WordPress plugin development.

**ORM.php** bootstraps Laravel's Eloquent ORM inside WordPress using the Illuminate Capsule Manager. It reads the WordPress database constants (`DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`) and the plugin's configured `db_prefix`, then sets up a full Eloquent connection. After this, you write database code identically to how you would in a Laravel application.

**The Eloquent bootstrap:**

```php
use Illuminate\Database\Capsule\Manager as Capsule;

$capsule = new Capsule;
$capsule->addConnection([
    'driver'    => 'mysql',
    'host'      => DB_HOST,
    'database'  => DB_NAME,
    'username'  => DB_USER,
    'password'  => DB_PASSWORD,
    'charset'   => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix'    => $config['db_prefix'],
]);
$capsule->setAsGlobal();
$capsule->bootEloquent();
```

**Model.php** is the base model class all plugin models extend. It extends Laravel's `Illuminate\Database\Eloquent\Model` directly. Plugin models inherit everything: `$fillable`, `$casts`, `$timestamps`, relationships (`hasMany`, `belongsTo`, `belongsToMany`), model events (`creating`, `created`, `updating`, `deleted`), scopes, and accessors.

**Example plugin model:**

```php
namespace MyPlugin\Models;

use WPPillar\Framework\Database\Model;

class Ticket extends Model
{
    protected $table = 'twai_tickets';
    
    protected $fillable = [
        'freescout_id', 'subject', 'status', 'agent_id', 'reply_count'
    ];
    
    protected $casts = [
        'created_at' => 'datetime',
        'resolved_at' => 'datetime',
        'is_resolved' => 'boolean',
    ];
    
    public function messages()
    {
        return $this->hasMany(Message::class);
    }
    
    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }
}
```

**Migration.php** provides the base migration class. Each plugin creates migration files extending this class, implementing `up()` to create tables and `down()` to drop them. Migrations use Eloquent's Schema Builder — the same API as Laravel migrations.

**Example migration:**

```php
namespace MyPlugin\Database\Migrations;

use WPPillar\Framework\Database\Migration;
use Illuminate\Database\Capsule\Manager as Capsule;

class CreateTicketsTable extends Migration
{
    public function up(): void
    {
        Capsule::schema()->create('twai_tickets', function($table) {
            $table->id();
            $table->string('freescout_id')->unique();
            $table->string('subject');
            $table->enum('status', ['open', 'pending', 'resolved'])->default('open');
            $table->unsignedBigInteger('agent_id')->nullable();
            $table->unsignedInteger('reply_count')->default(0);
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            $table->index('status');
            $table->index('agent_id');
        });
    }

    public function down(): void
    {
        Capsule::schema()->dropIfExists('twai_tickets');
    }
}
```

**Why no `$wpdb`?** `$wpdb` requires you to write raw SQL strings. Eloquent gives you a full query builder (`->where()`, `->orderBy()`, `->with()`, `->chunk()`), model events, and relationships. The productivity difference for anything beyond simple SELECT queries is significant. It also makes your code database-engine agnostic in principle, though WordPress requires MySQL in practice.

**Important:** `$wpdb` is still available for anything that genuinely needs it — for example, reading from WordPress core tables (`wp_users`, `wp_posts`) where Eloquent models do not exist. WP Pillar does not prevent this. It just means your plugin's own tables are always managed through Eloquent.
