import { describe, expect, it, vi } from 'vitest'
import { toCharacterCreateInput, type Character, type CharacterPreview, type SavedCharacter } from '@/types/character'

vi.mock('@/api/generated/endpoints', () => ({ previewCharacter: vi.fn() }))
const { applyPreview } = await import('@/utils/characterBuild')

const base = (): Character => ({
  name: 'Elandra',
  level: 1,
  abilities: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
  proficiencies: { skills: [], languages: [], tools: [] },
  race: { index: 'elf', name: 'Elfe' } as any,
  subrace: { index: 'high-elf', name: 'Haut-elfe' } as any,
  class: { index: 'cleric', name: 'Clerc' } as any,
  // Sous-classe maison du front : son index en base est "war"
  subclass: { id: 'domaine-guerre', index: 'war', name: 'Domaine de la Guerre' } as any,
  background: { index: 'acolyte', name: 'Acolyte' } as any,
  features: [],
  choices: [{ choiceId: 10, optionId: 100 }, { choiceId: 11, language: 'giant' }],
  startingEquipment: { items: [{ equipment: 'mace', name: null, quantity: 1 }], currencies: { GP: 15 } },
})

describe('toCharacterCreateInput', () => {
  it('sends indexes and answers, not SRD objects', () => {
    const input = toCharacterCreateInput(base())

    expect(input).toMatchObject({
      edition: '2014',
      name: 'Elandra',
      race: 'elf',
      subrace: 'high-elf',
      background: 'acolyte',
      abilityMethod: 'POINT_BUY',
      abilityScores: { str: 8, int: 15 },
      classes: [{ class: 'cleric', subclass: 'war', levels: [{ level: 1, characterLevel: 1 }] }],
      choices: [{ choiceId: 10, optionId: 100 }, { choiceId: 11, language: 'giant' }],
    })
  })

  it('adds the starting equipment to a new character only', () => {
    expect(toCharacterCreateInput(base())).toMatchObject({
      items: [{ equipment: 'mace', quantity: 1, equipped: false, attuned: false }],
      currencies: { GP: 15 },
    })

    const saved = {
      id: 3, edition: '2014', name: 'Elandra', race: 'elf', abilityScores: {}, abilityMethod: 'MANUAL',
      classes: [{ class: 'cleric', subclass: 'war', hitDiceUsed: 1, levels: [{ level: 1, characterLevel: 1 }, { level: 2, characterLevel: 2, hitPointRoll: 6 }] }],
      items: [{ name: 'Amulette', quantity: 1 }], currencies: { GP: 3 }, notes: 'à garder',
      names: {}, sheet: null, warnings: [], createdAt: '', updatedAt: '',
    } as unknown as SavedCharacter
    const input = toCharacterCreateInput({ ...base(), id: 3, saved })

    // Inventaire, argent, niveaux et notes du personnage enregistré conservés
    expect(input).toMatchObject({ items: [{ name: 'Amulette' }], currencies: { GP: 3 }, notes: 'à garder', abilityMethod: 'MANUAL' })
    // Méthode choisie dans le créateur, sinon celle enregistrée
    expect(toCharacterCreateInput({ ...base(), id: 3, saved, abilityMethod: 'ROLLED' }).abilityMethod).toBe('ROLLED')
    expect(input.classes[0]).toMatchObject({ hitDiceUsed: 1, levels: [{ level: 1 }, { level: 2, hitPointRoll: 6 }] })
    // Champs de lecture seule non renvoyés
    expect(input).not.toHaveProperty('id')
    expect(input).not.toHaveProperty('sheet')
  })

  it('names an unnamed character instead of sending an empty name', () => {
    expect(toCharacterCreateInput({ ...base(), name: '  ' }).name).toBe('Personnage sans nom')
  })
})

describe('applyPreview', () => {
  const preview: CharacterPreview = {
    valid: true,
    errors: [],
    sheet: {
      level: 1, proficiencyBonus: 2, maxHitPoints: 9, abilityScores: {},
      pending: { subclasses: [], abilityScoreImprovements: [], choices: [] },
      proficiencies: [
        { index: 'skill-religion', name: 'Compétence : Religion', type: 'SKILL' },
        { index: 'calligraphers-supplies', name: 'Matériel de calligraphe', type: 'ARTISAN_TOOL' },
        { index: 'light-armor', name: 'Armures légères', type: 'ARMOR' },
      ],
      expertise: [],
      languages: [{ index: 'common', name: 'Commun' }, { index: 'giant', name: 'Géant' }],
    },
    choices: [
      {
        id: 10, kind: 'SUBFEATURE', choose: 1, description: 'Choisissez 1 option',
        source: { type: 'trait', index: 'draconic-ancestry', name: 'Ascendance draconique' }, parentOptionId: null, pool: null,
        options: [{ id: 100, label: 'Ascendance draconique (Rouge)', items: [], nestedChoiceId: null }],
      },
      {
        id: 12, kind: 'ABILITY_SCORE_INCREASE', choose: 2, description: '', source: { type: 'race', index: 'half-elf', name: 'Demi-elfe' }, parentOptionId: null, pool: null,
        options: [{ id: 120, label: 'Force +1', items: [{ type: 'abilityScore', index: 'str', name: 'Force', quantity: 1, bonus: 1, description: null }], nestedChoiceId: null }],
      },
    ],
    startingEquipment: { items: [{ equipment: 'mace', name: null, quantity: 1 }], currencies: {} },
  }

  it('fills the display fields from the computed sheet and the answers', () => {
    const character = base()
    applyPreview(character, preview, [{ choiceId: 10, optionId: 100 }, { choiceId: 12, optionId: 120 }])

    expect(character.proficiencies.skills.map((p) => p.name)).toEqual(['Religion'])
    expect(character.proficiencies.tools.map((p) => p.name)).toEqual(['Matériel de calligraphe'])
    expect(character.proficiencies.languages.map((p) => p.name)).toEqual(['Commun', 'Géant'])
    expect(character.specialChoices).toEqual({ 'Ascendance draconique': ['Ascendance draconique (Rouge)'], halfElfAbilities: ['str'] })
    expect(character.startingEquipment?.items).toEqual([{ equipment: 'mace', name: null, quantity: 1 }])
  })
})
