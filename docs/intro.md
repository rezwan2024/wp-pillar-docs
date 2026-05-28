---
id: intro
title: Welcome to WP Pillar
sidebar_label: Introduction
sidebar_position: 1
---

# WP Pillar — Framework Documentation

**Version:** 1.0 | **Author:** Rezwan | **Status:** In Development | **Last Updated:** 2026

WP Pillar is a lightweight, Laravel-inspired WordPress plugin development framework. It is **not a standalone plugin** — it is a `framework/` folder that gets copied into every new WordPress plugin project you build. Think of it as your personal foundation layer: the same way Laravel gives PHP web developers a clean MVC structure out of the box, WP Pillar gives WordPress plugin developers that same structure, designed to work correctly inside WordPress's hook system.

Every time you start a new WordPress plugin, instead of writing the same boilerplate from scratch — database setup, REST API routing, permission checks, admin page registration — you copy the WP Pillar framework folder in and start building your real plugin logic immediately.

---

## What's in this documentation

- [Architecture](./architecture/why-i-built-it) — Why WP Pillar exists, how it evolved, and its core design principles
- [Framework Layers](./framework-layers/application-container) — Deep-dive into each layer: container, database, HTTP, auth, and support
- [Frontend](./frontend/why-vuejs) — Vue.js and React integration patterns inside WordPress admin
- [Guides](./guides/security) — Security, translation, SEO, plugin integration, performance, and Composer
- [Building Plugins](./building-plugins/new-plugin-setup) — Step-by-step workflows for starting and developing new plugins
