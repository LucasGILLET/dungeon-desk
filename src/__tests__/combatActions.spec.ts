import { describe, expect, it } from 'vitest'
import type { Combat, Combatant } from '@/api/campaigns'
import * as a from '@/utils/combatActions'

const fighter = (over: Partial<Combatant>): Combatant => ({
  kind: 'MONSTER', character: null, monster: null, name: '?', initiative: null, initiativeBonus: 0, armorClass: 12,
  maxHitPoints: 10, hitPoints: 10, tempHitPoints: 0, conditions: [], note: null, hidden: false, ...over,
})
const combat = (combatants: Combatant[], turn = 0, round = 1): Combat => ({
  id: 1, name: 'Embuscade', encounterId: null, round, turn, finished: false, shareCode: null, updatedAt: '', combatants,
})

describe('combatActions', () => {
  it('sorts by initiative, then bonus, then characters first, keeping the turn on the same combatant', () => {
    const c = combat([
      fighter({ name: 'Gobelin', initiative: 12, initiativeBonus: 2 }),
      fighter({ name: 'Bram', kind: 'CHARACTER', initiative: 12, initiativeBonus: 2 }),
      fighter({ name: 'Ogre', initiative: 18 }),
      fighter({ name: 'Rat', initiative: 12, initiativeBonus: 3 }),
    ], 0)
    const sorted = a.sortByInitiative(c)
    expect(sorted.combatants.map((x) => x.name)).toEqual(['Ogre', 'Rat', 'Bram', 'Gobelin'])
    expect(sorted.combatants[sorted.turn]!.name).toBe('Gobelin')
  })

  it('rolls d20 + bonus for the creatures only, or for whoever has no initiative yet', () => {
    const c = combat([fighter({ name: 'Bram', kind: 'CHARACTER', initiative: 15 }), fighter({ name: 'Gobelin', initiativeBonus: 2 })])
    const rolled = a.rollInitiative(c, 'creatures', () => 0.5) // d20 = 11
    expect(rolled.combatants.find((x) => x.name === 'Gobelin')!.initiative).toBe(13)
    expect(rolled.combatants.find((x) => x.name === 'Bram')!.initiative).toBe(15)

    const missing = a.rollInitiative(combat([fighter({ name: 'Bram', kind: 'CHARACTER' })]), 'missing', () => 0)
    expect(missing.combatants[0]!.initiative).toBe(1)
  })

  it('goes to the next turn, skipping creatures out of the fight, and starts a new round', () => {
    const c = combat([fighter({ name: 'A' }), fighter({ name: 'B', hitPoints: 0 }), fighter({ name: 'C', kind: 'CHARACTER', hitPoints: 0 })])
    const second = a.nextTurn(c)
    expect(second.turn).toBe(2) // B est hors de combat ; C, personnage à 0 PV, joue (jets contre la mort)
    const third = a.nextTurn(second)
    expect(third).toMatchObject({ turn: 0, round: 2 })
    expect(a.nextTurn(third, -1)).toMatchObject({ turn: 2, round: 1 })
    expect(a.nextTurn(combat([fighter({})]), -1)).toMatchObject({ turn: 0, round: 1 })
  })

  it('takes damage from temporary hit points first, heals up to the maximum', () => {
    const c = combat([fighter({ hitPoints: 8, tempHitPoints: 3 })])
    expect(a.damage(c, 0, 5).combatants[0]).toMatchObject({ tempHitPoints: 0, hitPoints: 6 })
    expect(a.damage(c, 0, 50).combatants[0]!.hitPoints).toBe(0)
    expect(a.heal(c, 0, 50).combatants[0]!.hitPoints).toBe(10)
  })

  it('numbers added creatures and keeps the turn when removing one', () => {
    let c = combat([fighter({ name: 'Gobelin 1' }), fighter({ name: 'Gobelin 2' }), fighter({ name: 'Bram', kind: 'CHARACTER' })], 2)
    c = a.addCombatants(c, fighter({ name: 'Gobelin' }), 2)
    expect(c.combatants.map((x) => x.name)).toEqual(['Gobelin 1', 'Gobelin 2', 'Bram', 'Gobelin 3', 'Gobelin 4'])
    const removed = a.removeCombatant(c, 0)
    expect(removed.combatants[removed.turn]!.name).toBe('Bram')
    const moved = a.move(removed, 1, -1)
    expect(moved.combatants.map((x) => x.name).slice(0, 2)).toEqual(['Bram', 'Gobelin 2'])
    expect(moved.combatants[moved.turn]!.name).toBe('Bram')
  })
})
