import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
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
      '@': resolve(import.meta.dirname, 'src'),
    },
  },
})
