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
  damageVulnerabilities: [], damageResistances: [{ damageType: ref('fire'), nonMagicalOnly: false, note: null }, { damageType: null, nonMagicalOnly: false, note: 'dégâts des sorts' }],
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
      skills: [{ skill: 'stealth', bonus: 6 }], damageResistances: ['fire'], senses: { darkvision: 60 }, languages: 'commun, gobelin',
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
        abilities: ['str', 'dex', 'con', 'int', 'wis', 'cha'].map((a) => ref(a)), skills: [ref('stealth', 'Discrétion')],
        damageTypes: [ref('fire', 'Feu'), ref('slashing', 'Tranchant')], conditions: [ref('frightened', 'Effrayé')],
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
})
