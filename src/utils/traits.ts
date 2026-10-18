// Descriptions des traits raciaux : toutes en base (SRD et contenu maison).
import { loadTraits } from './dataLoader'

const UNAVAILABLE = 'Description non disponible'

export function getTraitDescriptionFromSRD(traits: any[], traitIndex: string): string | null {
  const trait = traits.find(t => t.index === traitIndex)
  return trait ? trait.desc.join(' ') : null
}

export async function getTraitDescriptionByIndex(traitIndex: string): Promise<string | null> {
  const allTraits = await loadTraits()
  const trait = allTraits.find((t: any) => t.index === traitIndex)
  return trait ? trait.desc.join(' ') : null
}

export function getTraitDescriptionCombined(traits: any[], traitIndex: string, _traitName?: string): string {
  return getTraitDescriptionFromSRD(traits, traitIndex) ?? UNAVAILABLE
}
