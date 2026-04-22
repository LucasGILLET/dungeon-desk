import { describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { ref } from 'vue'
import App from '../App.vue'

vi.mock('@auth0/auth0-vue', () => ({
  useAuth0: () => ({
    loginWithRedirect: vi.fn(),
    logout: vi.fn(),
    user: ref(null),
    isAuthenticated: ref(false),
    getAccessTokenSilently: vi.fn(),
  }),
}))

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
        plugins: [router, createPinia()],
        stubs: {
          RouterView: true,
        },
      },
    })

    expect(wrapper.find('button[title="Ouvrir le lanceur de dés"]').exists()).toBe(true)
  })

  it('renders a global menu button on every route', async () => {
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
        plugins: [router, createPinia()],
        stubs: {
          RouterView: true,
        },
      },
    })

    expect(wrapper.find('button[title="Ouvrir le menu"]').exists()).toBe(true)

    await router.push('/gm-dashboard')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('button[title="Ouvrir le menu"]').exists()).toBe(true)
  })
})
