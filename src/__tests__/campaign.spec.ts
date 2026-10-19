import { describe, expect, it, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import CampaignView from '@/views/CampaignView.vue'
import type { Campaign } from '@/api/campaigns'

vi.mock('@/stores/auth', () => ({ useAuthStore: () => ({ isAuthenticated: true }) }))
vi.mock('@/stores/character', () => ({ useCharacterStore: () => ({ fetchCharacters: vi.fn().mockResolvedValue([]) }) }))
vi.mock('@/api/campaigns', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/campaigns')>()
  return { ...actual, campaignsApi: { get: vi.fn() } }
})

const campaign = (role: 'GM' | 'PLAYER'): Campaign => ({
  id: 5, edition: '2014', name: 'La mine perdue', description: 'Une **mine** oubliée.', theme: 'Exploration', status: 'ACTIVE', role,
  gm: { id: 2, name: 'MJ' }, inviteCode: role === 'GM' ? 'abc123' : null,
  members: [{ userId: 1, name: 'Joueuse', isMe: role === 'PLAYER', joinedAt: '', character: { id: 9, name: 'Test moine', level: 3, race: 'Humain', classes: [{ name: 'Moine', level: 3 }] } }],
  partyLevels: [3],
  sessions: [{ id: 1, number: 1, playedOn: '2026-10-10', title: 'Départ', summary: 'Résumé', gmNotes: role === 'GM' ? 'Secret' : null }],
  quests: [],
  npcs: [],
  encounters: [],
})

async function mountAs(role: 'GM' | 'PLAYER', tab?: string) {
  const { campaignsApi } = await import('@/api/campaigns')
  vi.mocked(campaignsApi.get).mockResolvedValue(campaign(role))
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/campaigns/:id', name: 'campaign', component: CampaignView },
      { path: '/gm', name: 'gm-dashboard', component: { template: '<div />' } },
      { path: '/npc', name: 'npc-generator', component: { template: '<div />' } },
    ],
  })
  router.push({ path: '/campaigns/5', query: tab ? { tab } : {} })
  await router.isReady()
  const wrapper = mount(CampaignView, { global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

beforeEach(() => setActivePinia(createPinia()))

describe('CampaignView', () => {
  it('shows every tab and the invitation link to the game master', async () => {
    const wrapper = await mountAs('GM')
    const tabs = wrapper.findAll('nav button').map((b) => b.text().replace(/\d+$/, ''))
    expect(tabs).toEqual(['Présentation', 'Séances', 'Quêtes', 'PNJ', 'Rencontres'])
    expect(wrapper.text()).toContain('Vous êtes le MJ')
    expect((wrapper.find('input[aria-label="Lien d\'invitation"]').element as HTMLInputElement).value).toContain('/campaigns/join/abc123')
  })

  it('hides NPCs, encounters and GM notes from a player', async () => {
    const wrapper = await mountAs('PLAYER', 'sessions')
    expect(wrapper.findAll('nav button').map((b) => b.text().replace(/\d+$/, ''))).toEqual(['Présentation', 'Séances', 'Quêtes'])
    expect(wrapper.text()).toContain('Résumé')
    expect(wrapper.text()).not.toContain('Notes du MJ')
    expect(wrapper.text()).not.toContain('Nouvelle séance')
  })
})
