import { beforeEach, describe, expect, it, vi } from 'vitest'

type DiceRollerModule = typeof import('@/composables/useDiceRoller')

describe('useDiceRoller', () => {
  let module: DiceRollerModule

  beforeEach(async () => {
    vi.resetModules()
    module = await import('@/composables/useDiceRoller')
  })

  it('parses a simple preset expression', () => {
    const parsed = module.parseDiceExpression('d20')

    expect(parsed.normalizedExpression).toBe('d20')
    expect(parsed.parts).toHaveLength(1)
    expect(parsed.parts[0]?.sides).toBe(20)
    expect(parsed.totalModifier).toBe(0)
  })

  it('normalizes spaces, casing and merged modifiers', () => {
    const parsed = module.parseDiceExpression(' 2D6 + 3 - 1 ')

    expect(parsed.normalizedExpression).toBe('2d6+2')
    expect(parsed.parts).toHaveLength(1)
    expect(parsed.totalModifier).toBe(2)
  })

  it('supports negative dice groups', () => {
    const parsed = module.parseDiceExpression('d20-1d4+2')

    expect(parsed.normalizedExpression).toBe('d20-d4+2')
    expect(parsed.parts).toHaveLength(2)
    expect(parsed.parts[0]?.sign).toBe(1)
    expect(parsed.parts[1]?.sign).toBe(-1)
  })

  it('parses modifier-only expressions', () => {
    const parsed = module.parseDiceExpression('3+2-10')

    expect(parsed.parts).toHaveLength(0)
    expect(parsed.totalModifier).toBe(-5)
    expect(parsed.normalizedExpression).toBe('-5')
  })

  it('rolls a mixed expression deterministically', () => {
    const randomValues = [0, 0.5]
    const result = module.rollDiceExpression('2d6+3', () => randomValues.shift() ?? 0)

    expect(result.total).toBe(8)
    expect(result.parts[0]?.rolls).toEqual([1, 4])
    expect(result.totalModifier).toBe(3)
  })

  it('applies subtraction dice correctly when rolling', () => {
    const randomValues = [0.5, 0, 0.75]
    const result = module.rollDiceExpression('d8-2d4+1', () => randomValues.shift() ?? 0)

    expect(result.parts[0]?.rolls).toEqual([5])
    expect(result.parts[1]?.rolls).toEqual([1, 4])
    expect(result.parts[1]?.subtotal).toBe(-5)
    expect(result.total).toBe(1)
  })

  it('rolls 2d100 deterministically', () => {
    const randomValues = [0.71, 0.04]
    const result = module.rollDiceExpression('2d100', () => randomValues.shift() ?? 0)

    expect(result.parts).toHaveLength(1)
    expect(result.parts[0]?.sides).toBe(100)
    expect(result.parts[0]?.rolls).toEqual([72, 5])
    expect(result.totalModifier).toBe(0)
    expect(result.total).toBe(77)
  })

  it('rolls 2d100+3 deterministically', () => {
    const randomValues = [0.71, 0.04]
    const result = module.rollDiceExpression('2d100+3', () => randomValues.shift() ?? 0)

    expect(result.parts).toHaveLength(1)
    expect(result.parts[0]?.rolls).toEqual([72, 5])
    expect(result.totalModifier).toBe(3)
    expect(result.total).toBe(80)
  })

  it('tracks preset rolls in history and keeps latest result', () => {
    const api = module.useDiceRoller()

    const result = module.rollPreset(6, () => 0)

    expect(api.selectedPreset.value).toBe(6)
    expect(api.expression.value).toBe('d6')
    expect(api.lastResult.value?.id).toBe(result.id)
    expect(api.history.value).toHaveLength(1)
  })

  it('sets an error message when custom expression is invalid', () => {
    const api = module.useDiceRoller()

    module.setDiceExpression('2x6')
    expect(() => module.rollCustomExpression()).toThrow('Formule invalide')
    expect(api.errorMessage.value).toMatch(/Formule invalide/i)
  })

  it('clears the history explicitly', () => {
    const api = module.useDiceRoller()

    module.rollPreset(20, () => 0)
    module.rollPreset(6, () => 0)
    expect(api.history.value.length).toBeGreaterThan(0)

    module.clearDiceHistory()
    expect(api.history.value).toHaveLength(0)
  })

  it('caps history to 8 entries', () => {
    const api = module.useDiceRoller()

    for (let i = 0; i < 10; i += 1) {
      module.rollPreset(20, () => i / 20)
    }

    expect(api.history.value).toHaveLength(8)
  })

  it('opens, toggles and closes panel state as expected', () => {
    const api = module.useDiceRoller()

    expect(api.isOpen.value).toBe(false)
    module.openDiceRoller(false)
    expect(api.isOpen.value).toBe(true)
    module.toggleDiceRoller()
    expect(api.isOpen.value).toBe(false)
    module.closeDiceRoller()
    expect(api.isOpen.value).toBe(false)
  })

  it('resets selected preset when setting a custom expression', () => {
    const api = module.useDiceRoller()

    module.rollPreset(20, () => 0)
    expect(api.selectedPreset.value).toBe(20)

    module.setDiceExpression('2d6+1')
    expect(api.expression.value).toBe('2d6+1')
    expect(api.selectedPreset.value).toBeNull()
  })

  it('rejects invalid input', () => {
    expect(() => module.parseDiceExpression('2x6')).toThrow('Formule invalide')
    expect(() => module.parseDiceExpression('')).toThrow('Entre une formule de dé.')
  })
})