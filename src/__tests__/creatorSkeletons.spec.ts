import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

// Chargements tenus en attente : on regarde ce que montre l'étape entre-temps
const pending = vi.hoisted(() => {
  const deferred = <T>() => {
    let resolve!: (v: T) => void
    const promise = new Promise<T>((r) => { resolve = r })
    return { promise, resolve }
  }
  return { backgrounds: deferred<unknown[]>(), level1: deferred<string[]>() }
})
vi.mock('@/utils/dataLoader', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utils/dataLoader')>()),
  loadBackgrounds: vi.fn(() => pending.backgrounds.promise),
}))
vi.mock('@/utils/subclasses', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utils/subclasses')>()),
  getLevel1SubclassClassIds: vi.fn(() => pending.level1.promise),
  loadSubclassesForClass: vi.fn(async () => []),
}))

const character = { name: '', level: 1, race: { index: 'human', name: 'Humain' }, class: { index: 'fighter', name: 'Guerrier' } } as never
const stubs = { TutorialGuide: true }

describe('creator skeletons', () => {
  it('shows background cards placeholders, then the backgrounds', async () => {
    const { default: StepBackground } = await import('@/components/CreateCharacterSteps/4-Background/StepBackground.vue')
    const wrapper = mount(StepBackground, { props: { character }, global: { stubs } })
    await flushPromises()

    expect(wrapper.find('[role="status"]').text()).toBe('Chargement des historiques…')
    expect(wrapper.findAll('.ui-skeleton').length).toBeGreaterThan(0)

    pending.backgrounds.resolve([])
    await flushPromises()
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
  })

  it('does not say « no choice needed » before knowing whether the class picks its subclass now', async () => {
    const { default: StepSubclass } = await import('@/components/CreateCharacterSteps/6-Subclass/StepSubclass.vue')
    const wrapper = mount(StepSubclass, { props: { character }, global: { stubs } })
    await flushPromises()

    expect(wrapper.text()).toContain('Chargement des sous-classes…')
    expect(wrapper.text()).not.toContain('Aucun choix requis')
    expect(wrapper.findComponent({ name: 'StepNavigation' }).props('disableNext')).toBe(true)

    pending.level1.resolve(['cleric'])
    await flushPromises()
    expect(wrapper.text()).toContain('Aucun choix requis')
    expect(wrapper.findComponent({ name: 'StepNavigation' }).props('disableNext')).toBe(false)
  })
})
