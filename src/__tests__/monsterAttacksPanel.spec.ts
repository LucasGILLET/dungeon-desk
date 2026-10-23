import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import MonsterAttacksPanel from '@/components/combat/MonsterAttacksPanel.vue'
import type { ApiMonster, ApiMonsterAction } from '@/utils/dataLoader'

const action = (over: Partial<ApiMonsterAction>): ApiMonsterAction => ({
  name: '?', description: '', attack: null, save: null, usage: null, legendaryCost: null, damages: [], multiattack: [], spellcasting: null, ...over,
})
const slashing = { index: 'slashing', name: 'Tranchant' }
const monster = (actions: ApiMonsterAction[]) => ({
  name: 'Orza', traits: [], actions, bonusActions: [], reactions: [], legendaryActions: [], lairActions: [],
}) as unknown as ApiMonster

const text = (actions: ApiMonsterAction[]) =>
  mount(MonsterAttacksPanel, { props: { monster: monster(actions), targets: [] } }).text().replace(/\s+/g, ' ')

describe('MonsterAttacksPanel', () => {
  it('lists a multiattack that has its own roll once, with its description', () => {
    const shown = text([action({
      name: 'Attaques multiples', description: 'Orza attaque avec ses griffes à deux reprises',
      attack: { type: 'MELEE_WEAPON', bonus: 6, reachFt: 5, rangeFt: null }, damages: [{ dice: '2d6+3', damageType: slashing, alternativeGroup: null }],
    })])
    expect(shown.match(/Attaques multiples/g)).toHaveLength(1)
    expect(shown).toContain('Toucher +6')
    expect(shown).toContain('Orza attaque avec ses griffes à deux reprises')
  })

  it('shows a multiattack without a roll as text above the attacks', () => {
    const shown = text([
      action({ name: 'Attaques multiples', description: 'Une morsure et deux griffes.' }),
      action({ name: 'Griffes', attack: { type: 'MELEE_WEAPON', bonus: 6, reachFt: 5, rangeFt: null }, damages: [{ dice: '2d6+3', damageType: slashing, alternativeGroup: null }] }),
    ])
    expect(shown).toContain('Attaques multiples. Une morsure et deux griffes.')
    expect(shown.match(/Attaques multiples/g)).toHaveLength(1)
    expect(shown).toMatch(/Griffes ?Toucher \+6/)
  })
})
