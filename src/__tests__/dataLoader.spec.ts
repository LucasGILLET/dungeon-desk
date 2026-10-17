import { beforeEach, describe, expect, it, vi } from 'vitest'

// Réponses de l'API, par chemin
const responses: Record<string, unknown> = {
  races: [{
    index: 'elf', name: 'Elfe', sizes: ['MEDIUM'], speeds: { walk: 30 }, age: 'vieux', alignment: null, size: 'Svelte.', languageDescription: null,
    abilityBonuses: [{ index: 'dex', name: 'Dextérité', bonus: 2 }],
    languages: [{ index: 'common', name: 'Commun' }],
    traits: [{ index: 'darkvision', name: 'Vision dans le noir', description: 'Vous voyez.\n\nDans le noir.' }],
    subraces: [{ index: 'wood-elf', name: 'Elfe des bois', description: 'Agile.', abilityBonuses: [{ index: 'wis', name: 'Sagesse', bonus: 1 }], traits: [{ index: 'darkvision', name: 'Vision dans le noir', description: 'Vous voyez.' }] }],
  }],
  backgrounds: [{
    index: 'acolyte', name: 'Acolyte', feature: { name: 'Abri du fidèle', description: 'Un temple.' },
    proficiencies: [{ index: 'skill-religion', name: 'Compétence : Religion' }], startingEquipment: [{ index: 'pouch', name: 'Bourse', quantity: 1 }],
    personality: [
      { id: 1, kind: 'IDEAL', text: 'Tradition.', alignments: [{ index: 'lawful-good', name: 'Loyal bon' }] },
      { id: 2, kind: 'FLAW', text: 'Rigide.', alignments: [] },
    ],
  }],
}

const fetchMock = vi.fn(async (url: string) => {
  const path = new URL(url).pathname.replace('/api/srd/2014/', '')
  if (!(path in responses)) return new Response('not found', { status: 404 })
  return new Response(JSON.stringify(responses[path]), { status: 200, headers: { 'content-type': 'application/json' } })
})

let loader: typeof import('@/utils/dataLoader')

beforeEach(async () => {
  vi.resetModules()
  fetchMock.mockClear()
  vi.stubGlobal('fetch', fetchMock)
  loader = await import('@/utils/dataLoader')
})

describe('dataLoader (API → types SRD du front)', () => {
  it('converts races, with French ability abbreviations and size label', async () => {
    const [elf] = await loader.loadRaces()

    expect(elf).toMatchObject({
      index: 'elf', name: 'Elfe', speed: 30, size: 'Taille : Moyenne', size_description: 'Svelte.', age: 'vieux',
      ability_bonuses: [{ ability_score: { index: 'dex', name: 'DEX' }, bonus: 2 }],
      traits: [{ index: 'darkvision', name: 'Vision dans le noir' }],
      subraces: [{ index: 'wood-elf' }],
    })
    expect(fetchMock.mock.calls[0]![0]).toContain('/api/srd/2014/races?lang=fr')
  })

  it('derives subraces and traits from the same request', async () => {
    const [subraces, traits] = await Promise.all([loader.loadSubraces(), loader.loadTraits()])

    expect(subraces[0]).toMatchObject({ index: 'wood-elf', race: { index: 'elf' }, ability_bonuses: [{ ability_score: { name: 'SAG' }, bonus: 1 }], racial_traits: [{ index: 'darkvision' }] })
    // Trait commun à la race et à la sous-race : fusionné, texte découpé en paragraphes
    expect(traits).toHaveLength(1)
    expect(traits[0]).toMatchObject({ desc: ['Vous voyez.', 'Dans le noir.'], races: [{ index: 'elf' }], subraces: [{ index: 'wood-elf' }] })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('rebuilds the personality tables of backgrounds', async () => {
    const [acolyte] = await loader.loadBackgrounds()

    expect(acolyte).toMatchObject({
      feature: { name: 'Abri du fidèle', desc: ['Un temple.'] },
      starting_proficiencies: [{ index: 'skill-religion' }],
      ideals: { choose: 1, from: { options: [{ desc: 'Tradition.', alignments: [{ index: 'lawful-good' }] }] } },
      flaws: { from: { options: [{ desc: 'Rigide.' }] } },
      personality_traits: { choose: 2, from: { options: [] } },
    })
  })

  it('retries after a failed request instead of caching the error', async () => {
    fetchMock.mockImplementationOnce(async () => new Response('boom', { status: 500 }))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(loader.loadRaces()).rejects.toThrow('500')
    expect((await loader.loadRaces())[0]!.name).toBe('Elfe')
  })
})

describe('spellFormat', () => {
  it('formats distances, casting times and durations in French', async () => {
    const f = await import('@/utils/spellFormat')

    expect(f.feetToMeters(150)).toBe('45 mètres')
    expect(f.feetToMeters(5)).toBe('1,5 mètre')
    expect(f.formatRange({ type: 'SELF', feet: null, note: null })).toBe('personnelle')
    expect(f.formatCastingTime({ amount: 1, unit: 'BONUS_ACTION', note: null })).toBe('1 action bonus')
    expect(f.formatCastingTime({ amount: 10, unit: 'MINUTE', note: null })).toBe('10 minutes')
    expect(f.formatDuration({ type: 'MINUTE', amount: 1, concentration: true })).toBe("concentration, jusqu'à 1 minute")
    expect(f.formatDuration({ type: 'INSTANTANEOUS', amount: null, concentration: false })).toBe('instantanée')
  })
})
