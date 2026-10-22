import { describe, expect, it, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { toMonsterInput } from '@/api/monsters'
import type { ApiMonster } from '@/utils/dataLoader'

const ref = (index: string, name = index) => ({ index, name })
const goblin: ApiMonster = {
  index: 'goblin', name: 'Gobelin', source: 'SRD', size: 'SMALL', type: ref('humanoid', 'Humanoïde'), subtypes: [], swarmOfSize: null,
  alignment: { unaligned: false, options: [ref('neutral-evil')] }, armorClass: 15, hitPoints: 7, challengeRating: 0.25, xp: 50, legendary: false, imageUrl: null,
  description: null,
  armorClasses: [{ value: 15, source: 'ARMOR', armor: [ref('leather-armor', 'Armure de cuir'), ref('shield', 'Bouclier')], spell: null, condition: null, note: null }],
  hitDice: { count: 2, size: 6, bonus: 0 }, speeds: { walk: 30 }, abilityScores: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
  savingThrows: [], skills: [{ index: 'stealth', name: 'Discrétion', bonus: 6 }],
  damageVulnerabilities: [], damageResistances: [{ damageType: ref('fire'), nonMagicalOnly: false, note: null }, { damageType: ref('slashing'), nonMagicalOnly: true, note: null }, { damageType: null, nonMagicalOnly: false, note: 'dégâts des sorts' }],
  damageImmunities: [], conditionImmunities: [], senses: { darkvision: 60 }, passivePerception: 9,
  languages: { text: 'commun, gobelin', list: [], telepathyFt: null }, proficiencyBonus: 2, legendaryActionsPerRound: null,
  traits: [{ name: 'Fuite agile', description: 'Se désengager en action bonus.', attack: null, save: null, usage: null, legendaryCost: null, damages: [], multiattack: [], spellcasting: null }],
  actions: [{
    name: 'Cimeterre', description: 'Attaque…', attack: { type: 'MELEE_WEAPON', bonus: 4, reachFt: 5, rangeFt: null }, save: null, usage: null, legendaryCost: null,
    damages: [{ dice: '1d6 + 2', damageType: ref('slashing'), alternativeGroup: null }, { dice: '1d6', damageType: ref('fire'), alternativeGroup: 1 }, { dice: '1d6', damageType: ref('cold'), alternativeGroup: 1 }],
    multiattack: [], spellcasting: null,
  }],
  bonusActions: [], reactions: [], legendaryActions: [], lairActions: [], forms: [],
}

describe('toMonsterInput', () => {
  it('turns a bestiary sheet into the form input', () => {
    const input = toMonsterInput(goblin)
    expect(input).toMatchObject({
      name: 'Gobelin', size: 'SMALL', type: 'humanoid', alignment: 'neutral-evil', challengeRating: 0.25,
      armorClass: { value: 15, note: 'Armure de cuir, Bouclier' }, hitDice: { count: 2, size: 6, bonus: 0 }, hitPoints: 7,
      skills: [{ skill: 'stealth', bonus: 6 }], senses: { darkvision: 60 }, languages: 'commun, gobelin',
      damageResistances: [{ damageType: 'fire', nonMagicalOnly: false }, { damageType: 'slashing', nonMagicalOnly: true }],
    })
    // Dégâts au choix : la première possibilité seulement ; dés sans espaces (format de l'API)
    expect(input.actions[0]!.damages).toEqual([{ dice: '1d6+2', damageType: 'slashing' }, { dice: '1d6', damageType: 'fire' }])
    expect(input.traits[0]).toMatchObject({ name: 'Fuite agile', attack: null, damages: [] })
  })
})

const { create, update } = vi.hoisted(() => ({ create: vi.fn(), update: vi.fn() }))
vi.mock('@/api/monsters', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/monsters')>()
  return {
    ...actual,
    monstersApi: {
      options: vi.fn(async () => ({
        creatureTypes: [ref('humanoid', 'Humanoïde'), ref('dragon', 'Dragon')], alignments: [ref('neutral-evil', 'neutre mauvais')],
        abilities: ['str', 'dex', 'con', 'int', 'wis', 'cha'].map((a) => ref(a)),
        skills: [{ ...ref('stealth', 'Discrétion'), ability: 'dex' }, { ...ref('perception', 'Perception'), ability: 'wis' }],
        damageTypes: [ref('fire', 'Feu'), ref('slashing', 'Tranchant'), ref('piercing', 'Perforant'), ref('bludgeoning', 'Contondant')],
        conditions: [ref('frightened', 'Effrayé')],
        challengeRatings: [{ value: 0.25, xp: 50 }, { value: 1, xp: 200 }, { value: 2, xp: 450 }],
      })),
      get: vi.fn(), create, update,
    },
  }
})
vi.mock('@/utils/dataLoader', () => ({ loadMonster: vi.fn(async () => goblin) }))

