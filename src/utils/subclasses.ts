// Sous-classes lues depuis la fiche de classe de l'API (SRD et contenu maison
// confondus) et mises en forme pour l'étape « Sous-classe ».
import { loadApiClass, loadApiClasses, loadApiSpells } from './dataLoader'

export interface SubclassData {
  id: string
  index: string // index de la sous-classe en base (API)
  name: string
  className: string
  source: string
  description: string
  bonusSpells?: string[]
  levelProgression?: {
    level: number
    features?: string[]
  }[]
  // Textes de règle (bulles d'aide), par nom de capacité ou de sort
  descriptions?: Record<string, string>
}

const SOURCE_LABELS: Record<string, string> = { SRD: 'SRD', HOMEBREW: 'Contenu maison' }
// Libellé des sorts de sous-classe, par classe
const SPELL_LABELS: Record<string, string> = { cleric: 'Sorts de domaine', warlock: 'Sorts étendus', paladin: 'Sorts de serment', druid: 'Sorts de cercle' }

export async function loadSubclassesForClass(classIndex: string): Promise<SubclassData[]> {
  const cls = await loadApiClass(classIndex)
  if (!cls) return []
  const hasSpells = cls.subclasses.some((s) => s.spells.length)
  const spellTexts = hasSpells ? new Map((await loadApiSpells()).map((sp) => [sp.index, sp.description])) : new Map<string, string>()
  const spellLabel = SPELL_LABELS[cls.index] ?? 'Sorts de sous-classe'

  return cls.subclasses.map((sub) => {
    const descriptions: Record<string, string> = {}
    const byLevel = new Map<number, string[]>()
    const add = (level: number, name: string) => byLevel.set(level, [...(byLevel.get(level) ?? []), name])
    for (const f of cls.features.filter((f) => f.subclass === sub.index && !f.parent)) {
      add(f.level, f.name)
      descriptions[f.name] = f.description
    }
    // Sorts gagnés par niveau : « Sorts de domaine : Bénédiction, Soins »
    const spellLevels = [...new Set(sub.spells.map((sp) => sp.requiredClassLevel))]
    for (const level of spellLevels) {
      const spells = sub.spells.filter((sp) => sp.requiredClassLevel === level)
      const name = `${spellLabel} : ${spells.map((sp) => sp.name).join(', ')}`
      add(level, name)
      descriptions[name] = spells.map((sp) => `${sp.name} — ${(spellTexts.get(sp.index) ?? '').split('\n')[0]}`).join('\n')
    }
    for (const sp of sub.spells) descriptions[sp.name] = spellTexts.get(sp.index) ?? ''
    return {
      id: sub.index,
      index: sub.index,
      name: sub.name,
      className: cls.index,
      source: SOURCE_LABELS[sub.source] ?? sub.source,
      description: (sub.description ?? '').split('\n\n')[0] ?? '',
      bonusSpells: sub.spells.map((sp) => sp.name),
      levelProgression: [...byLevel.entries()].sort(([a], [b]) => a - b).map(([level, features]) => ({ level, features })),
      descriptions,
    }
  })
}

// Classes qui choisissent leur sous-classe dès le niveau 1 (clerc, ensorceleur, occultiste en 2014)
export async function getLevel1SubclassClassIds(): Promise<string[]> {
  return (await loadApiClasses()).filter((c) => c.subclassLevel === 1).map((c) => c.index)
}

export function getSubclassEmoji(subclassId: string): string {
  const emojis: Record<string, string> = {
    // Clerc
    war: '⚔️',
    life: '💚',
    light: '☀️',
    nature: '🌿',
    trickery: '🎭',
    // Ensorceleur
    draconic: '🐉',
    'wild-magic': '⚡',
    // Occultiste
    'great-old-one': '👁️',
    archfey: '🧚',
    fiend: '😈',
  }
  return emojis[subclassId] || '🔮'
}

