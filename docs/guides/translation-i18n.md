---
id: translation-i18n
title: "4.2 Internationalisation"
sidebar_label: "• Internationalisation"
sidebar_position: 2
---

## Translation and Internationalisation

WP Pillar follows WordPress's standard internationalisation system with one key addition: the Vue/React frontend translation bridge.

**PHP side — standard WordPress i18n:**

- All PHP strings use `__('String', 'text-domain')` or `esc_html__()`, `esc_attr__()`
- The text domain matches the plugin slug
- A `.pot` file is generated from PHP files using WP-CLI or Poedit
- Translators create `.po` and `.mo` files for their language

**JavaScript side — bridge pattern:**

PHP strings cannot be directly used in JavaScript. The bridge works like this:

1. `AppServiceProvider::getTranslationStrings()` collects all frontend-facing strings using `__()`
2. This array is passed to JavaScript via `wp_localize_script()`
3. Vue's `vue-i18n` or React's `react-intl` reads from `window.PluginData.strings`
4. Components use the i18n translation function, not hardcoded English strings

**What this means for translators:** Translators only need to translate `.po` files. The JavaScript strings are sourced from those same translations — there is no separate JavaScript translation file to maintain.

**What this means for developers:** Never hardcode English strings in Vue or React components. Every user-facing string must be in `getTranslationStrings()` in PHP, wrapped in `__()`, and referenced by key in components.
