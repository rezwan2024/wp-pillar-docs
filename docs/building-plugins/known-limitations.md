---
id: known-limitations
title: "5.4 Known Limitations"
sidebar_label: "• Known Limitations"
sidebar_position: 4
---

## Known Limitations and Design Decisions

**Illuminate version coupling.** WP Pillar requires four `illuminate/*` packages at `^10.0` (`database`, `events`, `container`, `pagination`), which in turn requires PHP 8.1+. This ties framework updates to Illuminate release cycles. The upside is access to a battle-tested, well-documented ORM. The downside is that Illuminate major versions occasionally have breaking changes.

**Multisite is explicitly blocked, not just unsupported.** WP Pillar v1.x is single-site only, and this is enforced, not merely undocumented: the scaffold's plugin entry file detects `is_multisite()` at load time and calls `deactivate_plugins()` on itself with an admin notice explaining why, rather than silently running in an unsupported configuration. If you need multisite support, you'll need to remove that check and handle network-activation, per-site tables, and network admin pages yourself — the framework provides no multisite-specific utilities.

**No CLI tooling.** Unlike Laravel's Artisan, WP Pillar has no command-line tools for generating controllers, models, or migrations. `bin/update-framework.sh` (see [New Plugin Setup](./new-plugin-setup#updating-the-framework-later)) is the one script the scaffold does ship, and it only pulls framework updates — it doesn't scaffold new plugin code.

**Frontend is the plugin's responsibility.** WP Pillar ships no JavaScript. The Vue or React stack is set up per-plugin. This means more initial setup per plugin but complete flexibility — a plugin can use Vue, React, Alpine.js, or plain JavaScript as appropriate.

**Composer is required.** WP Pillar cannot be used without Composer. This is a deliberate choice that accepts losing compatibility with hosting environments that cannot run Composer. The target environment is professional development setups, staging servers, and production servers where Composer is standard.

**The framework is copied, not required as a package.** WP Pillar is distributed as a full scaffold repository that gets cloned into each plugin rather than as a Composer package installed from a registry. This means each plugin has its own independent copy of the framework code. Framework updates require manually running `bin/update-framework.sh` per plugin. This is a trade-off: simpler distribution and no external package registry dependency, at the cost of manual, per-plugin updates.

---

*WP Pillar — A Laravel-inspired WordPress plugin framework*
*Built by Rezwan*
