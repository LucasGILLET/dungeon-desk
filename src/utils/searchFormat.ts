// Libellés et destinations des résultats de la recherche globale
import type { RouteLocationRaw } from 'vue-router'
import type { SearchKind, SearchResult } from '@/api/search'
import type { MagicItemRarity } from '@/utils/dataLoader'
import { formatChallenge, RARITY_LABELS } from '@/utils/monsterFormat'

export const KIND_LABELS: Record<SearchKind, string> = {
  spell: 'Sorts', monster: 'Monstres', 'magic-item': 'Objets magiques', equipment: 'Équipement',
  class: 'Classes', subclass: 'Sous-classes', race: 'Races', subrace: 'Sous-races', feat: 'Dons',
  background: 'Historiques', condition: 'États', rule: 'Règles', guide: 'Guide de Dungeon Desk',
}

export function resultDetail(r: SearchResult): string | null {
  if (r.detail === null) return null
  switch (r.kind) {
    case 'spell': return r.detail === '0' ? 'Tour de magie' : `Niveau ${r.detail}`
    case 'monster': return `FP ${formatChallenge(Number(r.detail))}`
    case 'magic-item': return RARITY_LABELS[r.detail as MagicItemRarity] ?? r.detail
    default: return r.detail
  }
}

// Page de la fiche ; null : le texte s'affiche dans la recherche
export function resultLink(r: SearchResult): RouteLocationRaw | null {
  switch (r.kind) {
    case 'spell': return `/sort/${r.index}`
    case 'monster': return `/bestiary/${r.index}`
    case 'magic-item': return `/magic-items/${r.index}`
    case 'rule': return { name: 'rules', query: { section: r.index } }
    case 'guide': return { name: 'documentation', query: { section: r.index } }
    default: return null
  }
}

// Groupes par type, dans l'ordre de leur meilleur résultat
export function groupResults(results: SearchResult[]): { kind: SearchKind; label: string; results: SearchResult[] }[] {
  const groups = new Map<SearchKind, SearchResult[]>()
  for (const r of results) groups.set(r.kind, [...(groups.get(r.kind) ?? []), r])
  return [...groups].map(([kind, rs]) => ({ kind, label: KIND_LABELS[kind], results: rs }))
}
