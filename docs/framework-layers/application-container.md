---
id: application-container
title: "2.1 Application Container"
sidebar_label: "• Application Container"
sidebar_position: 1
---

## Application Container

**File:** `framework/src/Application.php`

The Application class is the heart of WP Pillar. It is a simple IoC (Inversion of Control) container that manages class bindings and the configuration store — **one isolated instance per plugin slug**, not a single shared singleton.

**Responsibilities:**
- Per-plugin instance management, keyed by slug (`Application::getInstance($slug)`)
- Binding factory closures to abstract names (`bind()`) and resolving them (`make()`)
- Storing and reading configuration with dot notation (`setConfig()`, `getConfig()`)
- Registering and booting service providers (`register()`, `boot()`)

**Key methods:**

```php
Application::getInstance(string $slug): static  // Get or create the instance for this plugin slug
Application::current(): static                  // Most recently accessed instance (used by global helpers)
$app->setConfig(array $config): void            // Replace the entire config array
$app->getConfig(?string $key = null): mixed     // Get a config value (dot notation), or the full array
$app->bind(string $abstract, callable $factory): void   // Register a binding
$app->make(string $abstract): mixed             // Resolve a binding — throws if none registered
$app->register(array $providerClasses): void    // Instantiate + register() a list of service providers
$app->boot(): void                              // Boot all registered providers (safe to call more than once — only runs once)
$app->isBooted(): bool                          // Whether boot() has already run
```

**Why per-slug instances, not a true singleton:** early versions of WP Pillar used a single shared `Application::getInstance()` with no arguments — a real singleton. That broke the moment two WP Pillar plugins were active on the same WordPress site: whichever plugin's `plugins_loaded` callback ran last would call `setConfig()` and silently overwrite the *other* plugin's config, admin menu slug, and boot state. The fix was to key instances by plugin slug (`private static array $instances`), so `Application::getInstance('invoice-manager')` and `Application::getInstance('ticketwise-ai')` are two entirely separate objects, each with its own config and boot state — even though both are (before you rename the namespace — see [New Plugin Setup](../building-plugins/new-plugin-setup#step-2--rename-the-framework-namespace)) technically the same PHP class.

**Usage in bootstrap:**

```php
// boot/app.php
$pluginConfig = require __DIR__ . '/../config/plugin.php';

$app = Application::getInstance($pluginConfig['slug']);

if ($app->isBooted()) {
    return $app;
}

$app->setConfig($pluginConfig);
$app->register([AppServiceProvider::class]);
$app->boot();
```

Note that `getInstance()` **requires** a slug argument — there is no no-argument legacy form. The global helper functions (`wpillar_app()`, `wpillar_config()`) fall back to `Application::current()`, which returns whichever instance was most recently accessed via `getInstance($slug)` — correct by default in a single-plugin setup, but inside a service provider you should always call `Application::getInstance($slug)` directly rather than relying on the global helpers, so your code is correct even if another WP Pillar plugin boots afterward.

**Why a container at all?** In traditional WordPress plugins, classes are often instantiated directly wherever they are needed: `new MyService()`. This creates tight coupling — the calling code must know exactly which class to use and how to construct it. A container decouples this: you register what to use once, and everywhere else you just ask the container to give you an instance. This makes testing and swapping implementations easy.
