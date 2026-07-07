import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import StepRace from '@/components/CreateCharacterSteps/1-Race/StepRace.vue'

vi.mock('@/utils/dataLoader', () => ({
  loadRaces: vi.fn().mockResolvedValue([
    { index: 'human', name: 'Human', ability_bonuses: [], traits: [] },
    { index: 'elf', name: 'Elf', ability_bonuses: [], traits: [] },
  ]),
}))

const character = {
  name: '',
  level: 1,
} as any

beforeEach(() => {
  localStorage.setItem('dungeon-desk-welcome-complete', 'true')
})

async function mountStep() {
  const wrapper = mount(StepRace, {
    props: { character },
    global: {
      stubs: { TutorialGuide: true, RaceDetailsModal: true },
    },
  })
  await flushPromises()
  return wrapper
}

describe('StepRace', () => {
  it('disables the "next" button until a race is selected', async () => {
    const wrapper = await mountStep()
    const nav = wrapper.findComponent({ name: 'StepNavigation' })
    expect(nav.props('disableNext')).toBe(true)
  })

  it('selects a race and enables "next" when a card is clicked', async () => {
    const wrapper = await mountStep()
    const card = wrapper.find('[aria-label="Choisir la race Humain"]')
    expect(card.exists()).toBe(true)
    expect(card.attributes('aria-pressed')).toBe('false')

    await card.trigger('click')

    expect(card.attributes('aria-pressed')).toBe('true')
    const nav = wrapper.findComponent({ name: 'StepNavigation' })
    expect(nav.props('disableNext')).toBe(false)
  })

  it('also selects a race via the keyboard (Enter key)', async () => {
    const wrapper = await mountStep()
    const card = wrapper.find('[aria-label="Choisir la race Elfe"]')

    await card.trigger('keydown.enter')

    expect(card.attributes('aria-pressed')).toBe('true')
  })

  it('emits the selected race when "next" is triggered', async () => {
    const wrapper = await mountStep()
    const card = wrapper.find('[aria-label="Choisir la race Humain"]')
    await card.trigger('click')

    const nav = wrapper.findComponent({ name: 'StepNavigation' })
    nav.vm.$emit('next')

    expect(wrapper.emitted('next')).toBeTruthy()
    expect(wrapper.emitted('next')![0]![0]).toMatchObject({ index: 'human' })
  })
})
