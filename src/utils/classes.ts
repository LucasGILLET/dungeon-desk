// Données des classes D&D 5e
import { loadClasses } from './dataLoader'
import type { SRDClass } from '@/types/srd'
export interface ClassData {
  id: string
  name: string
  description: string
  hitDie: number
  primaryAbility: string[]
  savingThrows: string[]
  skillChoices: number
  availableSkills: string[]
  equipment: string[]
  spellcaster: boolean
  needsLevel1Subclass: boolean
}

export const classes: ClassData[] = [
  {
    id: 'guerrier',
    name: 'Guerrier',
    description: 'Un maître du combat martial, habile avec une variété d\'armes et d\'armures.',
    hitDie: 10,
    primaryAbility: ['Force', 'Dextérité'],
    savingThrows: ['Force', 'Constitution'],
    skillChoices: 2,
    availableSkills: ['Acrobaties', 'Dressage', 'Histoire', 'Intimidation', 'Perception', 'Survie'],
    equipment: ['Armure de mailles', 'Épée longue', 'Bouclier'],
    spellcaster: false,
    needsLevel1Subclass: false
  },
  {
    id: 'roublard',
    name: 'Roublard',
    description: 'Un spécialiste des compétences, de la discrétion et des attaques sournoises.',
    hitDie: 8,
    primaryAbility: ['Dextérité'],
    savingThrows: ['Dextérité', 'Intelligence'],
    skillChoices: 4,
    availableSkills: ['Acrobaties', 'Athlétisme', 'Discrétion', 'Escamotage', 'Intimidation', 'Investigation', 'Perception', 'Persuasion', 'Perspicacité', 'Représentation', 'Supercherie', 'Tromperie'],
    equipment: ['Armure de cuir', 'Épée courte', 'Outils de voleur'],
    spellcaster: false,
    needsLevel1Subclass: false
  },
  {
    id: 'rodeur',
    name: 'Rôdeur',
    description: 'Un guerrier des étendues sauvages, expert en pistage et en survie.',
    hitDie: 10,
    primaryAbility: ['Dextérité', 'Sagesse'],
    savingThrows: ['Force', 'Dextérité'],
    skillChoices: 3,
    availableSkills: ['Dressage', 'Discrétion', 'Investigation', 'Nature', 'Perception', 'Survie'],
    equipment: ['Armure d\'écailles', 'Épée courte', 'Arc long'],
    spellcaster: true,
    needsLevel1Subclass: false
  },
  {
    id: 'paladin',
    name: 'Paladin',
    description: 'Un guerrier saint, lié par un serment sacré de combattre le mal.',
    hitDie: 10,
    primaryAbility: ['Force', 'Charisme'],
    savingThrows: ['Sagesse', 'Charisme'],
    skillChoices: 2,
    availableSkills: ['Athlétisme', 'Intimidation', 'Médecine', 'Perspicacité', 'Persuasion', 'Religion'],
    equipment: ['Armure de mailles', 'Épée longue', 'Bouclier', 'Symbole sacré'],
    spellcaster: true,
    needsLevel1Subclass: false
  },
  {
    id: 'barbare',
    name: 'Barbare',
    description: 'Un guerrier primitif alimenté par une rage intérieure féroce.',
    hitDie: 12,
    primaryAbility: ['Force'],
    savingThrows: ['Force', 'Constitution'],
    skillChoices: 2,
    availableSkills: ['Dressage', 'Athlétisme', 'Intimidation', 'Nature', 'Perception', 'Survie'],
    equipment: ['Hache à deux mains', 'Javelines', 'Équipement d\'explorateur'],
    spellcaster: false,
    needsLevel1Subclass: false
  },
  {
    id: 'moine',
    name: 'Moine',
    description: 'Un maître des arts martiaux, canalisant le pouvoir du ki.',
    hitDie: 8,
    primaryAbility: ['Dextérité', 'Sagesse'],
    savingThrows: ['Force', 'Dextérité'],
    skillChoices: 2,
    availableSkills: ['Acrobaties', 'Athlétisme', 'Histoire', 'Perspicacité', 'Religion', 'Discrétion'],
    equipment: ['Épée courte', 'Fléchettes', 'Équipement d\'explorateur'],
    spellcaster: false,
    needsLevel1Subclass: false
  },
  {
    id: 'magicien',
    name: 'Magicien',
    description: 'Un lanceur de sorts érudit avec un grimoire plein de sorts arcaniques.',
    hitDie: 6,
    primaryAbility: ['Intelligence'],
    savingThrows: ['Intelligence', 'Sagesse'],
    skillChoices: 2,
    availableSkills: ['Arcane', 'Histoire', 'Perspicacité', 'Investigation', 'Médecine', 'Religion'],
    equipment: ['Bâton', 'Grimoire', 'Composantes de sorts'],
    spellcaster: true,
    needsLevel1Subclass: false
  },
  {
    id: 'clerc',
    name: 'Clerc',
    description: 'Un intermédiaire divin, canalisant la magie divine pour guérir et bénir.',
    hitDie: 8,
    primaryAbility: ['Sagesse'],
    savingThrows: ['Sagesse', 'Charisme'],
    skillChoices: 2,
    availableSkills: ['Histoire', 'Médecine', 'Perspicacité', 'Persuasion', 'Religion'],
    equipment: ['Armure d\'écailles', 'Bouclier', 'Symbole sacré', 'Masse d\'armes'],
    spellcaster: true,
    needsLevel1Subclass: true
  },
  {
    id: 'barde',
    name: 'Barde',
    description: 'Un maître de la chanson, de la parole et de la magie qu\'ils contiennent.',
    hitDie: 8,
    primaryAbility: ['Charisme'],
    savingThrows: ['Dextérité', 'Charisme'],
    skillChoices: 3,
    availableSkills: ['Arcane', 'Athlétisme', 'Discrétion', 'Dressage', 'Escamotage', 'Histoire', 'Investigation', 'Médecine', 'Nature', 'Perception', 'Représentation', 'Persuasion', 'Perspicacité', 'Religion', 'Supercherie', 'Survie', 'Tromperie'],
    equipment: ['Armure de cuir', 'Rapière', 'Instrument de musique'],
    spellcaster: true,
    needsLevel1Subclass: false
  },
  {
    id: 'sorcier',
    name: 'Ensorceleur',
    description: 'Un lanceur de sorts doté de magie innée alimentée par une source intérieure.',
    hitDie: 6,
    primaryAbility: ['Charisme'],
    savingThrows: ['Constitution', 'Charisme'],
    skillChoices: 2,
    availableSkills: ['Arcane', 'Intimidation', 'Perspicacité', 'Persuasion', 'Religion', 'Tromperie'],
    equipment: ['Dague', 'Composantes de sorts', 'Équipement d\'explorateur'],
    spellcaster: true,
    needsLevel1Subclass: true
  },
  {
    id: 'occultiste',
    name: 'Occultiste',
    description: 'Un lanceur de sorts lié par un pacte avec un être extraplanaire.',
    hitDie: 8,
    primaryAbility: ['Charisme'],
    savingThrows: ['Sagesse', 'Charisme'],
    skillChoices: 2,
    availableSkills: ['Arcane', 'Histoire', 'Intimidation', 'Investigation', 'Nature', 'Religion'],
    equipment: ['Armure de cuir', 'Épée courte', 'Composantes de sorts'],
    spellcaster: true,
    needsLevel1Subclass: true
  },
  {
    id: 'druide',
    name: 'Druide',
    description: 'Un prêtre de la nature, maniant la magie élémentaire et se transformant.',
    hitDie: 8,
    primaryAbility: ['Sagesse'],
    savingThrows: ['Intelligence', 'Sagesse'],
    skillChoices: 2,
    availableSkills: ['Arcane', 'Dressage', 'Médecine', 'Nature', 'Perception', 'Religion', 'Survie'],
    equipment: ['Armure de cuir', 'Bouclier', 'Cimeterre', 'Équipement d\'explorateur'],
    spellcaster: true,
    needsLevel1Subclass: false
  }
]

