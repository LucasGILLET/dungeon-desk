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

beforeEach(() => {
  mockCreateMutateAsync.mockReset()
  mockUpdateMutateAsync.mockReset()
  mockGetCharacters.mockReset()
})

describe('useCharacterStore.saveCharacter', () => {
  it('adds the newly created character to the list on success', async () => {
    mockCreateMutateAsync.mockResolvedValue({
      data: { id: 1, userId: 1, name: 'Aragorn', level: 1, data: minimalCharacter, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
    })

    const store = mountStore()
    const result = await store.saveCharacter(minimalCharacter)

    expect(result.success).toBe(true)
    expect(store.characters).toHaveLength(1)
    expect(store.characters[0]!.name).toBe('Aragorn')
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('sets an error message and returns success: false when the API call fails', async () => {
    mockCreateMutateAsync.mockRejectedValue(new Error('Network error'))

    const store = mountStore()
    const result = await store.saveCharacter(minimalCharacter)

    expect(result.success).toBe(false)
    expect(store.error).toBe('Network error')
    expect(store.characters).toHaveLength(0)
    expect(store.loading).toBe(false)
  })
})

describe('useCharacterStore.updateCharacter', () => {
  it('replaces the existing character in the list instead of duplicating it', async () => {
    mockCreateMutateAsync.mockResolvedValue({
      data: { id: 1, userId: 1, name: 'Aragorn', level: 1, data: minimalCharacter, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
    })
    mockUpdateMutateAsync.mockResolvedValue({
      data: { id: 1, userId: 1, name: 'Aragorn le Roi', level: 5, data: minimalCharacter, createdAt: '2026-01-01', updatedAt: '2026-01-03' },
    })

    const store = mountStore()
    await store.saveCharacter(minimalCharacter)
    const result = await store.updateCharacter(1, { ...minimalCharacter, name: 'Aragorn le Roi', level: 5 })

    expect(result.success).toBe(true)
    expect(store.characters).toHaveLength(1)
    expect(store.characters[0]!.name).toBe('Aragorn le Roi')
    expect(store.characters[0]!.level).toBe(5)
  })
})
