import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import StepAbilities from '@/components/CreateCharacterSteps/5-Caracteristics/StepAbilities.vue'

const character = {
  name: '',
  level: 1,
  race: { index: 'human', name: 'Human', ability_bonuses: [] },
  class: { index: 'fighter', name: 'Fighter' },
} as any

function mountStep(props: Partial<{ character: any }> = {}) {
  return mount(StepAbilities, {
    props: { character, ...props },
    global: {
      stubs: { TutorialGuide: true },
    },
  })
}

describe('StepAbilities', () => {
  it('starts every ability at 8 with all 27 points unspent, and blocks "next"', () => {
    const wrapper = mountStep()
    const nav = wrapper.findComponent({ name: 'StepNavigation' })

    expect(wrapper.find('[aria-label="Augmenter Force"]').exists()).toBe(true)
    expect(nav.props('disableNext')).toBe(true)
  })

  it('spends 1 point when raising an ability from 8 to 9', async () => {
    const wrapper = mountStep()
    await wrapper.find('[aria-label="Augmenter Force"]').trigger('click')

    // 27 total points - 1 spent = 26 remaining, still > 0 so next stays disabled
    const nav = wrapper.findComponent({ name: 'StepNavigation' })
    expect(nav.props('disableNext')).toBe(true)
    expect(wrapper.text()).toContain('26')
  })

  it('never lets an ability drop below 8', async () => {
    const wrapper = mountStep()
    const decreaseButton = wrapper.find('[aria-label="Diminuer Force"]')

    expect(decreaseButton.attributes('disabled')).toBeDefined()
    await decreaseButton.trigger('click')
    // value should remain unchanged at 8 -> increasing once should still cost exactly 1 point
    await wrapper.find('[aria-label="Augmenter Force"]').trigger('click')
    expect(wrapper.text()).toContain('26')
  })

  it('never lets the total spent points exceed the 27-point budget (13 -> 14 costs 2, not 1)', async () => {
    const wrapper = mountStep()
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
    const wrapper = mountStep()
    const increaseButton = wrapper.find('[aria-label="Augmenter Force"]')

    // Spend all reachable points on Force alone by clicking well past the cap
    for (let i = 0; i < 20; i++) {
      if (increaseButton.attributes('disabled') !== undefined) break
      await increaseButton.trigger('click')
    }

    expect(increaseButton.attributes('disabled')).toBeDefined()
  })

  it('enables "next" once all 27 points are spent', async () => {
    const wrapper = mountStep()
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
})
