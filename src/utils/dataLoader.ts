// Données de jeu lues depuis l'API (/api/srd/:edition/…), puis converties vers
// les types SRD qu'utilisent les composants. La base, éditée dans Directus, est
// la seule source : il n'y a plus de fichiers JSON côté front.
import type { SRDBackground, SRDClass, SRDFeature, SRDRace, SRDSubclass, SRDTrait } from '@/types/srd'
import { buildApiUrl } from './api'

export const EDITION = '2014'
const LANG = 'fr'

// --- Réponses de l'API --------------------------------------------------------------

interface Ref { index: string; name: string }
interface ApiTrait extends Ref { description: string }
interface ApiBonus extends Ref { bonus: number }
interface ApiRace extends Ref {
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
  feature: { name: string; description: string | null } | null
  proficiencies: Ref[]
  startingEquipment: (Ref & { quantity: number })[]
  personality: { id: number; kind: 'PERSONALITY_TRAIT' | 'IDEAL' | 'BOND' | 'FLAW'; text: string; alignments: Ref[] }[]
}
export interface ApiSubclass extends Ref {
  source: 'SRD' | 'HOMEBREW'
  description: string | null
  spells: (Ref & { level: number; requiredClassLevel: number })[]
}
export interface ApiClass extends Ref {
  hitDie: number
  subclassLevel: number
  savingThrows: Ref[]
  proficiencies: Ref[]
  startingEquipment: (Ref & { quantity: number })[]
  spellcasting: { ability: Ref; startLevel: number; sections: { title: string; description: string }[] } | null
  subclasses: ApiSubclass[]
  features: { index: string; level: number; subclass: string | null; parent: string | null; name: string; description: string }[]
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
