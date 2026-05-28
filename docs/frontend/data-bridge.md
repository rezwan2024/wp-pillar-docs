---
id: data-bridge
title: "3.4 Data Bridge"
sidebar_label: "• Data Bridge"
sidebar_position: 4
---

## Data Bridge — wp_localize_script

`wp_localize_script()` is WordPress's mechanism for passing PHP data to JavaScript at page load. WP Pillar uses this to give the JavaScript application everything it needs to operate: the REST API URL, the nonce, the current user, and any plugin-specific configuration.

```php
wp_localize_script('myplugin-app', 'MyPluginData', [
    'restUrl'     => esc_url_raw(rest_url('myplugin/v1')),
    'nonce'       => wp_create_nonce('wp_rest'),
    'adminUrl'    => admin_url(),
    'pluginUrl'   => plugin_dir_url(MYPLUGIN_FILE),
    'currentUser' => [
        'id'    => get_current_user_id(),
        'name'  => wp_get_current_user()->display_name,
        'roles' => wp_get_current_user()->roles,
    ],
    'strings'     => $this->getTranslationStrings(),
]);
```

In the JavaScript application, this data is available as `window.MyPluginData`. The REST URL and nonce are configured into the API client once at startup, and every subsequent API call automatically includes the correct authentication headers.
