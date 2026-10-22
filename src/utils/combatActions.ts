// Actions du gestionnaire de combat, sans effet de bord : chaque fonction
// renvoie un nouveau combat (enregistré ensuite tel quel par l'API).
import type { Combat, Combatant } from '@/api/campaigns'

const clone = (c: Combat): Combat => JSON.parse(JSON.stringify(c))
const d20 = (random: () => number) => 1 + Math.floor(random() * 20)

// Hors de combat : un monstre ou une créature à 0 PV ne joue plus son tour
// (un personnage à 0 PV fait ses jets contre la mort, il garde le sien)
export const isOut = (c: Combatant) => c.kind !== 'CHARACTER' && c.hitPoints === 0

// Ordre d'initiative : la plus haute d'abord ; à égalité le meilleur bonus,
// puis les personnages avant les créatures. Le tour reste au même combattant.
export function sortByInitiative(combat: Combat): Combat {
  const next = clone(combat)
  const current = next.combatants[next.turn]
  next.combatants.sort((a, b) =>
    (b.initiative ?? -Infinity) - (a.initiative ?? -Infinity)
    || b.initiativeBonus - a.initiativeBonus
    || Number(b.kind === 'CHARACTER') - Number(a.kind === 'CHARACTER'))
  next.turn = current ? Math.max(0, next.combatants.indexOf(current)) : 0
  return next
}

// Jet d'initiative (d20 + bonus) pour ceux qui n'en ont pas, ou pour tous
// sauf les personnages (dont les joueurs annoncent souvent leur jet)
export function rollInitiative(combat: Combat, who: 'missing' | 'creatures', random = Math.random): Combat {
  const next = clone(combat)
  for (const c of next.combatants) {
    if (who === 'missing' ? c.initiative == null : c.kind !== 'CHARACTER') c.initiative = d20(random) + c.initiativeBonus
  }
  return sortByInitiative(next)
}

// Tour suivant (ou précédent), en sautant les créatures hors de combat ;
// passer le dernier commence un nouveau round
export function nextTurn(combat: Combat, direction: 1 | -1 = 1): Combat {
  const next = clone(combat)
  const n = next.combatants.length
  if (!n) return next
  for (let step = 0; step < n; step++) {
    next.turn += direction
    if (next.turn >= n) { next.turn = 0; next.round += 1 }
    if (next.turn < 0) {
      if (next.round === 1) { next.turn = 0; break }
      next.turn = n - 1
      next.round -= 1
    }
    if (!isOut(next.combatants[next.turn]!)) break
  }
  return next
}

const update = (combat: Combat, i: number, patch: (c: Combatant) => void): Combat => {
  const next = clone(combat)
  if (next.combatants[i]) patch(next.combatants[i]!)
  return next
}

// Dégâts : d'abord les PV temporaires, jamais sous 0
export const damage = (combat: Combat, i: number, amount: number) => update(combat, i, (c) => {
  const absorbed = Math.min(c.tempHitPoints, amount)
  c.tempHitPoints -= absorbed
  if (c.hitPoints != null) c.hitPoints = Math.max(0, c.hitPoints - (amount - absorbed))
})

// Soins, sans dépasser le maximum
export const heal = (combat: Combat, i: number, amount: number) => update(combat, i, (c) => {
  if (c.hitPoints == null) return
  c.hitPoints = c.maxHitPoints != null ? Math.min(c.maxHitPoints, c.hitPoints + amount) : c.hitPoints + amount
})

export const setTempHp = (combat: Combat, i: number, amount: number) => update(combat, i, (c) => { c.tempHitPoints = Math.max(0, Math.floor(amount) || 0) })

export const toggleCondition = (combat: Combat, i: number, condition: string) => update(combat, i, (c) => {
  c.conditions = c.conditions.includes(condition) ? c.conditions.filter((x) => x !== condition) : [...c.conditions, condition]
})

export const patchCombatant = (combat: Combat, i: number, patch: Partial<Combatant>) => update(combat, i, (c) => Object.assign(c, patch))

// Nouveaux combattants à la fin ; numérotés si on en ajoute plusieurs du même
// nom (« Gobelin 4 » après trois gobelins)
export function addCombatants(combat: Combat, base: Omit<Combatant, 'id'>, count = 1): Combat {
  const next = clone(combat)
  const same = next.combatants.filter((c) => c.name === base.name || c.name.startsWith(`${base.name} `)).length
  for (let k = 0; k < count; k++) {
    const numbered = count > 1 || same > 0
    next.combatants.push({ ...JSON.parse(JSON.stringify(base)), name: numbered ? `${base.name} ${same + k + 1}` : base.name })
  }
  return next
}

// Retrait : le tour reste au combattant en cours
export function removeCombatant(combat: Combat, i: number): Combat {
  const next = clone(combat)
  next.combatants.splice(i, 1)
  if (i < next.turn) next.turn -= 1
  next.turn = Math.min(next.turn, Math.max(0, next.combatants.length - 1))
  return next
}

// Déplacer d'un cran dans l'ordre (égalités départagées à la main)
export function move(combat: Combat, i: number, direction: 1 | -1): Combat {
  const j = i + direction
  if (j < 0 || j >= combat.combatants.length) return combat
  const next = clone(combat)
  const [a, b] = [next.combatants[i]!, next.combatants[j]!]
  next.combatants[i] = b
  next.combatants[j] = a
  if (next.turn === i) next.turn = j
  else if (next.turn === j) next.turn = i
  return next
}
