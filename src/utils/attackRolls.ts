// Jets d'attaque et de dégâts des monstres dans le gestionnaire de combat.
import { rollDiceExpression } from '@/composables/useDiceRoller'
import type { ApiMonsterAction } from '@/utils/dataLoader'

export interface AttackRoll {
  d20: number
  bonus: number
  total: number
  critical: boolean // 20 naturel
  fumble: boolean // 1 naturel
}

export function rollAttack(bonus: number, random: () => number = Math.random): AttackRoll {
  const d20 = rollDiceExpression('1d20', random).total
  return { d20, bonus, total: d20 + bonus, critical: d20 === 20, fumble: d20 === 1 }
}

// Coup critique : les dés sont doublés, pas les modificateurs (« 2d6+3 » → « 4d6+3 »)
export const criticalDice = (dice: string) => dice.replace(/\s+/g, '').replace(/(\d*)d(\d+)/gi, (_, n: string, sides: string) => `${2 * Number(n || 1)}d${sides}`)

export interface DamageRoll {
  parts: { dice: string; total: number; type: string }[]
  total: number
  critical: boolean
}

// Tous les dégâts de l'action ; dégâts au choix : la première possibilité
export function rollDamage(damages: ApiMonsterAction['damages'], critical = false, random: () => number = Math.random): DamageRoll {
  const kept = damages.filter((d, i, all) => d.alternativeGroup == null || all.findIndex((x) => x.alternativeGroup === d.alternativeGroup) === i)
  const parts = kept.map((d) => {
    const dice = critical ? criticalDice(d.dice) : d.dice.replace(/\s+/g, '')
    return { dice, total: Math.max(0, rollDiceExpression(dice, random).total), type: d.damageType.name.toLowerCase() }
  })
  return { parts, total: parts.reduce((sum, p) => sum + p.total, 0), critical }
}

// Actions utiles en combat : celles qui ont une attaque, une sauvegarde ou des dégâts
export const combatActions = (actions: ApiMonsterAction[]) => actions.filter((a) => a.attack || a.save || a.damages.length)
