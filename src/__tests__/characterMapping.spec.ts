import { describe, expect, it } from 'vitest'
import { mapApiCharacterToCharacter, toCharacterCreateInput, type ApiCharacterModel, type Character } from '@/types/character'

const baseSheet = {
  abilities: { str: 15, dex: 12, con: 14, int: 10, wis: 8, cha: 13 },
  proficiencies: { skills: [], languages: [], tools: [] },
  race: { index: 'human', name: 'Humain' },
  class: { index: 'fighter', name: 'Guerrier' },
  background: { index: 'soldier', name: 'Soldat' },
  features: [],
}

describe('mapApiCharacterToCharacter', () => {
  it('flattens the API model (id/name/level at top level, rest from data)', () => {
    const apiCharacter = {
      id: 42,
      userId: 7,
      name: 'Aragorn',
      level: 3,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      data: { ...baseSheet, name: 'ignored', level: 999 },
    } as unknown as ApiCharacterModel

    const character = mapApiCharacterToCharacter(apiCharacter)

    expect(character.id).toBe(42)
    expect(character.userId).toBe(7)
    expect(character.name).toBe('Aragorn')
    expect(character.level).toBe(3)
    expect(character.race.index).toBe('human')
    expect(character.abilities.str).toBe(15)
  })

  it('does not let the name/level stored inside data override the top-level ones', () => {
    const apiCharacter = {
      id: 1,
      userId: 1,
      name: 'VraiNom',
      level: 5,
      data: { ...baseSheet, name: 'FauxNom', level: 1 },
    } as unknown as ApiCharacterModel

    const character = mapApiCharacterToCharacter(apiCharacter)

    expect(character.name).toBe('VraiNom')
    expect(character.level).toBe(5)
  })

  it('handles a character with no data payload without throwing', () => {
    const apiCharacter = {
      id: 2,
      userId: 1,
      name: 'Vide',
      level: 1,
      data: null,
    } as unknown as ApiCharacterModel

    expect(() => mapApiCharacterToCharacter(apiCharacter)).not.toThrow()
    expect(mapApiCharacterToCharacter(apiCharacter).name).toBe('Vide')
  })
})

describe('toCharacterCreateInput', () => {
  it('wraps the full character under data, keeping name/level at the top level', () => {
    const character = {
      ...baseSheet,
      id: 42,
      name: 'Aragorn',
      level: 3,
    } as unknown as Character

    const input = toCharacterCreateInput(character)

    expect(input.name).toBe('Aragorn')
    expect(input.level).toBe(3)
    expect((input.data as any).race.index).toBe('human')
  })

  it('round-trips through mapApiCharacterToCharacter and toCharacterCreateInput without losing data', () => {
    const apiCharacter = {
      id: 10,
      userId: 3,
      name: 'Legolas',
      level: 2,
      data: baseSheet,
    } as unknown as ApiCharacterModel

    const character = mapApiCharacterToCharacter(apiCharacter)
    const input = toCharacterCreateInput(character)

    expect(input.name).toBe('Legolas')
    expect(input.level).toBe(2)
    expect((input.data as any).class.index).toBe('fighter')
  })
})
