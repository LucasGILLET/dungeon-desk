import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import LocalizedField from '@/components/admin/LocalizedField.vue'
import AdminClassEditView from '@/views/admin/AdminClassEditView.vue'
import AdminTranslationsView from '@/views/admin/AdminTranslationsView.vue'
import { adminApi } from '@/api/admin'

// L'API d'administration est simulée : pas de backend ni d'Auth0 pendant les tests
vi.mock('@/api/admin', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/admin')>()
  return {
    ...actual,
    adminApi: {
      me: vi.fn(),
      classes: vi.fn(),
      getClass: vi.fn(),
      saveClass: vi.fn(),
      translationsTodo: vi.fn(),
      saveTranslation: vi.fn(),
    },
  }
})

const api = adminApi as unknown as Record<keyof typeof adminApi, ReturnType<typeof vi.fn>>

const wizard = () => ({
  id: 12,
  index: 'wizard',
  hitDie: 6,
  subclassLevel: 2,
  source: 'SRD',
  translations: {
    en: { name: 'Wizard', subclassLabel: 'Arcane Tradition', description: null },
    fr: { name: 'Magicien', subclassLabel: 'Tradition arcanique', description: null },
  },
  subclasses: [{ id: 3, index: 'evocation', translations: { fr: { name: "École d'évocation", description: null } } }],
  features: [
    { id: 100, index: 'arcane-recovery', level: 1, subclass: null, translations: { en: { name: 'Arcane Recovery', description: 'You have learned…' }, fr: { name: 'Restauration arcanique', description: 'Vous avez appris…' } } },
    { id: 101, index: 'sculpt-spells', level: 2, subclass: 'evocation', translations: { en: { name: 'Sculpt Spells', description: 'Beginning at 2nd level…' } } },
  ],
})

async function mountAt(path: string, component: unknown, role = 'EDITOR') {
  api.me.mockResolvedValue({ id: 4, email: 'mj@example.com', username: 'mj', role })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/admin/classes', component: { template: '<div />' } },
      { path: '/admin/classes/:index', component: component as never },
      { path: '/admin/traductions', component: component as never },
    ],
  })
  router.push(path)
  await router.isReady()
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const wrapper = mount(component as never, { global: { plugins: [router, [VueQueryPlugin, { queryClient }]] } })
  await flushPromises()
  return wrapper
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LocalizedField', () => {
  it('flags a missing French text', () => {
    const wrapper = mount(LocalizedField, { props: { label: 'Nom', en: 'Wizard', fr: '' } })
    expect(wrapper.find('[data-status="missing"]').exists()).toBe(true)
  })

  it('flags a long text copied from English', () => {
    const wrapper = mount(LocalizedField, { props: { label: 'Description', multiline: true, en: 'Same text', fr: 'Same text' } })
    expect(wrapper.find('[data-status="identical"]').exists()).toBe(true)
  })

  it('emits the French value when typing', async () => {
    const wrapper = mount(LocalizedField, { props: { label: 'Nom', en: 'Wizard', fr: '' } })
    await wrapper.find('input[data-locale="fr"]').setValue('Magicien')
    expect(wrapper.emitted('update:fr')?.[0]).toEqual(['Magicien'])
  })
})

describe('AdminClassEditView', () => {
  it('saves only what changed', async () => {
    api.getClass.mockResolvedValue(wizard())
    api.saveClass.mockImplementation(async () => wizard())
    const wrapper = await mountAt('/admin/classes/wizard', AdminClassEditView)

    const features = wrapper.findAll('[data-test="feature"]')
    expect(features).toHaveLength(2)
    // Traduction de la deuxième capacité, absente en français
    await features[1]!.find('input[data-locale="fr"]').setValue('Façonneur de sorts')
    await features[1]!.find('textarea[data-locale="fr"]').setValue('À partir du niveau 2…')
    await wrapper.find('[data-test="save"]').trigger('click')
    await flushPromises()

    expect(api.saveClass).toHaveBeenCalledWith('wizard', {
      features: [{ id: 101, translations: { fr: { name: 'Façonneur de sorts', description: 'À partir du niveau 2…' } } }],
    })
    expect(wrapper.find('[data-test="saved"]').exists()).toBe(true)
  })

  it('blocks saving when a required French field is empty', async () => {
    api.getClass.mockResolvedValue(wizard())
    const wrapper = await mountAt('/admin/classes/wizard', AdminClassEditView)

    const second = wrapper.findAll('[data-test="feature"]')[1]!
    await second.find('input[data-locale="fr"]').setValue('Façonneur de sorts')
    await wrapper.find('[data-test="save"]').trigger('click')
    await flushPromises()

    expect(api.saveClass).not.toHaveBeenCalled()
    expect(wrapper.find('[data-test="errors"]').text()).toContain('Description obligatoire')
  })

  it('lets a translator edit texts but not class fields', async () => {
    api.getClass.mockResolvedValue(wizard())
    const wrapper = await mountAt('/admin/classes/wizard', AdminClassEditView, 'TRANSLATOR')

    expect(wrapper.find('[data-test="hitDie"]').attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('vous ne pouvez modifier que les textes')
  })

  it('shows the access message to a player', async () => {
    const wrapper = await mountAt('/admin/classes/wizard', AdminClassEditView, 'USER')

    expect(wrapper.text()).toContain('Accès réservé')
    expect(api.getClass).toHaveBeenCalled()
    expect(wrapper.find('[data-test="save"]').exists()).toBe(false)
  })
})

describe('AdminTranslationsView', () => {
  const todo = () => ({
    locale: 'fr',
    total: 5,
    todo: 2,
    items: [
      { entity: 'choice', id: 9, classIndex: 'wizard', context: 'Choix', reference: { description: 'Choose two from Arcana…' }, translation: { description: 'Choose two from Arcana…' }, status: 'identical' },
      { entity: 'spellcastingSection', id: 7, classIndex: 'wizard', context: 'Incantation', reference: { title: 'Cantrips', description: 'At 1st level…' }, translation: null, status: 'missing' },
    ],
  })

  it('saves a translation and removes it from the list', async () => {
    api.translationsTodo.mockResolvedValue(todo())
    api.saveTranslation.mockResolvedValue({})
    const wrapper = await mountAt('/admin/traductions', AdminTranslationsView)

    expect(wrapper.find('[data-test="todo-count"]').text()).toBe('2')
    const section = wrapper.findAll('[data-test="todo-item"]')[1]!
    await section.find('input[data-locale="fr"]').setValue('Tours de magie')
    await section.find('textarea[data-locale="fr"]').setValue('Au niveau 1…')
    await section.find('[data-test="save-translation"]').trigger('click')
    await flushPromises()

    expect(api.saveTranslation).toHaveBeenCalledWith('spellcastingSection', 7, 'fr', { title: 'Tours de magie', description: 'Au niveau 1…' })
    expect(wrapper.findAll('[data-test="todo-item"]')).toHaveLength(1)
    expect(wrapper.find('[data-test="todo-count"]').text()).toBe('1')
  })

  it('does not send a translation with an empty required field', async () => {
    api.translationsTodo.mockResolvedValue(todo())
    const wrapper = await mountAt('/admin/traductions', AdminTranslationsView)

    const section = wrapper.findAll('[data-test="todo-item"]')[1]!
    await section.find('[data-test="save-translation"]').trigger('click')
    await flushPromises()

    expect(api.saveTranslation).not.toHaveBeenCalled()
    expect(section.text()).toContain('obligatoire')
  })
})
