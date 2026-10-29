import { describe, expect, it, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import CampaignView from '@/views/CampaignView.vue'
import type { Campaign } from '@/api/campaigns'

vi.mock('@/stores/auth', () => ({ useAuthStore: () => ({ isAuthenticated: true }) }))
// Personnages de l'utilisateur connecté (MJ ou joueur)
const mine = vi.hoisted(() => ({ characters: [] as { id: number; name: string; level: number }[] }))
vi.mock('@/stores/character', () => ({ useCharacterStore: () => ({ fetchCharacters: vi.fn(async () => mine.characters) }) }))
// PNJ enregistrés par le MJ (générateur)
const npcs = vi.hoisted(() => [{ id: 7, name: 'Thorek du clan Brisefer', profession: 'Forgeron', race: 'dwarf', names: { race: 'Nain', alignment: 'Loyal bon' }, gender: 'MALE', age: 120, personality: 'Bourru', abilityScores: { str: 15 }, notes: null }])
vi.mock('@/stores/npc', () => ({ useNpcStore: () => ({ npcs, fetchNpcs: vi.fn(async () => npcs), updateNpc: vi.fn() }) }))
vi.mock('@/api/campaigns', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/campaigns')>()
  return { ...actual, campaignsApi: { get: vi.fn() } }
})

const campaign = (role: 'GM' | 'PLAYER'): Campaign => ({
  id: 5, edition: '2014', name: 'La mine perdue', description: 'Une **mine** oubliée.', theme: 'Exploration', status: 'ACTIVE', role,
  gm: { id: 2, name: 'MJ' }, inviteCode: role === 'GM' ? 'abc123' : null,
  members: [{ userId: 1, name: 'Joueuse', isMe: role === 'PLAYER', joinedAt: '', character: { id: 9, name: 'Test moine', level: 3, race: 'Humain', classes: [{ name: 'Moine', level: 3 }] } }],
  gmCharacters: [{ id: 12, name: 'Compagnon', level: 2, race: 'Elfe', classes: [{ name: 'Rôdeur', level: 2 }] }],
  partyLevels: [3, 2],
  sessions: [{ id: 1, number: 1, playedOn: '2026-10-10', title: 'Départ', summary: 'Résumé', gmNotes: role === 'GM' ? 'Secret' : null }],
  quests: [],
  npcs: [],
  encounters: [],
})

async function mountAs(role: 'GM' | 'PLAYER', tab?: string, changes: Partial<Campaign> = {}) {
  const { campaignsApi } = await import('@/api/campaigns')
  vi.mocked(campaignsApi.get).mockResolvedValue({ ...campaign(role), ...changes })
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

beforeEach(() => {
  setActivePinia(createPinia())
  mine.characters = []
})

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

  it('lets the game master add their own characters, and shows them to players', async () => {
    mine.characters = [{ id: 12, name: 'Compagnon', level: 2 }, { id: 13, name: 'Héroïne solo', level: 1 }]
    const gm = await mountAs('GM')
    expect(gm.text()).toContain('Personnages du MJ')
    // Le personnage déjà dans le groupe n'est plus proposé
    const options = gm.findAll('select option').map((o) => o.text())
    expect(options).toContain('Héroïne solo (niveau 1)')
    expect(options).not.toContain('Compagnon (niveau 2)')

    const player = await mountAs('PLAYER')
    expect(player.text()).toContain('Compagnon')
    expect(player.find('a[href="/character/12"]').exists()).toBe(false)
  })

  it("opens the full sheet of a campaign's NPC, without deleting it from there", async () => {
    const npc = { id: 3, npcId: 7, name: 'Thorek du clan Brisefer', profession: 'Forgeron', race: 'Nain', class: null, role: 'Informateur', location: 'Phandaline', notes: null }
    const wrapper = await mountAs('GM', 'npcs', { npcs: [npc] })

    await wrapper.find('button[aria-label="Voir la fiche de Thorek du clan Brisefer"]').trigger('click')
    const dialog = wrapper.find('[role="dialog"]')
    expect(dialog.text()).toContain('Nain')
    expect(dialog.text()).toContain('Bourru')
    expect(dialog.text()).toContain('120 ans')
    expect(dialog.text()).not.toContain('Supprimer le PNJ')

    await dialog.find('button[aria-label="Fermer"]').trigger('click')
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })
})
