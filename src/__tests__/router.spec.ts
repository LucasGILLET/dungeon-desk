import { describe, expect, it, vi } from 'vitest'

vi.mock('@/views/HomeView.vue', () => ({ default: { template: '<div />' } }))

import router from '@/router'

// Adresses tapées ou rechargées directement (pas seulement suivies par un lien)
describe('router', () => {
  it('matches a campaign URL with a numeric id, on reload too', () => {
    expect(router.resolve('/campaigns/5').name).toBe('campaign')
    expect(router.resolve('/campaigns/join/abc-123').name).toBe('join-campaign')
    expect(router.resolve('/campaigns/abc').name).toBeUndefined()
  })

  it('serves the English URLs of the new pages', () => {
    expect(router.resolve('/bestiary/aboleth').name).toBe('monster-view')
    expect(router.resolve('/magic-items/bag-of-holding').name).toBe('magic-item-view')
    expect(router.resolve('/rules?section=cover').name).toBe('rules')
  })

  it('redirects the former French URLs', async () => {
    for (const [from, to] of [
      ['/campagnes/5?tab=quests', '/campaigns/5?tab=quests'],
      ['/campagnes/rejoindre/abc', '/campaigns/join/abc'],
      ['/bestiaire/aboleth', '/bestiary/aboleth'],
      ['/objets-magiques', '/magic-items'],
      ['/regles?section=cover', '/rules?section=cover'],
    ]) {
      await router.push(from!)
      expect(router.currentRoute.value.fullPath).toBe(to)
    }
  })
})
