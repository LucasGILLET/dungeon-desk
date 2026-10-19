// Descriptions des traits raciaux : toutes en base (SRD et contenu maison).
const UNAVAILABLE = 'Description non disponible'

export function getTraitDescriptionFromSRD(traits: any[], traitIndex: string): string | null {
  const trait = traits.find(t => t.index === traitIndex)
  return trait ? trait.desc.join(' ') : null
}

export function getTraitDescriptionCombined(traits: any[], traitIndex: string, _traitName?: string): string {
  return getTraitDescriptionFromSRD(traits, traitIndex) ?? UNAVAILABLE
}
