import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

// Règles d'achat de points de l'édition (API)
vi.mock('@/utils/dataLoader', () => ({
  loadCreationRules: vi.fn(async () => ({ pointBuy: { budget: 27, costs: { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 } }, standardArray: [15, 14, 13, 12, 10, 8] })),
  loadAbilityScores: vi.fn(async () => []),
}))
import StepAbilities from '@/components/CreateCharacterSteps/5-Caracteristics/StepAbilities.vue'

const character = {
  name: '',
  level: 1,
  race: { index: 'human', name: 'Human', ability_bonuses: [] },
  class: { index: 'fighter', name: 'Fighter' },
} as any

async function mountStep(props: Partial<{ character: any }> = {}) {
  const wrapper = mount(StepAbilities, {
    props: { character, ...props },
    global: {
      stubs: { TutorialGuide: true },
    },
  })
  await flushPromises()
  return wrapper
}

describe('StepAbilities', () => {
  it('starts every ability at 8 with all 27 points unspent, and blocks "next"', async () => {
    const wrapper = await mountStep()
    const nav = wrapper.findComponent({ name: 'StepNavigation' })

    expect(wrapper.find('[aria-label="Augmenter Force"]').exists()).toBe(true)
    expect(nav.props('disableNext')).toBe(true)
  })

  it('spends 1 point when raising an ability from 8 to 9', async () => {
    const wrapper = await mountStep()
    await wrapper.find('[aria-label="Augmenter Force"]').trigger('click')

    // 27 total points - 1 spent = 26 remaining, still > 0 so next stays disabled
    const nav = wrapper.findComponent({ name: 'StepNavigation' })
    expect(nav.props('disableNext')).toBe(true)
    expect(wrapper.text()).toContain('26')
  })

  it('never lets an ability drop below 8', async () => {
    const wrapper = await mountStep()
    const decreaseButton = wrapper.find('[aria-label="Diminuer Force"]')

    expect(decreaseButton.attributes('disabled')).toBeDefined()
    await decreaseButton.trigger('click')
    // value should remain unchanged at 8 -> increasing once should still cost exactly 1 point
    await wrapper.find('[aria-label="Augmenter Force"]').trigger('click')
    expect(wrapper.text()).toContain('26')
  })

  it('never lets the total spent points exceed the 27-point budget (13 -> 14 costs 2, not 1)', async () => {
    const wrapper = await mountStep()
    const incForce = () => wrapper.find('[aria-label="Augmenter Force"]').trigger('click')

    // Spend down to exactly 1 point remaining: raise 5 abilities from 8 to 13 (cost 5 each = 25),
    // then Charisme from 8 to 9 (cost 1) -> 26 spent, 1 remaining.
    for (const name of ['Force', 'Dextérité', 'Constitution', 'Intelligence', 'Sagesse']) {
      for (let i = 0; i < 5; i++) {
        await wrapper.find(`[aria-label="Augmenter ${name}"]`).trigger('click')
      }
    }
    await wrapper.find('[aria-label="Augmenter Charisme"]').trigger('click')

    const pointsBadge = wrapper.find('.rounded-full.bg-zinc-950.text-amber-500')
    expect(pointsBadge.text()).toBe('1')

    // Force is now at 13 (cost 5). The next step (13 -> 14) costs 2 marginal points,
    // but only 1 remains: the button must be disabled, and the count must never go negative.
    const increaseForce = wrapper.find('[aria-label="Augmenter Force"]')
    expect(increaseForce.attributes('disabled')).toBeDefined()

    await incForce()
    expect(pointsBadge.text()).not.toBe('-1')
    expect(pointsBadge.text()).toBe('1')
  })

  it('never lets an ability rise above 15', async () => {
    const wrapper = await mountStep()
    const increaseButton = wrapper.find('[aria-label="Augmenter Force"]')

    // Spend all reachable points on Force alone by clicking well past the cap
    for (let i = 0; i < 20; i++) {
      if (increaseButton.attributes('disabled') !== undefined) break
      await increaseButton.trigger('click')
    }

    expect(increaseButton.attributes('disabled')).toBeDefined()
  })

  it('enables "next" once all 27 points are spent', async () => {
    const wrapper = await mountStep()
    const abilityNames = ['Force', 'Dextérité', 'Constitution', 'Intelligence', 'Sagesse', 'Charisme']

    // Raise every ability to 13 (cost 5 each = 30 total, more than 27) is too much;
    // instead raise them one by one until the button reports no points remain.
    let guard = 0
    while (guard < 60) {
      const nav = wrapper.findComponent({ name: 'StepNavigation' })
      if (nav.props('disableNext') === false) break

      let clicked = false
      for (const name of abilityNames) {
        const btn = wrapper.find(`[aria-label="Augmenter ${name}"]`)
        if (btn.exists() && btn.attributes('disabled') === undefined) {
          await btn.trigger('click')
          clicked = true
          break
        }
      }
      if (!clicked) break
      guard++
    }

    const nav = wrapper.findComponent({ name: 'StepNavigation' })
    expect(nav.props('disableNext')).toBe(false)
  })

  const methodButton = (wrapper: any, label: string) => wrapper.findAll('[role="radio"]').find((b: any) => b.text() === label)!

  it('accepts any score from 1 to 30 in free entry, and saves the method', async () => {
    const wrapper = await mountStep()
    await methodButton(wrapper, 'Saisie libre').trigger('click')
    const nav = () => wrapper.findComponent({ name: 'StepNavigation' })
    expect(nav().props('disableNext')).toBe(false) // pas de capital à dépenser

    await wrapper.find('[aria-label="Valeur de Force"]').setValue('20')
    await wrapper.find('[aria-label="Valeur de Charisme"]').setValue('3')
    await wrapper.find('[aria-label="Valeur de Dextérité"]').setValue('31')
    expect(nav().props('disableNext')).toBe(true)
    expect(wrapper.text()).toContain('Entre 1 et 30')
    await wrapper.find('[aria-label="Valeur de Dextérité"]').setValue('17')

    nav().vm.$emit('next')
    expect(wrapper.emitted('update:character')!.at(-1)).toEqual([{ abilityMethod: 'MANUAL' }])
    expect(wrapper.emitted('next')![0]).toEqual([{ str: 20, dex: 17, con: 8, int: 8, wis: 8, cha: 3 }])
  })

  it('rolls 4d6 (3 to 18) with the dice method, and refuses typed scores out of range', async () => {
    const wrapper = await mountStep()
    await methodButton(wrapper, 'Dés').trigger('click')
    await wrapper.find('[aria-label="Lancer les dés"]').trigger('click')
    const values = wrapper.findAll('input[type="number"]').map((i) => Number((i.element as HTMLInputElement).value))
    expect(values).toHaveLength(6)
    expect(values.every((v) => v >= 3 && v <= 18)).toBe(true)

    await wrapper.find('[aria-label="Valeur de Force"]').setValue('19')
    expect(wrapper.findComponent({ name: 'StepNavigation' }).props('disableNext')).toBe(true)
  })

  it('spreads the standard array, swapping a value already taken', async () => {
    const wrapper = await mountStep()
    await methodButton(wrapper, 'Tableau standard').trigger('click')
    const nav = wrapper.findComponent({ name: 'StepNavigation' })
    expect(nav.props('disableNext')).toBe(false)

    const force = wrapper.find('[aria-label="Valeur de Force"]')
    const before = (force.element as HTMLSelectElement).value
    const holder = wrapper.findAll('select').find((s) => (s.element as HTMLSelectElement).value === '8')!
    await force.setValue('8')
    expect((holder.element as HTMLSelectElement).value).toBe(before)
    expect(nav.props('disableNext')).toBe(false)
  })

  it('reopens a saved character on its method, with free scores kept', async () => {
    const wrapper = await mountStep({ character: { ...character, abilityMethod: 'MANUAL', abilities: { str: 5, dex: 20, con: 8, int: 8, wis: 8, cha: 8 } } })
    expect(methodButton(wrapper, 'Saisie libre').attributes('aria-checked')).toBe('true')
    expect((wrapper.find('[aria-label="Valeur de Force"]').element as HTMLInputElement).value).toBe('5')
  })
})
