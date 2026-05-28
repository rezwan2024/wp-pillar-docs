---
id: known-limitations
title: "5.4 Known Limitations"
sidebar_label: "• Known Limitations"
sidebar_position: 4
---

## Known Limitations and Design Decisions

**Illuminate version coupling.** WP Pillar requires `illuminate/database` ^10.0 (PHP 8.1+) or ^9.0 (PHP 8.0+). This ties framework updates to Illuminate release cycles. The upside is access to a battle-tested, well-documented ORM. The downside is that Illuminate major versions occasionally have breaking changes.

**No multisite support.** WP Pillar is designed for single-site WordPress installations. Multisite support (network-activated plugins, per-site tables, network admin pages) is intentionally left to individual plugins to implement as needed. The framework does not block multisite — it simply does not provide multisite-specific utilities.

**No CLI tooling.** Unlike Laravel's Artisan, WP Pillar has no command-line tools for generating controllers, models, or migrations. This is intentional — Claude Code handles scaffolding. A future `wp-pillar generate:controller` CLI command is possible but not planned for v1.0.

**Frontend is the plugin's responsibility.** WP Pillar ships no JavaScript. The Vue or React stack is set up per-plugin. This means more initial setup per plugin but complete flexibility — a plugin can use Vue, React, Alpine.js, or plain JavaScript as appropriate.

**Composer is required.** WP Pillar cannot be used without Composer. This is a deliberate choice that accepts losing compatibility with hosting environments that cannot run Composer. The target environment is professional development setups, staging servers, and production servers where Composer is standard.

**The framework is copied, not required as a package.** WP Pillar is distributed as a folder that gets copied into each plugin rather than as a Composer package installed from a registry. This means each plugin has its own independent copy of the framework code. Framework updates require manually copying the updated `framework/` folder into each plugin. This is a trade-off: simpler distribution and no external package registry dependency, at the cost of manual updates.

---

*WP Pillar — A Laravel-inspired WordPress plugin framework*
*Built by Rezwan, 2026*
*Status: In active development*
