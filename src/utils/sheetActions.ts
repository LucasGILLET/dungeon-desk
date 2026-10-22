// Actions de la fiche de personnage sur l'état en partie, sans effet de bord :
// chaque fonction renvoie un nouveau personnage (format d'échange de l'API).
import type { CharacterCreateInput } from '@/api/generated/model/characterCreateInput'

export type Input = CharacterCreateInput
type State = NonNullable<Input['state']>
type Item = NonNullable<Input['items']>[number]

const clone = (input: Input): Input => JSON.parse(JSON.stringify(input))
const state = (input: Input): State => ({
  experiencePoints: 0, temporaryHitPoints: 0, deathSaveSuccesses: 0, deathSaveFailures: 0, inspiration: false,
  spellSlotsUsed: [], featureUsage: [],
  ...(input.state ?? {}),
})
const withState = (input: Input, patch: Partial<State>): Input => ({ ...clone(input), state: { ...state(input), ...patch } })

export const currentHp = (input: Input, maxHp: number) => input.state?.currentHitPoints ?? maxHp

// Dégâts : d'abord les PV temporaires
export function applyDamage(input: Input, maxHp: number, amount: number): Input {
  const s = state(input)
  const absorbed = Math.min(s.temporaryHitPoints ?? 0, amount)
  const hp = Math.max(0, currentHp(input, maxHp) - (amount - absorbed))
  return withState(input, { temporaryHitPoints: (s.temporaryHitPoints ?? 0) - absorbed, currentHitPoints: hp })
}

// Soins, sans dépasser le maximum (au maximum : null, qui suit les montées de niveau)
export function heal(input: Input, maxHp: number, amount: number): Input {
  const hp = Math.min(maxHp, currentHp(input, maxHp) + amount)
  const patch: Partial<State> = { currentHitPoints: hp >= maxHp ? null : hp }
  if (hp > 0) Object.assign(patch, { deathSaveSuccesses: 0, deathSaveFailures: 0 })
  return withState(input, patch)
}

export const setTemporaryHp = (input: Input, amount: number) => withState(input, { temporaryHitPoints: Math.max(0, amount) })

export function setDeathSave(input: Input, kind: 'success' | 'failure', count: number): Input {
  return withState(input, kind === 'success' ? { deathSaveSuccesses: count } : { deathSaveFailures: count })
}

// Dépense d'un dé de vie au repos court : PV = jet + modificateur de Constitution
export function spendHitDie(input: Input, maxHp: number, classIndex: string, roll: number, conModifier: number): Input {
  const next = heal(input, maxHp, Math.max(0, roll + conModifier))
  next.classes = next.classes.map((c) => (c.class === classIndex ? { ...c, hitDiceUsed: (c.hitDiceUsed ?? 0) + 1 } : c))
  return next
}

// Capacité ou trait à utilisations limitées (rage, ki, souffle…)
export type ResourceKey = { feature?: string | null; trait?: string | null }
const sameResource = (u: { feature?: string | null; trait?: string | null }, key: ResourceKey) =>
  key.feature ? u.feature === key.feature : !!key.trait && u.trait === key.trait

export function setFeatureUsed(input: Input, key: ResourceKey, used: number): Input {
  const others = (state(input).featureUsage ?? []).filter((u) => !sameResource(u, key))
  const entry = { feature: key.feature ?? null, trait: key.trait ?? null, used }
  return withState(input, { featureUsage: used > 0 ? [...others, entry] : others })
}

// Repos court : les emplacements de pacte et les capacités qui se rechargent au repos court reviennent
export function shortRest(input: Input, shortRecharge: ResourceKey[] = []): Input {
  const s = state(input)
  return withState(input, {
    spellSlotsUsed: (s.spellSlotsUsed ?? []).filter((u) => !u.pact),
    featureUsage: (s.featureUsage ?? []).filter((u) => !shortRecharge.some((key) => sameResource(u, key))),
  })
}

// --- Sorts ---------------------------------------------------------------------------------

export function addSpell(input: Input, classIndex: string, spell: string, prepared = false): Input {
  const next = clone(input)
  const spells = next.spells ?? []
  if (!spells.some((s) => s.class === classIndex && s.spell === spell)) spells.push({ class: classIndex, spell, prepared })
  next.spells = spells
  return next
}

export function removeSpell(input: Input, classIndex: string, spell: string): Input {
  const next = clone(input)
  next.spells = (next.spells ?? []).filter((s) => !(s.class === classIndex && s.spell === spell))
  return next
}

export function togglePrepared(input: Input, classIndex: string, spell: string): Input {
  const next = clone(input)
  next.spells = (next.spells ?? []).map((s) => (s.class === classIndex && s.spell === spell ? { ...s, prepared: !s.prepared } : s))
  return next
}

