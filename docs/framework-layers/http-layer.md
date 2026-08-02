---
id: http-layer
title: "2.3 HTTP Layer"
sidebar_label: "• HTTP Layer"
sidebar_position: 3
---

## HTTP Layer

**Files:** `framework/src/Http/Router.php`, `Middleware.php`, `Request.php`, `Response.php`, `ValidationException.php`, `Controller.php`

### Router.php

`Router` wraps WordPress's `register_rest_route()` in Laravel-style syntax:

```php
// app/Http/Routes/api.php
$router = new Router('invoice-manager/v1', 'InvoiceManager\\App\\Http\\Controllers\\');

$router->get('/invoices',                'InvoiceController@index',  AdminPolicy::class);
$router->post('/invoices',               'InvoiceController@store',  AdminPolicy::class);
$router->get('/invoices/(?P<id>\d+)',    'InvoiceController@show',   AdminPolicy::class);
$router->put('/invoices/(?P<id>\d+)',    'InvoiceController@update', AdminPolicy::class);
$router->delete('/invoices/(?P<id>\d+)', 'InvoiceController@destroy',AdminPolicy::class);
```

**Every authenticated route registered through the Router automatically verifies the WordPress nonce** sent in the `X-WP-Nonce` header — a request with a missing or invalid nonce is rejected with a 403 before the controller is ever called.

The third argument to any route method accepts one of two forms:

- **A `Policy` class-string** (as above) — simplest option, and a good default for most routes. `authorize()` is called directly.
- **An array of `Middleware` class-strings** — for stacking multiple checks (rate limiting, audit logging, role checks) as a pipeline.

**Middleware pipeline and `group()`:**

```php
$router->group(['prefix' => '/admin', 'middleware' => [AuditLogMiddleware::class]], function (Router $router) {
    $router->get('/settings', 'SettingsController@index', AdminPolicy::class);
});
```

`group()` stacks a URL prefix and/or a middleware list onto every route registered inside its callback. Groups nest — prefixes concatenate and middleware stacks merge outer-to-inner. Every `Middleware` extends the abstract `Middleware` class:

```php
class RateLimitMiddleware extends Middleware
{
    public function handle(WP_REST_Request $request, callable $next): bool|WP_Error
    {
        if (over_limit()) {
            return new WP_Error('rate_limited', 'Too many requests.', ['status' => 429]);
        }

        return $next($request); // continue the pipeline
    }
}
```

Middleware run right-to-left: each one receives the request and a `$next` callable, and must either call `$next($request)` to continue, or return `bool|WP_Error` itself to short-circuit the chain.

**Public (unauthenticated) routes:** `publicGet()`, `publicPost()`, `publicPut()`, `publicPatch()`, `publicDelete()` register routes with nonce verification skipped entirely — for endpoints that must be reachable by logged-out callers (a webhook receiver, for example). A Policy or Middleware can still be applied to a public route; without one, the route is fully open.

```php
$router->publicPost('/webhook', 'WebhookController@handle');
```

### Request.php

`Request` wraps the incoming `WP_REST_Request`, merging URL route params, query string, form body, and JSON body into one input source (JSON body takes highest priority). **Controllers must never touch `$_POST`/`$_GET` directly** — always go through `Request`.

```php
$request->input('amount', 0);      // single value with a default
$request->all();                   // everything merged
$request->only(['amount', 'status']);
$request->has('invoice_number');
$request->user();                  // current WP_User
$request->userId();                // current user ID
```

`Request::validate($rules)` runs simple, pipe-separated validation rules and throws a `ValidationException` on failure:

```php
$data = $request->validate([
    'invoice_number' => 'required|string|max:255',
    'amount'         => 'required|numeric|min:0',
    'status'         => 'nullable|in:unpaid,paid',
]);
```

Supported rules: `required`, `string`, `integer`, `numeric`, `email`, `min:n`, `max:n`, `in:a,b,c`, `nullable`. The Router catches `ValidationException` automatically and converts it into a 422 response — you never need a try/catch around `validate()` in a controller.

### Response.php

`Response` is a static factory that enforces a consistent JSON envelope across every endpoint:

```php
Response::success(['id' => 1], 'Invoice created.', 201);
// { "success": true, "data": {...}, "message": "Invoice created." }

Response::error('Invoice not found.', 404);
// { "success": false, "message": "...", "errors": [] }

Response::paginated($invoices->paginate(25));
// { "success": true, "data": [...], "message": "", "meta": { total, per_page, current_page, last_page, from, to } }

Response::notFound();          // shorthand for error(..., 404)
Response::unauthorized();      // shorthand for error(..., 401)
Response::validationError($errors); // 422, used internally by the Router
```

### Controller.php

`Controller` is the abstract base class every plugin controller extends. The `Request` instance is injected automatically by the Router on every call.

```php
class InvoiceController extends Controller
{
    public function index(Request $request): WP_REST_Response
    {
        return Response::paginated(Invoice::paginate(25));
    }
}
```

It also exposes `$this->validate($rules)` (delegates to `Request::validate()`), `$this->currentUser()`, and `$this->currentUserId()` as convenience shortcuts.

**Reminder — defense in depth:** even with a `Policy` or `Middleware` protecting a route, every controller method should still call `current_user_can()` (or an equivalent check) directly before doing anything sensitive. Never rely on the router's permission check alone.
