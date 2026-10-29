// Recherche globale dans les données de jeu (/api/srd/:edition/search)
import { buildApiUrl } from '@/utils/api'
import { EDITION } from '@/utils/dataLoader'

export type SearchKind =
  | 'spell' | 'monster' | 'magic-item' | 'equipment' | 'class' | 'subclass' | 'race' | 'subrace'
  | 'feat' | 'background' | 'condition' | 'rule' | 'guide'

export interface SearchResult {
  kind: SearchKind
  index: string
  name: string
  // Nom trouvé dans une autre langue (« Fireball » pour « Boule de feu »)
  matched: string | null
  detail: string | null
  // Texte montré dans la recherche pour ce qui n'a pas de page à soi
  text: string | null
  score: number
}

export async function searchSrd(query: string, signal?: AbortSignal): Promise<SearchResult[]> {
  const response = await fetch(buildApiUrl(`srd/${EDITION}/search?q=${encodeURIComponent(query)}&lang=fr`), { signal })
  if (!response.ok) throw new Error(`Erreur ${response.status} sur la recherche`)
  return response.json()
}
