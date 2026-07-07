import { describe, expect, it } from 'vitest'
import { getAbilityPointCost, getAbilityDescription, translateAbilityScore } from '@/utils/abilities'

describe('getAbilityPointCost', () => {
  it('costs 0 points to stay at the base value of 8', () => {
    expect(getAbilityPointCost(8)).toBe(0)
  })

  it('follows the D&D 5e point-buy table for values 9 to 13', () => {
    expect(getAbilityPointCost(9)).toBe(1)
    expect(getAbilityPointCost(10)).toBe(2)
    expect(getAbilityPointCost(11)).toBe(3)
    expect(getAbilityPointCost(12)).toBe(4)
    expect(getAbilityPointCost(13)).toBe(5)
  })

  it('charges a steeper cost for 14 and 15 (the classic point-buy jump)', () => {
    expect(getAbilityPointCost(14)).toBe(7)
    expect(getAbilityPointCost(15)).toBe(9)
  })

  it('returns 0 for values outside the known table', () => {
    expect(getAbilityPointCost(7)).toBe(0)
    expect(getAbilityPointCost(16)).toBe(0)
  })
})

describe('getAbilityDescription', () => {
  it('returns the French description for a known ability', () => {
    expect(getAbilityDescription('Force')).toContain('Puissance physique')
  })

  it('returns an empty string for an unknown ability', () => {
    expect(getAbilityDescription('Chance')).toBe('')
  })
})

describe('translateAbilityScore', () => {
  it('translates known English ability codes to French', () => {
    expect(translateAbilityScore('STR')).toBe('FOR')
    expect(translateAbilityScore('WIS')).toBe('SAG')
  })

  it('returns the input unchanged when the code is unknown', () => {
    expect(translateAbilityScore('LUK')).toBe('LUK')
  })
})
