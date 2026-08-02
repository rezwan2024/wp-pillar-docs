---
id: auth-layer
title: "2.4 Auth Layer"
sidebar_label: "• Auth Layer"
sidebar_position: 4
---

## Auth Layer — Policy and Middleware

**Files:** `framework/src/Auth/Policy.php`, `framework/src/Http/Middleware.php`

### Policy.php

`Policy` is the framework's permission system, and the simplest way to protect a route. Pass a `Policy` class-string as the third argument to any `Router` route method; if `authorize()` returns `false`, the Router returns a 403 before the controller method ever runs.

```php
namespace InvoiceManager\App\Http\Policies;

use YourPlugin\Framework\Auth\Policy;

class AdminPolicy extends Policy
{
    public function authorize(string $capability = 'manage_options'): bool
    {
        return current_user_can('manage_options');
    }
}
```

The base `Policy` class itself ships three ready-to-use methods, so a simple capability check often needs no subclass at all:

```php
$policy->authorize('manage_options'): bool                 // simple true/false check
$policy->authorizeOrFail('manage_options'): bool|WP_Error   // returns a descriptive 403 WP_Error on failure
$policy->permissionCallback('manage_options'): callable     // wraps authorize() as a REST permission_callback
Policy::check('manage_options'): bool                       // static one-off check, no instance needed
```

**Security guarantee:** no method on `Policy` ever returns `true` unconditionally — every check calls WordPress's own `current_user_can()` at minimum. If you extend `Policy` and override `authorize()`, keep that guarantee: never return a bare `true` without checking the current user's capability first.

### Middleware.php

`Middleware` is for anything a single `authorize(): bool` can't express cleanly — stacking multiple independent checks (rate limiting, audit logging, a role check *and* an ownership check) on a route or a whole `Router::group()`.

```php
namespace InvoiceManager\App\Http\Middleware;

use YourPlugin\Framework\Http\Middleware;
use WP_Error;
use WP_REST_Request;

class AuditLogMiddleware extends Middleware
{
    public function handle(WP_REST_Request $request, callable $next): bool|WP_Error
    {
        error_log('Invoice API request: ' . $request->get_route());

        return $next($request); // continue to the next middleware / the terminal auth check
    }
}
```

Attach an array of Middleware classes as the third argument to a route, or to an entire `Router::group()` — see [HTTP Layer](./http-layer#routerphp) for the full pipeline mechanics. Policies and Middleware are not mutually exclusive across a plugin: use a plain `Policy` class-string for most routes, and reach for `Middleware` only where you genuinely need to stack more than one check.

**Why have both, rather than just Middleware everywhere?** A single `Policy` class-string is the simplest thing that works for the overwhelmingly common case — "does this user have this capability." `Middleware` exists for the less common case where a route needs more than one independent check chained together. Keeping both means simple routes stay simple, and only routes that genuinely need a pipeline pay for one.

**Why not just use `current_user_can()` directly in controllers and skip Policy/Middleware entirely?** You could, and in fact every controller method *should still* call `current_user_can()` directly as well (see [HTTP Layer](./http-layer#controllerphp) — defense in depth). But centralizing the primary permission logic in Policy or Middleware classes means: one place to update when permissions change, easy to test in isolation, and a consistent pattern across all endpoints that any developer on the team can follow.
