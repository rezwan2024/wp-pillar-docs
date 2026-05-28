---
id: why-vuejs
title: "3.1 Why Vue.js"
sidebar_label: "• Why Vue.js"
sidebar_position: 1
---

## Why Vue.js is the Primary Choice

Vue.js is the recommended frontend framework for plugins built on WP Pillar, for several strong reasons.

**Vue 3 is lighter.** The full Vue 3 runtime with Vue Router and Pinia (state management) compiles to a smaller bundle than the equivalent React setup with React Router, React Query, and Zustand.

**Vue's Options API maps naturally to PHP MVC thinking.** If you are coming from a PHP background, Vue's component structure — `data`, `methods`, `computed`, `mounted` — reads like a class with properties and methods. It is immediately intuitive for backend developers.

**Vue Router in hash mode is battle-tested in wp-admin.** The WordPress admin dashboard uses a traditional multi-page architecture. Hash-based routing (`/#/tickets`, `/#/settings`) works perfectly inside a WordPress admin page without conflicting with WordPress's own URL structure. This pattern is used by many production-grade WordPress plugins.

**No conflict with WordPress's use of React.** WordPress core uses React for the Block Editor (Gutenberg). If your plugin also loads React, you can potentially get version conflicts or bundle size duplication. Vue has no such conflict — it coexists cleanly.

**Pinia is simpler than the React state ecosystem.** Pinia (Vue's official state manager) is a single lightweight package. The equivalent for React involves React Query for server state, Zustand or Redux for client state, and careful coordination between them.
