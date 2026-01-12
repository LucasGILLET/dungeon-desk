// Utilitaires pour les sous-races basés sur les données SRD

import { loadSubraces } from './dataLoader'
import type { SRDSubclass } from '@/types/srd'

// Cache pour les sous-races chargées
let subracesCache: SRDSubclass[] | null = null

async function getSubraces(): Promise<SRDSubclass[]> {
  if (!subracesCache) {
    subracesCache = await loadSubraces()
  }
  return subracesCache
}

// Fonctions utilitaires adaptées aux SRD
export async function getSubracesByParentRace(parentRaceIndex: string): Promise<SRDSubclass[]> {
  const allSubraces = await getSubraces()
  return allSubraces.filter(subrace => subrace.race.index === parentRaceIndex)
}

export async function getSubraceByIndex(index: string): Promise<SRDSubclass | undefined> {
  const allSubraces = await getSubraces()
  return allSubraces.find(subrace => subrace.index === index)
}

export async function getAllSubraces(): Promise<SRDSubclass[]> {
  return getSubraces()
}

// Fonction pour obtenir l'emoji d'une sous-race selon sa race parente
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

// Fonctions utilitaires pour extraire les informations des sous-races SRD
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

// Pour la compatibilité avec l'ancien code, on garde une interface similaire
export interface Subrace {
  index: string
  name: string
  description: string
  abilityBonuses: Record<string, number>
  parentRace: string
  racialTraits: Array<{
    index: string
    name: string
    url: string
  }>
}

// Fonction pour convertir SRDSubclass vers l'ancienne interface (pour compatibilité)
export function convertSRDSubraceToLegacy(subrace: SRDSubclass): Subrace {
  return {
    index: subrace.index,
    name: subrace.name,
    description: subrace.desc,
    abilityBonuses: getSubraceAbilityBonuses(subrace),
    parentRace: subrace.race.index,
    racialTraits: subrace.racial_traits
  }
}
