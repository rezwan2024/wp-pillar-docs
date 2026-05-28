---
id: performance-ux
title: "4.6 Performance & UX"
sidebar_label: "• Performance & UX"
sidebar_position: 6
---

## Performance and UX

Performance and user experience are first-class concerns in WP Pillar. The framework architecture makes several performance improvements automatic, and provides clear patterns for additional optimisations.

### Backend Performance

**Eloquent query optimisation.**

Eloquent's query builder makes it natural to write efficient queries. The most important pattern is eager loading — loading related models in a single query instead of N+1 queries.

```php
// BAD — N+1 queries (1 for tickets, then 1 per ticket for messages)
$tickets = Ticket::all();
foreach ($tickets as $ticket) {
    echo $ticket->messages->count(); // new query each time
}

// GOOD — 2 queries total (eager loading)
$tickets = Ticket::with('messages')->get();
foreach ($tickets as $ticket) {
    echo $ticket->messages->count(); // already loaded
}
```

**Database indexing in migrations.**

Every migration should include indexes on columns used in WHERE clauses, ORDER BY, and JOIN conditions. Eloquent's schema builder makes this easy:

```php
$table->index('status');
$table->index('agent_id');
$table->index(['status', 'created_at']); // composite index
```

**REST API response pagination.**

Never return all records from a REST endpoint. Always paginate:

```php
public function index(Request $request): WP_REST_Response
{
    $per_page = $request->input('per_page', 20);
    $page     = $request->input('page', 1);

    $results = Ticket::with('agent')
        ->where('status', 'open')
        ->orderByDesc('created_at')
        ->paginate($per_page, ['*'], 'page', $page);

    return Response::success([
        'data'        => $results->items(),
        'total'       => $results->total(),
        'per_page'    => $results->perPage(),
        'current_page'=> $results->currentPage(),
        'last_page'   => $results->lastPage(),
    ]);
}
```

**Assets only load on your plugin's admin page.**

The `enqueueAssets()` method checks the current screen hook before enqueueing JavaScript and CSS. Your compiled Vue or React bundle only loads when a user is actually on your plugin's admin page — not on every page in wp-admin:

```php
public function enqueueAssets(string $hook): void
{
    // Only load on this plugin's page — not on every wp-admin page
    if (strpos($hook, 'myplugin') === false) {
        return;
    }
    wp_enqueue_script('myplugin-app', ...);
}
```

This is a significant WordPress performance practice that is easy to forget in traditional plugins. WP Pillar's scaffold makes it the default.

**Transient caching for expensive operations.**

For data that is expensive to compute and does not change often, use WordPress transients:

```php
public function getExpensiveReport(): array
{
    $cache_key = 'myplugin_monthly_report_' . date('Y_m');
    $cached    = get_transient($cache_key);

    if ($cached !== false) {
        return $cached;
    }

    $data = $this->computeExpensiveReport();
    set_transient($cache_key, $data, HOUR_IN_SECONDS * 6);

    return $data;
}
```

---

### Frontend Performance

**Vite production builds.**

Vite's production build (`npm run build`) automatically:

- Tree-shakes unused code from Vue/React and all dependencies
- Minifies and compresses JavaScript and CSS
- Splits code into chunks — only the code needed for the current view is loaded
- Generates content-hashed filenames for aggressive browser caching

The difference between a development bundle and a Vite production build is significant — typically 60–80% smaller.

**Route-based code splitting.**

Vue Router and React Router both support lazy-loading components so that only the code for the current page is downloaded, not the entire application upfront:

```javascript
// Vue — lazy load each view
const routes = [
    { path: '/',          component: () => import('./views/Dashboard.vue') },
    { path: '/tickets',   component: () => import('./views/TicketList.vue') },
    { path: '/settings',  component: () => import('./views/Settings.vue') },
]
```

```javascript
// React — lazy load each view
import { lazy, Suspense } from 'react'
const Dashboard  = lazy(() => import('./views/Dashboard'))
const TicketList = lazy(() => import('./views/TicketList'))
```

