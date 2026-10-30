import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { Quasar } from 'quasar'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'

import App from './App.vue'

describe('App', () => {
  it('renders the editor', () => {
    const router = createRouter({ history: createWebHistory(), routes })
    const wrapper = mount(App, {
      global: { plugins: [createPinia(), Quasar, router] },
    })

    expect(wrapper.text()).toContain('SFCD Bank Editor')
    expect(wrapper.text()).toContain('Open file')
  })
})
