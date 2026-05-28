---
id: hash-routing
title: "3.5 Hash-Based Routing"
sidebar_label: "• Hash-Based Routing"
sidebar_position: 5
---

## Hash-Based Routing

All navigation inside a WP Pillar plugin uses hash-based routing. The URL changes from:

```
/wp-admin/admin.php?page=myplugin#/tickets
/wp-admin/admin.php?page=myplugin#/tickets/123
/wp-admin/admin.php?page=myplugin#/settings
```

WordPress only sees one admin page load — the initial one. Every `#/route-change` after that is handled entirely in JavaScript. No PHP is involved in navigation. No page reloads.

**Vue Router hash mode setup:**

```javascript
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: '/',         component: Dashboard },
        { path: '/tickets',  component: TicketList },
        { path: '/tickets/:id', component: TicketDetail },
        { path: '/settings', component: Settings },
    ]
})
```

**React Router hash mode setup:**

```javascript
import { HashRouter, Routes, Route } from 'react-router-dom'

<HashRouter>
    <Routes>
        <Route path="/"           element={<Dashboard />} />
        <Route path="/tickets"    element={<TicketList />} />
        <Route path="/tickets/:id" element={<TicketDetail />} />
        <Route path="/settings"   element={<Settings />} />
    </Routes>
</HashRouter>
```
