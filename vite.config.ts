import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [
    vue({ template: { transformAssetUrls } }),
    // Quasar transforms the Vue plugin's output, so it has to come after it —
    // it throws at resolve time otherwise.
    quasar(),
    // Dev-only overlay; excluded from production builds.
    ...(process.env.NODE_ENV === 'production' ? [] : [vueDevTools()]),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
