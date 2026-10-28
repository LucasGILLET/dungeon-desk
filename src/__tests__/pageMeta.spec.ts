import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { applyPageMeta, setRouteMeta, summarize, usePageMeta } from '@/utils/pageMeta'

const meta = (key: string) => document.head.querySelector(`meta[name="${key}"], meta[property="${key}"]`)?.getAttribute('content')
const canonical = () => document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href

afterEach(() => { document.head.innerHTML = '' })

describe('page metadata', () => {
  it('writes the tab title, description, indexing, canonical link and link previews', () => {
    applyPageMeta({ title: 'Sorts de D&D 5e', description: 'Tous les sorts.' }, '/sorts')
    expect(document.title).toBe('Sorts de D&D 5e · Dungeon Desk')
    expect(meta('description')).toBe('Tous les sorts.')
    expect(meta('robots')).toBe('index, follow')
    expect(meta('og:title')).toBe('Sorts de D&D 5e · Dungeon Desk')
    expect(canonical()).toBe('https://www.dungeon-desk.com/sorts')

    applyPageMeta({ title: 'Mon profil', noindex: true }, '/profile')
    expect(meta('robots')).toBe('noindex, nofollow')
    expect(meta('description')).toContain('Dungeon Desk') // description par défaut
  })

  it('makes a short plain-text description', () => {
    expect(summarize('***Bouclier***. Une   barrière\n\ninvisible.')).toBe('Bouclier. Une barrière invisible.')
    expect(summarize('mot '.repeat(80))!.length).toBeLessThanOrEqual(160)
    expect(summarize('')).toBeUndefined()
  })

  it('lets a detail page refine the route metadata once its data has loaded, keeping the canonical query', async () => {
    setRouteMeta({ title: 'Règles de D&D 5e', description: 'Les règles.' }, '/rules?section=cover')
    document.title = 'Règles de D&D 5e · Dungeon Desk'
    const section = ref<{ name: string } | null>(null)
    mount(defineComponent({ setup() { usePageMeta(() => section.value && { title: section.value.name }); return () => h('div') } }))
    expect(document.title).toBe('Règles de D&D 5e · Dungeon Desk') // rien tant que la section n'est pas chargée

    section.value = { name: 'Abri' }
    await flushPromises()
    expect(document.title).toBe('Abri · Dungeon Desk')
    expect(meta('description')).toBe('Les règles.')
    expect(canonical()).toBe('https://www.dungeon-desk.com/rules?section=cover')
  })

  it('is applied by the router on every navigation, with a real 404 page', async () => {
    const { default: router } = await import('@/router')
    await router.push('/sorts')
    expect(document.title).toBe('Sorts de D&D 5e · Dungeon Desk')
    await router.push('/rules?section=cover&q=x')
    expect(canonical()).toBe('https://www.dungeon-desk.com/rules?section=cover')
    await router.push('/nimporte-quoi')
    expect(router.currentRoute.value.name).toBe('not-found')
    expect(meta('robots')).toBe('noindex, nofollow')
  })
})
