import { describe, expect, it } from 'vitest'
import { parseDiceExpression, rollDiceExpression } from '@/composables/useDiceRoller'

describe('useDiceRoller', () => {
  it('parses a simple preset expression', () => {
    const parsed = parseDiceExpression('d20')

    expect(parsed.normalizedExpression).toBe('d20')
    expect(parsed.parts).toHaveLength(1)
    expect(parsed.parts[0]?.sides).toBe(20)
    expect(parsed.totalModifier).toBe(0)
  })

  it('rolls a mixed expression deterministically', () => {
    const randomValues = [0, 0.5]
    const result = rollDiceExpression('2d6+3', () => randomValues.shift() ?? 0)

    expect(result.total).toBe(8)
    expect(result.parts[0]?.rolls).toEqual([1, 4])
    expect(result.totalModifier).toBe(3)
  })

  it('rejects invalid input', () => {
    expect(() => parseDiceExpression('2x6')).toThrow('Formule invalide')
  })
})