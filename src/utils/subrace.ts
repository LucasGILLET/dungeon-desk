import { loadSubraces } from './dataLoader'
import type { SRDSubclass } from '@/types/srd'

let subracesCache: SRDSubclass[] | null = null

async function getSubraces(): Promise<SRDSubclass[]> {
  if (!subracesCache) {
    subracesCache = await loadSubraces()
  }
  return subracesCache
}

export async function getSubracesByParentRace(parentRaceIndex: string): Promise<SRDSubclass[]> {
  const allSubraces = await getSubraces()
  return allSubraces.filter(subrace => subrace.race.index === parentRaceIndex)
}

export function getSubraceEmoji(subrace: SRDSubclass): string {
  return subrace.icon ?? '❓'
}

export function getSubraceAbilityBonuses(subrace: SRDSubclass): Record<string, number> {
  const bonuses: Record<string, number> = {}
  subrace.ability_bonuses.forEach(bonus => {
    bonuses[bonus.ability_score.name] = bonus.bonus
  })
  return bonuses
}

export function getSubraceDescription(subrace: SRDSubclass): string {
  return subrace.desc
}

export interface Subrace {
  index: string
  name: string
  description: string
  desc: string
  abilityBonuses: Record<string, number>
  parentRace: string
  racialTraits: Array<{
    index: string
    name: string
    url: string
  }>
  ability_bonuses: Record<string, number>
}