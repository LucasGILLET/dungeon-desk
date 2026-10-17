import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadSubraces } from '@/utils/dataLoader'

// Le serveur renvoie index.html (200) pour un fichier absent, comme Vite en dev
const html = () => new Response('<!DOCTYPE html><html></html>', { status: 200, headers: { 'content-type': 'text/html' } })
const json = (data: unknown) => new Response(JSON.stringify(data), { status: 200, headers: { 'content-type': 'application/json' } })

afterEach(() => vi.unstubAllGlobals())

describe('loadSubraces', () => {
  it('falls back to the English SRD file when there is no French one, custom subraces taking precedence', async () => {
    const files: Record<string, unknown> = {
      '/data/5e-SRD-Subraces.json': [
        { index: 'lightfoot-halfling', name: 'Lightfoot Halfling', race: { index: 'halfling' } },
        { index: 'hill-dwarf', name: 'Hill Dwarf', race: { index: 'dwarf' } },
      ],
      '/data/custom/custom-subraces.json': [{ index: 'lightfoot-halfling', name: 'Halfelin pied-léger', race: { index: 'halfling' } }],
    }
    vi.stubGlobal('fetch', vi.fn(async (url: string) => (files[url] ? json(files[url]) : html())))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const subraces = await loadSubraces()

    expect(subraces.map((s) => s.name)).toEqual(['Halfelin pied-léger', 'Hill Dwarf'])
  })
})
