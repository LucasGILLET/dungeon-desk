// Mots-clés des règles repérés dans les textes (sorts, monstres, objets) et
// expliqués dans une infobulle, à la manière de Baldur's Gate 3 : états du SRD
// (chargés depuis l'API) et termes de règles courants.

export interface GlossaryEntry {
  key: string
  title: string
  category: 'État' | 'Règle' | 'Caractéristique'
  text: string
  // Formes reconnues dans le texte (sans groupe capturant), insensibles à la casse…
  pattern: string
  // …sauf pour les mots courants qui ne sont un terme qu'écrits ainsi (« Force », « DD », « CA »)
  caseSensitive?: boolean
}

const APOS = "['’]"

export const RULE_TERMS: GlossaryEntry[] = [
  { key: 'advantage', title: 'Avantage', category: 'Règle', pattern: 'avantages?',
    text: 'Lancez deux d20 et gardez le meilleur résultat. Avantage et désavantage s’annulent, quel que soit leur nombre.' },
  { key: 'disadvantage', title: 'Désavantage', category: 'Règle', pattern: 'désavantages?',
    text: 'Lancez deux d20 et gardez le plus faible résultat. Avantage et désavantage s’annulent, quel que soit leur nombre.' },
  { key: 'saving-throw', title: 'Jet de sauvegarde', category: 'Règle', pattern: 'jets? de sauvegarde',
    text: 'Pour résister à un sort, un piège ou un poison : d20 + modificateur de la caractéristique demandée (+ bonus de maîtrise si vous maîtrisez cette sauvegarde). Réussi si le total atteint le DD de l’effet.' },
  { key: 'bonus-action', title: 'Action bonus', category: 'Règle', pattern: 'actions? bonus',
    text: 'Action rapide, possible seulement quand une capacité, un sort ou un objet le permet. Une seule par tour.' },
  { key: 'reaction', title: 'Réaction', category: 'Règle', pattern: 'réactions?',
    text: 'Réponse instantanée à un déclencheur, pendant votre tour ou celui d’un autre. Une seule par round, récupérée au début de votre tour.' },
  { key: 'concentration', title: 'Concentration', category: 'Règle', pattern: 'concentration',
    text: 'Un seul sort de concentration à la fois. Subir des dégâts impose un jet de sauvegarde de Constitution (DD 10 ou la moitié des dégâts, le plus élevé) pour le maintenir ; être neutralisé ou mourir y met fin.' },
  { key: 'opportunity-attack', title: 'Attaque d’opportunité', category: 'Règle', pattern: `attaques? d${APOS}opportunité`,
    text: 'Quand une créature hostile que vous voyez sort de votre allonge, vous pouvez utiliser votre réaction pour lui porter une attaque au corps à corps.' },
  { key: 'resistance', title: 'Résistance', category: 'Règle', pattern: 'résistances?',
    text: 'Les dégâts du type concerné sont réduits de moitié.' },
  { key: 'vulnerability', title: 'Vulnérabilité', category: 'Règle', pattern: 'vulnérabilités?',
    text: 'Les dégâts du type concerné sont doublés.' },
  { key: 'temporary-hit-points', title: 'Points de vie temporaires', category: 'Règle', pattern: 'points? de vie temporaires',
    text: 'Réserve qui encaisse les dégâts avant vos points de vie. Ils ne se cumulent pas (gardez la plus grande valeur) et ne se soignent pas.' },
  { key: 'cover', title: 'Abri', category: 'Règle', pattern: 'abris? (?:partiels?|supérieurs?|total|totaux)',
    text: 'Abri partiel : +2 à la CA et aux jets de sauvegarde de Dextérité. Abri supérieur : +5. Abri total : impossible d’être ciblé directement.' },
  { key: 'difficult-terrain', title: 'Terrain difficile', category: 'Règle', pattern: 'terrains? difficiles?',
    text: 'Chaque mètre parcouru coûte un mètre de déplacement supplémentaire.' },
  { key: 'difficulty-class', title: 'Degré de difficulté (DD)', category: 'Règle', pattern: 'DD', caseSensitive: true,
    text: 'Valeur à atteindre pour réussir un jet de caractéristique ou de sauvegarde. Pour un sort : 8 + bonus de maîtrise + modificateur de la caractéristique d’incantation.' },
  { key: 'armor-class', title: 'Classe d’armure (CA)', category: 'Règle', pattern: `classes? d${APOS}armure`,
    text: 'Valeur qu’un jet d’attaque doit atteindre pour vous toucher. Sans armure : 10 + modificateur de Dextérité.' },
  { key: 'armor-class-abbr', title: 'Classe d’armure (CA)', category: 'Règle', pattern: 'CA', caseSensitive: true,
    text: 'Valeur qu’un jet d’attaque doit atteindre pour vous toucher. Sans armure : 10 + modificateur de Dextérité.' },
  { key: 'attack-roll', title: 'Jet d’attaque', category: 'Règle', pattern: `jets? d${APOS}attaque`,
    text: 'd20 + modificateur de caractéristique (Force au corps à corps, Dextérité à distance) + bonus de maîtrise si vous maîtrisez l’arme ou pour un sort. Touche si le total atteint la CA de la cible ; un 20 naturel touche toujours (coup critique), un 1 rate toujours.' },
  { key: 'damage-roll', title: 'Jet de dégâts', category: 'Règle', pattern: 'jets? de dégâts',
    text: 'Dés de l’arme ou du sort, + modificateur de caractéristique pour une arme. Sur un coup critique, lancez deux fois les dés de dégâts.' },
  { key: 'reach', title: 'Allonge', category: 'Règle', pattern: 'allonges?',
    text: 'Distance à laquelle vous attaquez au corps à corps : 1,50 m en général, 3 m avec une arme à allonge.' },
  { key: 'short-rest', title: 'Repos court', category: 'Règle', pattern: 'repos courts?',
    text: 'Pause d’au moins 1 heure. Vous pouvez dépenser des dés de vie : chacun rend 1 dé + modificateur de Constitution points de vie.' },
  { key: 'long-rest', title: 'Repos long', category: 'Règle', pattern: 'repos longs?',
    text: 'Au moins 8 heures, dont 6 de sommeil, une fois par 24 heures. Vous récupérez tous vos points de vie et la moitié de vos dés de vie (au moins 1).' },
  // Caractéristiques : avec leur majuscule seulement (« la force du courant » n'en est pas une)
  { key: 'str', title: 'Force', category: 'Caractéristique', pattern: 'Force', caseSensitive: true,
    text: 'Puissance physique. Sert aux attaques et aux dégâts au corps à corps, à l’Athlétisme et à porter des charges.' },
  { key: 'dex', title: 'Dextérité', category: 'Caractéristique', pattern: 'Dextérité', caseSensitive: true,
    text: 'Agilité et réflexes. Sert à la CA, à l’initiative, aux attaques à distance et avec les armes de finesse, aux Acrobaties, à la Discrétion et à l’Escamotage.' },
  { key: 'con', title: 'Constitution', category: 'Caractéristique', pattern: 'Constitution', caseSensitive: true,
    text: 'Santé et endurance. Son modificateur s’ajoute aux points de vie à chaque niveau ; elle sert à maintenir la concentration.' },
  { key: 'int', title: 'Intelligence', category: 'Caractéristique', pattern: 'Intelligence', caseSensitive: true,
    text: 'Raisonnement et mémoire. Sert aux Arcanes, à l’Histoire, à l’Investigation, à la Nature et à la Religion ; caractéristique d’incantation du magicien.' },
  { key: 'wis', title: 'Sagesse', category: 'Caractéristique', pattern: 'Sagesse', caseSensitive: true,
    text: 'Perception et intuition. Sert à la Perception, à la Perspicacité, à la Médecine, à la Survie et au Dressage ; caractéristique d’incantation du clerc, du druide et du rôdeur.' },
  { key: 'cha', title: 'Charisme', category: 'Caractéristique', pattern: 'Charisme', caseSensitive: true,
    text: 'Force de personnalité. Sert à la Persuasion, à la Tromperie, à l’Intimidation et à la Représentation ; caractéristique d’incantation du barde, de l’ensorceleur, de l’occultiste et du paladin.' },
]

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// « Aveuglé » → aveuglé, aveuglée, aveuglés, aveuglées
function conditionPattern(index: string, name: string): string {
  const base = name.toLowerCase()
  const forms = [base.endsWith('é') ? `${escape(base)}e?s?` : `${escape(base)}s?`]
  // Le SRD français écrit « incapable d’agir » dans les autres états
  if (index === 'incapacitated') forms.push(`incapables? d${APOS}agir`)
  return forms.join('|')
}