// Repos long : PV, emplacements et capacités au maximum ; la moitié des dés de vie (au moins 1) revient
export function longRest(input: Input): Input {
  const next = withState(input, {
    currentHitPoints: null, temporaryHitPoints: 0, deathSaveSuccesses: 0, deathSaveFailures: 0, spellSlotsUsed: [], featureUsage: [],
  })
  let budget = Math.max(1, Math.floor(next.classes.reduce((sum, c) => sum + c.levels.length, 0) / 2))
  next.classes = next.classes.map((c) => {
    const regained = Math.min(c.hitDiceUsed ?? 0, budget)
    budget -= regained
    return { ...c, hitDiceUsed: (c.hitDiceUsed ?? 0) - regained }
  })
  return next
}

export const slotsUsed = (input: Input, level: number, pact = false) =>
  input.state?.spellSlotsUsed?.find((u) => u.level === level && !!u.pact === pact)?.used ?? 0

export function setSlotsUsed(input: Input, level: number, used: number, pact = false): Input {
  const others = (state(input).spellSlotsUsed ?? []).filter((u) => !(u.level === level && !!u.pact === pact))
  return withState(input, { spellSlotsUsed: used > 0 ? [...others, { level, pact, used }] : others })
}

export function toggleCondition(input: Input, condition: string): Input {
  const next = clone(input)
  const current = next.conditions ?? []
  next.conditions = current.includes(condition) ? current.filter((c) => c !== condition) : [...current, condition]
  return next
}

// --- Inventaire -----------------------------------------------------------------------

// Objet du catalogue, objet magique ou objet libre ; un objet déjà présent voit sa quantité augmenter
export function addItem(input: Input, item: { equipment?: string | null; magicItem?: string | null; name?: string | null; quantity?: number }): Input {
  const next = clone(input)
  const items = next.items ?? []
  const same = items.find((i) =>
    item.equipment ? i.equipment === item.equipment
      : item.magicItem ? i.magicItem === item.magicItem
        : !i.equipment && !i.magicItem && i.name === item.name)
  if (same) same.quantity = (same.quantity ?? 1) + (item.quantity ?? 1)
  else items.push({ equipment: item.equipment ?? null, magicItem: item.magicItem ?? null, name: item.name ?? null, quantity: item.quantity ?? 1, equipped: false, attuned: false })
  next.items = items
  return next
}

export function updateItem(input: Input, index: number, patch: Partial<Item>): Input {
  const next = clone(input)
  const items = next.items ?? []
  if (!items[index]) return next
  items[index] = { ...items[index]!, ...patch }
  // Quantité à zéro : l'objet sort de l'inventaire
  next.items = items.filter((i) => (i.quantity ?? 1) > 0)
  return next
}

export const removeItem = (input: Input, index: number) => updateItem(input, index, { quantity: 0 })

export function setCurrency(input: Input, currency: 'CP' | 'SP' | 'EP' | 'GP' | 'PP', amount: number): Input {
  const next = clone(input)
  next.currencies = { ...(next.currencies ?? {}), [currency]: Math.max(0, Math.floor(amount) || 0) }
  return next
}

// --- Retour en arrière ------------------------------------------------------------------

// Retire le dernier niveau pris (le plus haut niveau de personnage). Une classe
// sans niveau disparaît, une sous-classe sous son niveau d'accès aussi ; les PV
// actuels et dés de vie dépensés restent dans les nouvelles limites.
export function removeLastLevel(input: Input, subclassLevel: (classIndex: string) => number): Input {
  const next = clone(input)
  const levels = next.classes.flatMap((c) => c.levels.map((l) => l.characterLevel))
  if (levels.length <= 1) return next
  const top = Math.max(...levels)
  next.classes = next.classes
    .map((c) => {
      const kept = c.levels.filter((l) => l.characterLevel !== top)
      if (kept.length === c.levels.length) return c
      return {
        ...c,
        levels: kept,
        subclass: kept.length < subclassLevel(c.class) ? null : c.subclass,
        hitDiceUsed: Math.min(c.hitDiceUsed ?? 0, kept.length),
      }
    })
    .filter((c) => c.levels.length > 0)
  next.state = { ...state(next), currentHitPoints: null }
  return next
}

// Retire les réponses que l'API refuse après un retour en arrière : choix d'un
// niveau retiré, sorts trop puissants, utilisations d'une capacité perdue.
// Renvoie null quand aucune erreur ne vise ces listes.
export function pruneRejected(input: Input, errors: { path: string }[]): Input | null {
  // « spells[3].spell » → 3 pour la liste « spells »
  const rejected = (list: string) => new Set(errors.flatMap((e) => {
    if (!e.path.startsWith(`${list}[`)) return []
    const index = Number.parseInt(e.path.slice(list.length + 1), 10)
    return Number.isNaN(index) ? [] : [index]
  }))
  const choices = rejected('choices')
  const spells = rejected('spells')
  const usage = rejected('state.featureUsage')
  if (!choices.size && !spells.size && !usage.size) return null
  const next = clone(input)
  next.choices = (next.choices ?? []).filter((_, i) => !choices.has(i))
  next.spells = (next.spells ?? []).filter((_, i) => !spells.has(i))
  next.state = { ...state(next), featureUsage: (state(next).featureUsage ?? []).filter((_, i) => !usage.has(i)) }
  return next
}
