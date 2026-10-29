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
    // Ordre de l'API (par caractéristique) : la fiche trie par nom
    { index: 'acrobatics', name: 'Acrobaties', ability: { index: 'dex', name: 'Dextérité' } },
  ]),
  loadConditions: vi.fn(async () => [{ index: 'poisoned', name: 'Empoisonné', description: '…' }]),
  loadEquipmentCatalog: vi.fn(async () => [{ index: 'longsword', name: 'Épée longue', kind: 'WEAPON', cost: null, weightLb: 3, damage: '1d8', armorClass: null }]),
  loadFeats: vi.fn(async () => [{ index: 'grappler', name: 'Lutteur', description: 'Vous luttez.', prerequisites: [] }]),
  loadMagicItems: vi.fn(async () => [
    { index: 'cloak-of-elvenkind', name: 'Cape elfique', rarity: 'UNCOMMON', requiresAttunement: true, category: { index: 'wondrous-items', name: 'Objet merveilleux' } },
    { index: 'weapon-1', name: 'Arme, +1', rarity: 'UNCOMMON', requiresAttunement: false, category: { index: 'weapon', name: 'Arme' } },
  ]),
  loadEquipment: vi.fn(async () => ({
    index: 'longsword', name: 'Épée longue', description: null, kind: 'WEAPON', cost: { amount: 15, currency: 'GP' }, weightLb: 3, categories: [], armor: null,
    weapon: { category: 'MARTIAL', range: 'MELEE', damage: '1d8', damageType: { index: 'slashing', name: 'Tranchant' }, versatileDamage: '1d10', normalRangeFt: null, longRangeFt: null,
      properties: [{ index: 'versatile', name: 'Polyvalente', description: 'Peut être utilisée à deux mains.' }] },
  })),
  loadMagicItem: vi.fn(),
}))
vi.mock('@/stores/auth', () => ({ useAuthStore: () => ({ isAuthenticated: true, login: vi.fn() }) }))
const { mockShared, mockCopy } = vi.hoisted(() => ({ mockShared: vi.fn(), mockCopy: vi.fn() }))
vi.mock('@/api/characterShare', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/api/characterShare')>()),
  fetchSharedCharacter: mockShared,
  copySharedCharacter: mockCopy,
  shareCharacter: vi.fn(async () => ({ shareCode: 'abc123' })),
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
  attacks: [{ kind: 'WEAPON', index: 'longsword', name: 'Épée longue', attackBonus: 5, save: null, damage: '1d8 + 3 tranchant', versatileDamage: '1d10 + 3 tranchant', range: null, properties: ['Polyvalente'], equipped: true }],
  damageResistances: [{ damageType: 'fire', name: 'Feu', source: 'Résistance infernale' }],
  featureResources: [
    { feature: 'second-wind', trait: null, name: 'Second souffle', max: 1, used: 0, recharge: 'SHORT' },
    { feature: 'lay-on-hands', trait: null, name: 'Imposition des mains', max: 15, used: 0, recharge: 'LONG' },
  ],
})
const saved = (levels: number) => ({
  id: 7, name: 'Bram', edition: '2014', race: 'human', subrace: null, background: 'soldier', abilityMethod: 'POINT_BUY',
  abilityScores: { str: 15, dex: 11, con: 13, int: 9, wis: 12, cha: 7 },
  classes: [{ class: 'fighter', subclass: null, hitDiceUsed: 0, levels: Array.from({ length: levels }, (_, i) => ({ level: i + 1, characterLevel: i + 1 })) }],
  choices: [], spells: [], items: [{ equipment: 'longsword', quantity: 1, equipped: true, attuned: false }, { magicItem: 'cloak-of-elvenkind', quantity: 1, equipped: true, attuned: true }], currencies: { GP: 10 },
  personality: [], conditions: [], state: { currentHitPoints: null, temporaryHitPoints: 0, spellSlotsUsed: [], featureUsage: [] },
  names: { race: 'Humain', subrace: null, background: 'Soldat', classes: [{ class: 'Guerrier', subclass: null, level: levels }] },
  sheet: sheetValues(levels), warnings: [], createdAt: '', updatedAt: '',
})

