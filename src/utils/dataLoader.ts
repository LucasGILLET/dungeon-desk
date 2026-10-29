// Données de jeu lues depuis l'API (/api/srd/:edition/…), puis converties vers
// les types SRD qu'utilisent les composants. La base, éditée dans Directus, est
// la seule source : il n'y a plus de fichiers JSON côté front.
import type { SRDBackground, SRDClass, SRDFeature, SRDRace, SRDSubclass, SRDTrait } from '@/types/srd'
import { buildApiUrl } from './api'
import type { GuideAccent } from './guideAccent'

export const EDITION = '2014'
const LANG = 'fr'

// --- Réponses de l'API --------------------------------------------------------------

export interface Ref { index: string; name: string }
interface ApiTrait extends Ref { description: string }
interface ApiBonus extends Ref { bonus: number }
interface ApiRace extends Ref {
  icon: string | null
  summary: string | null
  abilityBonusChoice: { choose: number; bonus: number } | null
  npcProfile: { frequency: number; heightCm: { base: number; variance: number } | null; weightKg: { base: number; variance: number } | null }
  sizes: string[]
  speeds: { walk: number }
  age: string | null
  alignment: string | null
  size: string | null
  languageDescription: string | null
  abilityBonuses: ApiBonus[]
  languages: Ref[]
  traits: ApiTrait[]
  subraces: (Ref & { description: string | null; abilityBonuses: ApiBonus[]; traits: ApiTrait[] })[]
}
interface ApiBackground extends Ref {
  icon: string | null
  summary: string | null
  feature: { name: string; description: string | null } | null
  proficiencies: Ref[]
  startingEquipment: (Ref & { quantity: number })[]
  personality: { id: number; kind: 'PERSONALITY_TRAIT' | 'IDEAL' | 'BOND' | 'FLAW'; text: string; alignments: Ref[] }[]
}
export interface ApiSubclass extends Ref {
  icon: string | null
  source: 'SRD' | 'HOMEBREW'
  description: string | null
  spells: (Ref & { level: number; requiredClassLevel: number })[]
}
export interface ApiClass extends Ref {
  hitDie: number
  subclassLevel: number
  summary: string | null
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  recommendedAbilities: Ref[]
  savingThrows: Ref[]
  proficiencies: Ref[]
  startingEquipment: (Ref & { quantity: number })[]
  spellcasting: { ability: Ref; startLevel: number; casterType: 'FULL' | 'HALF' | 'THIRD' | 'PACT'; sections: { title: string; description: string }[] } | null
  subclasses: ApiSubclass[]
  features: { index: string; level: number; subclass: string | null; parent: string | null; name: string; description: string }[]
  table: {
    columns: { key: string; label: string; type: string }[]
    levels: { level: number; abilityScoreImprovements: number; cantripsKnown: number | null; spellsKnown: number | null; spellSlots: number[]; values: Record<string, unknown> }[]
  }
}
export interface ApiSpell extends Ref {
  level: number
  school: Ref
  castingTime: { amount: number; unit: string; note: string | null }
  ritual: boolean
  range: { type: string; feet: number | null; note: string | null }
  components: { verbal: boolean; somatic: boolean; material: boolean; materialText: string | null }
  duration: { type: string; amount: number | null; concentration: boolean }
  description: string
  higherLevels: string | null
  classes: Ref[]
  subclasses: Ref[]
}

// Une requête par ressource, partagée entre tous les appelants
const cache = new Map<string, Promise<unknown>>()
function get<T>(path: string): Promise<T> {
  if (!cache.has(path)) {
    const request = fetch(buildApiUrl(`srd/${EDITION}/${path}${path.includes('?') ? '&' : '?'}lang=${LANG}`))
      .then((response) => {
        if (!response.ok) throw new Error(`Erreur ${response.status} sur /srd/${EDITION}/${path}`)
        return response.json() as Promise<T>
      })
      .catch((error) => {
        cache.delete(path)
        console.error(`Erreur lors du chargement de ${path}:`, error)
        throw error
      })
    cache.set(path, request)
  }
  return cache.get(path) as Promise<T>
}

// --- Conversion vers les types SRD du front -------------------------------------------

