// Données des classes D&D 5e
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

// Fonction utilitaire pour obtenir une classe par son ID
export function getClassById(id: string): ClassData | undefined {
  return classes.find(c => c.id === id)
}

// Fonction utilitaire pour obtenir une classe par son nom
export function getClassByName(name: string): ClassData | undefined {
  return classes.find(c => c.name === name)
}

// Fonction pour obtenir les classes qui nécessitent une sous-classe au niveau 1
export function getLevel1SubclassClasses(): ClassData[] {
  return classes.filter(c => c.needsLevel1Subclass)
}

// Fonction pour obtenir les IDs des classes qui nécessitent une sous-classe au niveau 1
export function getLevel1SubclassClassIds(): string[] {
  return getLevel1SubclassClasses().map(c => c.id)
}