async function mountSheet(path = '/character/7') {
  const { default: CharacterSheetView } = await import('@/views/CharacterSheetView.vue')
  const router = createRouter({ history: createMemoryHistory(), routes: [
    { path: '/character/:id', component: CharacterSheetView },
    { path: '/shared/:code', name: 'shared-character', component: (await import('@/views/SharedCharacterView.vue')).default },
    { path: '/', component: { template: '<div />' } },
    { path: '/character/:id/edit', component: { template: '<div />' } },
    { path: '/profile', component: { template: '<div />' } },
  ] })
  router.push(path)
  await router.isReady()
  // Comme dans l'application : la vue de la route courante
  const wrapper = mount({ template: '<router-view />' }, { global: { plugins: [router, createPinia(), VueQueryPlugin] } })
  await flushPromises()
  return Object.assign(wrapper, { router })
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
    // Compétences par ordre alphabétique
    expect(text.indexOf('Acrobaties')).toBeLessThan(text.indexOf('Athlétisme'))
    expect(text.indexOf('Athlétisme')).toBeLessThan(text.indexOf('Perception'))
    expect(text).toContain('Second souffle')
    expect(text).toContain('Fougue')
    expect(text).not.toContain('Critique amélioré') // niveau 3, sous-classe non choisie
    expect(text).toContain('Grade militaire')
    expect(text).toContain('Épée longue')
    expect(text).toContain('9 m') // 30 pieds
    expect(text).toContain('Cotte de mailles 16')
    expect(text).toContain('Second souffle')
    expect(text).toContain('15 / 15') // réserve affichée en compteur
    // Attaques calculées par le back, objet magique de l'inventaire
    expect(text).toContain('1d8 + 3 tranchant')
    expect(text).toContain('à deux mains : 1d10 + 3 tranchant')
    expect(text).toContain('Cape elfique')
    expect(text).toContain('Peu commun · lien')
    // Résistance d'un trait racial, dans le bloc Combat
    expect(text).toContain('Résistances')
    expect(text).toContain('Feu')
  })

  it("opens the full sheet of an inventory item, closed with Escape", async () => {
    const wrapper = await mountSheet()
    await wrapper.find('button[title="Voir la fiche de Épée longue"]').trigger('click')
    await flushPromises()
    const dialog = wrapper.find('[role="dialog"][aria-label="Épée longue"]')
    expect(dialog.text()).toContain('1d8 tranchant')
    expect(dialog.text()).toContain('Polyvalente')
    expect(dialog.text()).toContain('Peut être utilisée à deux mains.')
    expect(dialog.text()).toContain('15 po')

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPromises()
    expect(wrapper.find('[role="dialog"][aria-label="Épée longue"]').exists()).toBe(false)
  })

  it('removes the last level after dropping the answers the API refuses', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const input = saved(2)
    mockGetCharacter.mockResolvedValue({ data: { ...input, choices: [{ choiceId: 5, optionId: 50 }] } })
    // La réponse au choix 5 n'appartient plus au personnage une fois le niveau 2 retiré
    mockPreview.mockImplementationOnce(async () => ({ data: { valid: false, errors: [{ path: 'choices[0].choiceId', message: 'not available' }], sheet: null, choices: [] } }))
    vi.useFakeTimers()
    const wrapper = await mountSheet()

    // Action regroupée dans le menu « Actions »
    await wrapper.findAll('button').find((b) => b.text().startsWith('Actions'))!.trigger('click')
    await flushPromises()
    await wrapper.findAll('[role="menuitem"]').find((b) => b.text() === 'Retirer un niveau')!.trigger('click')
    await vi.advanceTimersByTimeAsync(700)

    const sent = mockUpdate.mock.calls.at(-1)![0].data
    expect(sent.classes[0].levels).toHaveLength(1)
    expect(sent.choices).toEqual([])
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

  it('edits a past ability score improvement, prefilled with the current choice', async () => {
    const base = saved(4)
    const levels = base.classes[0]!.levels.map((l) => (l.level === 4 ? { ...l, abilityIncreases: [{ ability: 'str', bonus: 2 }] } : l))
    mockGetCharacter.mockResolvedValue({ data: { ...base, classes: [{ ...base.classes[0]!, subclass: 'champion', levels }] } })
    const wrapper = await mountSheet()

    // Action regroupée dans le menu « Actions »
    await wrapper.findAll('button').find((b) => b.text().startsWith('Actions'))!.trigger('click')
    await flushPromises()
    await wrapper.findAll('[role="menuitem"]').find((b) => b.text() === 'Modifier mes choix')!.trigger('click')
    await flushPromises()
    const dialog = () => wrapper.find('[role="dialog"]')
    expect(dialog().text()).toContain('Modifier mes choix')
    expect(dialog().text()).toContain('Amélioration de caractéristiques (Guerrier 4)')
    // Le choix actuel est présélectionné : +2 en FOR
    const selected = dialog().findAll('button.choice-on').map((b) => b.text())
    expect(selected).toContain('+2 à une caractéristique')
    expect(selected.some((t) => t.startsWith('FOR'))).toBe(true)

    await dialog().findAll('button').find((b) => b.text() === 'Un don')!.trigger('click')
    await dialog().findAll('button').find((b) => b.text().startsWith('Lutteur'))!.trigger('click')
    await new Promise((r) => setTimeout(r, 300))
    await flushPromises()

    vi.useFakeTimers()
    await wrapper.findAll('footer button').find((b) => b.text() === 'Enregistrer')!.trigger('click')
    await vi.advanceTimersByTimeAsync(700)
    const sent = mockUpdate.mock.calls.at(-1)![0].data
    expect(sent.classes[0].levels).toHaveLength(4)
    expect(sent.classes[0].levels[3]).toMatchObject({ level: 4, feat: 'grappler', abilityIncreases: [] })
  })

  it('spends a limited use and saves it', async () => {
    vi.useFakeTimers()
    const wrapper = await mountSheet()

    await wrapper.find('button[title="Disponible"]').trigger('click')
    await vi.advanceTimersByTimeAsync(700)

    expect(mockUpdate.mock.calls.at(-1)![0].data.state.featureUsage).toEqual([{ feature: 'second-wind', trait: null, used: 1 }])
  })

  it('shows a shared sheet read-only, and copies it into the characters of the user', async () => {
    mockShared.mockResolvedValue({ ...saved(2), access: 'SHARED', sharedBy: 'Lucas', shareCode: null })
    mockCopy.mockResolvedValue({ id: 42 })
    const wrapper = await mountSheet('/shared/xyz')

    expect(wrapper.text()).toContain('Fiche partagée par Lucas : lecture seule')
    expect(wrapper.find('fieldset').attributes('disabled')).toBeDefined()
    expect(wrapper.findAll('button').some((b) => b.text() === 'Monter de niveau')).toBe(false)

    await wrapper.findAll('button').find((b) => b.text() === 'Copier dans mes personnages')!.trigger('click')
    await flushPromises()
    expect(mockCopy).toHaveBeenCalledWith('xyz')
    expect(wrapper.router.currentRoute.value.fullPath).toBe('/character/42')
    // La copie est chargée comme une fiche ordinaire
    await flushPromises()
    expect(mockGetCharacter.mock.calls.at(-1)![0]).toBe('42')
    expect(wrapper.text()).not.toContain('Fiche partagée par')
  })

  it('puts a magic weapon on a base weapon from the inventory', async () => {
    vi.useFakeTimers()
    mockGetCharacter.mockResolvedValue({ data: { ...saved(2), items: [{ magicItem: 'weapon-1', quantity: 1, equipped: true, attuned: false }] } })
    const wrapper = await mountSheet()

    await vi.advanceTimersByTimeAsync(700)
    // (« Arme, +1 » : la virgule couperait un sélecteur CSS en deux)
    const select = wrapper.findAll('select').find((x) => x.attributes('aria-label') === 'Objet de base de Arme, +1')!
    expect(select.findAll('option').map((o) => o.text())).toEqual(['— choisir —', 'Épée longue'])
    // La cape elfique (objet merveilleux) ne se pose sur rien
    expect(wrapper.find('select[aria-label="Objet de base de Cape elfique"]').exists()).toBe(false)

    await select.setValue('longsword')
    await vi.advanceTimersByTimeAsync(700)
    expect(mockUpdate.mock.calls.at(-1)![0].data.items[0]).toMatchObject({ magicItem: 'weapon-1', equipment: 'longsword' })
  })

  it('offers a tabbed view, remembered, with the tab in the address', async () => {
    localStorage.removeItem('dungeon-desk:sheet-layout')
    const wrapper = await mountSheet()
    const visible = (title: string) => {
      const heading = wrapper.findAll('h2').find((h) => h.text() === title)
      return !!heading && (heading.element.closest('section') as HTMLElement).style.display !== 'none'
    }
    expect(visible('Combat') && visible('Compétences')).toBe(true) // tout, par défaut

    await wrapper.findAll('button').find((b) => b.text() === 'Onglets')!.trigger('click')
    expect(localStorage.getItem('dungeon-desk:sheet-layout')).toBe('tabs')
    const tabs = wrapper.findAll('[role="tab"]').map((t) => t.text())
    // Guerrier sans sorts : pas d'onglet Sorts
    expect(tabs).toEqual(['Combat', 'Caractéristiques', 'Inventaire', 'Capacités', 'Notes'])
    expect(visible('Combat')).toBe(true)
    expect(visible('Compétences')).toBe(false)

    await wrapper.find('[role="tab"][aria-selected="true"]').trigger('keydown', { key: 'ArrowRight' })
    await flushPromises()
    expect(wrapper.router.currentRoute.value.query.onglet).toBe('carac')
    expect(visible('Compétences')).toBe(true)
    expect(visible('Combat')).toBe(false)
    localStorage.removeItem('dungeon-desk:sheet-layout')
  })

  it('changes tab with a horizontal swipe, not while scrolling or at the ends', async () => {
    localStorage.setItem('dungeon-desk:sheet-layout', 'tabs')
    const wrapper = await mountSheet()
    const panel = wrapper.find('[role="tabpanel"]')
    const swipe = async (dx: number, dy = 0) => {
      await panel.trigger('touchstart', { touches: [{ clientX: 200, clientY: 300 }] })
      await panel.trigger('touchend', { changedTouches: [{ clientX: 200 + dx, clientY: 300 + dy }] })
      await flushPromises()
    }
    const onglet = () => wrapper.router.currentRoute.value.query.onglet

    await swipe(100) // vers la droite depuis le premier onglet : rien avant
    expect(onglet()).toBeUndefined()
    await swipe(-100)
    expect(onglet()).toBe('carac')
    await swipe(-90, 120) // défilement vertical
    expect(onglet()).toBe('carac')
    await swipe(-30) // trop court
    expect(onglet()).toBe('carac')
    await swipe(100)
    expect(onglet()).toBeUndefined()
    localStorage.removeItem('dungeon-desk:sheet-layout')
  })
})
