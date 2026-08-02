---
id: intro
title: Welcome to WP Pillar
sidebar_label: Introduction
sidebar_position: 1
---

# WP Pillar — Framework Documentation

**Version:** 1.1 | **Author:** Rezwan | **License:** GPL-3.0 | **Last Updated:** 2026

WP Pillar is a lightweight, Laravel-inspired WordPress plugin development framework. It is **not a standalone plugin** — it is a complete plugin scaffold that you copy, rename, and turn into your own WordPress plugin. Think of it as your personal foundation layer: the same way Laravel gives PHP web developers a clean MVC structure out of the box, WP Pillar gives WordPress plugin developers that same structure, designed to work correctly inside WordPress's hook system.

Every time you start a new WordPress plugin, instead of writing the same boilerplate from scratch — database setup, REST API routing, permission checks, admin page registration — you clone the WP Pillar scaffold, follow a short setup checklist, and start building your real plugin logic immediately.

**New here? Start with [New Plugin Setup](./building-plugins/new-plugin-setup)** — it walks through every step, in order, from cloning the scaffold to activating your first working plugin, written so that even a first-time WP Pillar user can follow along without getting lost.

---

## What's in this documentation

- [Architecture](./architecture/why-i-built-it) — Why WP Pillar exists, how it evolved, and its core design principles
- [Framework Layers](./framework-layers/application-container) — Deep-dive into each layer: container, database, HTTP, auth, and support
- [Frontend](./frontend/why-vuejs) — Vue.js and React integration patterns inside WordPress admin
- [Guides](./guides/security) — Security, translation, SEO, plugin integration, performance, and Composer
- [Building Plugins](./building-plugins/new-plugin-setup) — Step-by-step workflows for starting and developing new plugins, plus the independence checklist and how to pull framework updates into a plugin you've already built

---

## Plugins built on WP Pillar

WP Pillar isn't theoretical — it already powers real plugins:

| Plugin | Description |
|---|---|
| **TicketWise AI** | A production plugin used daily by the BuddyBoss support team — AI-powered support ticketing built with Vue 3 + Vite + Eloquent ORM + REST API. |
| **WP Notes** | The test plugin used to validate the framework end-to-end — Vue 3 + Vite + Eloquent ORM + REST API. |

If you'd like to see the framework in action before diving into the setup guide, there's a short demo walkthrough linked from the [framework's GitHub repository](https://github.com/rezwan2024/wp-pillar-framework).
