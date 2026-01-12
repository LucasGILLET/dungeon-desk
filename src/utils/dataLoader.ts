// Utilitaires pour charger les données SRD depuis les fichiers JSON

import type { SRDRace, SRDClass, SRDSubclass, SRDBackground, SRDTrait } from '@/types/srd'

// Cache pour éviter de recharger les données
const dataCache = new Map<string, any>()

async function loadJSON<T>(filename: string): Promise<T> {
  if (dataCache.has(filename)) {
    return dataCache.get(filename) as T
  }

  try {
    const response = await fetch(`/data/${filename}`)
    if (!response.ok) {
      throw new Error(`Erreur lors du chargement de ${filename}: ${response.status}`)
    }
    const data = await response.json()
    dataCache.set(filename, data)
    return data as T
  } catch (error) {
    console.error(`Erreur lors du chargement de ${filename}:`, error)
    throw error
  }
}

export async function loadRaces(): Promise<SRDRace[]> {
  return loadJSON<SRDRace[]>('5e-SRD-Races.json')
}

export async function loadClasses(): Promise<SRDClass[]> {
  return loadJSON<SRDClass[]>('5e-SRD-Classes.json')
}

export async function loadSubclasses(): Promise<SRDSubclass[]> {
  return loadJSON<SRDSubclass[]>('5e-SRD-Subclasses.json')
}

export async function loadBackgrounds(): Promise<SRDBackground[]> {
  const [srdBackgrounds, customBackgrounds] = await Promise.all([
    loadJSON<SRDBackground[]>('5e-SRD-Backgrounds.json'),
    loadJSON<SRDBackground[]>('custom/custom-backgrounds.json').catch(() => [])
  ])
  
  // Fusionner les backgrounds SRD et personnalisés
  return [...srdBackgrounds, ...customBackgrounds]
}

export async function loadSubraces(): Promise<SRDSubclass[]> {
  const [srdSubraces, customSubraces] = await Promise.all([
    loadJSON<SRDSubclass[]>('5e-SRD-Subraces.json'),
    loadJSON<SRDSubclass[]>('custom/custom-subraces.json').catch(() => [])
  ])
  
  // Créer une map pour éviter les doublons, en priorisant les versions custom (françaises)
  const subracesMap = new Map<string, SRDSubclass>()
  
  // Ajouter d'abord les sous-races SRD
  srdSubraces.forEach(subrace => {
    subracesMap.set(subrace.index, subrace)
  })
  
  // Ajouter/écraser avec les sous-races custom (elles ont priorité)
  customSubraces.forEach(subrace => {
    subracesMap.set(subrace.index, subrace)
  })
  
  // Convertir la map en tableau
  return Array.from(subracesMap.values())
}

// Fonctions utilitaires pour adapter les données SRD à ton app
export async function loadTraits(): Promise<SRDTrait[]> {
  // Charger les traits custom et SRD en parallèle
  const [customTraits, srdTraits] = await Promise.all([
    loadJSON<SRDTrait[]>('custom/custom-traits.json').catch(() => []),
    loadJSON<SRDTrait[]>('5e-SRD-Traits.json')
  ])
  
  // Fusionner avec priorité aux traits custom
  const traitMap = new Map<string, SRDTrait>()
  
  // Ajouter d'abord les traits SRD
  srdTraits.forEach(trait => traitMap.set(trait.index, trait))
  
  // Écraser avec les traits custom (priorité)
  customTraits.forEach(trait => traitMap.set(trait.index, trait))
  
  return Array.from(traitMap.values())
}

export function getRaceDisplayName(race: SRDRace): string {
  // Pour l'instant, on garde les noms anglais, mais tu peux ajouter une traduction ici
  return race.name
}

export function getClassDisplayName(cls: SRDClass): string {
  return cls.name
}

export function getBackgroundDisplayName(bg: SRDBackground): string {
  return bg.name
}

export function getSubclassDisplayName(subclass: SRDSubclass): string {
  return subclass.name
}
