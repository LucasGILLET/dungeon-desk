export const traitDescriptions: Record<string, string> = {
  // Traits essentiels manquants du SRD
  'dwarven-toughness': 'Votre maximum de points de vie augmente de 1 à chaque niveau.',
  'elf-weapon-training': 'Vous maîtrisez les épées longues, les épées courtes, les arcs longs et les arcs courts.',
  'high-elf-cantrip': 'Vous connaissez un tour de magie de magicien de votre choix. L\'Intelligence est votre caractéristique d\'incantation pour ce tour.',
  'extra-language': 'Vous pouvez parler, lire et écrire une langue supplémentaire de votre choix.',
  'naturally-stealthy': 'Vous pouvez tenter de vous cacher même lorsque vous n\'êtes obscurci que par une créature plus grande que vous.',
  'artificers-lore': 'Chaque fois que vous faites un test d\'Intelligence (Histoire) relatif à des objets magiques, alchimiques ou technologiques, vous pouvez ajouter le double de votre bonus de maîtrise au lieu de votre bonus de maîtrise normal.',
  'tinker': 'Vous avez la capacité de créer de petits objets mécaniques.'
}


export function getTraitDescription(traitName: string): string {
  return traitDescriptions[traitName] || 'Description non disponible'
}

export function getTraitDescriptionFromSRD(traits: any[], traitIndex: string): string | null {
  const trait = traits.find(t => t.index === traitIndex)
  return trait ? trait.desc.join(' ') : null
}

export function getTraitDescriptionCombined(traits: any[], traitIndex: string, traitName: string): string {
  // Chercher par index dans les données SRD (custom + classique)
  const srdDesc = getTraitDescriptionFromSRD(traits, traitIndex)
  if (srdDesc) return srdDesc
  
  // Chercher par nom anglais dans les descriptions locales (pour compatibilité)
  const nameDesc = getTraitDescription(traitName)
  if (nameDesc !== 'Description non disponible') return nameDesc
  
  // Chercher par index dans les descriptions locales (pour les traits manquants)
  const indexDesc = getTraitDescription(traitIndex)
  if (indexDesc !== 'Description non disponible') return indexDesc
  
  return 'Description non disponible'
}
