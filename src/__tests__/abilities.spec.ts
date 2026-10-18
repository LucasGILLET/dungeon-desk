import { describe, expect, it, vi } from 'vitest'

// Règles de création de l'édition, telles que renvoyées par l'API
vi.mock('@/utils/dataLoader', () => ({
  loadCreationRules: vi.fn(async () => ({ pointBuy: { budget: 27, costs: { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 } }, standardArray: [15, 14, 13, 12, 10, 8] })),
  loadAbilityScores: vi.fn(async () => [{ index: 'str', name: 'Force', abbreviation: 'FOR', summary: 'Puissance physique, combat au corps à corps', description: null }]),
}))

describe('useCreationRules', () => {
  it('reads the point-buy costs and budget of the edition', async () => {
    const { useCreationRules } = await import('@/composables/useCreationRules')
    const rules = useCreationRules()
    await rules.loaded

    expect(rules.budget.value).toBe(27)
    expect(rules.cost(8)).toBe(0)
    expect(rules.cost(13)).toBe(5)
    // Le saut classique de 14 et 15
    expect(rules.cost(14)).toBe(7)
    expect(rules.cost(15)).toBe(9)
    expect([rules.minValue.value, rules.maxValue.value]).toEqual([8, 15])
    expect(rules.standardArray.value).toEqual([15, 14, 13, 12, 10, 8])
  })

  it('gives the short summary of an ability, by name or index', async () => {
    const { useCreationRules } = await import('@/composables/useCreationRules')
    const rules = useCreationRules()
    await rules.loaded

    expect(rules.summaryOf('Force')).toBe('Puissance physique, combat au corps à corps')
    expect(rules.summaryOf('str')).toBe('Puissance physique, combat au corps à corps')
    expect(rules.summaryOf('Inconnue')).toBe('')
  })
})
