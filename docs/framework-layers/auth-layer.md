---
id: auth-layer
title: "2.4 Auth Layer"
sidebar_label: "• Auth Layer"
sidebar_position: 4
---

## Auth Layer — Policy

**File:** `framework/src/Auth/Policy.php`

The Policy class is the permission system. Every REST route or controller action runs through a Policy before executing. Plugin policies extend the base class and implement `authorize()`.

```php
namespace MyPlugin\Http\Policies;

use WPPillar\Framework\Auth\Policy;

class TicketPolicy extends Policy
{
    public function authorize(): bool
    {
        return current_user_can('manage_options');
    }
}
```

Policies can be applied at the controller level (all routes in a controller use the same policy) or at the route level (individual routes have their own policy). If `authorize()` returns false, the Router automatically returns a 403 response before the controller method runs.

**Why not just use `current_user_can()` directly in controllers?** You could. But centralising permission logic in Policy classes means: one place to update when permissions change, easy to test in isolation, and a consistent pattern across all endpoints that any developer on the team can follow.