For most wp-admin plugins this is optional — the total bundle size is usually small enough. But for larger plugins with many views, lazy loading noticeably improves the initial page load.

**Optimistic UI updates.**

For actions like saving a setting or updating a record, update the UI immediately before the API call completes. If the API call fails, roll back. This makes the interface feel instant even on slower connections:

```javascript
// Vue with Pinia — optimistic update
async updateTicketStatus(id, status) {
    const ticket = this.tickets.find(t => t.id === id)
    const previousStatus = ticket.status

    // Update UI immediately
    ticket.status = status

    try {
        await api.put(`/tickets/${id}`, { status })
    } catch (error) {
        // Roll back on failure
        ticket.status = previousStatus
        this.error = 'Failed to update status'
    }
}
```

**Request debouncing for search inputs.**

Any search or filter input that triggers an API call must be debounced. Without debouncing, typing "support" in a search box fires 7 API requests (one per keystroke). With debouncing, it fires one — after the user stops typing:

```javascript
import { debounce } from 'lodash-es'

const search = debounce(async (query) => {
    const response = await api.get('/tickets', { params: { search: query } })
    tickets.value = response.data.data
}, 300)
```

**Vue/React reactivity means no manual DOM manipulation.**

Traditional WordPress admin pages use jQuery to update the DOM — `$('#count').text(newCount)`. This is fragile and slow at scale. Vue and React's reactive data model means the UI automatically updates whenever data changes. You update the data; the framework updates the DOM. This is both faster and eliminates entire categories of bugs.

---

### UX Improvements Over Traditional Plugins

The SPA architecture WP Pillar enables delivers a noticeably better user experience compared to traditional WordPress admin plugins. Here is a concrete comparison:

**Navigation — instant vs full page reload.**

Traditional WordPress admin plugins navigate by loading a new PHP page for each section. Every click on the admin menu triggers a full page reload: browser sends request, server renders PHP, browser parses and repaints HTML, page jumps to top. This typically takes 500ms–2 seconds per navigation.

WP Pillar plugins use hash-based SPA routing. Every navigation is instant — the JavaScript router swaps the component, no server request is made, the page does not reload, the scroll position is preserved. Users of modern web applications expect this behaviour.

**Loading states — clear feedback vs blank page.**

Traditional admin plugins often show a blank or partially-loaded page while data is fetching. WP Pillar's Vue/React frontend can show skeleton loading states, spinners, and progress indicators while API calls are in flight:

```vue
<template>
  <div v-if="loading" class="skeleton-table">
    <!-- Skeleton rows while loading -->
    <div v-for="n in 5" :key="n" class="skeleton-row"></div>
  </div>
  <table v-else>
    <tr v-for="ticket in tickets" :key="ticket.id">...</tr>
  </table>
</template>
```

**Form validation — inline vs after submission.**

Traditional WordPress forms validate on the server after form submission. The page reloads, shows errors, and the user has to re-fill the form. Vue and React enable real-time inline validation — errors appear as the user types, required fields are highlighted before submission, and the form never reloads the page.

**Persistent state during navigation.**

With traditional multi-page plugins, any unsaved state is lost when you navigate away. A Pinia or Zustand store persists state across navigation within the plugin. If a user starts filling a form, navigates to another section to check something, and comes back — their form data is still there.

**Error handling — graceful vs fatal.**

Traditional plugins can crash with a PHP fatal error showing a white screen. WP Pillar's frontend can catch API errors and show friendly messages with retry options, without ever crashing the entire page. The PHP backend can return structured error responses that the frontend handles gracefully.

**Keyboard and accessibility.**

Vue and React components can be built with proper keyboard navigation, focus management, ARIA attributes, and screen reader support from the start. Traditional WordPress admin pages — built with PHP templates and jQuery — often have poor accessibility because these concerns are added as an afterthought.
