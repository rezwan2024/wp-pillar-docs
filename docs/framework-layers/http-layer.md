---
id: http-layer
title: "2.3 HTTP Layer"
sidebar_label: "• HTTP Layer"
sidebar_position: 3
---

## HTTP Layer

**Files:** `framework/src/Http/Router.php`, `Request.php`, `Response.php`, `Controller.php`

**Router.php** wraps WordPress's `register_rest_route()` in a clean API and automatically handles nonce verification on every route.

```php
// In RouteServiceProvider.php
$router->group('myplugin/v1', function($router) {
    $router->get('/items',          [ItemController::class, 'index']);
    $router->post('/items',         [ItemController::class, 'store']);
    $router->get('/items/{id}',     [ItemController::class, 'show']);
    $router->put('/items/{id}',     [ItemController::class, 'update']);
    $router->delete('/items/{id}',  [ItemController::class, 'destroy']);
});
```

Every route registered through the Router automatically verifies the WordPress nonce sent in the `X-WP-Nonce` header. Routes that fail nonce verification return a 403 before the controller is ever called.

**Request.php** wraps the incoming `WP_REST_Request` object, providing clean methods to access validated, sanitised input data.

**Response.php** provides a fluent JSON response builder.

```php
return Response::success(['items' => $items], 200);
return Response::error('Item not found', 404);
return Response::json(['custom' => 'data'], 200);
```

**Controller.php** is the base controller all plugin controllers extend. It provides access to the Request object and Response builder, and can optionally enforce a Policy on the entire controller.
