import type { PrimeVueConfiguration } from 'primevue/config'
import Aura from '@primeuix/themes/aura'

/**
 * PrimeVue setup shared by the app entry point and the tests, so a component
 * mounted under Vitest gets the same theme it gets in the browser.
 */
export const primevueConfig: PrimeVueConfiguration = {
  theme: {
    preset: Aura,
    options: {
      // The editor is dark only. `index.html` puts this class on <html> so the
      // dark token set is applied without waiting on `prefers-color-scheme`.
      darkModeSelector: '.app-dark',
    },
  },
}
