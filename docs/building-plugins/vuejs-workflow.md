---
id: vuejs-workflow
title: "5.2 Vue.js Workflow"
sidebar_label: "• Vue.js Workflow"
sidebar_position: 2
---

## Full Development Workflow With Vue.js

This section covers the complete end-to-end workflow for building a plugin frontend using Vue 3 + Vite on top of WP Pillar.

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- WP Pillar framework set up and working
- PHP backend routes working and returning JSON

### Setup

**Step 1 — Create `package.json`**

```json
{
  "name": "my-plugin",
  "private": true,
  "scripts": {
    "dev":   "vite",
    "build": "vite build"
  },
  "dependencies": {
    "vue":             "^3.4.0",
    "vue-router":      "^4.3.0",
    "pinia":           "^2.1.0",
    "vue-i18n":        "^9.13.0",
    "axios":           "^1.6.0"
  },
  "devDependencies": {
    "vite":            "^5.0.0",
    "@vitejs/plugin-vue": "^5.0.0"
  }
}
```

**Step 2 — Create `vite.config.js`**

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'assets/js',
    rollupOptions: {
      input: 'resources/js/main.js',
      output: {
        entryFileNames: 'app.js',
        chunkFileNames: 'chunk-[hash].js',
        assetFileNames: 'app.[ext]',
      }
    }
  }
})
```

**Step 3 — Create `resources/js/main.js`**

```javascript
import { createApp }    from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createPinia }  from 'pinia'
import { createI18n }   from 'vue-i18n'
import App              from './App.vue'
import Dashboard        from './views/Dashboard.vue'
import TicketList       from './views/TicketList.vue'
import TicketDetail     from './views/TicketDetail.vue'
import Settings         from './views/Settings.vue'

// Router
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/',            component: Dashboard },
    { path: '/tickets',     component: TicketList },
    { path: '/tickets/:id', component: TicketDetail },
    { path: '/settings',    component: Settings },
  ]
})

// State management
const pinia = createPinia()

// Translations — sourced from PHP via wp_localize_script
const i18n = createI18n({
  locale: 'en',
  messages: { en: window.MyPluginData?.strings ?? {} }
})

// API client — configure Axios with base URL and nonce
import api from './api'
api.defaults.baseURL = window.MyPluginData?.restUrl
api.defaults.headers.common['X-WP-Nonce'] = window.MyPluginData?.nonce

// Mount
const app = createApp(App)
app.use(router)
app.use(pinia)
app.use(i18n)
app.mount('#myplugin-root')
```

**Step 4 — Create `resources/js/api.js`**

```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: window.MyPluginData?.restUrl,
  headers: {
    'Content-Type': 'application/json',
    'X-WP-Nonce':   window.MyPluginData?.nonce,
  }
})

export default api
```

**Step 5 — Create a Pinia store**

```javascript
// resources/js/stores/tickets.js
import { defineStore } from 'pinia'
import api from '../api'

export const useTicketStore = defineStore('tickets', {
  state: () => ({
    tickets: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchTickets() {
      this.loading = true
      try {
        const response = await api.get('/tickets')
        this.tickets = response.data.data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    }
  }
})
```

**Step 6 — Create a component**

```vue
<!-- resources/js/views/TicketList.vue -->
<template>
  <div class="ticket-list">
    <h1>{{ $t('tickets') }}</h1>
    <div v-if="store.loading">Loading...</div>
    <table v-else>
      <tr v-for="ticket in store.tickets" :key="ticket.id">
        <td>{{ ticket.subject }}</td>
        <td>{{ ticket.status }}</td>
        <td>
          <router-link :to="`/tickets/${ticket.id}`">
            {{ $t('view') }}
          </router-link>
        </td>
      </tr>
    </table>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useTicketStore } from '../stores/tickets'

const store = useTicketStore()
onMounted(() => store.fetchTickets())
</script>
```

**Step 7 — Build and enqueue**

```bash
npm run build
```

In `AppServiceProvider.php`:

```php
public function enqueueAssets(string $hook): void
{
    if (strpos($hook, 'myplugin') === false) return;

    wp_enqueue_script(
        'myplugin-app',
        plugin_dir_url(MYPLUGIN_FILE) . 'assets/js/app.js',
        [],
        MYPLUGIN_VERSION,
        true
    );

    wp_localize_script('myplugin-app', 'MyPluginData', [
        'restUrl' => esc_url_raw(rest_url('myplugin/v1/')),
        'nonce'   => wp_create_nonce('wp_rest'),
        'strings' => $this->getTranslationStrings(),
    ]);
}
```
