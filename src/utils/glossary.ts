// Mots-clés des règles repérés dans les textes (sorts, monstres, objets) et
// expliqués dans une infobulle, à la manière de Baldur's Gate 3 : états du SRD
// (chargés depuis l'API) et termes de règles courants.

export interface GlossaryEntry {
  key: string
  title: string
  category: 'État' | 'Règle'
  text: string
  // Formes reconnues dans le texte (sans groupe capturant), insensibles à la casse
  pattern: string
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
  const regex = sorted.length
    ? new RegExp(`(?<![\\p{L}\\d])(?:${sorted.map((e) => `(${e.pattern})`).join('|')})(?![\\p{L}\\d])`, 'giu')
    : null
  return (text: string): KeywordSegment[] => {
    if (!regex || !text) return [{ text }]
    const segments: KeywordSegment[] = []
    let last = 0
    for (const m of text.matchAll(regex)) {
      const entry = sorted[m.slice(1).findIndex((g) => g !== undefined)]
      if (m.index > last) segments.push({ text: text.slice(last, m.index) })
      segments.push({ text: m[0], entry })
      last = m.index + m[0].length
    }
    if (last < text.length) segments.push({ text: text.slice(last) })
    return segments
  }
}
