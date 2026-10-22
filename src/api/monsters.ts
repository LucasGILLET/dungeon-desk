// Monstres maison de l'utilisateur connecté (/api/monsters) : même format que
// le bestiaire du SRD, visibles et utilisables par leur seul auteur.
import { authenticatedFetch, buildApiUrl } from '@/utils/api'
import type { ApiMonster, ApiMonsterAction, ApiMonsterSummary, Size } from '@/utils/dataLoader'

type Ref = { index: string; name: string }
export type MonsterAttackType = 'MELEE_WEAPON' | 'RANGED_WEAPON' | 'MELEE_OR_RANGED_WEAPON' | 'MELEE_SPELL' | 'RANGED_SPELL'

export interface MonsterActionInput {
  name: string
  description: string
  attack: { type: MonsterAttackType; bonus: number; reachFt?: number | null; rangeFt?: { normal: number; long?: number | null } | null } | null
  save: { ability: string; dc: number } | null
  damages: { dice: string; damageType: string }[]
  legendaryCost?: number | null
}

// nonMagicalOnly : seulement contre les attaques non magiques
export interface DamageModifierInput { damageType: string; nonMagicalOnly: boolean }

export interface MonsterInput {
  name: string
  description: string | null
  size: Size
  type: string
  alignment: string | null
  armorClass: { value: number; note: string | null }
  hitDice: { count: number; size: number; bonus: number }
  hitPoints: number | null
  speeds: Partial<Record<'walk' | 'fly' | 'swim' | 'climb' | 'burrow', number>> & { hover?: true }
  abilityScores: Record<'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha', number>
  savingThrows: { ability: string; bonus: number }[]
  skills: { skill: string; bonus: number }[]
  damageVulnerabilities: DamageModifierInput[]
  damageResistances: DamageModifierInput[]
  damageImmunities: DamageModifierInput[]
  conditionImmunities: string[]
  senses: Partial<Record<'darkvision' | 'blindsight' | 'truesight' | 'tremorsense', number>>
  passivePerception: number | null
  languages: string | null
  challengeRating: number
  legendaryActionsPerRound: number | null
  traits: MonsterActionInput[]
  actions: MonsterActionInput[]
  bonusActions: MonsterActionInput[]
  reactions: MonsterActionInput[]
  legendaryActions: MonsterActionInput[]
  lairActions: MonsterActionInput[]
}

export interface MonsterOptions {
  creatureTypes: Ref[]
  alignments: Ref[]
  abilities: Ref[]
  skills: (Ref & { ability: string })[]
  damageTypes: Ref[]
  conditions: Ref[]
  challengeRatings: { value: number; xp: number }[]
}

export class MonsterApiError extends Error {
  constructor(message: string, readonly status: number, readonly errors: { path: string; message: string }[] = []) {
    super(message)
  }
}

async function call<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const response = await authenticatedFetch(buildApiUrl(`monsters${path}`), {
    method: options.method ?? 'GET',
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const errors = (data.errors ?? []) as { path: string; message: string }[]
    throw new MonsterApiError(errors.map((e) => `${e.path} : ${e.message}`).join(', ') || data.message || `Erreur ${response.status}`, response.status, errors)
  }
  return data as T
}

let options: Promise<MonsterOptions> | null = null

export const monstersApi = {
  list: () => call<ApiMonsterSummary[]>('?lang=fr'),
  get: (index: string) => call<ApiMonster>(`/${encodeURIComponent(index)}?lang=fr`),
  // Listes du formulaire, chargées une fois
  options: () => (options ??= call<MonsterOptions>('/options?lang=fr').catch((e) => { options = null; throw e })),
  create: (input: MonsterInput) => call<{ index: string }>('?lang=fr', { method: 'POST', body: input }),
  update: (index: string, input: MonsterInput) => call<{ index: string }>(`/${encodeURIComponent(index)}?lang=fr`, { method: 'PUT', body: input }),
  remove: (index: string) => call<{ message: string }>(`/${encodeURIComponent(index)}`, { method: 'DELETE' }),
}

