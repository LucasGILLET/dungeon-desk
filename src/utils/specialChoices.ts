// Gestion des choix spéciaux de classe/sous-classe D&D 5e

export interface SpecialChoice {
  id: string
  name: string
  description: string
  category: 'draconic-ancestry' | 'fighting-style' | 'favored-enemy' | 'natural-explorer' | 'expertise'
  options?: SpecialChoiceOption[]
}

export interface SpecialChoiceOption {
  id: string
  name: string
  description: string
  effect?: string
}

export interface SpecialChoiceData {
  choices: SpecialChoice[]
}

// Ascendances draconiques pour l'ensorceleur lignée draconique
export const draconicAncestries: SpecialChoiceOption[] = [
  {
    id: 'dragon-noir',
    name: 'Dragon Noir',
    description: 'Dragon des marais et des lacs acides',
    effect: 'Type de dégâts : Acide'
  },
  {
    id: 'dragon-bleu',
    name: 'Dragon Bleu', 
    description: 'Dragon des déserts et des orages',
    effect: 'Type de dégâts : Foudre'
  },
  {
    id: 'dragon-dairain',
    name: 'Dragon d\'Airain',
    description: 'Dragon des déserts et des terres arides',
    effect: 'Type de dégâts : Feu'
  },
  {
    id: 'dragon-bronze',
    name: 'Dragon de Bronze',
    description: 'Dragon des côtes et des îles',
    effect: 'Type de dégâts : Foudre'
  },
  {
    id: 'dragon-cuivre',
    name: 'Dragon de Cuivre',
    description: 'Dragon des collines et des montagnes',
    effect: 'Type de dégâts : Acide'
  },
  {
    id: 'dragon-or',
    name: 'Dragon d\'Or',
    description: 'Dragon des plaines et des prairies',
    effect: 'Type de dégâts : Feu'
  },
  {
    id: 'dragon-vert',
    name: 'Dragon Vert',
    description: 'Dragon des forêts et des jungles',
    effect: 'Type de dégâts : Poison'
  },
  {
    id: 'dragon-rouge',
    name: 'Dragon Rouge',
    description: 'Dragon des montagnes et des volcans',
    effect: 'Type de dégâts : Feu'
  },
  {
    id: 'dragon-argent',
    name: 'Dragon d\'Argent',
    description: 'Dragon des nuages et des hauts plateaux',
    effect: 'Type de dégâts : Froid'
  },
  {
    id: 'dragon-blanc',
    name: 'Dragon Blanc',
    description: 'Dragon des régions arctiques',
    effect: 'Type de dégâts : Froid'
  }
]

// Styles de combat pour guerrier
export const fightingStyles: SpecialChoiceOption[] = [
  {
    id: 'archerie',
    name: 'Archerie',
    description: 'Vous gagnez un bonus de +2 aux jets d\'attaque effectués avec des armes à distance.',
    effect: '+2 aux jets d\'attaque à distance'
  },
  {
    id: 'defense',
    name: 'Défense',
    description: 'Tant que vous portez une armure, vous gagnez un bonus de +1 à la CA.',
    effect: '+1 CA avec armure'
  },
  {
    id: 'duel',
    name: 'Duel',
    description: 'Quand vous maniez une arme de mêlée à une main sans autre arme, vous gagnez un bonus de +2 aux jets de dégâts.',
    effect: '+2 dégâts avec arme à une main seule'
  },
  {
    id: 'armes-a-deux-mains',
    name: 'Combat à deux armes',
    description: 'Quand vous combattez avec deux armes légères de mêlée, vous pouvez ajouter votre modificateur de caractéristique aux dégâts de la seconde attaque.',
    effect: 'Bonus de caractéristique à la deuxième arme'
  },
  {
    id: 'protection',
    name: 'Protection',
    description: 'Avec un bouclier, vous pouvez utiliser votre réaction pour imposer un désavantage à l\'attaque contre un allié adjacent.',
    effect: 'Réaction pour protéger un allié (bouclier requis)'
  },
  {
    id: 'armes-lourdes',
    name: 'Combat avec une arme à deux mains',
    description: 'Quand vous faites 1 ou 2 sur un dé de dégâts avec une arme de mêlée à deux mains, vous pouvez relancer le dé.',
    effect: 'Relance des 1 et 2 en dégâts (arme à deux mains)'
  }
]

