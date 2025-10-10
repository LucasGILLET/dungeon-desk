// Données des sous-classes D&D 5e
export interface SubclassData {
  id: string
  name: string
  className: string
  source: string
  description: string
  primaryAbility: string
  bonusSpells?: string[]
  features?: string[]
  level1Features: string[]
  levelProgression?: {
    level: number
    features?: string[] // Features gagnées à ce niveau (optionnel)
  }[]
}

export const subclasses: SubclassData[] = [
  // Sous-classes de Clerc
  {
    id: 'domaine-guerre',
    name: 'Domaine de la Guerre',
    className: 'clerc',
    source: 'Manuel des Joueurs',
    description: 'Un clerc martial qui bénit les batailles et guide les guerriers au combat.',
    primaryAbility: 'Sorts et capacités de combat améliorés',
    bonusSpells: ['Faveur divine', 'Bouclier de la foi', 'Arme spirituelle', 'Arme magique'],
    features: ['Prêtre guerrier', 'Sorts de domaine', 'Canalisation : Frappe guidée'],
    level1Features: ['Prêtre guerrier', 'Sorts de domaine'],
    levelProgression: [
      { level: 1, features: ['Prêtre guerrier', 'Sorts de domaine (Guerre - Niv 1)'] },
      { level: 2, features: ['Canalisation Divine : Frappe guidée'] },
      { level: 3, features: ['Sorts de domaine (Guerre - Niv 3)'] },
      { level: 5, features: ['Sorts de domaine (Guerre - Niv 5)'] },
      { level: 6, features: ['Canalisation Divine : Bénédiction de guerre'] },
      { level: 7, features: ['Sorts de domaine (Guerre - Niv 7)'] },
      { level: 8, features: ['Frappe guerrière'] },
      { level: 9, features: ['Sorts de domaine (Guerre - Niv 9)'] },
      { level: 17, features: ['Avatar de bataille'] }
    ]
  },
  {
    id: 'domaine-vie',
    name: 'Domaine de la Vie',
    className: 'clerc',
    source: 'Manuel des Joueurs',
    description: 'Un guérisseur dévoué qui canalise l\'énergie positive pour soigner et protéger.',
    primaryAbility: 'Soins renforcés et protection divine',
    bonusSpells: ['Bénédiction', 'Soin des blessures', 'Restauration partielle', 'Prière de guérison'],
    features: ['Disciple de la vie', 'Sorts de domaine', 'Canalisation : Préservation de la vie'],
    level1Features: ['Disciple de la vie', 'Sorts de domaine'],
    levelProgression: [
      { level: 1, features: ['Disciple de la vie', 'Sorts de domaine (Vie - Niv 1)'] },
      { level: 2, features: ['Canalisation Divine : Préservation de la vie'] },
      { level: 3, features: ['Sorts de domaine (Vie - Niv 3)'] },
      { level: 5, features: ['Sorts de domaine (Vie - Niv 5)'] },
      { level: 6, features: ['Guérisseur béni'] },
      { level: 7, features: ['Sorts de domaine (Vie - Niv 7)'] },
      { level: 8, features: ['Frappe divine'] },
      { level: 9, features: ['Sorts de domaine (Vie - Niv 9)'] },
      { level: 17, features: ['Guérison suprême'] }
    ]
  },
  {
    id: 'domaine-lumiere',
    name: 'Domaine de la Lumière',
    className: 'clerc',
    source: 'Manuel des Joueurs',
    description: 'Un clerc qui combat les ténèbres avec la lumière divine et le feu sacré.',
    primaryAbility: 'Sorts de lumière et de feu',
    bonusSpells: ['Lueurs féeriques', 'Mains brûlantes', 'Sphère de feu', 'Lumière du jour'],
    features: ['Sort mineur bonus', 'Lueur protectrice', 'Sorts de domaine'],
    level1Features: ['Sort mineur bonus', 'Sorts de domaine'],
    levelProgression: [
      { level: 1, features: ['Sort mineur bonus', 'Lueur protectrice', 'Sorts de domaine (Lumière - Niv 1)'] },
      { level: 2, features: ['Canalisation Divine : Rayonnement du soleil'] },
      { level: 3, features: ['Sorts de domaine (Lumière - Niv 3)'] },
      { level: 5, features: ['Sorts de domaine (Lumière - Niv 5)'] },
      { level: 6, features: ['Lueur protectrice améliorée'] },
      { level: 7, features: ['Sorts de domaine (Lumière - Niv 7)'] },
      { level: 8, features: ['Amélioration des sorts mineurs'] },
      { level: 9, features: ['Sorts de domaine (Lumière - Niv 9)'] },
      { level: 17, features: ['Couronne de lumière'] }
    ]
  },
  {
    id: 'domaine-nature',
    name: 'Domaine de la Nature',
    className: 'clerc',
    source: 'Manuel des Joueurs',
    description: 'Un clerc connecté au monde naturel et à ses créatures.',
    primaryAbility: 'Magie de la nature et communion animale',
    bonusSpells: ['Baies magiques', 'Communication avec les animaux', 'Croissance d\'épines', 'Liberté de mouvement'],
    features: ['Acolyte de la nature', 'Maîtrise des armures lourdes', 'Sorts de domaine'],
    level1Features: ['Acolyte de la nature', 'Sorts de domaine'],
    levelProgression: [
      { level: 1, features: ['Acolyte de la nature', 'Maîtrise des armures lourdes', 'Sorts de domaine (Nature - Niv 1)'] },
      { level: 2, features: ['Canalisation Divine : Charme des animaux et des plantes'] },
      { level: 3, features: ['Sorts de domaine (Nature - Niv 3)'] },
      { level: 5, features: ['Sorts de domaine (Nature - Niv 5)'] },
      { level: 6, features: ['Résistance aux éléments'] },
      { level: 7, features: ['Sorts de domaine (Nature - Niv 7)'] },
      { level: 8, features: ['Frappe élémentaire'] },
      { level: 9, features: ['Sorts de domaine (Nature - Niv 9)'] },
      { level: 17, features: ['Maître de la nature'] }
    ]
  },
  {
    id: 'domaine-duperie',
    name: 'Domaine de la Duperie',
    className: 'clerc',
    source: 'Manuel des Joueurs',
    description: 'Un clerc rusé qui utilise l\'illusion et la tromperie pour servir sa divinité.',
    primaryAbility: 'Illusions et discrétion divine',
    bonusSpells: ['Charme-personne', 'Déguisement', 'Image miroir', 'Invisibilité'],
    features: ['Bénédiction du filou', 'Canalisation : Invoquer un double', 'Sorts de domaine'],
    level1Features: ['Bénédiction du filou', 'Sorts de domaine'],
    levelProgression: [
      { level: 1, features: ['Bénédiction du filou', 'Sorts de domaine (Duperie - Niv 1)'] },
      { level: 2, features: ['Canalisation Divine : Invoquer un double'] },
      { level: 3, features: ['Sorts de domaine (Duperie - Niv 3)'] },
      { level: 5, features: ['Sorts de domaine (Duperie - Niv 5)'] },
      { level: 6, features: ['Canalisation Divine: Manteau d\'ombre'] },
      { level: 7, features: ['Sorts de domaine (Duperie - Niv 7)'] },
      { level: 8, features: ['Frappe furtive'] },
      { level: 9, features: ['Sorts de domaine (Duperie - Niv 9)'] },
      { level: 17, features: ['Duperie améliorée'] }
    ]
  },

  // Sous-classes d'Ensorceleur
  {
    id: 'lignee-draconique',
    name: 'Lignée Draconique',
    className: 'sorcier',
    source: 'Manuel des Joueurs',
    description: 'Votre magie innée provient de la magie draconique qui coule dans vos veines.',
    primaryAbility: 'Résistance et puissance élémentaire',
    bonusSpells: ['Bouclier', 'Faux-semblant', 'Suggestion', 'Vol'],
    features: ['Ancêtre dragon', 'Résistance draconique', 'Affinité élémentaire'],
    level1Features: ['Ancêtre dragon', 'Résistance draconique'],
    levelProgression: [
      { level: 1, features: ['Ancêtre draconique', 'Résistance draconique'] },
      { level: 6, features: ['Affinité élémentaire'] },
      { level: 14, features: ['Ailes draconiques'] },
      { level: 18, features: ['Présence draconique'] }
    ]
  },
  {
    id: 'magie-sauvage',
    name: 'Magie Sauvage',
    className: 'sorcier',
    source: 'Manuel des Joueurs',
    description: 'Votre magie innée provient des forces chaotiques du chaos lui-même.',
    primaryAbility: 'Effets magiques imprévisibles',
    bonusSpells: ['Détection de la magie', 'Lueurs féeriques', 'Flou', 'Lévitation'],
    features: ['Poussée de magie sauvage', 'Marées de chaos', 'Résistance au chaos'],
    level1Features: ['Poussée de magie sauvage', 'Marées de chaos'],
    levelProgression: [
      { level: 1, features: ['Poussée de magie sauvage', 'Marées de chaos'] },
      { level: 6, features: ['Chance surnaturelle'] },
      { level: 14, features: ['Chaos contrôlé'] },
      { level: 18, features: ['Bombardement de sorts'] }
    ]
  },

  // Sous-classes d'Occultiste
  {
    id: 'grand-ancien',
    name: 'Le Grand Ancien',
    className: 'occultiste',
    source: 'Manuel des Joueurs',
    description: 'Votre patron est une entité mystérieuse dont la nature est étrangère au tissu de la réalité.',
    primaryAbility: 'Télépathie et contrôle mental',
    bonusSpells: ['Dissonance mentale', 'Sommeil', 'Détection des pensées', 'Suggestion'],
    features: ['Télépathie', 'Sorts étendus', 'Protection mentale psychique'],
    level1Features: ['Sorts étendus', 'Télépathie'],
    levelProgression: [
      { level: 1, features: ['Télépathie', 'Sorts étendus (Grand Ancien - Niv 1)'] },
      { level: 3, features: ['Sorts étendus (Grand Ancien - Niv 3)'] },
      { level: 5, features: ['Sorts étendus (Grand Ancien - Niv 5)'] },
      { level: 6, features: ['Protection psychique'] },
      { level: 7, features: ['Sorts étendus (Grand Ancien - Niv 7)'] },
      { level: 9, features: ['Sorts étendus (Grand Ancien - Niv 9)'] },
      { level: 10, features: ['Résistance psychique'] },
      { level: 14, features: ['Créer un serviteur'] }
    ]
  },
  {
    id: 'archifee',
    name: 'L\'Archifée',
    className: 'occultiste',
    source: 'Manuel des Joueurs',
    description: 'Votre patron est un seigneur ou une dame des fées, une créature de légende.',
    primaryAbility: 'Enchantements et illusions féeriques',
    bonusSpells: ['Lueurs féeriques', 'Sommeil', 'Apaisement des émotions', 'Suggestion'],
    features: ['Présence féerique', 'Sorts étendus', 'Fuite brumeuse'],
    level1Features: ['Présence féerique', 'Sorts étendus'],
    levelProgression: [
      { level: 1, features: ['Présence féerique', 'Sorts étendus (Archifée - Niv 1)'] },
      { level: 3, features: ['Sorts étendus (Archifée - Niv 3)'] },
      { level: 5, features: ['Sorts étendus (Archifée - Niv 5)'] },
      { level: 6, features: ['Fuite brumeuse'] },
      { level: 7, features: ['Sorts étendus (Archifée - Niv 7)'] },
      { level: 9, features: ['Sorts étendus (Archifée - Niv 9)'] },
      { level: 10, features: ['Défenses de charme'] },
      { level: 14, features: ['Délire ensorcelant'] }
    ]
  },
  {
    id: 'fiend',
    name: 'Le Fiélon',
    className: 'occultiste',
    source: 'Manuel des Joueurs',
    description: 'Vous avez conclu un pacte avec un fiélon des plans inférieurs.',
    primaryAbility: 'Feu infernal et résistance démoniaque',
    bonusSpells: ['Mains brûlantes', 'Injonction', 'Cécité/Surdité', 'Suggestion'],
    features: ['Bénédiction du Ténébreux', 'Sorts étendus', 'Résistance du fiélon'],
    level1Features: ['Bénédiction du Ténébreux', 'Sorts étendus'],
    levelProgression: [
      { level: 1, features: ['Bénédiction du Ténébreux', 'Sorts étendus (Fiélon - Niv 1)'] },
      { level: 3, features: ['Sorts étendus (Fiélon - Niv 3)'] },
      { level: 5, features: ['Sorts étendus (Fiélon - Niv 5)'] },
      { level: 6, features: ['Résistance du fiélon'] },
      { level: 7, features: ['Sorts étendus (Fiélon - Niv 7)'] },
      { level: 9, features: ['Sorts étendus (Fiélon - Niv 9)'] },
      { level: 10, features: ['Résistance fiélonne'] },
      { level: 14, features: ['Traverser les Enfers'] }
    ]
  },
]

// Fonction utilitaire pour obtenir les sous-classes d'une classe
export function getSubclassesByClassName(className: string): SubclassData[] {
  return subclasses.filter(sc => sc.className === className)
}

// Fonction utilitaire pour obtenir une sous-classe par son ID
export function getSubclassById(id: string): SubclassData | undefined {
  return subclasses.find(sc => sc.id === id)
}

// Fonction utilitaire pour obtenir l'emoji d'une sous-classe
export function getSubclassEmoji(subclassId: string): string {
  const emojis: Record<string, string> = {
    // Clerc
    'domaine-guerre': '⚔️',
    'domaine-vie': '💚',
    'domaine-lumiere': '☀️',
    'domaine-nature': '🌿',
    'domaine-duperie': '🎭',
    
    // Ensorceleur
    'lignee-draconique': '🐉',
    'magie-sauvage': '⚡',
    'ame-divine': '👼',
    
    // Occultiste
    'grand-ancien': '👁️',
    'archifee': '🧚',
    'fiend': '😈',
    'lame-maudite': '🗡️'
  }
  return emojis[subclassId] || '🔮'
}
