---
id: composer-dependencies
title: "4.5 Composer Dependencies"
sidebar_label: "• Composer Dependencies"
sidebar_position: 5
---

## Composer Dependencies

WP Pillar uses three Composer packages from the Laravel Illuminate ecosystem. All are MIT licensed and compatible with GPL-2.0-or-later for WordPress.org submission.

| Package | Version | Purpose |
|---------|---------|---------|
| `illuminate/database` | ^10.0 | Eloquent ORM, Schema Builder, Query Builder |
| `illuminate/events` | ^10.0 | Model events dispatcher (fires `created`, `updated`, etc.) |
| `illuminate/container` | ^10.0 | IoC container for Eloquent's internal dependencies |

No other external dependencies. Everything else used by WP Pillar is either a PHP built-in or a WordPress built-in.

**Why these specific packages and not the full Laravel framework?**

The full Laravel framework is a complete web application stack — HTTP kernel, routing, session management, filesystem, queue, mail, caching, authentication, and more. Including all of that in a WordPress plugin would be redundant (WordPress already provides most of these) and would create conflicts.

The three Illuminate packages listed above are the database, events, and container components only. They are designed to be used standalone, outside of Laravel. They have been used successfully in WordPress plugins for years.

**Why version ^10.0?**

Illuminate 10.x requires PHP 8.1+. If you need PHP 8.0 compatibility, use ^9.0 instead (requires PHP 8.0). Choose based on your plugin's minimum PHP requirement.
