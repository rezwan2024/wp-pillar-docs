---
id: why-i-built-it
title: "1.1 Why I Built It"
sidebar_label: "• Why I Built It"
sidebar_position: 1
---

## Why I Built It — The Problem With WordPress Plugin Development

WordPress has been around since 2003. Its plugin API was designed for a much simpler era of web development. The traditional way to build a WordPress plugin looks like this:

```php
// Traditional WordPress plugin — everything in one file
add_action('rest_api_init', function() {
    register_rest_route('myplugin/v1', '/items', [
        'methods'  => 'GET',
        'callback' => 'myplugin_get_items',
        'permission_callback' => function() {
            return current_user_can('manage_options');
        }
    ]);
});

function myplugin_get_items() {
    global $wpdb;
    $results = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}my_items");
    return rest_ensure_response($results);
}
```

This approach works for simple plugins. But it breaks down fast when your plugin grows. The problems are:

**No structure.** Functions are defined globally. There is no MVC separation. Business logic, database queries, and HTTP handling are mixed together. A 10,000-line plugin becomes impossible to navigate.

**`$wpdb` is painful.** WordPress's built-in database abstraction is procedural, requires raw SQL strings, has no query builder, has no model layer, and offers no protection against complex query mistakes. You write raw SQL in 2026 the same way you did in 2006.

**No dependency injection.** Classes cannot declare their dependencies cleanly. Everything is either a global function, a singleton called with a static method, or passed through function parameters. Testing is nearly impossible.

**No real REST routing.** `register_rest_route()` works, but you end up with dozens of individual route registrations, each with repeated permission and nonce logic. There is no concept of route groups, middleware, or a controller class.

**Repeated boilerplate.** Every plugin you build starts from scratch. Plugin header, autoloading, activation hooks, admin menu registration, asset enqueuing, REST route registration — written again every time.

**The technical challenge I wanted to solve was this:** Can you build WordPress plugins the same way modern PHP frameworks work — with a proper MVC pattern, a real query builder, clean routing, and dependency injection — while still respecting WordPress's hook system completely?

The answer is yes. PHP is PHP. The Illuminate packages that power Laravel's database layer, container, and events system are standalone Composer packages. They have no knowledge of or dependency on the Laravel framework itself. They run inside WordPress perfectly.

WP Pillar is the bridge that connects modern PHP development patterns to the WordPress plugin system — without fighting WordPress, replacing it, or breaking compatibility with anything else.
