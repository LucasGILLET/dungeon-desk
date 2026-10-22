// Fiche PDF d'un personnage enregistré, à n'importe quel niveau : valeurs
// calculées par le back (niveau, PV, CA, maîtrises, dés de vie) mises au
// format attendu par usePdfExport.
import type { CharacterNames, CharacterSheetValues } from '@/types/character'
import type { PDFCharacterData } from '@/types/pdfExport'
import { currentHp, type Input } from '@/utils/sheetActions'

// Index de compétence du SRD → champ du PDF
const SKILLS = {
  acrobatics: 'acrobatics', 'animal-handling': 'animalHandling', arcana: 'arcana', athletics: 'athletics',
  deception: 'deception', history: 'history', insight: 'insight', intimidation: 'intimidation',
  investigation: 'investigation', medicine: 'medicine', nature: 'nature', perception: 'perception',
  performance: 'performance', persuasion: 'persuasion', religion: 'religion', 'sleight-of-hand': 'sleightOfHand',
  stealth: 'stealth', survival: 'survival',
} as const

const PERSONALITY = { PERSONALITY_TRAIT: 'personalityTraits', IDEAL: 'ideals', BOND: 'bonds', FLAW: 'flaws' } as const

export interface SheetPdfSources {
  input: Input
  sheet: CharacterSheetValues
  names: CharacterNames
  speedFeet: number | null
  features: { name: string }[]
  equipmentName: (index: string) => string | undefined
  personalityText: (optionId: number) => string | undefined
}

export function toSheetPdfData({ input, sheet, names, speedFeet, features, equipmentName, personalityText }: SheetPdfSources): PDFCharacterData {
  const score = (a: string) => sheet.abilityScores[a]?.total ?? 10
  const proficient = (index: string) => sheet.proficiencies.some((p) => p.index === index)
  const skills = Object.fromEntries(Object.entries(SKILLS).map(([index, key]) => [key, proficient(`skill-${index}`)])) as Record<(typeof SKILLS)[keyof typeof SKILLS], boolean>

  const personality = Object.fromEntries(Object.entries(PERSONALITY).map(([kind, key]) => [
    key,
    (input.personality ?? []).filter((p) => p.kind === kind)
      .map((p) => p.text || (p.optionId != null ? personalityText(p.optionId) : undefined))
      .filter(Boolean).join('\n'),
  ]))

  const classes = names.classes.map((c) => `${c.class ?? '?'}${c.subclass ? ` (${c.subclass})` : ''}`)
  const items = (input.items ?? []).map((i) => {
    const name = i.name || (i.equipment ? equipmentName(i.equipment) ?? i.equipment : '?')
    return (i.quantity ?? 1) > 1 ? `${name} ×${i.quantity}` : name
  })
  const coins = input.currencies ?? {}
  const masteries = [
    ...sheet.proficiencies.filter((p) => !p.index.startsWith('skill-') && !p.index.startsWith('saving-throw-')).map((p) => p.name),
    ...sheet.languages.map((l) => l.name),
  ]

  return {
    name: input.name,
    characterClass: classes.join(' / '),
    // Multiclassé : « Guerrier 3 / Magicien 1 » plutôt que le niveau total seul
    classLevel: names.classes.length > 1
      ? names.classes.map((c, i) => `${classes[i]} ${c.level}`).join(' / ')
      : `${classes[0] ?? ''} ${sheet.level}`,
    level: sheet.level,
    background: names.background ?? '',
    playerName: '',
    race: names.subrace || names.race || '',
    alignment: '',
    experience: input.state?.experiencePoints ?? 0,
    strength: score('str'),
    dexterity: score('dex'),
    constitution: score('con'),
    intelligence: score('int'),
    wisdom: score('wis'),
    charisma: score('cha'),
    strengthCheck: proficient('saving-throw-str'),
    dexterityCheck: proficient('saving-throw-dex'),
    constitutionCheck: proficient('saving-throw-con'),
    intelligenceCheck: proficient('saving-throw-int'),
    wisdomCheck: proficient('saving-throw-wis'),
    charismaCheck: proficient('saving-throw-cha'),
    ...skills,
    armorClass: sheet.armorClass?.value ?? 10 + (sheet.abilityScores.dex?.modifier ?? 0),
    initiative: sheet.abilityScores.dex?.modifier ?? 0,
    speed: speedFeet != null ? Math.round(speedFeet * 0.3 * 10) / 10 : 9,
    hpMax: sheet.maxHitPoints,
    hpCurrent: currentHp(input, sheet.maxHitPoints),
    hitDice: (sheet.hitDice ?? []).map((d) => `${d.total}d${d.die}`).join(' + '),
    featuresTraits: features.map((f) => f.name).join(', '),
    attacks: [],
    appearance: input.appearance ?? '',
    backstory: input.backstory ?? '',
    equipment: items.join(', '),
    pc: coins.CP ?? 0,
    pa: coins.SP ?? 0,
    pe: coins.EP ?? 0,
    po: coins.GP ?? 0,
    pp: coins.PP ?? 0,
    otherMasteries: masteries.join(', '),
    ...personality,
  }
}