// Fonction utilitaire pour obtenir une classe par son ID (utilise les données SRD)
export async function getClassById(id: string): Promise<SRDClass | undefined> {
  const srdClasses = await loadClasses()
  return srdClasses.find(c => c.index === id)
}

// Fonction utilitaire pour obtenir une classe par son nom (utilise les données SRD)
export async function getClassByName(name: string): Promise<SRDClass | undefined> {
  const srdClasses = await loadClasses()
  return srdClasses.find(c => c.name === name)
}

// Fonction pour obtenir les classes qui nécessitent une sous-classe au niveau 1 (utilise les données SRD)
export async function getLevel1SubclassClasses(): Promise<SRDClass[]> {
  const srdClasses = await loadClasses()
  const lvl1Classes = ["cleric", "sorcerer", "warlock"]
  return srdClasses.filter(c => lvl1Classes.includes(c.index))
}

// Fonction pour obtenir les IDs des classes qui nécessitent une sous-classe au niveau 1 (utilise les données SRD)
export async function getLevel1SubclassClassIds(): Promise<string[]> {
  const level1Classes = await getLevel1SubclassClasses()
  return level1Classes.map(c => c.index)
}

// Fonctions compatibilité avec l'ancien format (utilisent toujours la variable classes)
export function getClassByIdSync(id: string): ClassData | undefined {
  return classes.find(c => c.id === id)
}

export function getClassByNameSync(name: string): ClassData | undefined {
  return classes.find(c => c.name === name)
}

export function getLevel1SubclassClassesSync(): ClassData[] {
  return classes.filter(c => c.needsLevel1Subclass)
}

