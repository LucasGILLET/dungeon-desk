import { describe, expect, it } from 'vitest'
import { generateNpc, toNpcInput, weightedPick, type NpcRace } from '@/utils/npcGenerator'

const races: NpcRace[] = [
  { index: 'human', name: 'Humain', npcProfile: { frequency: 40, heightCm: { base: 160, variance: 30 }, weightKg: { base: 60, variance: 30 } } },
  { index: 'dwarf', name: 'Nain', npcProfile: { frequency: 15, heightCm: { base: 120, variance: 15 }, weightKg: { base: 65, variance: 25 } } },
  { index: 'half-orc', name: 'Demi-orc', npcProfile: { frequency: 4, heightCm: null, weightKg: null } },
]
const entry = (text: string, race: string | null = null) => ({ race, text, weight: 1 })
const tables = {
  FIRST_NAME: [entry('Thorin', 'dwarf'), entry('Alden', 'human')],
  LAST_NAME: [entry('Battlehammer', 'dwarf'), entry('Chantebrise')],
  NAME_PREFIX: [entry('Thal')],
  NAME_SUFFIX: [entry('or')],
  PROFESSION: [entry('Forgeron')],
  ORIGIN: [entry('Vient de la capitale')],
  HISTORY_EVENT: [entry('cherche son frère disparu')],
  QUIRK: [entry('Parle très fort')],
}
describe('npcGenerator', () => {
  it('picks according to weights', () => {
    const items = [{ v: 'a', w: 1 }, { v: 'b', w: 3 }]
    expect(weightedPick(items, (i) => i.w, () => 0.1)?.v).toBe('a')
    expect(weightedPick(items, (i) => i.w, () => 0.5)?.v).toBe('b')
  })

  it('uses the names and the physical profile of the chosen race', () => {
    const npc = generateNpc({ races, classes: [], alignments: [{ index: 'neutral', name: 'Neutre' }], tables, race: 'dwarf', random: () => 0.9 })

    expect(npc.race).toEqual({ index: 'dwarf', name: 'Nain' })
    expect(npc.firstName).toBe('Thorin')
    expect(npc.lastName).toBe('Battlehammer')
    expect(npc.heightCm).toBeGreaterThanOrEqual(120)
    expect(npc.heightCm).toBeLessThanOrEqual(135)
    expect(npc.profession).toBe('Forgeron')
    expect(npc.history).toBe('Vient de la capitale et cherche son frère disparu.')
    expect(npc.class).toBeNull()
  })

  it('falls back to syllables and common last names for a race without names', () => {
    const npc = generateNpc({ races, classes: [], alignments: [], tables, race: 'half-orc', random: () => 0.9 })

    expect(npc.firstName).toBe('Thalor')
    expect(npc.lastName).toBe('Chantebrise')
    expect(npc.height).toBe('—')
  })

  it('draws the race by frequency when none is chosen', () => {
    expect(generateNpc({ races, classes: [], alignments: [], tables, random: () => 0.1 }).race.index).toBe('human')
    expect(generateNpc({ races, classes: [], alignments: [], tables, random: () => 0.8 }).race.index).toBe('dwarf')
  })

  it('converts to the exchange format of the API', () => {
    const npc = generateNpc({ races, classes: [{ index: 'fighter', name: 'Guerrier' }], alignments: [{ index: 'neutral', name: 'Neutre' }], tables, race: 'dwarf', class: 'fighter', gender: 'FEMALE', random: () => 0.9 })
    const input = toNpcInput(npc)

    expect(input).toMatchObject({ name: 'Thorin Battlehammer', race: 'dwarf', class: 'fighter', alignment: 'neutral', gender: 'FEMALE', profession: 'Forgeron' })
    expect(Object.keys(input.abilityScores!)).toEqual(['str', 'dex', 'con', 'int', 'wis', 'cha'])
  })
})
