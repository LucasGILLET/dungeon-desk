import { describe, expect, it, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { createMemoryHistory, createRouter } from 'vue-router'

// --- Données de jeu (formes renvoyées par l'API) ---------------------------------------

const level = (l: number, asi: number, values: Record<string, unknown> = {}) => ({ level: l, abilityScoreImprovements: asi, cantripsKnown: null, spellsKnown: null, spellSlots: [], values })
const fighter = {
  index: 'fighter', name: 'Guerrier', hitDie: 10, subclassLevel: 3, savingThrows: [], proficiencies: [], startingEquipment: [], spellcasting: null,
  subclasses: [{ index: 'champion', name: 'Champion', source: 'SRD', description: 'Un guerrier accompli.', spells: [] }],
  features: [
    { index: 'second-wind', level: 1, subclass: null, parent: null, name: 'Second souffle', description: 'Regagnez 1d10 PV.' },
    { index: 'action-surge', level: 2, subclass: null, parent: null, name: 'Fougue', description: 'Une action de plus.' },
    { index: 'improved-critical', level: 3, subclass: 'champion', parent: null, name: 'Critique amélioré', description: '19-20.' },
  ],
  table: {
    columns: [{ key: 'ki_points', label: 'Points de ki', type: 'INTEGER' }, { key: 'unarmored_movement', label: 'Déplacement sans armure (pieds)', type: 'INTEGER' }],
    levels: [
      level(1, 0, { ki_points: 0, unarmored_movement: 0 }), level(2, 0, { ki_points: 2, unarmored_movement: 10 }),
      level(3, 0, { ki_points: 3, unarmored_movement: 10 }), level(4, 1, { ki_points: 4, unarmored_movement: 10 }), level(5, 1),
    ],
  },
}

vi.mock('@/utils/dataLoader', () => ({
  loadApiClass: vi.fn(async (index: string) => (index === 'fighter' ? fighter : undefined)),
  loadApiClasses: vi.fn(async () => [fighter]),
  loadApiRaces: vi.fn(async () => [{ index: 'human', name: 'Humain', speeds: { walk: 30 }, traits: [], subraces: [] }]),
  loadApiBackgrounds: vi.fn(async () => [{ index: 'soldier', name: 'Soldat', feature: { name: 'Grade militaire', description: 'Respect.' } }]),
  loadSkills: vi.fn(async () => [
    { index: 'athletics', name: 'Athlétisme', ability: { index: 'str', name: 'Force' } },
    { index: 'perception', name: 'Perception', ability: { index: 'wis', name: 'Sagesse' } },
  ]),
  loadConditions: vi.fn(async () => [{ index: 'poisoned', name: 'Empoisonné', description: '…' }]),
  loadEquipmentCatalog: vi.fn(async () => [{ index: 'longsword', name: 'Épée longue', kind: 'WEAPON', cost: null, weightLb: 3, damage: '1d8', armorClass: null }]),
  loadFeats: vi.fn(async () => [{ index: 'grappler', name: 'Lutteur', description: 'Vous luttez.', prerequisites: [] }]),
}))
vi.mock('@/utils/subclasses', () => ({
  loadSubclassesForClass: vi.fn(async () => [{ id: 'champion', index: 'champion', name: 'Champion', className: 'fighter', source: 'SRD', description: 'Un guerrier accompli.' }]),
}))

const { mockGetCharacter, mockUpdate, mockPreview } = vi.hoisted(() => ({ mockGetCharacter: vi.fn(), mockUpdate: vi.fn(), mockPreview: vi.fn() }))
vi.mock('@/api/generated/endpoints', () => ({
  getCharacter: mockGetCharacter,
  getCharacters: vi.fn(),
  getGetCharactersQueryKey: () => ['characters'],
  useCreateCharacter: () => ({ mutateAsync: vi.fn() }),
  useUpdateCharacter: () => ({ mutateAsync: mockUpdate }),
  previewCharacter: mockPreview,
}))

const sheetValues = (levels: number) => ({
  level: levels, proficiencyBonus: 2, maxHitPoints: 12 + (levels - 1) * 7,
  abilityScores: Object.fromEntries(['str', 'dex', 'con', 'int', 'wis', 'cha'].map((a, i) => [a, { base: 10, bonus: 0, total: [16, 12, 14, 10, 13, 8][i], modifier: [3, 1, 2, 0, 1, -1][i] }])),
  pending: { subclasses: [], abilityScoreImprovements: [], choices: [] },
  proficiencies: [{ index: 'skill-athletics', name: 'Compétence : Athlétisme', type: 'SKILL' }, { index: 'saving-throw-str', name: 'Jet de sauvegarde : FOR', type: 'SAVING_THROW' }],
  expertise: [], languages: [{ index: 'common', name: 'Commun' }],
  hitDice: [{ class: 'fighter', die: 10, total: levels, used: 0 }], spellSlots: [], pactSlots: null, spellcasting: [],
  armorClass: { value: 16, detail: 'Cotte de mailles 16' },
  featureResources: [
    { feature: 'second-wind', trait: null, name: 'Second souffle', max: 1, used: 0, recharge: 'SHORT' },
    { feature: 'lay-on-hands', trait: null, name: 'Imposition des mains', max: 15, used: 0, recharge: 'LONG' },
  ],
})
const saved = (levels: number) => ({
  id: 7, name: 'Bram', edition: '2014', race: 'human', subrace: null, background: 'soldier', abilityMethod: 'POINT_BUY',
  abilityScores: { str: 15, dex: 11, con: 13, int: 9, wis: 12, cha: 7 },
  classes: [{ class: 'fighter', subclass: null, hitDiceUsed: 0, levels: Array.from({ length: levels }, (_, i) => ({ level: i + 1, characterLevel: i + 1 })) }],
  choices: [], spells: [], items: [{ equipment: 'longsword', quantity: 1, equipped: true, attuned: false }], currencies: { GP: 10 },
  personality: [], conditions: [], state: { currentHitPoints: null, temporaryHitPoints: 0, spellSlotsUsed: [], featureUsage: [] },
  names: { race: 'Humain', subrace: null, background: 'Soldat', classes: [{ class: 'Guerrier', subclass: null, level: levels }] },
  sheet: sheetValues(levels), warnings: [], createdAt: '', updatedAt: '',
})

async function mountSheet() {
  const { default: CharacterSheetView } = await import('@/views/CharacterSheetView.vue')
  const router = createRouter({ history: createMemoryHistory(), routes: [
    { path: '/character/:id', component: CharacterSheetView },
    { path: '/character/:id/edit', component: { template: '<div />' } },
    { path: '/profile', component: { template: '<div />' } },
  ] })
  router.push('/character/7')
  await router.isReady()
  const wrapper = mount(CharacterSheetView, { global: { plugins: [router, createPinia(), VueQueryPlugin] } })
  await flushPromises()
  return wrapper
}

beforeEach(() => {
  vi.useRealTimers()
  mockGetCharacter.mockReset().mockResolvedValue({ data: saved(2) })
  mockUpdate.mockReset().mockImplementation(async ({ data }) => ({ data: { ...saved(data.classes[0].levels.length), ...data } }))
  mockPreview.mockReset().mockImplementation(async (input) => ({
    data: { valid: true, errors: [], sheet: sheetValues(input.classes[0].levels.length), choices: [], startingEquipment: { items: [], currencies: {} } },
  }))
})

describe('CharacterSheetView', () => {
  it('shows what the new level brings, even without a choice to make', async () => {
    mockGetCharacter.mockResolvedValue({ data: saved(1) })
    const wrapper = await mountSheet()

    await wrapper.findAll('button').find((b) => b.text() === 'Monter de niveau')!.trigger('click')
    await flushPromises()
    const text = wrapper.find('[role="dialog"]').text()

    expect(text).toContain('Ce que vous gagnez')
    expect(text).toContain('Fougue')
    expect(text).toContain('Une action de plus.')
    expect(text).not.toContain('Second souffle') // déjà acquis au niveau 1
    expect(text).toContain('Points de ki2')
    expect(text).toContain('Déplacement sans armure3 m') // 10 pieds
    expect(text).toContain('PV max12 → 19')
  })

  it('shows the values computed by the back, features up to the level and the inventory', async () => {
    const text = (await mountSheet()).text()

    expect(text).toContain('Bram')
    expect(text).toContain('Guerrier 2')
    expect(text).toContain('19 / 19') // PV au maximum
    expect(text).toContain('Athlétisme')
    expect(text).toContain('Second souffle')
    expect(text).toContain('Fougue')
    expect(text).not.toContain('Critique amélioré') // niveau 3, sous-classe non choisie
    expect(text).toContain('Grade militaire')
    expect(text).toContain('Épée longue')
    expect(text).toContain('9 m') // 30 pieds
    expect(text).toContain('Cotte de mailles 16')
    expect(text).toContain('Second souffle')
    expect(text).toContain('15 / 15') // réserve affichée en compteur
  })

  it('saves damage automatically, in the exchange format', async () => {
    vi.useFakeTimers()
    const wrapper = await mountSheet()

    await wrapper.find('input[aria-label="Montant"]').setValue(5)
    await wrapper.findAll('button').find((b) => b.text() === 'Dégâts')!.trigger('click')
    await vi.advanceTimersByTimeAsync(700)

    expect(mockUpdate).toHaveBeenCalledTimes(1)
    const sent = mockUpdate.mock.calls[0]![0]
    expect(sent.id).toBe('7')
    expect(sent.data.state.currentHitPoints).toBe(14)
    expect(sent.data).not.toHaveProperty('sheet')
    expect(sent.data).not.toHaveProperty('names')
  })

  it('levels up with the average hit points and asks for the subclass at level 3', async () => {
    const wrapper = await mountSheet()

    await wrapper.findAll('button').find((b) => b.text() === 'Monter de niveau')!.trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Niveau 3')
    expect(wrapper.text()).toContain('Moyenne : 6 +2')
    expect(wrapper.text()).toContain('Guerrier : archétype martial')

    expect(wrapper.find('[role="dialog"]').text()).not.toContain('Critique amélioré')
    // Sans sous-classe, pas de validation possible
    const validate = () => wrapper.findAll('footer button').find((b) => b.text() === 'Monter de niveau')!
    expect(validate().attributes('disabled')).toBeDefined()
    await wrapper.findAll('button').find((b) => b.text().startsWith('Champion'))!.trigger('click')
    await new Promise((r) => setTimeout(r, 300))
    await flushPromises()
    expect(validate().attributes('disabled')).toBeUndefined()
    // Capacités de la sous-classe choisie
    expect(wrapper.find('[role="dialog"]').text()).toContain('Critique amélioré')

    vi.useFakeTimers()
    await validate().trigger('click')
    await vi.advanceTimersByTimeAsync(700)
    const sent = mockUpdate.mock.calls.at(-1)![0].data
    expect(sent.classes[0]).toMatchObject({ subclass: 'champion', levels: [{ level: 1 }, { level: 2 }, { level: 3, characterLevel: 3, hitPointRoll: null }] })
  })

  it('asks for an ability score improvement or a feat at level 4', async () => {
    mockGetCharacter.mockResolvedValue({ data: { ...saved(3), classes: [{ ...saved(3).classes[0], subclass: 'champion' }] } })
    const wrapper = await mountSheet()

    await wrapper.findAll('button').find((b) => b.text() === 'Monter de niveau')!.trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Amélioration de caractéristiques (Guerrier 4)')

    await wrapper.findAll('button').find((b) => b.text() === 'Un don')!.trigger('click')
    await wrapper.findAll('button').find((b) => b.text().startsWith('Lutteur'))!.trigger('click')
    await new Promise((r) => setTimeout(r, 300))
    await flushPromises()

    vi.useFakeTimers()
    await wrapper.findAll('footer button').find((b) => b.text() === 'Monter de niveau')!.trigger('click')
    await vi.advanceTimersByTimeAsync(700)
    const sent = mockUpdate.mock.calls.at(-1)![0].data
    expect(sent.classes[0].levels[3]).toMatchObject({ level: 4, feat: 'grappler', abilityIncreases: [] })
  })

  it('spends a limited use and saves it', async () => {
    vi.useFakeTimers()
    const wrapper = await mountSheet()

    await wrapper.find('button[title="Disponible"]').trigger('click')
    await vi.advanceTimersByTimeAsync(700)

    expect(mockUpdate.mock.calls.at(-1)![0].data.state.featureUsage).toEqual([{ feature: 'second-wind', trait: null, used: 1 }])
  })
})