const ABBREVIATIONS: Record<string, string> = { str: 'FOR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'SAG', cha: 'CHA' }
const SIZES: Record<string, string> = { TINY: 'Très petite', SMALL: 'Petite', MEDIUM: 'Moyenne', LARGE: 'Grande', HUGE: 'Très grande', GARGANTUAN: 'Gigantesque' }
const ref = (r: Ref) => ({ index: r.index, name: r.name, url: '' })
const bonuses = (list: ApiBonus[]) => list.map((b) => ({ ability_score: { index: b.index, name: ABBREVIATIONS[b.index] ?? b.name, url: '' }, bonus: b.bonus }))
const paragraphs = (text: string | null | undefined) => (text ? text.split(/\n\n+/) : [])

export async function loadApiRaces(): Promise<ApiRace[]> {
  return get<ApiRace[]>('races')
}

export async function loadRaces(): Promise<SRDRace[]> {
  return (await loadApiRaces()).map((r) => ({
    index: r.index,
    name: r.name,
    icon: r.icon,
    summary: r.summary,
    ability_bonus_choice: r.abilityBonusChoice,
    speed: r.speeds.walk,
    ability_bonuses: bonuses(r.abilityBonuses),
    alignment: r.alignment ?? '',
    age: r.age ?? '',
    size: `Taille : ${r.sizes.map((s) => SIZES[s] ?? s).join(' ou ')}`,
    size_description: r.size ?? '',
    languages: r.languages.map(ref),
    language_desc: r.languageDescription ?? '',
    traits: r.traits.map(ref),
    subraces: r.subraces.map(ref),
    url: '',
  }))
}

export async function loadSubraces(): Promise<SRDSubclass[]> {
  return (await loadApiRaces()).flatMap((r) => r.subraces.map((s) => ({
    index: s.index,
    name: s.name,
    icon: r.icon,
    race: ref(r),
    desc: s.description ?? '',
    description: s.description ?? '',
    ability_bonuses: bonuses(s.abilityBonuses),
    racial_traits: s.traits.map(ref),
    url: '',
  })))
}

export async function loadTraits(): Promise<SRDTrait[]> {
  const traits = new Map<string, SRDTrait>()
  for (const race of await loadApiRaces()) {
    const add = (t: ApiTrait, owner: { races?: Ref; subraces?: Ref }) => {
      const trait = traits.get(t.index) ?? { index: t.index, name: t.name, desc: paragraphs(t.description), races: [], subraces: [], proficiencies: [], url: '' }
      if (owner.races) trait.races.push(ref(owner.races))
      if (owner.subraces) trait.subraces.push(ref(owner.subraces))
      traits.set(t.index, trait)
    }
    race.traits.forEach((t) => add(t, { races: race }))
    race.subraces.forEach((s) => s.traits.forEach((t) => add(t, { subraces: s })))
  }
  return [...traits.values()]
}

export async function loadApiClasses(): Promise<ApiClass[]> {
  const list = await get<Ref[]>('classes')
  return Promise.all(list.map((c) => get<ApiClass>(`classes/${c.index}`)))
}

export async function loadApiClass(index: string): Promise<ApiClass | undefined> {
  return (await loadApiClasses()).find((c) => c.index === index)
}

export async function loadClasses(): Promise<SRDClass[]> {
  return (await loadApiClasses()).map((c) => ({
    index: c.index,
    name: c.name,
    summary: c.summary,
    difficulty: c.difficulty,
    recommended_abilities: c.recommendedAbilities.map(ref),
    caster_type: c.spellcasting?.casterType ?? null,
    hit_die: c.hitDie,
    proficiency_choices: [],
    proficiencies: c.proficiencies.map(ref),
    saving_throws: c.savingThrows.map(ref),
    starting_equipment: c.startingEquipment.map((e) => ({ equipment: ref(e), quantity: e.quantity })),
    starting_equipment_options: [],
    class_levels: '',
    subclasses: c.subclasses.map(ref),
    spellcasting: c.spellcasting
      ? {
          level: c.spellcasting.startLevel,
          spellcasting_ability: ref(c.spellcasting.ability),
          info: c.spellcasting.sections.map((s) => ({ name: s.title, desc: paragraphs(s.description) })),
        }
      : undefined,
    url: '',
  }))
}

export async function loadFeatures(): Promise<SRDFeature[]> {
  return (await loadApiClasses()).flatMap((c) => c.features.map((f) => ({
    index: f.index,
    class: ref(c),
    name: f.name,
    level: f.level,
    prerequisites: [],
    desc: paragraphs(f.description),
    url: '',
    ...(f.parent ? { parent: { index: f.parent, name: '', url: '' } } : {}),
    ...(f.subclass ? { subclass: { index: f.subclass, name: c.subclasses.find((s) => s.index === f.subclass)?.name ?? f.subclass, url: '' } } : {}),
  })))
}

const PERSONALITY_FIELDS = { PERSONALITY_TRAIT: 'personality_traits', IDEAL: 'ideals', BOND: 'bonds', FLAW: 'flaws' } as const
const PERSONALITY_CHOOSE = { PERSONALITY_TRAIT: 2, IDEAL: 1, BOND: 1, FLAW: 1 } as const

export async function loadApiBackgrounds(): Promise<ApiBackground[]> {
  return get<ApiBackground[]>('backgrounds')
}

export async function loadBackgrounds(): Promise<SRDBackground[]> {
  return (await loadApiBackgrounds()).map((b) => {
    const tables = Object.fromEntries(Object.entries(PERSONALITY_FIELDS).map(([kind, field]) => [field, {
      choose: PERSONALITY_CHOOSE[kind as keyof typeof PERSONALITY_CHOOSE],
      type: field,
      from: {
        option_set_type: 'options_array',
        options: b.personality.filter((p) => p.kind === kind).map((p) => ({ option_type: 'string', desc: p.text, alignments: p.alignments.map(ref) })),
      },
    }]))
    return {
      index: b.index,
      name: b.name,
      icon: b.icon,
      summary: b.summary,
      starting_proficiencies: b.proficiencies.map(ref),
      starting_equipment: b.startingEquipment.map((e) => ({ equipment: ref(e), quantity: e.quantity })),
      feature: { name: b.feature?.name ?? '', desc: paragraphs(b.feature?.description) },
      url: '',
      ...tables,
    } as SRDBackground
  })
}

export async function loadApiSpells(): Promise<ApiSpell[]> {
  return get<ApiSpell[]>('spells')
}

// --- Référentiels de la fiche de personnage ------------------------------------------------

export interface ApiSkill extends Ref { ability: Ref }
export interface ApiCondition extends Ref { description: string }
export interface ApiEquipment extends Ref {
  kind: string
  cost: { amount: number; currency: string } | null
  weightLb: number | null
  damage: string | null
  armorClass: number | null
}
export interface ApiFeat extends Ref {
  description: string
  prerequisites: { ability: Ref; minimumScore: number; alternativeGroup: number }[]
}

export const loadSkills = () => get<ApiSkill[]>('skills')
export const loadConditions = () => get<ApiCondition[]>('conditions')
export const loadEquipmentCatalog = () => get<ApiEquipment[]>('equipment')
// Fiche complète d'un objet (dégâts, propriétés et leur règle, armure…)
export interface ApiEquipmentDetail extends Ref {
  description: string | null
  kind: string
  cost: { amount: number; currency: string } | null
  weightLb: number | null
  categories: Ref[]
  weapon: {
    category: 'SIMPLE' | 'MARTIAL'
    range: 'MELEE' | 'RANGED'
    damage: string | null
    damageType: Ref | null
    versatileDamage: string | null
    normalRangeFt: number | null
    longRangeFt: number | null
    properties: (Ref & { description: string })[]
  } | null
  armor: {
    category: 'LIGHT' | 'MEDIUM' | 'HEAVY' | 'SHIELD'
    baseArmorClass: number
    addsDexModifier: boolean
    maxDexModifier: number | null
    strengthMinimum: number | null
    stealthDisadvantage: boolean
  } | null
}
export const loadEquipment = (index: string) => get<ApiEquipmentDetail>(`equipment/${encodeURIComponent(index)}`)
export const loadFeats = () => get<ApiFeat[]>('feats')

export interface ApiAbilityScore extends Ref { abbreviation: string; summary: string | null; description: string | null }
export interface ApiCreationRules { pointBuy: { budget: number; costs: Record<string, number> }; standardArray: number[] }
export type ApiNpcTables = Partial<Record<string, { race: string | null; text: string; weight: number }[]>>

export const loadAbilityScores = () => get<ApiAbilityScore[]>('ability-scores')
export const loadCreationRules = () => get<ApiCreationRules>('rules')
export const loadNpcTables = () => get<ApiNpcTables>('npc-tables')
export const loadAlignments = () => get<(Ref & { abbreviation: string })[]>('alignments')
// Classes sans leur détail (listes de choix)
export const loadClassRefs = () => get<Ref[]>('classes')

// --- Bestiaire et objets magiques ------------------------------------------------------

export type Size = 'TINY' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'HUGE' | 'GARGANTUAN'
export interface ApiMonsterSummary extends Ref {
  source: 'SRD' | 'HOMEBREW'
  size: Size
  type: Ref
  subtypes: Ref[]
  swarmOfSize: Size | null
  alignment: { unaligned: boolean; options: Ref[] }
  armorClass: number | null
  hitPoints: number
  challengeRating: number
  xp: number
  legendary: boolean
  imageUrl: string | null
}
export type MonsterUsage =
  | { type: 'at_will' }
  | { type: 'per_day'; times: number }
  | { type: 'recharge'; dice: string; minValue: number }
  | { type: 'per_rest'; rests: ('short' | 'long')[] }
export interface ApiMonsterAction {
  name: string
  description: string
  attack: { type: string; bonus: number | null; reachFt: number | null; rangeFt: { normal: number; long: number | null } | null } | null
  save: { ability: Ref; dc: number; success: 'NONE' | 'HALF' | 'OTHER' } | null
  usage: MonsterUsage | null
  legendaryCost: number | null
  damages: { dice: string; damageType: Ref; alternativeGroup: number | null }[]
  multiattack: { action: string; count: number; alternativeGroup: number }[]
  spellcasting: {
    ability: Ref
    saveDc: number | null
    attackBonus: number | null
    casterLevel: number | null
    class: Ref | null
    slots: Record<string, number> | null
    spells: (Ref & { level: number; usage: MonsterUsage | null })[]
  } | null
}
export interface ApiDamageModifier { damageType: Ref | null; nonMagicalOnly: boolean; note: string | null }
export interface ApiMonster extends ApiMonsterSummary {
  description: string | null
  armorClasses: { value: number; source: 'NATURAL' | 'ARMOR' | 'DEXTERITY' | 'SPELL' | 'CONDITION'; armor: Ref[]; spell: Ref | null; condition: Ref | null; note: string | null }[]
  hitDice: { count: number; size: number; bonus: number }
  speeds: Partial<Record<'walk' | 'fly' | 'swim' | 'climb' | 'burrow', number>> & { hover?: boolean }
  abilityScores: Record<'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha', number>
  savingThrows: (Ref & { bonus: number })[]
  skills: (Ref & { bonus: number })[]
  damageVulnerabilities: ApiDamageModifier[]
  damageResistances: ApiDamageModifier[]
  damageImmunities: ApiDamageModifier[]
  conditionImmunities: Ref[]
  senses: Partial<Record<'darkvision' | 'blindsight' | 'truesight' | 'tremorsense', number>> & { blindBeyond?: true }
  passivePerception: number
  languages: { text: string | null; list: (Ref & { understandOnly: boolean })[]; telepathyFt: number | null }
  proficiencyBonus: number
  legendaryActionsPerRound: number | null
  traits: ApiMonsterAction[]
  actions: ApiMonsterAction[]
  bonusActions: ApiMonsterAction[]
  reactions: ApiMonsterAction[]
  legendaryActions: ApiMonsterAction[]
  lairActions: ApiMonsterAction[]
  forms: Ref[]
}

export type MagicItemRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'VERY_RARE' | 'LEGENDARY' | 'ARTIFACT' | 'VARIES'
export interface ApiMagicItemSummary extends Ref {
  source: 'SRD' | 'HOMEBREW'
  subtitle: string | null
  category: Ref
  rarity: MagicItemRarity
  requiresAttunement: boolean
  variantOf: string | null
  imageUrl: string | null
}
export interface ApiMagicItem extends Omit<ApiMagicItemSummary, 'variantOf'> {
  description: string
  variantOf: Ref | null
  variants: (Ref & { rarity: MagicItemRarity })[]
}

export const loadMonsters = () => get<ApiMonsterSummary[]>('monsters')
export const loadMonster = (index: string) => get<ApiMonster>(`monsters/${encodeURIComponent(index)}`)
export const loadMagicItems = () => get<ApiMagicItemSummary[]>('magic-items')
export const loadMagicItem = (index: string) => get<ApiMagicItem>(`magic-items/${encodeURIComponent(index)}`)

// --- Règles du SRD et guides -------------------------------------------------------------

export interface ApiRuleChapter extends Ref { sections: Ref[] }
export interface ApiRuleSection extends Ref { chapter: Ref; description: string }

export interface ApiGuideCard {
  index: string
  icon: string | null
  accent: GuideAccent | null
  title: string
  eyebrow: string | null
  summary: string | null
  advice: string | null
  lists: { label: string | null; items: string[] }[]
  class: Ref | null
  race: Ref | null
  rule: Ref | null
  // Section de la même page qui détaille la carte
  detail: string | null
}
export interface ApiGuideSection {
  index: string
  // Niveau de titre : 1 (partie), 2, 3
  level: number
  icon: string | null
  accent: GuideAccent | null
  title: string | null
  subtitle: string | null
  body: string | null
  cards: ApiGuideCard[]
}
export interface ApiGuideSummary { index: string; title: string; shortTitle: string | null; icon: string | null; accent: GuideAccent | null }
export interface ApiGuidePage extends ApiGuideSummary {
  published: boolean
  eyebrow: string | null
  heading: string | null
  intro: string | null
  sections: ApiGuideSection[]
}

export const loadRuleChapters = () => get<ApiRuleChapter[]>('rule-chapters')
export const loadRuleSection = (index: string) => get<ApiRuleSection>(`rule-sections/${encodeURIComponent(index)}`)
export const loadGuides = () => get<ApiGuideSummary[]>('guides')
export const loadGuide = (index: string) => get<ApiGuidePage>(`guides/${encodeURIComponent(index)}`)
