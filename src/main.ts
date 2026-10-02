import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar } from 'quasar'

import App from './App.vue'

// Resolved to Quasar's prebuilt stylesheet by the Vite plugin.
import 'quasar/src/css/index.sass'
import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(Quasar, { config: { dark: true } })

app.mount('#app')
