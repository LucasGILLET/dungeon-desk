// Génération de PNJ à partir des tables de l'API (/srd/:edition/npc-tables) :
// professions, manies… Le nom est généré selon les sonorités de la race
// (npcNames), la race tirée selon sa fréquence, la taille et le poids selon son profil.
import type { NpcInput } from '@/api/generated/model/npcInput'
import type { ApiNpcTables } from './dataLoader'
import { generateNpcName } from './npcNames'

export interface NpcRace {
  index: string
  name: string
  npcProfile: { frequency: number; heightCm: { base: number; variance: number } | null; weightKg: { base: number; variance: number } | null }
}
export interface NpcRef { index: string; name: string }

export const GENDERS = [
  { code: 'MALE', label: 'Homme' },
  { code: 'FEMALE', label: 'Femme' },
  { code: 'NON_BINARY', label: 'Non-binaire' },
] as const
export type GenderCode = (typeof GENDERS)[number]['code']

const ABILITIES = [['FOR', 'str'], ['DEX', 'dex'], ['CON', 'con'], ['INT', 'int'], ['SAG', 'wis'], ['CHA', 'cha']] as const

export interface GeneratedNPC {
  firstName: string
  lastName: string
  // Dans la forme de la race : « Thorek du clan Brisefer »
  fullName: string
  race: NpcRef
  class: NpcRef | null
  gender: GenderCode
  genderLabel: string
  age: number
  ageCategory: string
  heightCm: number | null
  weightKg: number | null
  height: string
  weight: string
  bodyType: string
  profession: string
  socialStatus: string
  relations: string
  history: string
  // Affichage : FOR, DEX…
  stats: Record<(typeof ABILITIES)[number][0], number>
  alignment: NpcRef | null
  personality: string
  motivation: string
  quirk: string
}

type Random = () => number

// Tirage pondéré (poids des entrées de table, fréquence des races)
export function weightedPick<T>(items: T[], weight: (item: T) => number, random: Random = Math.random): T | undefined {
  const total = items.reduce((sum, item) => sum + Math.max(0, weight(item)), 0)
  if (!items.length || total <= 0) return items[0]
  let roll = random() * total
  for (const item of items) {
    roll -= Math.max(0, weight(item))
    if (roll < 0) return item
  }
  return items.at(-1)
}

// Entrées communes à toutes les races
const pickText = (tables: ApiNpcTables, kind: string, random: Random) =>
  weightedPick((tables[kind] ?? []).filter((e) => e.race === null), (e) => e.weight, random)?.text ?? ''

function age(random: Random) {
  const roll = random()
  if (roll < 0.2) return { value: 16 + Math.floor(random() * 9), category: 'Jeune' }
  if (roll < 0.6) return { value: 25 + Math.floor(random() * 25), category: 'Adulte' }
  if (roll < 0.85) return { value: 50 + Math.floor(random() * 20), category: 'Mûr' }
  return { value: 70 + Math.floor(random() * 20), category: 'Vieux' }
}

const roll3d6 = (random: Random) => [0, 0, 0].reduce((sum) => sum + 1 + Math.floor(random() * 6), 0)
const vary = (range: { base: number; variance: number } | null, random: Random) =>
  range ? range.base + Math.floor(random() * (range.variance + 1)) : null

export function generateNpc(options: {
  races: NpcRace[]
  classes: NpcRef[]
  alignments: NpcRef[]
  tables: ApiNpcTables
  race?: string | null // index, sinon tirage selon la fréquence
  class?: string | 'random' | null // null = roturier
  gender?: GenderCode | null
  random?: Random
}): GeneratedNPC {
  const random = options.random ?? Math.random
  const race = options.races.find((r) => r.index === options.race) ?? weightedPick(options.races, (r) => r.npcProfile.frequency, random)!
  const cls = options.class === 'random'
    ? options.classes[Math.floor(random() * options.classes.length)] ?? null
    : options.classes.find((c) => c.index === options.class) ?? null
  const gender = GENDERS.find((g) => g.code === options.gender) ?? GENDERS[Math.floor(random() * GENDERS.length)]!
  const a = age(random)
  const heightCm = vary(race.npcProfile.heightCm, random)
  const weightKg = vary(race.npcProfile.weightKg, random)
  const origin = pickText(options.tables, 'ORIGIN', random)
  const event = pickText(options.tables, 'HISTORY_EVENT', random)

  return {
    ...generateNpcName(race.index, gender.code, random),
    race: { index: race.index, name: race.name },
    class: cls ? { index: cls.index, name: cls.name } : null,
    gender: gender.code,
    genderLabel: gender.label,
    age: a.value,
    ageCategory: a.category,
    heightCm,
    weightKg,
    height: heightCm != null ? `${heightCm} cm` : '—',
    weight: weightKg != null ? `${weightKg} kg` : '—',
    bodyType: pickText(options.tables, 'BODY_TYPE', random),
    profession: pickText(options.tables, 'PROFESSION', random),
    socialStatus: pickText(options.tables, 'SOCIAL_STATUS', random),
    relations: pickText(options.tables, 'RELATION', random),
    history: origin && event ? `${origin} et ${event}.` : origin || event,
    stats: Object.fromEntries(ABILITIES.map(([label]) => [label, roll3d6(random)])) as GeneratedNPC['stats'],
    alignment: options.alignments.length ? options.alignments[Math.floor(random() * options.alignments.length)]! : null,
    personality: pickText(options.tables, 'PERSONALITY', random),
    motivation: pickText(options.tables, 'MOTIVATION', random),
    quirk: pickText(options.tables, 'QUIRK', random),
  }
}

// PNJ généré → format d'échange de l'API
export function toNpcInput(npc: GeneratedNPC): NpcInput {
  return {
    name: npc.fullName,
    firstName: npc.firstName || null,
    lastName: npc.lastName || null,
    race: npc.race.index,
    class: npc.class?.index ?? null,
    alignment: npc.alignment?.index ?? null,
    gender: npc.gender,
    age: npc.age,
    heightCm: npc.heightCm,
    weightKg: npc.weightKg,
    bodyType: npc.bodyType || null,
    profession: npc.profession || null,
    socialStatus: npc.socialStatus || null,
    relations: npc.relations || null,
    personality: npc.personality || null,
    motivation: npc.motivation || null,
    quirk: npc.quirk || null,
    history: npc.history || null,
    abilityScores: Object.fromEntries(ABILITIES.map(([label, index]) => [index, npc.stats[label]])),
  }
}