// Monstre vierge du formulaire
export const emptyMonster = (): MonsterInput => ({
  name: '', description: null, size: 'MEDIUM', type: 'humanoid', alignment: null,
  armorClass: { value: 12, note: null }, hitDice: { count: 2, size: 8, bonus: 0 }, hitPoints: null,
  speeds: { walk: 30 }, abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  savingThrows: [], skills: [], damageVulnerabilities: [], damageResistances: [], damageImmunities: [], conditionImmunities: [],
  senses: {}, passivePerception: null, languages: null, challengeRating: 1, legendaryActionsPerRound: null,
  traits: [], actions: [], bonusActions: [], reactions: [], legendaryActions: [], lairActions: [],
})

const ATTACK_TYPES = new Set<string>(['MELEE_WEAPON', 'RANGED_WEAPON', 'MELEE_OR_RANGED_WEAPON', 'MELEE_SPELL', 'RANGED_SPELL'])
const actionInput = (a: ApiMonsterAction): MonsterActionInput => ({
  name: a.name,
  description: a.description,
  attack: a.attack && ATTACK_TYPES.has(a.attack.type)
    ? { type: a.attack.type as MonsterAttackType, bonus: a.attack.bonus ?? 0, reachFt: a.attack.reachFt, rangeFt: a.attack.rangeFt }
    : null,
  save: a.save && a.save.dc != null ? { ability: a.save.ability.index, dc: a.save.dc } : null,
  // Dégâts au choix : la première possibilité de chaque groupe
  damages: a.damages.filter((d, i, all) => d.alternativeGroup == null || all.findIndex((x) => x.alternativeGroup === d.alternativeGroup) === i)
    .map((d) => ({ dice: d.dice.replace(/\s/g, ''), damageType: d.damageType.index })),
  legendaryCost: a.legendaryCost,
})
// Modificateurs sans type de dégâts (« dégâts des sorts ») : non repris
const typed = (list: { damageType: Ref | null; nonMagicalOnly: boolean }[]) =>
  list.flatMap((d) => (d.damageType ? [{ damageType: d.damageType.index, nonMagicalOnly: d.nonMagicalOnly }] : []))

// Fiche du bestiaire (SRD ou maison) → saisie du formulaire : copier un monstre
// du SRD, ou modifier un monstre maison. Les attaques multiples, sorts et
// usages limités restent dans les descriptions.
export function toMonsterInput(m: ApiMonster): MonsterInput {
  const { hover: _hover, ...speeds } = m.speeds
  const { blindBeyond: _b, ...senses } = m.senses
  return {
    name: m.name,
    description: m.description,
    size: m.size,
    type: m.type.index,
    alignment: m.alignment.unaligned || m.alignment.options.length !== 1 ? null : m.alignment.options[0]!.index,
    armorClass: { value: m.armorClasses[0]?.value ?? m.armorClass ?? 10, note: m.armorClasses[0]?.note ?? (m.armorClasses[0]?.armor.map((a) => a.name).join(', ') || null) },
    hitDice: { count: m.hitDice.count, size: m.hitDice.size, bonus: m.hitDice.bonus },
    hitPoints: m.hitPoints,
    speeds,
    abilityScores: { ...m.abilityScores },
    savingThrows: m.savingThrows.map((s) => ({ ability: s.index, bonus: s.bonus })),
    skills: m.skills.map((s) => ({ skill: s.index, bonus: s.bonus })),
    damageVulnerabilities: typed(m.damageVulnerabilities),
    damageResistances: typed(m.damageResistances),
    damageImmunities: typed(m.damageImmunities),
    conditionImmunities: m.conditionImmunities.map((c) => c.index),
    senses,
    passivePerception: m.passivePerception,
    languages: m.languages.text,
    challengeRating: m.challengeRating,
    legendaryActionsPerRound: m.legendaryActionsPerRound,
    traits: m.traits.map(actionInput),
    actions: m.actions.map(actionInput),
    bonusActions: m.bonusActions.map(actionInput),
    reactions: m.reactions.map(actionInput),
    legendaryActions: m.legendaryActions.map(actionInput),
    lairActions: m.lairActions.map(actionInput),
  }
}
