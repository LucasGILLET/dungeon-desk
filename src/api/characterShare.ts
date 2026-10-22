// Partage d'un personnage par lien : le propriétaire crée ou retire le lien,
// toute personne qui l'a lit la fiche, un utilisateur connecté peut la copier.
import type { SavedCharacter } from '@/types/character'
import { authenticatedFetch, buildApiUrl } from '@/utils/api'

async function json<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || `Erreur ${response.status}`)
  return data as T
}

export const shareCharacter = async (id: number, share: boolean) =>
  json<{ shareCode: string | null }>(await authenticatedFetch(buildApiUrl(`characters/${id}/share`), { method: share ? 'POST' : 'DELETE' }))

// Sans connexion ; null si le lien n'existe pas ou plus
export async function fetchSharedCharacter(code: string): Promise<SavedCharacter | null> {
  const response = await fetch(buildApiUrl(`characters/shared/${encodeURIComponent(code)}?lang=fr`))
  if (response.status === 404) return null
  return json<SavedCharacter>(response)
}

export const copySharedCharacter = async (code: string) =>
  json<{ id: number }>(await authenticatedFetch(buildApiUrl(`characters/shared/${encodeURIComponent(code)}/copy`), { method: 'POST' }))

export const characterShareUrl = (code: string) => `${window.location.origin}/shared/${code}`
