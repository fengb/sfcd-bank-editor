import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'

import App from './App.vue'
import { primevueConfig } from './primevue'

describe('App', () => {
  it('renders the editor', () => {
    // App reads the bank file store on setup, so it needs a Pinia instance,
    // and it renders PrimeVue components, so it needs the plugin too. Both come
    // from the same config the browser entry point uses.
    const wrapper = mount(App, {
      global: { plugins: [createPinia(), [PrimeVue, primevueConfig]] },
    })

    expect(wrapper.text()).toContain('SFCD Bank Editor')
    expect(wrapper.text()).toContain('No file loaded')
  })
})
