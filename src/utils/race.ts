import { loadSubraces } from './dataLoader'
import type { SRDRace } from '@/types/srd'
import { translateAbilityScore } from './abilities'

export function getRaceDescription(race: SRDRace): string {
  // Descriptions traduites en français pour chaque race
  const descriptions: Record<string, string> = {
    'Dwarf': 'Créatures robustes et résistantes, les nains excellent dans l\'artisanat et la guerre souterraine.',
    'Elf': 'Gracieux et longévives, les elfes sont des êtres magiques connectés à la nature et aux arts.',
    'Halfling': 'Petits et chanceux, les halfelins sont des aventuriers intrépides et opportunistes.',
    'Human': 'Adaptables et ambitieux, les humains sont la race la plus répandue et diverse de Faerûn.',
    'Dragonborn': 'Descendants des dragons, ils possèdent une force impressionnante et un souffle draconique.',
    'Gnome': 'Ingénieux et curieux, les gnomes excellent dans l\'invention et la magie illusionniste.',
    'Half-Elf': 'Mélange d\'elfe et d\'humain, ils combinent la grâce elfique avec l\'adaptabilité humaine.',
    'Half-Orc': 'Puissants et endurants, les demi-orcs allient la force orc avec d\'autres héritages.',
    'Tiefling': 'Marqués par un héritage infernal, ils possèdent des pouvoirs surnaturels et une résistance aux éléments.'
  }
  return descriptions[race.name] || race.size_description || race.alignment
}

export function translateRaceName(englishName: string): string {
  const translations: Record<string, string> = {
    'Dwarf': 'Nain',
    'Elf': 'Elfe',
    'Halfling': 'Halfelin',
    'Human': 'Humain',
    'Dragonborn': 'Drakéide',
    'Gnome': 'Gnome',
    'Half-Elf': 'Demi-elfe',
    'Half-Orc': 'Demi-orc',
    'Tiefling': 'Tieffelin'
  }
  return translations[englishName] || englishName
}

export function getRaceStats(race: SRDRace): string[] {
  return race.ability_bonuses.map(bonus => `+${bonus.bonus} ${translateAbilityScore(bonus.ability_score.name)}`)
}

export function getRaceTraits(race: SRDRace): string[] {
  return race.traits.map(trait => trait.name)
}

