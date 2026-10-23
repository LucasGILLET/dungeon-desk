import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import SkeletonCards from '@/components/skeleton/SkeletonCards.vue'
import SkeletonText from '@/components/skeleton/SkeletonText.vue'

const { resolveSpells } = vi.hoisted(() => {
  let resolve: (value: unknown[]) => void = () => {}
  const promise = new Promise<unknown[]>((r) => { resolve = r })
  return { resolveSpells: { promise, resolve: (v: unknown[]) => resolve(v) } }
})
vi.mock('@/utils/spellFormat', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utils/spellFormat')>()),
  loadSpells: vi.fn(() => resolveSpells.promise),
}))

describe('skeletons', () => {
  it('announce the loading to screen readers and draw the expected number of placeholders', () => {
    const cards = mount(SkeletonCards, { props: { count: 4, label: 'Chargement du bestiaire…' } })
    expect(cards.attributes('role')).toBe('status')
    expect(cards.text()).toBe('Chargement du bestiaire…')
    expect(cards.findAll('[aria-hidden="true"]')).toHaveLength(4)

    const text = mount(SkeletonText, { props: { lines: 3, title: false } })
    expect(text.text()).toBe('Chargement…')
    expect(text.findAll('.ui-skeleton')).toHaveLength(3)
  })

  it('shows a skeleton, not « no spell matches », while the spells load', async () => {
    const { default: SortsListView } = await import('@/views/SortsListView.vue')
    const router = createRouter({ history: createMemoryHistory(), routes: [
      { path: '/sorts', component: SortsListView },
      { path: '/sort/:index', name: 'sort-view', component: { template: '<div />' } },
    ] })
    router.push('/sorts')
    await router.isReady()
    const wrapper = mount(SortsListView, { global: { plugins: [router] } })
    await flushPromises()

    expect(wrapper.text()).toContain('Chargement des sorts…')
    expect(wrapper.text()).not.toContain('Aucun sort ne correspond')

    resolveSpells.resolve([])
    await flushPromises()
    expect(wrapper.text()).not.toContain('Chargement des sorts…')
    expect(wrapper.text()).toContain('Aucun sort ne correspond')
  })
})
