// Données des sous-races D&D 5e
export interface Subrace {
  id: string
  name: string
  description: string
  abilityBonuses: Record<string, number>
  size: string
  speed: string
  vision: string[]
  languages: string[]
  traits: string[]
  parentRace: string
}

export const subraces: Subrace[] = [
  // Sous-races humaines
  {
    id: 'humain-standard',
    name: 'Humain',
    description: 'Équilibré et polyvalent, bon dans tous les domaines.',
    abilityBonuses: { 'Force': 1, 'Dextérité': 1, 'Constitution': 1, 'Intelligence': 1, 'Sagesse': 1, 'Charisme': 1 },
    size: 'M',
    speed: '9 m/round',
    vision: ['Vision normale'],
    languages: ['Commun', 'Une langue de votre choix'],
    traits: [],
    parentRace: 'humain'
  },
  {
    id: 'humain-variant',
    name: 'Humain (don)',
    description: 'Plus spécialisé avec un don gratuit au niveau 1. Choisissez deux caractéristiques différentes pour un bonus de +1 chacune.',
    abilityBonuses: { },
    size: 'M',
    speed: '9 m/round',
    vision: ['Vision normale'],
    languages: ['Commun', 'Une langue de votre choix'],
    traits: ['Don gratuit', 'Compétence supplémentaire', '+1 à deux caractéristiques au choix'],
    parentRace: 'humain'
  },
  
  // Sous-races elfiques
  {
    id: 'haut-elfe',
    name: 'Haut-elfe',
    description: 'Maîtres de la magie arcane et des traditions anciennes.',
    abilityBonuses: { 'Dextérité': 2, 'Intelligence': 1 },
    size: 'M',
    speed: '9 m/round',
    vision: ['Vision dans le noir (18 m)'],
    languages: ['Commun', 'Elfique', 'Une langue de votre choix'],
    traits: ['Sens aiguisés', 'Ascendance féerique', 'Transe', 'Entraînement aux armes elfiques', 'Sort mineur'],
    parentRace: 'elfe'
  },
  {
    id: 'elfe-des-bois',
    name: 'Elfe des bois',
    description: 'Gardiens de la nature, experts en survie et discrétion.',
    abilityBonuses: { 'Dextérité': 2, 'Sagesse': 1 },
    size: 'M',
    speed: '10.5 m/round',
    vision: ['Vision dans le noir (18 m)'],
    languages: ['Commun', 'Elfique'],
    traits: ['Sens aiguisés', 'Ascendance féerique', 'Transe', 'Entraînement aux armes elfiques', 'Camouflage naturel'],
    parentRace: 'elfe'
  },
  {
    id: 'elfe-noir',
    name: 'Elfe noir',
    description: 'Elfes des ténèbres, maîtres de la magie noire.',
    abilityBonuses: { 'Dextérité': 2, 'Charisme': 1 },
    size: 'M',
    speed: '9 m/round',
    vision: ['Vision dans le noir supérieure (36 m)'],
    languages: ['Commun', 'Elfique'],
    traits: ['Sens aiguisés', 'Ascendance féerique', 'Transe', 'Sensibilité au soleil', 'Magie drow', 'Entraînement aux armes drow'],
    parentRace: 'elfe'
  },
  
  // Sous-races naines
  {
    id: 'nain-des-collines',
    name: 'Nain des collines',
    description: 'Plus sages et résistants, avec une intuition naturelle.',
    abilityBonuses: { 'Constitution': 2, 'Sagesse': 1 },
    size: 'M',
    speed: '7.5 m/round',
    vision: ['Vision dans le noir (18 m)'],
    languages: ['Commun', 'Nain'],
    traits: ['Résistance naine', 'Entraînement aux armes naines', 'Connaissance de la pierre', 'Maîtrise des outils', 'Ténacité naine'],
    parentRace: 'nain'
  },
  {
    id: 'nain-des-montagnes',
    name: 'Nain des montagnes',
    description: 'Guerriers robustes, maîtres de l\'armure et du combat.',
    abilityBonuses: { 'Constitution': 2, 'Force': 2 },
    size: 'M',
    speed: '7.5 m/round',
    vision: ['Vision dans le noir (18 m)'],
    languages: ['Commun', 'Nain'],
    traits: ['Résistance naine', 'Entraînement aux armes naines', 'Connaissance de la pierre', 'Maîtrise des outils', 'Maîtrise des armures légères et moyennes'],
    parentRace: 'nain'
  },
  
  // Sous-races halfelins
  {
    id: 'halfelin-pied-leger',
    name: 'Halfelin pied-léger',
    description: 'Discrets et agiles, excellents pour l\'infiltration.',
    abilityBonuses: { 'Dextérité': 2, 'Charisme': 1 },
    size: 'P',
    speed: '7.5 m/round',
    vision: ['Vision normale'],
    languages: ['Commun', 'Halfelin'],
    traits: ['Chance halfeline', 'Bravoure', 'Agilité halfeline', 'Discrétion naturelle'],
    parentRace: 'halfelin'
  },
  {
    id: 'halfelin-robuste',
    name: 'Halfelin robuste',
    description: 'Plus résistants aux éléments et aux poisons.',
    abilityBonuses: { 'Dextérité': 2, 'Constitution': 1 },
    size: 'P',
    speed: '7.5 m/round',
    vision: ['Vision normale'],
    languages: ['Commun', 'Halfelin'],
    traits: ['Chance halfeline', 'Bravoure', 'Agilité halfeline', 'Résistance des robustes'],
    parentRace: 'halfelin'
  },
  
  // Sous-races gnomes
  {
    id: 'gnome-des-forets',
    name: 'Gnome des forêts',
    description: 'Petits mais ingénieux, dotés de magie naturelle.',
    abilityBonuses: { 'Intelligence': 2, 'Dextérité': 1 },
    size: 'P',
    speed: '7.5 m/round',
    vision: ['Vision dans le noir (18 m)'],
    languages: ['Commun', 'Gnome'],
    traits: ['Ruse gnome', 'Communication avec les petits animaux', 'Illusionniste-né'],
    parentRace: 'gnome'
  },
  {
    id: 'gnome-des-roches',
    name: 'Gnome des roches',
    description: 'Inventeurs et mécaniciens, maîtres de la technologie.',
    abilityBonuses: { 'Intelligence': 2, 'Constitution': 1 },
    size: 'P',
    speed: '7.5 m/round',
    vision: ['Vision dans le noir (18 m)'],
    languages: ['Commun', 'Gnome'],
    traits: ['Ruse gnome', 'Connaissance en ingénierie', 'Bricoleur'],
    parentRace: 'gnome'
  },
  
  // Autres races (une seule sous-race chacune)
  {
    id: 'drakeide-standard',
    name: 'Drakéide',
    description: 'Descendants des dragons, fiers et puissants.',
    abilityBonuses: { 'Force': 2, 'Charisme': 1 },
    size: 'M',
    speed: '9 m/round',
    vision: ['Vision normale'],
    languages: ['Commun', 'Draconique'],
    traits: ['Ascendance draconique'],
    parentRace: 'drakéide'
  },
  {
    id: 'demi-elfe-standard',
    name: 'Demi-elfe',
    description: 'Héritiers de deux mondes, adaptables et charismatiques.',
    abilityBonuses: { 'Charisme': 2 },
    size: 'M',
    speed: '9 m/round',
    vision: ['Vision dans le noir (18 m)'],
    languages: ['Commun', 'Elfique', 'Une langue de votre choix'],
    traits: ['Ascendance féerique', 'Polyvalence'],
    parentRace: 'demi-elfe'
  },
  {
    id: 'demi-orc-standard',
    name: 'Demi-orc',
    description: 'Puissants guerriers avec une rage intérieure.',
    abilityBonuses: { 'Force': 2, 'Constitution': 1 },
    size: 'M',
    speed: '9 m/round',
    vision: ['Vision dans le noir (18 m)'],
    languages: ['Commun', 'Orc'],
    traits: ['Menaçant', 'Endurance implacable', 'Attaques sauvages'],
    parentRace: 'demi-orc'
  },
  {
    id: 'tieffelin-standard',
    name: 'Tieffelin',
    description: 'Marqués par l\'héritage infernal, mais non maléfiques.',
    abilityBonuses: { 'Charisme': 2, 'Intelligence': 1 },
    size: 'M',
    speed: '9 m/round',
    vision: ['Vision dans le noir (18 m)'],
    languages: ['Commun', 'Infernal'],
    traits: ['Résistance infernale', 'Ascendance infernale'],
    parentRace: 'tieffelin'
  }
]

// Fonctions utilitaires
export function getSubraceById(id: string): Subrace | undefined {
  return subraces.find(s => s.id === id)
}

export function getSubracesByParentRace(parentRaceId: string): Subrace[] {
  return subraces.filter(s => s.parentRace === parentRaceId)
}

export function getAllSubraces(): Subrace[] {
  return subraces
}

// Fonction pour obtenir l'emoji d'une sous-race selon son parent
export function getSubraceEmoji(parentRace: string): string {
  const emojiMap: Record<string, string> = {
    'humain': '👤',
    'elfe': '🧝',
    'nain': '⚔️',
    'halfelin': '🌱',
    'gnome': '🔮',
    'drakéide': '🐲',
    'demi-elfe': '✨',
    'demi-orc': '💪',
    'tieffelin': '😈'
  }
  return emojiMap[parentRace] || '❓'
}
