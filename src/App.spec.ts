import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import App from './App.vue'

describe('App', () => {
  it('renders the editor', () => {
    // App reads the bank file store on setup, so it needs a Pinia instance.
    const wrapper = mount(App, { global: { plugins: [createPinia()] } })

    expect(wrapper.text()).toContain('SFCD Bank Editor')
    expect(wrapper.text()).toContain('No file loaded')
  })
})
