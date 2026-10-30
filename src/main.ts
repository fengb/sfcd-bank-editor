import { createPinia } from 'pinia'
import { Quasar } from 'quasar'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { routes, handleHotUpdate } from 'vue-router/auto-routes'

import App from './App.vue'

// Resolved to Quasar's prebuilt stylesheet by the Vite plugin.
import 'quasar/src/css/index.sass'

import './assets/main.css'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

if (import.meta.hot) {
  handleHotUpdate(router)
}

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(Quasar, { config: { dark: true } })
app.mount('#app')