export function translateSubclassName(subclassName: string): string {
  const translations: Record<string, string> = {
    // Barbarian
    'Berserker': 'Berserker',
    'Totem Warrior': 'Guerrier totémique',
    'Path of the Berserker': 'Voie du Berserker',
    'Path of the Totem Warrior': 'Voie du Guerrier totémique',
    
    // Bard
    'Lore': 'Savoir',
    'Valor': 'Vaillance',
    'College of Lore': 'Collège du Savoir',
    'College of Valor': 'Collège de la Vaillance',

    // Clerc
    'Life': 'Vie',
    'Life Domain': 'Domaine de la Vie',
    'Light': 'Lumière',
    'Light Domain': 'Domaine de la Lumière',
    'Nature': 'Nature',
    'Nature Domain': 'Domaine de la Nature',
    'Tempest': 'Tempête',
    'Tempest Domain': 'Domaine de la Tempête',
    'Trickery': 'Duperie',
    'Trickery Domain': 'Domaine de la Duperie',
    'War': 'Guerre',
    'War Domain': 'Domaine de la Guerre',
    'Knowledge': 'Savoir',
    'Knowledge Domain': 'Domaine du Savoir',

    // Druid
    'Land': 'Terre',
    'Circle of the Land': 'Cercle de la Terre',
    'Moon': 'Lune',
    'Circle of the Moon': 'Cercle de la Lune',

    // Fighter
    'Champion': 'Champion',
    'Battle Master': 'Maître de guerre',
    'Eldritch Knight': 'Chevalier occulte',
    'Martial Archetype: Champion': 'Archétype Martial : Champion',
    
    // Monk
    'Open Hand': 'Main ouverte',
    'Way of the Open Hand': 'Voie de la Main ouverte',
    'Shadow': 'Ombre',
    'Way of Shadow': 'Voie de l\'Ombre',
    'Four Elements': 'Quatre éléments',
    'Way of the Four Elements': 'Voie des Quatre éléments',

    // Paladin
    'Devotion': 'Dévotion',
    'Oath of Devotion': 'Serment de Dévotion',
    'Ancients': 'Anciens',
    'Oath of the Ancients': 'Serment des Anciens',
    'Vengeance': 'Vengeance',
    'Oath of Vengeance': 'Serment de Vengeance',

    // Ranger
    'Hunter': 'Chasseur',
    'Beast Master': 'Maître des bêtes',
    'Hunter Archetype': 'Archétype de Chasseur',

    // Rogue
    'Thief': 'Voleur',
    'Assassin': 'Assassin',
    'Arcane Trickster': 'Escroc arcanique',
    'Roguish Archetype: Thief': 'Archétype de Roublard : Voleur',

    // Sorcerer
    'Draconic': 'Lignée draconique',
    'Draconic Bloodline': 'Lignée draconique',
    'Wild Magic': 'Magie sauvage',

    // Warlock
    'Fiend': 'Fiélon',
    'The Fiend': 'Le Fiélon',
    'Archfey': 'Archifée',
    'The Archfey': 'L\'Archifée',
    'Great Old One': 'Grand Ancien',
    'The Great Old One': 'Le Grand Ancien',

    // Wizard
    'Abjuration': 'Abjuration',
    'School of Abjuration': 'École d\'Abjuration',
    'Conjuration': 'Invocation',
    'School of Conjuration': 'École d\'Invocation',
    'Divination': 'Divination',
    'School of Divination': 'École de Divination',
    'Enchantment': 'Enchantement',
    'School of Enchantment': 'École d\'Enchantement',
    'Evocation': 'Évocation',
    'School of Evocation': 'École d\'Évocation',
    'Illusion': 'Illusion',
    'School of Illusion': 'École d\'Illusion',
    'Necromancy': 'Nécromancie',
    'School of Necromancy': 'École de Nécromancie',
    'Transmutation': 'Transmutation',
    'School of Transmutation': 'École de Transmutation'
  }
  return translations[subclassName] || subclassName
}