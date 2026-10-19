import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import DocumentationView from '@/views/DocumentationView.vue'
import type { ApiGuidePage } from '@/utils/dataLoader'

const page = (index: string, published: boolean): ApiGuidePage => ({
  index, title: index, shortTitle: null, icon: null, accent: null, published, eyebrow: null, heading: `Titre ${index}`, intro: null, sections: [],
})

vi.mock('@/utils/dataLoader', () => ({
  loadGuides: vi.fn().mockResolvedValue([
    { index: 'classes', title: 'Choix de classe', shortTitle: 'Classes', icon: null, accent: null },
    { index: 'combat-cheat-sheet', title: 'Aide combat', shortTitle: null, icon: null, accent: null },
  ]),
  loadGuide: vi.fn((index: string) => Promise.resolve(page(index, index !== 'brouillon'))),
}))

async function mountAt(query: Record<string, string>) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/documentation', component: DocumentationView }, { path: '/rules', name: 'rules', component: { template: '<div />' } }],
  })
  router.push({ path: '/documentation', query })
  await router.isReady()
  const wrapper = mount(DocumentationView, { global: { plugins: [router], stubs: { TableOfContents: true } } })
  await flushPromises()
  return wrapper
}

describe('DocumentationView', () => {
  it('lists the published pages, without the combat cheat sheet', async () => {
    const wrapper = await mountAt({})
    expect(wrapper.text()).toContain('Choix de classe')
    expect(wrapper.text()).not.toContain('Aide combat')
    expect(wrapper.text()).toContain('Titre classes')
  })

  it('opens an unpublished page from its link, as a draft preview', async () => {
    const wrapper = await mountAt({ section: 'brouillon' })
    expect(wrapper.text()).toContain('Titre brouillon')
    expect(wrapper.text()).toContain("Brouillon : cette page n'est pas publiée")
  })
})
