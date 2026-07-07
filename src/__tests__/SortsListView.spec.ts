import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import SortsListView from '@/views/SortsListView.vue'

const fakeSpells = [
  { index: 'fireball', name: 'Boule de Feu', level: 3, school: { name: 'Évocation' }, classes: [{ index: 'wizard', name: 'Magicien' }] },
  { index: 'magic-missile', name: 'Projectile Magique', level: 1, school: { name: 'Évocation' }, classes: [{ index: 'wizard', name: 'Magicien' }] },
  { index: 'cure-wounds', name: 'Soin des Blessures', level: 1, school: { name: 'Évocation' }, classes: [{ index: 'cleric', name: 'Clerc' }] },
]

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    json: () => Promise.resolve(fakeSpells),
  }))
})

async function mountView() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/sorts', name: 'sorts-list', component: SortsListView },
      { path: '/sorts/:index', name: 'sort-view', component: { template: '<div />' } },
    ],
  })
  router.push('/sorts')
  await router.isReady()

  const wrapper = mount(SortsListView, {
    global: { plugins: [router] },
  })
  await flushPromises()
  return wrapper
}

describe('SortsListView filtering', () => {
  it('lists every spell when no filter is applied', async () => {
    const wrapper = await mountView()
    expect(wrapper.text()).toContain('3 sorts sur 3')
  })

  it('filters by search text (case-insensitive)', async () => {
    const wrapper = await mountView()
    await wrapper.find('input[type="search"]').setValue('boule')
    await flushPromises()

    expect(wrapper.text()).toContain('Boule de Feu')
    expect(wrapper.text()).not.toContain('Projectile Magique')
  })

  it('filters by spell level', async () => {
    const wrapper = await mountView()
    const select = wrapper.find('select')
    await select.setValue(1)
    await flushPromises()

    expect(wrapper.text()).toContain('Projectile Magique')
    expect(wrapper.text()).toContain('Soin des Blessures')
    expect(wrapper.text()).not.toContain('Boule de Feu')
  })

  it('shows the empty state and resets filters', async () => {
    const wrapper = await mountView()
    await wrapper.find('input[type="search"]').setValue('sort-inexistant')
    await flushPromises()

    expect(wrapper.text()).toContain('Aucun sort ne correspond')

    const resetButton = wrapper.findAll('button').find(b => b.text() === 'Réinitialiser')
    expect(resetButton).toBeTruthy()
    await resetButton!.trigger('click')
    await flushPromises()
    // after reset, the search input is cleared and all 3 spells are shown again
    expect((wrapper.find('input[type="search"]').element as HTMLInputElement).value).toBe('')
  })
})
