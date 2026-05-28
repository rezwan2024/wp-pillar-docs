---
id: plugin-integration
title: "4.4 Plugin Integration"
sidebar_label: "• Plugin Integration"
sidebar_position: 4
---

## Integration With Other Plugins

A common concern when using a modern framework-based architecture is: will traditional WordPress plugins be able to integrate with mine?

The answer is: **yes, completely, through WordPress hooks.**

WordPress plugins integrate with each other through `add_action()` and `add_filter()` — not through shared code structure or shared classes. A plugin written in 2010 with no Composer, no MVC, no namespacing can integrate with a WP Pillar plugin written in 2026 with full Eloquent ORM and Vue.js, because the integration layer is WordPress hooks — a universal language every WordPress plugin speaks.

**Your plugin exposes integration points by firing actions and filters:**

```php
// Fire an action so other plugins can respond to your events
do_action('myplugin_ticket_created', $ticket->id, $ticket->toArray());
do_action('myplugin_ticket_resolved', $ticket->id);

// Apply a filter so other plugins can modify your data
$prompt = apply_filters('myplugin_before_ai_prompt', $prompt, $ticket->id);
$items = apply_filters('myplugin_ticket_list_items', $items, $query_args);
```

**Any other plugin — regardless of architecture — can hook into these:**

```php
// A traditional plugin with no framework hooks into WP Pillar plugin perfectly
add_action('myplugin_ticket_created', function($ticket_id, $ticket_data) {
    // Send a Slack notification
    slack_notify('#support', 'New ticket: ' . $ticket_data['subject']);
}, 10, 2);

add_filter('myplugin_before_ai_prompt', function($prompt, $ticket_id) {
    // Add customer tier info to the AI prompt
    $tier = get_post_meta($ticket_id, 'customer_tier', true);
    return $prompt . "\nCustomer tier: " . $tier;
}, 10, 2);
```

**For addon plugins** (plugins that extend your plugin's functionality), the pattern is identical. An addon plugin declares `myplugin` as a dependency in its own plugin header, checks that the main plugin is active before loading, and then hooks into the main plugin's actions and filters. The addon never directly instantiates WP Pillar classes — it communicates entirely through hooks.

This means WP Pillar's modern architecture creates zero compatibility problems with the existing WordPress ecosystem.
