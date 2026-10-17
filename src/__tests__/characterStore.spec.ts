import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { useCharacterStore } from '@/stores/character'

const { mockCreateMutateAsync, mockUpdateMutateAsync, mockGetCharacters } = vi.hoisted(() => ({
  mockCreateMutateAsync: vi.fn(),
  mockUpdateMutateAsync: vi.fn(),
  mockGetCharacters: vi.fn(),
}))

vi.mock('@/api/generated/endpoints', () => ({
  getCharacters: mockGetCharacters,
  getCharacter: vi.fn(),
  getGetCharactersQueryKey: () => ['characters'],
  useCreateCharacter: () => ({ mutateAsync: mockCreateMutateAsync }),
  useUpdateCharacter: () => ({ mutateAsync: mockUpdateMutateAsync }),
}))

function mountStore() {
  let store!: ReturnType<typeof useCharacterStore>
  const Host = defineComponent({
    setup() {
      store = useCharacterStore()
      return () => h('div')
    },
  })
  mount(Host, {
    global: {
      plugins: [createPinia(), VueQueryPlugin],
    },
  })
  return store
}

// Personnage du créateur (objets SRD réduits)
const minimalCharacter = {
  name: 'Aragorn',
  level: 1,
  abilities: { str: 15, dex: 12, con: 14, int: 10, wis: 8, cha: 13 },
  proficiencies: { skills: [], languages: [], tools: [] },
  race: { index: 'human', name: 'Humain' },
  class: { index: 'fighter', name: 'Guerrier' },
  background: { index: 'soldier', name: 'Soldat' },
  features: [],
} as any

// Réponse de l'API : format d'échange + noms + fiche
const saved = (name: string, levels = 1) => ({
  id: 1,
  name,
  edition: '2014',
  race: 'human',
  abilityScores: minimalCharacter.abilities,
  classes: [{ class: 'fighter', subclass: null, levels: Array.from({ length: levels }, (_, i) => ({ level: i + 1, characterLevel: i + 1 })) }],
  names: { race: 'Humain', subrace: null, background: 'Soldat', classes: [{ class: 'Guerrier', subclass: null, level: levels }] },
  sheet: { level: levels },
  warnings: [],
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
})

beforeEach(() => {
  mockCreateMutateAsync.mockReset()
  mockUpdateMutateAsync.mockReset()
  mockGetCharacters.mockReset()
})

describe('useCharacterStore.saveCharacter', () => {
  it('sends the new exchange format and adds the character to the list', async () => {
    mockCreateMutateAsync.mockResolvedValue({ data: saved('Aragorn') })

    const store = mountStore()
    const result = await store.saveCharacter(minimalCharacter)

    expect(result.success).toBe(true)
    expect(mockCreateMutateAsync).toHaveBeenCalledWith({ data: expect.objectContaining({ race: 'human', background: 'soldier', classes: [expect.objectContaining({ class: 'fighter' })] }) })
    expect(store.characters).toHaveLength(1)
    expect(store.characters[0]).toMatchObject({ name: 'Aragorn', level: 1, names: { race: 'Humain' } })
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('returns the validation messages of the API when it refuses the character', async () => {
    mockCreateMutateAsync.mockRejectedValue({ message: 'Invalid character data', errors: [{ path: 'race', message: 'Unknown race "orc"' }] })

    const store = mountStore()
    const result = await store.saveCharacter(minimalCharacter)

    expect(result).toEqual({ success: false, error: 'Unknown race "orc"' })
    expect(store.characters).toHaveLength(0)
    expect(store.loading).toBe(false)
  })

  it('sets an error message when the network fails', async () => {
    mockCreateMutateAsync.mockRejectedValue(new Error('Network error'))

    const store = mountStore()
    const result = await store.saveCharacter(minimalCharacter)

    expect(result.success).toBe(false)
    expect(store.error).toBe('Network error')
  })
})

describe('useCharacterStore.updateCharacter', () => {
  it('replaces the existing character in the list instead of duplicating it', async () => {
    mockCreateMutateAsync.mockResolvedValue({ data: saved('Aragorn') })
    mockUpdateMutateAsync.mockResolvedValue({ data: saved('Aragorn le Roi', 5) })

    const store = mountStore()
    await store.saveCharacter(minimalCharacter)
    const result = await store.updateCharacter(1, { ...minimalCharacter, name: 'Aragorn le Roi' })

    expect(result.success).toBe(true)
    expect(store.characters).toHaveLength(1)
    expect(store.characters[0]!.name).toBe('Aragorn le Roi')
    expect(store.characters[0]!.level).toBe(5)
  })
})
