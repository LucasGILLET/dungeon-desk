import { describe, expect, it, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import CombatCheatSheetView from '@/views/CombatCheatSheetView.vue'
import { renderMarkdown, stripLeadingHeading } from '@/utils/markdown'
import { accentClasses } from '@/utils/guideAccent'
import type { ApiGuideCard, ApiGuidePage } from '@/utils/dataLoader'

vi.mock('@/utils/dataLoader', () => ({ loadGuide: vi.fn() }))

const card = (index: string, title: string, extra: Partial<ApiGuideCard> = {}): ApiGuideCard => ({
  index, icon: null, accent: null, title, eyebrow: null, summary: null, advice: null, lists: [], class: null, race: null, rule: null, detail: null, ...extra,
})
const section = (index: string, title: string, cards: ApiGuideCard[], subtitle: string | null = null) =>
  ({ index, level: 1, icon: '⚔️', accent: 'EMERALD' as const, title, subtitle, body: null, cards })

const cheatSheet: ApiGuidePage = {
  index: 'combat-cheat-sheet', title: 'Aide combat', shortTitle: 'Combat', icon: null, accent: 'YELLOW', published: true,
  eyebrow: 'Aide-mémoire', heading: 'Combat', intro: null,
  sections: [
    section('action', 'Action', [card('attack', 'Attaquer', { detail: 'attack-sequence' }), card('dodge', 'Esquiver')], 'Action principale'),
    section('attack-sequence', "La séquence d'attaque", [card('attack-roll', "Jet d'attaque", { summary: '1d20 + bonus' })], "Détail de l'attaque"),
    section('movement', 'Mouvement', []),
    section('bonus', 'Bonus', []),
    section('other', 'Autre', []),
    section('reaction', 'Réaction', []),
  ],
}

describe('markdown', () => {
  it('renders Markdown and removes scripts', () => {
    expect(renderMarkdown('**gras**')).toContain('<strong>gras</strong>')
    expect(renderMarkdown('<img src=x onerror="alert(1)"><script>alert(1)</script>')).not.toMatch(/onerror|<script/)
    expect(renderMarkdown('*a*', { inline: true })).toBe('<em>a</em>')
    expect(renderMarkdown(null)).toBe('')
  })

  it('drops the leading heading already shown by the page', () => {
    expect(stripLeadingHeading('## Abri\n\nTexte')).toBe('Texte')
    expect(stripLeadingHeading('Texte\n\n## Titre')).toBe('Texte\n\n## Titre')
  })

  it('falls back to a default accent', () => {
    expect(accentClasses(null, 'AMBER').text).toBe('text-amber-500')
    expect(accentClasses('VIOLET').edge).toBe('border-l-violet-600')
  })
})

describe('CombatCheatSheetView', () => {
  beforeEach(async () => {
    const { loadGuide } = await import('@/utils/dataLoader')
    vi.mocked(loadGuide).mockResolvedValue(cheatSheet)
  })

  it('shows the tiles from the guide and opens a detail section from a card', async () => {
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: CombatCheatSheetView }, { path: '/regles', name: 'rules', component: { template: '<div />' } }] })
    router.push('/')
    await router.isReady()
    const wrapper = mount(CombatCheatSheetView, { global: { plugins: [router] } })
    await flushPromises()

    expect(wrapper.text()).toContain('Mouvement')
    await wrapper.findAll('button').find((b) => b.text().includes('Action'))!.trigger('click')
    expect(wrapper.text()).toContain('Action principale')
    expect(wrapper.text()).toContain('Esquiver')

    await wrapper.findAll('button').find((b) => b.text().includes('Attaquer'))!.trigger('click')
    expect(wrapper.text()).toContain("Détail de l'attaque")
    expect(wrapper.text()).toContain('1d20 + bonus')
  })
})
