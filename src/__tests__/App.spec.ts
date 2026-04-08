import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('renders the global dice launcher trigger', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/',
          component: {
            template: '<div />',
          },
        },
      ],
    })

    router.push('/')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: {
          RouterView: true,
        },
      },
    })

    expect(wrapper.find('button[title="Ouvrir le lanceur de dés"]').exists()).toBe(true)
  })

  it('shows the home floating button only outside the home route', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/',
          component: {
            template: '<div />',
          },
        },
        {
          path: '/gm-dashboard',
          component: {
            template: '<div />',
          },
        },
      ],
    })

    router.push('/')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: {
          RouterView: true,
        },
      },
    })

    expect(wrapper.find('a[title="Retour à l\'accueil"]').exists()).toBe(false)

    await router.push('/gm-dashboard')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('a[title="Retour à l\'accueil"]').exists()).toBe(true)
  })
})
