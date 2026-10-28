import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { isStaleChunkError, reloadOnStaleBuild } from '@/utils/staleBuild'

const originalLocation = window.location
let assign: ReturnType<typeof vi.fn>

beforeEach(() => {
  sessionStorage.clear()
  assign = vi.fn()
  Object.defineProperty(window, 'location', { configurable: true, value: { ...originalLocation, assign, href: 'http://localhost/' } })
})
afterEach(() => {
  Object.defineProperty(window, 'location', { configurable: true, value: originalLocation })
})

// Fichier d'une page disparu après un déploiement (onglet resté ouvert)
const staleRoute = () => Promise.reject(new TypeError('Failed to fetch dynamically imported module: https://www.dungeon-desk.com/assets/SortsListView-old.js'))

describe('stale build after a deployment', () => {
  it('reloads the site on the requested page when its file is gone, once a minute at most', async () => {
    const router = createRouter({ history: createMemoryHistory(), routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/sorts', component: staleRoute },
    ] })
    reloadOnStaleBuild(router)
    await router.push('/')

    await router.push('/sorts?niveau=1').catch(() => {})
    expect(assign).toHaveBeenCalledWith('/sorts?niveau=1')

    await router.push('/sorts').catch(() => {})
    expect(assign).toHaveBeenCalledTimes(1) // pas de boucle de rechargements
  })

  it('only reacts to missing files, not to other navigation errors', () => {
    expect(isStaleChunkError(new TypeError('Importing a module script failed.'))).toBe(true)
    expect(isStaleChunkError(new Error('error loading dynamically imported module'))).toBe(true)
    expect(isStaleChunkError(new Error('Network request failed'))).toBe(false)
  })
})
