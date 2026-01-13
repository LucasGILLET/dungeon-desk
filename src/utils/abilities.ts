export interface Ability {
  name: string
  value: number
}

export function getAbilityDescription(name: string): string {
  const descriptions: Record<string, string> = {
    'Force': 'Puissance physique, combat au corps à corps',
    'Dextérité': 'Agilité, réflexes, attaques à distance',
    'Constitution': 'Endurance, points de vie, résistance',
    'Intelligence': 'Raisonnement, mémoire, magie arcane',
    'Sagesse': 'Perception, intuition, magie divine',
    'Charisme': 'Force de personnalité, persuasion'
  }
  return descriptions[name] || ''
}

export function getAbilityPointCost(value: number): number {
  // Système de coût D&D 5e : 8=0pts, 9=1pt, 10=2pts, 11=3pts, 12=4pts, 13=5pts, 14=7pts, 15=9pts
  const costs = [0, 1, 2, 3, 4, 5, 7, 9]
  return costs[value - 8] || 0
}

export function translateAbilityScore(englishName: string): string {
  const translations: Record<string, string> = {
    'STR': 'FOR',
    'DEX': 'DEX',
    'CON': 'CON',
    'INT': 'INT',
    'WIS': 'SAG',
    'CHA': 'CHA'
  }
  return translations[englishName] || englishName
}