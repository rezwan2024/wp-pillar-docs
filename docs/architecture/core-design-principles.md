---
id: core-design-principles
title: "1.3 Core Design Principles"
sidebar_label: "• Core Design Principles"
sidebar_position: 3
---

## Core Design Principles

**1. WordPress first, always.**
WP Pillar does not fight WordPress. Every REST route is registered through `register_rest_route()`. Every admin page uses `add_menu_page()`. Activation, deactivation, and uninstall use WordPress's own hooks. The framework layers structure on top of WordPress, not instead of it.

**2. No global functions in plugin code.**
All plugin logic lives inside namespaced classes. Global functions are limited to the `helpers.php` file in the framework support layer, and even those are thin wrappers.

**3. The framework folder is never modified.**
The `framework/` folder is copied into every plugin unchanged. Any customisation happens in the `app/` folder. This means framework improvements can be shared across all plugins without conflicts.

**4. Eloquent for everything database-related.**
`$wpdb` is never used in plugin code. Eloquent's schema builder creates tables. Eloquent models query them. This gives you a real query builder, model events, relationships, and type-safe casts.

**5. Configuration over hardcoding.**
Database prefixes, REST namespaces, plugin slugs, version numbers — all live in `config/plugin.php`. Nothing is hardcoded in class files.

**6. Security by default.**
Nonce verification is built into the Router. Permission checks use the Policy class. PHP version checks are in the plugin entry file. These are not optional — they are part of the framework structure.
