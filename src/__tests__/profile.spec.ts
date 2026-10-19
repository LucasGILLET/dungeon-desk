import { describe, expect, it, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import ProfileView from '@/views/ProfileView.vue'

const characters = [
  { id: 9, name: 'Test moine', edition: '2014', race: 'human', subrace: null, classes: [{ class: 'monk', subclass: null, level: 3 }], level: 3,
    names: { race: 'Humain', subrace: null, background: null, classes: [{ class: 'Moine', subclass: null, level: 3 }] }, updatedAt: '2026-10-18T10:00:00Z' },
  { id: 10, name: 'Gandelf', edition: '2014', race: 'elf', subrace: null, classes: [{ class: 'wizard', subclass: null, level: 1 }], level: 1,
    names: { race: 'Elfe', subrace: null, background: null, classes: [{ class: 'Magicien', subclass: null, level: 1 }] }, updatedAt: '2026-10-19T10:00:00Z' },
]
const npcs = [{ id: 3, name: 'Toblen', race: 'human', names: { race: 'Humain', class: null, alignment: 'Neutre (N)' }, profession: 'Aubergiste', notes: 'Sait tout', abilityScores: { str: 10 }, createdAt: '2026-10-01' }]

const deleteCharacter = vi.fn()
vi.mock('@/stores/auth', () => ({ useAuthStore: () => ({ isAuthenticated: true, user: { name: 'Lucas' }, logout: vi.fn(), login: vi.fn() }) }))
vi.mock('@/stores/character', () => ({
  useCharacterStore: () => ({ characters, loading: false, fetchCharacters: vi.fn().mockResolvedValue(characters), deleteCharacter }),
}))
vi.mock('@/stores/npc', () => ({
  useNpcStore: () => ({ npcs, loading: false, fetchNpcs: vi.fn().mockResolvedValue(npcs), deleteNpc: vi.fn(), updateNpc: vi.fn() }),
}))
vi.mock('@/api/campaigns', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/campaigns')>()
  return {
    ...actual,
    campaignsApi: {
      list: vi.fn().mockResolvedValue([
        { id: 5, name: 'La mine perdue', theme: null, status: 'ACTIVE', role: 'PLAYER', gm: 'MJ', memberCount: 3, sessionCount: 2, myCharacter: { id: 9, name: 'Test moine' }, updatedAt: '' },
        { id: 6, name: 'Ma campagne', theme: 'Horreur', status: 'PREPARATION', role: 'GM', gm: 'Lucas', memberCount: 0, sessionCount: 0, myCharacter: null, updatedAt: '' },
      ]),
    },
  }
})

async function mountAt(query: Record<string, string> = {}) {
  const stub = { template: '<div />' }
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/profile', component: ProfileView },
      { path: '/character/:id', component: stub },
      { path: '/campagnes/:id', name: 'campaign', component: stub },
      { path: '/gm', name: 'gm-dashboard', component: stub },
      { path: '/character-creator', component: stub },
      { path: '/npc-generator', component: stub },
    ],
  })
  router.push({ path: '/profile', query })
  await router.isReady()
  const wrapper = mount(ProfileView, { global: { plugins: [router] } })
  await flushPromises()
  return { wrapper, router }
}

beforeEach(() => deleteCharacter.mockReset())

describe('ProfileView', () => {
  it('lists characters, most recent first, with the campaigns they play in', async () => {
    const { wrapper } = await mountAt()
    const names = wrapper.findAll('article h3').map((h) => h.text())
    expect(names).toEqual(['Gandelf', 'Test moine'])
    expect(wrapper.findAll('article')[1]!.text()).toContain('La mine perdue')
  })

  it('deletes a character after confirmation, mentioning its campaign', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const { wrapper } = await mountAt()
    await wrapper.find('button[aria-label="Supprimer Test moine"]').trigger('click')
    expect(confirm.mock.calls[0]![0]).toContain('« La mine perdue »')
    expect(deleteCharacter).toHaveBeenCalledWith(9)
    confirm.mockRestore()
  })

  it('shows the campaigns tab, split between led and played campaigns', async () => {
    const { wrapper } = await mountAt({ tab: 'campaigns' })
    expect(wrapper.text()).toContain('Que je mène')
    expect(wrapper.text()).toContain('Ma campagne')
    expect(wrapper.text()).toContain('avec Test moine')
  })

  it('opens the details of an NPC with its notes', async () => {
    const { wrapper } = await mountAt({ tab: 'npcs' })
    await wrapper.find('article button').trigger('click')
    expect(wrapper.find('[role="dialog"]').text()).toContain('Aubergiste')
    expect((wrapper.find('[role="dialog"] textarea').element as HTMLTextAreaElement).value).toBe('Sait tout')
  })
})
