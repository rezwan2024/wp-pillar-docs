---
id: spa-architecture
title: "3.3 SPA Architecture"
sidebar_label: "• SPA Architecture"
sidebar_position: 3
---

## SPA Architecture Inside wp-admin

A plugin built on WP Pillar registers exactly one WordPress admin menu item. That menu item points to one PHP callback that outputs a single `<div>`:

```php
public function renderAdminPage(): void
{
    echo '<div id="myplugin-root"></div>';
}
```

The compiled JavaScript bundle mounts the entire Vue or React application into this `<div>`. From that point forward, all navigation, all rendering, all state management happens inside JavaScript. The PHP server is only contacted through the REST API.

This is what "SPA inside wp-admin" means: a single PHP page load, followed by a fully JavaScript-driven application. Every section of the plugin UI — dashboard, settings, data tables, forms — is a Vue or React component, not a separate PHP page.

```
Browser loads /wp-admin/admin.php?page=myplugin
    → WordPress calls renderAdminPage()
    → Outputs <div id="myplugin-root"></div>
    → WordPress enqueues compiled JS bundle
    → Vue/React mounts into #myplugin-root
    → All further navigation is hash-based (no page reloads)
    → Data fetches go to /wp-json/myplugin/v1/... REST endpoints
```
