import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { Quasar } from 'quasar'

import App from './App.vue'

describe('App', () => {
  it('renders the editor', () => {
    // App reads the bank file store on setup, so it needs a Pinia instance,
    // and it renders Quasar components, so it needs the plugin too. Both come
    // from the same config the browser entry point uses.
    const wrapper = mount(App, {
      global: { plugins: [createPinia(), Quasar] },
    })

    expect(wrapper.text()).toContain('SFCD Bank Editor')
    expect(wrapper.text()).toContain('Drop a file anywhere')
  })
})
