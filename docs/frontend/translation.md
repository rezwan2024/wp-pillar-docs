---
id: translation
title: "3.6 Translation"
sidebar_label: "• Translation"
sidebar_position: 6
---

## Translation with vue-i18n

All user-facing strings in the Vue frontend must be translatable. WP Pillar's translation pattern works like this:

1. PHP collects all UI strings in `getTranslationStrings()` and passes them through `wp_localize_script()` inside the `strings` key
2. Vue uses `vue-i18n` configured to read from `window.MyPluginData.strings`
3. All component text uses `{{ t('key') }}` or `$t('key')`

```php
// PHP — AppServiceProvider.php
private function getTranslationStrings(): array
{
    return [
        'save'          => __('Save', 'myplugin'),
        'cancel'        => __('Cancel', 'myplugin'),
        'confirm_delete'=> __('Are you sure you want to delete this?', 'myplugin'),
        'tickets'       => __('Tickets', 'myplugin'),
        'settings'      => __('Settings', 'myplugin'),
    ];
}
```

```javascript
// JavaScript — main.js
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
    locale: 'en',
    messages: {
        en: window.MyPluginData.strings
    }
})
```

```vue
<!-- Vue component -->
<button>{{ $t('save') }}</button>
<p>{{ $t('confirm_delete') }}</p>
```

This pattern means: all strings are defined in PHP (where WordPress's translation system lives), WordPress translators work with `.po` files as usual, and Vue components always display translated text without needing to know anything about the translation system.