// Ennemis jurés pour rôdeur
export const favoredEnemies: SpecialChoiceOption[] = [
  {
    id: 'betes',
    name: 'Bêtes',
    description: 'Animaux sauvages, monstres bestiaux',
    effect: 'Avantage sur les jets de Sagesse (Survie) pour les pister, et Intelligence pour se rappeler d\'informations les concernant'
  },
  {
    id: 'fee',
    name: 'Fées',
    description: 'Créatures du royaume féerique',
    effect: 'Avantage sur les jets de Sagesse (Survie) pour les pister, et Intelligence pour se rappeler d\'informations les concernant'
  },
  {
    id: 'humanoides',
    name: 'Humanoïdes',
    description: 'Humains, elfes, nains, orcs... (choisir 2 races spécifiques)',
    effect: 'Avantage sur les jets de Sagesse (Survie) pour les pister, et Intelligence pour se rappeler d\'informations les concernant'
  },
  {
    id: 'monstruosites',
    name: 'Monstruosités',
    description: 'Créatures magiques déformées',
    effect: 'Avantage sur les jets de Sagesse (Survie) pour les pister, et Intelligence pour se rappeler d\'informations les concernant'
  },
  {
    id: 'dragons',
    name: 'Dragons',
    description: 'Dragons vrais et créatures draconiques',
    effect: 'Avantage sur les jets de Sagesse (Survie) pour les pister, et Intelligence pour se rappeler d\'informations les concernant'
  },
  {
    id: 'elementaires',
    name: 'Élémentaires',
    description: 'Créatures des plans élémentaires',
    effect: 'Avantage sur les jets de Sagesse (Survie) pour les pister, et Intelligence pour se rappeler d\'informations les concernant'
  },
  {
    id: 'morts-vivants',
    name: 'Morts-vivants',
    description: 'Créatures animées par la magie nécromantique',
    effect: 'Avantage sur les jets de Sagesse (Survie) pour les pister, et Intelligence pour se rappeler d\'informations les concernant'
  },
  {
    id: 'fiends',
    name: 'Fiélons',
    description: 'Diables, démons et autres créatures infernales',
    effect: 'Avantage sur les jets de Sagesse (Survie) pour les pister, et Intelligence pour se rappeler d\'informations les concernant'
  }
]

// Environnements pour Explorateur-né
export const naturalExplorerEnvironments: SpecialChoiceOption[] = [
  {
    id: 'arctique',
    name: 'Arctique',
    description: 'Toundra gelée, glaciers, terres désolées froides',
    effect: 'Double bonus de maîtrise en Sagesse (Survie), déplacement furtif à vitesse normale, reste alerte aux dangers, peut se nourrir et trouver un abri'
  },
  {
    id: 'cote',
    name: 'Côte',
    description: 'Littoraux, îles, récifs, grottes marines',
    effect: 'Double bonus de maîtrise en Sagesse (Survie), déplacement furtif à vitesse normale, reste alerte aux dangers, peut se nourrir et trouver un abri'
  },
  {
    id: 'desert',
    name: 'Désert',
    description: 'Sables, badlands, terres désolées chaudes',
    effect: 'Double bonus de maîtrise en Sagesse (Survie), déplacement furtif à vitesse normale, reste alerte aux dangers, peut se nourrir et trouver un abri'
  },
  {
    id: 'foret',
    name: 'Forêt',
    description: 'Forêts tempérées et tropicales, vergers',
    effect: 'Double bonus de maîtrise en Sagesse (Survie), déplacement furtif à vitesse normale, reste alerte aux dangers, peut se nourrir et trouver un abri'
  },
  {
    id: 'marais',
    name: 'Marais',
    description: 'Marécages, tourbières, bayous',
    effect: 'Double bonus de maîtrise en Sagesse (Survie), déplacement furtif à vitesse normale, reste alerte aux dangers, peut se nourrir et trouver un abri'
  },
  {
    id: 'montagne',
    name: 'Montagne',
    description: 'Hautes terres, plateaux, pics, collines',
    effect: 'Double bonus de maîtrise en Sagesse (Survie), déplacement furtif à vitesse normale, reste alerte aux dangers, peut se nourrir et trouver un abri'
  },
  {
    id: 'plaine',
    name: 'Plaine',
    description: 'Prairies, steppes, terres agricoles',
    effect: 'Double bonus de maîtrise en Sagesse (Survie), déplacement furtif à vitesse normale, reste alerte aux dangers, peut se nourrir et trouver un abri'
  },
  {
    id: 'souterrain',
    name: 'Souterrain',
    description: 'Donjons, cavernes, Ombreterre',
    effect: 'Double bonus de maîtrise en Sagesse (Survie), déplacement furtif à vitesse normale, reste alerte aux dangers, peut se nourrir et trouver un abri'
  }
]