export function conditionEntries(conditions: { index: string; name: string; description: string }[]): GlossaryEntry[] {
  return conditions.map((c) => ({ key: `condition-${c.index}`, title: c.name, category: 'État', text: c.description, pattern: conditionPattern(c.index, c.name) }))
}

export type KeywordSegment = { text: string; entry?: GlossaryEntry }

// Une seule expression pour tous les mots-clés, les plus longs d'abord
export function keywordMatcher(entries: GlossaryEntry[]) {
  const sorted = [...entries].sort((a, b) => b.pattern.length - a.pattern.length)
  const exact = new Map(sorted.filter((e) => e.caseSensitive).map((e) => [e, new RegExp(`^(?:${e.pattern})$`, 'u')]))
  const regex = sorted.length
    ? new RegExp(`(?<![\\p{L}\\d])(?:${sorted.map((e) => `(${e.pattern})`).join('|')})(?![\\p{L}\\d])`, 'giu')
    : null
  return (text: string): KeywordSegment[] => {
    if (!regex || !text) return [{ text }]
    const segments: KeywordSegment[] = []
    let last = 0
    for (const m of text.matchAll(regex)) {
      const entry = sorted[m.slice(1).findIndex((g) => g !== undefined)]!
      if (exact.has(entry) && !exact.get(entry)!.test(m[0])) continue
      if (m.index > last) segments.push({ text: text.slice(last, m.index) })
      segments.push({ text: m[0], entry })
      last = m.index + m[0].length
    }
    if (last < text.length) segments.push({ text: text.slice(last) })
    return segments
  }
}
