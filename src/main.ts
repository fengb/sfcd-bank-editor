import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'

import App from './App.vue'
import { primevueConfig } from './primevue'

import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(PrimeVue, primevueConfig)

app.mount('#app')
