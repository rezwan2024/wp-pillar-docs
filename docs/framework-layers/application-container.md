---
id: application-container
title: "2.1 Application Container"
sidebar_label: "• Application Container"
sidebar_position: 1
---

## Application Container

**File:** `framework/src/Application.php`

The Application class is the heart of WP Pillar. It is a simple IoC (Inversion of Control) container that manages class bindings and the configuration store.

**Responsibilities:**
- Singleton instance management (`Application::getInstance()`)
- Binding class names to concrete implementations (`bind()`, `singleton()`)
- Resolving class instances from the container (`make()`)
- Loading and storing configuration from `config/` files
- Accessing config values with dot notation (`getConfig('plugin.name')`)
- Registering and booting service providers

**Key methods:**

```php
Application::getInstance(): static        // Get or create the singleton
$app->bind(string $abstract, $concrete)   // Register a binding
$app->singleton(string $abstract, $concrete) // Register a singleton binding
$app->make(string $abstract): mixed       // Resolve from container
$app->getConfig(string $key): mixed       // Get config value (dot notation)
$app->loadConfig(string $path): void      // Load a config file
$app->register(ServiceProvider $provider) // Register a service provider
$app->boot(): void                        // Boot all registered providers
```

**Usage in bootstrap:**

```php
// boot/app.php
$app = Application::getInstance();
$app->loadConfig(__DIR__ . '/../config/plugin.php');
$app->register(new AppServiceProvider($app));
$app->boot();
```

**Why a container?** In traditional WordPress plugins, classes are often instantiated directly wherever they are needed: `new MyService()`. This creates tight coupling — the calling code must know exactly which class to use and how to construct it. A container decouples this. You register what to use once, and everywhere else you just ask the container to give you an instance. This makes testing and swapping implementations easy.