async function mountForm(path: string) {
  const { default: MonsterFormView } = await import('@/views/MonsterFormView.vue')
  const router = createRouter({ history: createMemoryHistory(), routes: [
    { path: '/my-monsters/new', name: 'homebrew-monster-new', component: MonsterFormView },
    { path: '/my-monsters/:index', name: 'homebrew-monster', component: { template: '<div />' } },
    { path: '/bestiary', name: 'bestiary', component: { template: '<div />' } },
  ] })
  router.push(path)
  await router.isReady()
  const wrapper = mount(MonsterFormView, { global: { plugins: [router] } })
  await flushPromises()
  return { wrapper, router }
}

beforeEach(() => {
  create.mockReset().mockResolvedValue({ index: 'dragonnet-abc123' })
  update.mockReset()
})

describe('MonsterFormView', () => {
  it('creates a monster, with distances typed in meters and sent in feet', async () => {
    const { wrapper, router } = await mountForm('/my-monsters/new')
    await wrapper.find('input[required][maxlength="120"]').setValue('Dragonnet')
    const fly = wrapper.findAll('label').find((l) => l.text().startsWith('Vol (m)'))!.find('input')
    await fly.setValue('18')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    const sent = create.mock.calls[0]![0]
    expect(sent).toMatchObject({ name: 'Dragonnet', speeds: { walk: 30, fly: 60 }, hitPoints: null, passivePerception: null, legendaryActionsPerRound: null })
    expect(router.currentRoute.value.fullPath).toBe('/my-monsters/dragonnet-abc123')
  })

  it('starts from a copy of an SRD monster', async () => {
    const { wrapper } = await mountForm('/my-monsters/new?from=goblin')
    expect(wrapper.text()).toContain('Copie de « Gobelin » du SRD')
    expect((wrapper.find('input[required][maxlength="120"]').element as HTMLInputElement).value).toBe('Gobelin (variante)')
    expect(wrapper.findAll('input').some((i) => (i.element as HTMLInputElement).value === 'Cimeterre')).toBe(true)
  })

  it('shows every save and skill, adds the proficiency bonus, and follows ability changes', async () => {
    const { wrapper } = await mountForm('/my-monsters/new')
    // FP 1 : bonus de maîtrise +2 ; DEX 10 au départ
    await wrapper.find('input[aria-label="Maîtrise des sauvegardes de DEX"]').setValue(true)
    expect((wrapper.find('input[aria-label="Bonus de sauvegarde de DEX"]').element as HTMLInputElement).value).toBe('2')
    await wrapper.find('select[aria-label="Maîtrise de Discrétion"]').setValue('E')
    expect((wrapper.find('input[aria-label="Bonus de Discrétion"]').element as HTMLInputElement).value).toBe('4')
    // Perception non maîtrisée : la valeur de SAG, affichée
    expect(wrapper.find('select[aria-label="Maîtrise de Perception"]').element.parentElement!.textContent).toContain('+0')

    // DEX 16 (+3) : les bonus calculés suivent
    const dex = wrapper.findAll('label').find((l) => l.text().startsWith('DEX'))!.find('input')
    await dex.setValue(16)
    await flushPromises()
    expect((wrapper.find('input[aria-label="Bonus de sauvegarde de DEX"]').element as HTMLInputElement).value).toBe('5')
    expect((wrapper.find('input[aria-label="Bonus de Discrétion"]').element as HTMLInputElement).value).toBe('7')
  })

  it('distinguishes resistances to non-magical attacks, and has lair actions', async () => {
    const { wrapper } = await mountForm('/my-monsters/new')
    await wrapper.find('input[required][maxlength="120"]').setValue('Golem de chair')
    const resistances = wrapper.findAll('div').find((d) => d.element.firstElementChild?.textContent?.trim().startsWith('Résistances'))!
    const slashing = resistances.findAll('button').find((b) => b.text() === 'Tranchant')!
    await slashing.trigger('click')
    await slashing.trigger('click')
    expect(slashing.text()).toBe('Tranchant (non magique)')
    await resistances.findAll('button').find((b) => b.text() === 'Feu')!.trigger('click')

    const lair = wrapper.findAll('section').find((x) => x.find('h2').exists() && x.find('h2').text() === 'Actions de repaire')!
    await lair.find('button').trigger('click')
    await lair.find('input[required]').setValue('Éboulement')

    await wrapper.find('form').trigger('submit')
    await flushPromises()
    const sent = create.mock.calls[0]![0]
    expect(sent.damageResistances).toEqual([{ damageType: 'slashing', nonMagicalOnly: true }, { damageType: 'fire', nonMagicalOnly: false }])
    expect(sent.lairActions).toEqual([expect.objectContaining({ name: 'Éboulement' })])
  })
})
