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
