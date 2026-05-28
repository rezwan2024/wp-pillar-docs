---
id: why-react
title: "3.2 Why React"
sidebar_label: "• Why React"
sidebar_position: 2
---

## Why React Also Works

React is also fully supported. If you prefer React or your team is more experienced with it, there is no technical barrier. The PHP backend is identical — only the `resources/js/` folder changes.

For React, the recommended stack is: React 18 + React Router v6 (with `HashRouter`) + TanStack Query (formerly React Query) for server state + Zustand for client state + Vite for the build.

The key point: the SPA architecture, the data bridge via `wp_localize_script`, the hash routing, the REST API communication — all of it works identically whether you choose Vue or React. The choice is purely about developer preference and team skills.