export function getLevel1SubclassClassIdsSync(): string[] {
  return getLevel1SubclassClassesSync().map(c => c.id)
}

// Fonctions utilitaires pour travailler avec les données SRD

// Convertit une classe SRD vers le format ClassData (pour compatibilité)
export function convertSRDClassToClassData(srdClass: SRDClass): ClassData {
  return {
    id: srdClass.index,
    name: srdClass.name,
    description: getClassDescription(srdClass),
    hitDie: srdClass.hit_die,
    primaryAbility: getClassPrimaryAbilities(srdClass),
    savingThrows: srdClass.saving_throws.map(st => st.name),
    skillChoices: getSkillChoicesCount(srdClass),
    availableSkills: getAvailableSkills(srdClass),
    equipment: getStartingEquipment(srdClass),
    spellcaster: isSpellcaster(srdClass),
    needsLevel1Subclass: hasLevel1Subclass(srdClass)
  }
}

// Obtient la description d'une classe SRD
export function getClassDescription(srdClass: SRDClass): string {
  const descriptions: Record<string, string> = {
    'barbarian': 'Combattant sauvage utilisant la rage comme arme.',
    'bard': 'Artiste magique, soutien polyvalent du groupe.',
    'cleric': 'Guérisseur divin, soutien et protection du groupe.',
    'druid': 'Gardien de la nature, magie et métamorphose.',
    'fighter': 'Maître des armes et de l\'armure, spécialiste du combat.',
    'monk': 'Artiste martial utilisant l\'énergie interne.',
    'paladin': 'Guerrier saint, alliant combat et magie divine.',
    'ranger': 'Chasseur expert, à l\'aise en nature et à distance.',
    'rogue': 'Expert en discrétion, crochetage et attaques sournoises.',
    'sorcerer': 'Magie innée puissante mais limitée en sorts.',
    'warlock': 'Pacte avec des entités d\'outre-monde pour la magie.',
    'wizard': 'Manipulateur de la magie arcane, puissant mais fragile.'
  }
  return descriptions[srdClass.index] || `Classe ${srdClass.name} de D&D 5e.`
}

// Obtient les statistiques principales d'une classe SRD
export function getClassPrimaryAbilities(srdClass: SRDClass): string[] {
  const statsMap: Record<string, string[]> = {
    'barbarian': ['Force', 'Constitution'],
    'bard': ['Charisme', 'Dextérité'],
    'cleric': ['Sagesse', 'Constitution'],
    'druid': ['Sagesse', 'Constitution'],
    'fighter': ['Force', 'Constitution'],
    'monk': ['Dextérité', 'Sagesse'],
    'paladin': ['Force', 'Charisme'],
    'ranger': ['Dextérité', 'Sagesse'],
    'rogue': ['Dextérité', 'Intelligence'],
    'sorcerer': ['Charisme', 'Constitution'],
    'warlock': ['Charisme', 'Constitution'],
    'wizard': ['Intelligence', 'Constitution']
  }
  return statsMap[srdClass.index] || ['Force']
}

// Obtient le nombre de choix de compétences pour une classe SRD
export function getSkillChoicesCount(srdClass: SRDClass): number {
  const skillChoice = srdClass.proficiency_choices.find(choice => 
    choice.type === 'proficiencies' && choice.from?.option_set_type === 'options_array'
  )
  return skillChoice?.choose || 0
}

// Obtient les compétences disponibles pour une classe SRD
export function getAvailableSkills(srdClass: SRDClass): string[] {
  const skillChoice = srdClass.proficiency_choices.find(choice => 
    choice.type === 'proficiencies' && choice.from?.option_set_type === 'options_array'
  )
  if (!skillChoice?.from?.options) return []
  
  return skillChoice.from.options
    .map(option => option.item?.name)
    .filter(name => name && name.includes('Skill:'))
    .map(name => name.replace('Skill: ', ''))
}

// Obtient l'équipement de départ pour une classe SRD
export function getStartingEquipment(srdClass: SRDClass): string[] {
  return srdClass.starting_equipment?.map(item => 
    `${item.equipment.name}${item.quantity > 1 ? ` (x${item.quantity})` : ''}`
  ) || []
}

// Vérifie si une classe SRD est un lanceur de sorts
export function isSpellcaster(srdClass: SRDClass): boolean {
  const spellcasters = ['bard', 'cleric', 'druid', 'sorcerer', 'warlock', 'wizard', 'paladin', 'ranger']
  return spellcasters.includes(srdClass.index)
}

// Vérifie si une classe SRD nécessite une sous-classe au niveau 1
export function hasLevel1Subclass(srdClass: SRDClass): boolean {
  const level1SubclassClasses = ['cleric', 'sorcerer', 'warlock']
  return level1SubclassClasses.includes(srdClass.index)
}
