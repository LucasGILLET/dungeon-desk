import { describe, expect, it, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import type { Combat, Combatant } from '@/api/campaigns'

const { saveCombat, combat } = vi.hoisted(() => ({ saveCombat: vi.fn(), combat: vi.fn() }))
vi.mock('@/api/campaigns', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/campaigns')>()
  return { ...actual, campaignsApi: { combat, saveCombat, shareCombat: vi.fn(), removeCombat: vi.fn() } }
})
vi.mock('@/api/monsters', () => ({ monstersApi: { list: vi.fn(async () => []), get: vi.fn() } }))
vi.mock('@/utils/dataLoader', () => ({
  loadConditions: vi.fn(async () => [{ index: 'prone', name: 'À terre', description: '' }]),
  loadMonsters: vi.fn(async () => []),
  loadMonster: vi.fn(async () => ({
    index: 'goblin', name: 'Gobelin', source: 'SRD', abilityScores: { dex: 14 },
    traits: [], bonusActions: [], reactions: [], legendaryActions: [], lairActions: [],
    actions: [{
      name: 'Cimeterre', description: 'Attaque…', attack: { type: 'MELEE_WEAPON', bonus: 4, reachFt: 5, rangeFt: null }, save: null, usage: null, legendaryCost: null,
      damages: [{ dice: '1d6+2', damageType: { index: 'slashing', name: 'Tranchant' }, alternativeGroup: null }], multiattack: [], spellcasting: null,
    }],
  })),
}))

const fighter = (over: Partial<Combatant>): Combatant => ({
  kind: 'MONSTER', character: null, monster: null, name: '?', initiative: null, initiativeBonus: 0, armorClass: 12,
  maxHitPoints: 10, hitPoints: 10, tempHitPoints: 0, conditions: [], note: null, hidden: false, ...over,
})
const stored = (): Combat => ({
  id: 3, name: 'Embuscade', encounterId: 1, round: 1, turn: 0, finished: false, shareCode: null, updatedAt: '',
  combatants: [
    fighter({ name: 'Bram', kind: 'CHARACTER', character: { id: 9, name: 'Bram' }, initiative: 17, hitPoints: 24, maxHitPoints: 30 }),
    fighter({ name: 'Gobelin 1', monster: { index: 'goblin', name: 'Gobelin', homebrew: false }, initiative: 12, hitPoints: 7, maxHitPoints: 7 }),
  ],
})

async function mountTracker() {
  const { default: CombatTrackerView } = await import('@/views/CombatTrackerView.vue')
  const router = createRouter({ history: createMemoryHistory(), routes: [
    { path: '/campaigns/:id/combats/:combatId', name: 'combat-tracker', component: CombatTrackerView },
    { path: '/campaigns/:id', name: 'campaign', component: { template: '<div />' } },
    { path: '/bestiary/:index', name: 'monster-view', component: { template: '<div />' } },
    { path: '/my-monsters/:index', name: 'homebrew-monster', component: { template: '<div />' } },
    { path: '/character/:id', component: { template: '<div />' } },
  ] })
  router.push('/campaigns/5/combats/3')
  await router.isReady()
  const wrapper = mount(CombatTrackerView, { global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

beforeEach(() => {
  vi.useRealTimers()
  combat.mockReset().mockResolvedValue(stored())
  saveCombat.mockReset().mockImplementation(async (_id: number, c: Combat) => c)
})

describe('CombatTrackerView', () => {
  it('shows the initiative order and whose turn it is', async () => {
    const wrapper = await mountTracker()
    expect(wrapper.text()).toContain('Round 1')
    expect(wrapper.text()).toContain('Tour de Bram')
    expect(wrapper.find('[aria-current="step"] input[aria-label="Nom de Bram"]').exists()).toBe(true)
  })

  it('passes the turn, applies damage and saves the whole combat', async () => {
    vi.useFakeTimers()
    const wrapper = await mountTracker()

    await wrapper.findAll('button').find((b) => b.text() === 'Tour suivant →')!.trigger('click')
    expect(wrapper.text()).toContain('Tour de Gobelin 1')

    await wrapper.find('input[aria-label="Montant pour Gobelin 1"]').setValue(4)
    await wrapper.findAll('button').filter((b) => b.text() === 'Dégâts')[1]!.trigger('click')
    await vi.advanceTimersByTimeAsync(700)

    // Un seul enregistrement pour les deux changements
    expect(saveCombat).toHaveBeenCalledTimes(1)
    const sent = saveCombat.mock.calls[0]![1] as Combat
    expect(sent).toMatchObject({ turn: 1, round: 1 })
    expect(sent.combatants[1]!.hitPoints).toBe(3)
  })

  it('adds a condition from the list', async () => {
    vi.useFakeTimers()
    const wrapper = await mountTracker()
    await wrapper.find('select[aria-label="Ajouter un état à Gobelin 1"]').setValue('prone')
    await vi.advanceTimersByTimeAsync(700)
    expect((saveCombat.mock.calls[0]![1] as Combat).combatants[1]!.conditions).toEqual(['prone'])
  })

  it("rolls a monster's attack and damage, and applies the damage to a target", async () => {
    vi.useFakeTimers()
    vi.spyOn(Math, 'random').mockReturnValue(0.999) // 20 naturel, puis dés au maximum
    const wrapper = await mountTracker()

    await wrapper.findAll('button').find((b) => b.text().startsWith('Attaques'))!.trigger('click')
    await wrapper.find('button[aria-label="Jet d\'attaque : Cimeterre"]').trigger('click')
    expect(wrapper.text().replace(/\s+/g, ' ')).toContain('Attaque : 24 (20 +4) — coup critique, dégâts doublés')
    await wrapper.find('button[aria-label="Jet de dégâts : Cimeterre"]').trigger('click')
    expect(wrapper.text().replace(/\s+/g, ' ')).toContain('Dégâts : 14 (14 tranchant, critique)') // 2d6+2 au maximum

    await wrapper.find('select[aria-label="Appliquer les dégâts de Cimeterre à"]').setValue('0')
    await vi.advanceTimersByTimeAsync(700)
    expect((saveCombat.mock.calls.at(-1)![1] as Combat).combatants[0]!.hitPoints).toBe(10) // Bram : 24 - 14
    vi.mocked(Math.random).mockRestore()
  })

  it('picks up the hit points changed on a character sheet, every 10 seconds when idle', async () => {
    vi.useFakeTimers()
    const healed = stored()
    healed.combatants[0]!.hitPoints = 30 // le joueur s'est soigné sur sa fiche
    combat.mockResolvedValueOnce(stored()).mockResolvedValue(healed)
    const wrapper = await mountTracker()
    expect((wrapper.find('input[aria-label="PV de Bram"]').element as HTMLInputElement).value).toBe('24')

    await vi.advanceTimersByTimeAsync(10000)
    expect((wrapper.find('input[aria-label="PV de Bram"]').element as HTMLInputElement).value).toBe('30')
    expect(saveCombat).not.toHaveBeenCalled()
  })
})
