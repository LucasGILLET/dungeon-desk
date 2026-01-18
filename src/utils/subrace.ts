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

export function getSubraceEmoji(parentRaceIndex: string): string {
  const emojiMap: Record<string, string> = {
    'human': '👤',
    'elf': '🧝',
    'dwarf': '⚔️',
    'halfling': '🌱',
    'dragonborn': '🐲',
    'gnome': '🔮',
    'half-elf': '✨',
    'half-orc': '💪',
    'tiefling': '😈'
  }
  return emojiMap[parentRaceIndex] || '❓'
}

export function translateSubraceName(englishName: string): string {
  const translations: Record<string, string> = {
    'Hill Dwarf': 'Nain des collines',
    'Mountain Dwarf': 'Nain des montagnes',
    'High Elf': 'Haut-elfe',
    'Wood Elf': 'Elfe des bois',
    'Dark Elf (Drow)': 'Elfe noir (Drow)',
    'Lightfoot Halfling': 'Pied-léger',
    'Stout Halfling': 'Robuste',
    'Forest Gnome': 'Gnome des forêts',
    'Rock Gnome': 'Gnome des roches',
    'Deep Gnome': 'Gnome des profondeurs', // Svirfneblin
    'Duergar': 'Duergar',
    'Eladrin': 'Eladrin',
  }
  return translations[englishName] || englishName
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