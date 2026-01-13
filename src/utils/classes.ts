import { loadClasses } from './dataLoader'
import type { SRDClass } from '@/types/srd'

export async function getLevel1SubclassClasses(): Promise<SRDClass[]> {
  const srdClasses = await loadClasses()
  const lvl1Classes = ["cleric", "sorcerer", "warlock"]
  return srdClasses.filter(c => lvl1Classes.includes(c.index))
}

export async function getLevel1SubclassClassIds(): Promise<string[]> {
  const level1Classes = await getLevel1SubclassClasses()
  return level1Classes.map(c => c.index)
}

export function getClassDifficulty(cls: SRDClass): 'Facile' | 'Moyen' | 'Difficile' {
  const easyClasses = ['barbarian', 'fighter']
  const hardClasses = ['wizard', 'druid', 'sorcerer']
  
  if (easyClasses.includes(cls.index)) return 'Facile'
  if (hardClasses.includes(cls.index)) return 'Difficile'
  return 'Moyen'
}

export function getClassDescription(cls: SRDClass): string {
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
  return descriptions[cls.index] || 'Classe de personnage D&D 5e.'
}

export function getClassMainStats(cls: SRDClass): string[] {
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
  return statsMap[cls.index] || ['Force']
}

export function isMartialClass(classIndex: string): boolean {
  return ['barbarian', 'fighter', 'monk', 'paladin', 'ranger', 'rogue'].includes(classIndex)
}