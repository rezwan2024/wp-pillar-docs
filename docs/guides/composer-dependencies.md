---
id: composer-dependencies
title: "4.5 Composer Dependencies"
sidebar_label: "• Composer Dependencies"
sidebar_position: 5
---

## Composer Dependencies

WP Pillar uses four Composer packages from the Laravel Illuminate ecosystem. All are MIT licensed and compatible with GPL-2.0-or-later for WordPress.org submission.

| Package | Version | Purpose |
|---------|---------|---------|
| `illuminate/database` | ^10.0 | Eloquent ORM, Schema Builder, Query Builder |
| `illuminate/events` | ^10.0 | Model events dispatcher (fires `created`, `updated`, etc.) |
| `illuminate/container` | ^10.0 | IoC container for Eloquent's internal dependencies |
| `illuminate/pagination` | ^10.0 | Powers `Model::paginate()` and `Response::paginated()` |

No other external dependencies. Everything else used by WP Pillar is either a PHP built-in or a WordPress built-in.

:::warning List `illuminate/pagination` explicitly
`illuminate/database` uses `illuminate/pagination` internally for `->paginate()`, but does **not** reliably pull it in as a transitive dependency in every Composer resolution. If it's missing from your `composer.json`, calling `->paginate()` anywhere (including inside `Response::paginated()`) fails at runtime with `Class "Illuminate\Pagination\Paginator" not found` — a real error that has shown up in production. Always list all four packages explicitly, exactly as shown in the table above.
:::

**Why these specific packages and not the full Laravel framework?**

The full Laravel framework is a complete web application stack — HTTP kernel, routing, session management, filesystem, queue, mail, caching, authentication, and more. Including all of that in a WordPress plugin would be redundant (WordPress already provides most of these) and would create conflicts.

The four Illuminate packages listed above are the database, events, container, and pagination components only. They are designed to be used standalone, outside of Laravel. They have been used successfully in WordPress plugins for years.

**Why version ^10.0?**

Illuminate 10.x requires PHP 8.1+. If you need PHP 8.0 compatibility, use ^9.0 instead for all four packages (also requires PHP 8.0). Choose based on your plugin's minimum PHP requirement — set consistently in `min_php` in `config/plugin.php` and in the `Requires PHP` header of your plugin entry file.
