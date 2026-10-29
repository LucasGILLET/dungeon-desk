import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import GlobalSearch from '@/components/search/GlobalSearch.vue'
import { searchSrd, type SearchResult } from '@/api/search'
import { closeGlobalSearch, openGlobalSearch } from '@/composables/useGlobalSearch'
import { groupResults, resultDetail, resultLink } from '@/utils/searchFormat'

vi.mock('@/api/search', () => ({ searchSrd: vi.fn() }))

const result = (kind: SearchResult['kind'], index: string, name: string, extra: Partial<SearchResult> = {}): SearchResult =>
  ({ kind, index, name, matched: null, detail: null, text: null, score: 1, mine: false, ...extra })

const RESULTS = [
  result('spell', 'fireball', 'Boule de feu', { matched: 'Fireball', detail: '3' }),
  result('magic-item', 'wand-of-fireballs', 'Baguette de boules de feu', { detail: 'RARE' }),
  result('spell', 'fire-bolt', 'Trait de feu', { detail: '0' }),
  result('condition', 'blinded', 'Aveuglé', { text: 'Une créature aveuglée ne voit pas.' }),
]

describe('search results', () => {
  it('groups results by kind, in the order of their best result', () => {
    expect(groupResults(RESULTS).map((g) => [g.label, g.results.map((r) => r.index)])).toEqual([
      ['Sorts', ['fireball', 'fire-bolt']],
      ['Objets magiques', ['wand-of-fireballs']],
      ['États', ['blinded']],
    ])
  })

  it('describes each result and opens its page when it has one', () => {
    expect(RESULTS.map(resultDetail)).toEqual(['Niveau 3', 'Rare', 'Tour de magie', null])
    expect(resultDetail(result('monster', 'goblin', 'Gobelin', { detail: '0.250' }))).toBe('FP 1/4')
    expect(resultLink(RESULTS[0]!)).toBe('/sort/fireball')
    expect(resultLink(result('rule', 'cover', 'Abri'))).toEqual({ name: 'rules', query: { section: 'cover' } })
    expect(resultLink(RESULTS[3]!)).toBeNull()
    // Monstre maison de l'utilisateur connecté : sa page à lui
    expect(resultLink(result('monster', 'orza-6ed062', 'Orza', { mine: true }))).toBe('/my-monsters/orza-6ed062')
  })
})

describe('GlobalSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    Element.prototype.scrollIntoView = vi.fn() // absent de jsdom
    vi.mocked(searchSrd).mockReset().mockResolvedValue(RESULTS)
  })
  afterEach(() => {
    closeGlobalSearch()
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  async function mountSearch() {
    const router = createRouter({ history: createMemoryHistory(), routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/sort/:index', component: { template: '<div />' } },
    ] })
    await router.push('/')
    const wrapper = mount(GlobalSearch, { global: { plugins: [router] }, attachTo: document.body })
    openGlobalSearch()
    await flushPromises()
    const input = document.querySelector<HTMLInputElement>('input[type="search"]')!
    const type = async (text: string) => {
      input.value = text
      input.dispatchEvent(new Event('input'))
      await vi.advanceTimersByTimeAsync(250)
      await flushPromises()
    }
    const key = async (k: string) => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }))
      await flushPromises()
    }
    return { wrapper, router, input, type, key }
  }

  it('searches once the user stops typing, and shows the name found in English', async () => {
    const { type } = await mountSearch()
    await type('f')
    expect(searchSrd).not.toHaveBeenCalled() // trop court

    await type('fireball')
    expect(searchSrd).toHaveBeenCalledTimes(1)
    expect(vi.mocked(searchSrd).mock.calls[0]![0]).toBe('fireball')
    const text = document.body.textContent!
    expect(text).toContain('Boule de feu')
    expect(text).toContain('Fireball')
    expect(text).toContain('Objets magiques')
  })

  it('opens the highlighted result with the keyboard', async () => {
    const { router, type, key } = await mountSearch()
    await type('feu')
    await key('ArrowDown') // Trait de feu, deuxième sort
    await key('Enter')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/sort/fire-bolt')
  })

  it('shows the text of what has no page of its own', async () => {
    const { type } = await mountSearch()
    await type('aveugle')
    const blinded = [...document.querySelectorAll<HTMLButtonElement>('[role="option"]')].find((b) => b.textContent!.includes('Aveuglé'))!
    blinded.click()
    await flushPromises()
    expect(blinded.getAttribute('aria-expanded')).toBe('true')
    expect(document.body.textContent).toContain('Une créature aveuglée ne voit pas.')
  })

  it('says when nothing matches', async () => {
    vi.mocked(searchSrd).mockResolvedValue([])
    const { type } = await mountSearch()
    await type('zzzz')
    expect(document.body.textContent).toContain('Aucun résultat pour « zzzz »')
  })
})
