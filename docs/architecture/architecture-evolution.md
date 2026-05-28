---
id: architecture-evolution
title: "1.2 Architecture Evolution"
sidebar_label: "• Architecture Evolution"
sidebar_position: 2
---

## Architecture Evolution — Old Way vs New Way

Understanding what changed and why helps you build on WP Pillar correctly.

### The Old WordPress Plugin Architecture

```
my-plugin/
├── my-plugin.php          ← Everything starts here
├── includes/
│   ├── functions.php      ← Random helper functions
│   ├── admin.php          ← Admin page HTML mixed with PHP logic
│   └── ajax.php           ← AJAX handlers (pre-REST API era)
└── assets/
    ├── admin.js           ← Plain jQuery
    └── admin.css
```

**How it worked:**

- Plugin entry file hooks directly into WordPress actions
- Database queries use `$wpdb->get_results()` with raw SQL strings
- Admin pages are PHP files that echo HTML directly
- Frontend is jQuery DOM manipulation
- No composer, no autoloading, no namespacing
- All data flows through `$_POST` and `wp_ajax_` hooks

**Problems at scale:** When a plugin grows past a few hundred lines, this structure becomes unmanageable. There is no clear separation between what handles HTTP requests, what talks to the database, and what renders the UI. Adding a new feature means hunting through mixed files for where to put things.

### The WP Pillar Architecture (Current)

```
my-plugin/
├── my-plugin.php              ← Thin entry — loads framework, fires hooks
├── composer.json              ← Dependency management
├── framework/                 ← WP Pillar (copied in, not modified)
│   └── src/
│       ├── Application.php
│       ├── Database/
│       ├── Http/
│       ├── Auth/
│       ├── Support/
│       └── View/
├── app/                       ← Your plugin's real code
│   ├── Http/Controllers/      ← Request handlers
│   ├── Models/                ← Database models
│   ├── Services/              ← Business logic
│   └── Providers/             ← Bootstrap classes
├── config/
│   └── plugin.php             ← Plugin configuration
├── database/
│   └── migrations/            ← Table creation scripts
├── boot/
│   └── app.php                ← Bootstrap sequence
└── resources/
    └── js/                    ← Vue.js or React frontend
```

**How it works:**

- Plugin entry file is thin — it loads the autoloader, registers activation hooks, and fires `plugins_loaded` to boot the application
- `boot/app.php` creates the Application container, registers service providers, and boots them
- Service providers register routes, admin menus, and assets via WordPress hooks — but inside clean class methods
- Controllers handle REST API requests with proper separation of concerns
- Models use Eloquent ORM for all database operations — no raw SQL
- Frontend is a full Vue.js or React SPA mounted in the WordPress admin dashboard
- All communication between PHP and JavaScript happens through `wp_localize_script()` and the WordPress REST API

**The key insight:** WordPress hooks (`add_action`, `add_filter`) are still used everywhere inside WP Pillar. The framework does not replace them. It organises your code so that hook callbacks are clean, testable class methods instead of global functions.

---

## Full Folder Structure

```
wp-pillar/                                  ← Framework root (this gets copied as framework/)
│
├── composer.json                           ← Framework Composer config
│
└── src/
    ├── Application.php                     ← IoC container + bootstrap
    │
    ├── Database/
    │   ├── ORM.php                         ← Eloquent Capsule bootstrap
    │   ├── Model.php                       ← Base Eloquent model
    │   └── Migration.php                   ← Base migration class
    │
    ├── Http/
    │   ├── Router.php                      ← REST route registration + nonce
    │   ├── Request.php                     ← Incoming request wrapper
    │   ├── Response.php                    ← JSON response builder
    │   └── Controller.php                  ← Base controller
    │
    ├── Auth/
    │   └── Policy.php                      ← Permission base class
    │
    ├── Support/
    │   ├── ServiceProvider.php             ← Base service provider
    │   ├── Config.php                      ← Config file loader
    │   ├── Str.php                         ← String utilities
    │   ├── View.php                        ← Simple PHP template renderer
    │   ├── Installer.php                   ← Activation/deactivation/uninstall
    │   └── helpers.php                     ← Global helper functions
    │
    └── Console/
        └── Installer.php                   ← CLI installer (future use)


When used in a real plugin, the full structure looks like this:

my-plugin/
├── my-plugin.php                           ← Plugin entry point
├── composer.json                           ← Plugin Composer config
├── package.json                            ← Node/Vue/React dependencies
├── vite.config.js                          ← Vite build config
├── .gitignore
│
├── framework/                              ← WP Pillar (copied, never modified)
│   └── src/ (same as above)
│
├── app/
│   ├── Http/
│   │   ├── Controllers/                    ← Request handlers
│   │   └── Middleware/                     ← Optional middleware
│   ├── Models/                             ← Eloquent models
│   ├── Services/                           ← Business logic classes
│   └── Providers/
│       ├── AppServiceProvider.php          ← Main bootstrap
│       └── RouteServiceProvider.php        ← Route registration
│
├── config/
│   └── plugin.php                          ← Name, slug, version, db_prefix, etc.
│
├── database/
│   └── migrations/
│       └── create_example_table.php
│
├── boot/
│   └── app.php                             ← Application bootstrap sequence
│
└── resources/
    └── js/
        ├── main.js                         ← Vue/React entry point
        ├── App.vue (or App.jsx)
        ├── router/
        ├── store/
        └── components/
```

**Total framework files: 15 core files across 6 directories.**
**Total scaffold files (example plugin): 12 additional files.**
