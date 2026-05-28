---
id: react-workflow
title: "5.3 React Workflow"
sidebar_label: "• React Workflow"
sidebar_position: 3
---

## Full Development Workflow With React

The PHP backend is identical to the Vue workflow. Only the `resources/js/` folder changes.

### Setup

**`package.json` dependencies:**

```json
{
  "dependencies": {
    "react":            "^18.2.0",
    "react-dom":        "^18.2.0",
    "react-router-dom": "^6.22.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand":          "^4.5.0",
    "axios":            "^1.6.0"
  },
  "devDependencies": {
    "vite":             "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0"
  }
}
```

**`resources/js/main.jsx`:**

```jsx
import React           from 'react'
import { createRoot }  from 'react-dom/client'
import { HashRouter }  from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App             from './App'
import api             from './api'

// Configure API client
api.defaults.baseURL = window.MyPluginData?.restUrl
api.defaults.headers.common['X-WP-Nonce'] = window.MyPluginData?.nonce

const queryClient = new QueryClient()

createRoot(document.getElementById('myplugin-root')).render(
  <QueryClientProvider client={queryClient}>
    <HashRouter>
      <App />
    </HashRouter>
  </QueryClientProvider>
)
```

**`resources/js/App.jsx`:**

```jsx
import { Routes, Route } from 'react-router-dom'
import Dashboard    from './views/Dashboard'
import TicketList   from './views/TicketList'
import TicketDetail from './views/TicketDetail'
import Settings     from './views/Settings'

export default function App() {
  return (
    <Routes>
      <Route path="/"             element={<Dashboard />} />
      <Route path="/tickets"      element={<TicketList />} />
      <Route path="/tickets/:id"  element={<TicketDetail />} />
      <Route path="/settings"     element={<Settings />} />
    </Routes>
  )
}
```

**Fetching data with TanStack Query:**

```jsx
import { useQuery } from '@tanstack/react-query'
import api from '../api'

export default function TicketList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => api.get('/tickets').then(r => r.data.data)
  })

  if (isLoading) return <div>Loading...</div>
  if (error)     return <div>Error: {error.message}</div>

  return (
    <table>
      {data.map(ticket => (
        <tr key={ticket.id}>
          <td>{ticket.subject}</td>
          <td>{ticket.status}</td>
        </tr>
      ))}
    </table>
  )
}
```

The `vite.config.js` and `AppServiceProvider.php` enqueue setup are identical to the Vue workflow, just referencing `@vitejs/plugin-react` instead.