// Expertise pour roublard (choix de 2 compétences où ils ont la maîtrise)
export const expertiseSkills: SpecialChoiceOption[] = [
  { id: 'acrobaties', name: 'Acrobaties', description: 'Double votre bonus de maîtrise pour les jets d\'Acrobaties', effect: 'Double bonus de maîtrise' },
  { id: 'athletisme', name: 'Athlétisme', description: 'Double votre bonus de maîtrise pour les jets d\'Athlétisme', effect: 'Double bonus de maîtrise' },
  { id: 'discretion', name: 'Discrétion', description: 'Double votre bonus de maîtrise pour les jets de Discrétion', effect: 'Double bonus de maîtrise' },
  { id: 'escamotage', name: 'Escamotage', description: 'Double votre bonus de maîtrise pour les jets d\'Escamotage', effect: 'Double bonus de maîtrise' },
  { id: 'intimidation', name: 'Intimidation', description: 'Double votre bonus de maîtrise pour les jets d\'Intimidation', effect: 'Double bonus de maîtrise' },
  { id: 'investigation', name: 'Investigation', description: 'Double votre bonus de maîtrise pour les jets d\'Investigation', effect: 'Double bonus de maîtrise' },
  { id: 'perception', name: 'Perception', description: 'Double votre bonus de maîtrise pour les jets de Perception', effect: 'Double bonus de maîtrise' },
  { id: 'persuasion', name: 'Persuasion', description: 'Double votre bonus de maîtrise pour les jets de Persuasion', effect: 'Double bonus de maîtrise' },
  { id: 'perspicacite', name: 'Perspicacité', description: 'Double votre bonus de maîtrise pour les jets de Perspicacité', effect: 'Double bonus de maîtrise' },
  { id: 'representation', name: 'Représentation', description: 'Double votre bonus de maîtrise pour les jets de Représentation', effect: 'Double bonus de maîtrise' },
  { id: 'tromperie', name: 'Tromperie', description: 'Double votre bonus de maîtrise pour les jets de Tromperie', effect: 'Double bonus de maîtrise' },
  { id: 'outils-voleur', name: 'Outils de voleur', description: 'Double votre bonus de maîtrise avec les outils de voleur', effect: 'Double bonus de maîtrise' }
]

// Fonction pour obtenir les choix spéciaux nécessaires pour un personnage
export function getRequiredSpecialChoices(classId: string, subclassId?: string): SpecialChoiceData {
  const choices: SpecialChoice[] = []

  // Choix basés sur la classe
  if (classId === 'fighter') {
    choices.push({
      id: 'fighting-style',
      name: 'Style de combat',
      description: 'Choisissez votre style de combat préféré qui définira votre approche tactique.',
      category: 'fighting-style',
      options: fightingStyles
    })
  }

  if (classId === 'ranger') {
    choices.push({
      id: 'favored-enemy',
      name: 'Ennemi juré',
      description: 'Choisissez un type de créature que vous avez étudié et appris à traquer efficacement.',
      category: 'favored-enemy',
      options: favoredEnemies
    })
    
    choices.push({
      id: 'natural-explorer',
      name: 'Explorateur-né',
      description: 'Choisissez un environnement naturel où vous excellez et vous sentez chez vous.',
      category: 'natural-explorer',
      options: naturalExplorerEnvironments
    })
  }

  if (classId === 'rogue') {
    choices.push({
      id: 'expertise',
      name: 'Expertise',
      description: 'Choisissez deux compétences ou utilisations d\'outils avec lesquels vous doublez votre bonus de maîtrise.',
      category: 'expertise',
      options: expertiseSkills
    })
  }

  // Choix basés sur la sous-classe
  if (subclassId === 'draconic-ancestry' || subclassId === 'lignee-draconique') {
    choices.push({
      id: 'draconic-ancestry',
      name: 'Ascendance draconique',
      description: 'Choisissez le type de dragon dont vous descendez. Le type de dégâts associé au dragon sera utilisé pour des compétences aux plus hauts niveaux plus tard.',
      category: 'draconic-ancestry',
      options: draconicAncestries
    })
  }

  return { choices }
}

// Fonction pour vérifier si un personnage a besoin de choix spéciaux
export function needsSpecialChoices(classId: string, subclassId?: string): boolean {
  const requiredChoices = getRequiredSpecialChoices(classId, subclassId)
  return requiredChoices.choices.length > 0
}
