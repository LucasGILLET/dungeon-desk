import { describe, expect, it } from 'vitest'
import * as a from '@/utils/sheetActions'

const base = (): a.Input => ({
  name: 'Elandra',
  race: 'elf',
  abilityScores: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
  classes: [
    { class: 'wizard', hitDiceUsed: 3, levels: [1, 2, 3, 4].map((l) => ({ level: l, characterLevel: l })) },
    { class: 'fighter', hitDiceUsed: 1, levels: [{ level: 1, characterLevel: 5 }] },
  ],
  state: { currentHitPoints: 20, temporaryHitPoints: 5, spellSlotsUsed: [{ level: 1, pact: false, used: 2 }, { level: 1, pact: true, used: 1 }] },
  items: [{ equipment: 'dagger', quantity: 2, equipped: false, attuned: false }],
})

describe('sheetActions', () => {
  it('takes damage from temporary hit points first, never below 0', () => {
    expect(a.applyDamage(base(), 32, 3).state).toMatchObject({ temporaryHitPoints: 2, currentHitPoints: 20 })
    expect(a.applyDamage(base(), 32, 9).state).toMatchObject({ temporaryHitPoints: 0, currentHitPoints: 16 })
    expect(a.applyDamage(base(), 32, 100).state?.currentHitPoints).toBe(0)
  })

  it('heals up to the maximum, which is stored as null', () => {
    expect(a.heal(base(), 32, 5).state?.currentHitPoints).toBe(25)
    expect(a.heal(base(), 32, 50).state?.currentHitPoints).toBeNull()
  })

  it('does not mutate the character it receives', () => {
    const input = base()
    a.applyDamage(input, 32, 9)
    a.addItem(input, { equipment: 'dagger' })
    expect(input.state?.currentHitPoints).toBe(20)
    expect(input.items?.[0]?.quantity).toBe(2)
  })

  it('spends a hit die to heal', () => {
    const next = a.spendHitDie(base(), 32, 'fighter', 7, 1)
    expect(next.state?.currentHitPoints).toBe(28)
    expect(next.classes[1]?.hitDiceUsed).toBe(2)
  })

  it('recovers pact slots on a short rest, everything on a long rest', () => {
    expect(a.shortRest(base()).state?.spellSlotsUsed).toEqual([{ level: 1, pact: false, used: 2 }])

    const rested = a.longRest(base())
    expect(rested.state).toMatchObject({ currentHitPoints: null, temporaryHitPoints: 0, spellSlotsUsed: [] })
    // Niveau 5 : 2 dés de vie récupérés, d'abord sur la première classe
    expect(rested.classes.map((c) => c.hitDiceUsed)).toEqual([1, 1])
  })

  it('counts and sets used spell slots per level', () => {
    expect(a.slotsUsed(base(), 1)).toBe(2)
    expect(a.slotsUsed(base(), 1, true)).toBe(1)
    expect(a.slotsUsed(a.setSlotsUsed(base(), 1, 0), 1)).toBe(0)
    expect(a.slotsUsed(a.setSlotsUsed(base(), 2, 1), 2)).toBe(1)
  })

  it('stacks catalogue items, removes items at quantity 0', () => {
    expect(a.addItem(base(), { equipment: 'dagger' }).items).toEqual([{ equipment: 'dagger', quantity: 3, equipped: false, attuned: false }])
    expect(a.addItem(base(), { name: 'Amulette' }).items).toHaveLength(2)
    expect(a.updateItem(base(), 0, { quantity: 0 }).items).toEqual([])
    expect(a.updateItem(base(), 0, { equipped: true }).items?.[0]?.equipped).toBe(true)
  })

  it('toggles conditions and sets currencies', () => {
    const poisoned = a.toggleCondition(base(), 'poisoned')
    expect(poisoned.conditions).toEqual(['poisoned'])
    expect(a.toggleCondition(poisoned, 'poisoned').conditions).toEqual([])
    expect(a.setCurrency(base(), 'GP', 12.7).currencies).toEqual({ GP: 12 })
  })
})
