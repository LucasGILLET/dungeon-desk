// Profil de l'utilisateur connecté (/api/me) : pseudo affiché aux autres joueurs
import { authenticatedFetch, buildApiUrl } from '@/utils/api'

export interface Profile {
  id: number
  username: string | null
  email: string
  createdAt: string
}

export class ProfileApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
  }
}

async function call<T>(options: { method?: string; body?: unknown } = {}): Promise<T> {
  const response = await authenticatedFetch(buildApiUrl('me'), {
    method: options.method ?? 'GET',
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const errors = (data.errors ?? []) as { message: string }[]
    throw new ProfileApiError(errors.map((e) => e.message).join(', ') || data.message || `Erreur ${response.status}`, response.status)
  }
  return data as T
}

export const profileApi = {
  get: () => call<Profile>(),
  updateUsername: (username: string) => call<Profile>({ method: 'PATCH', body: { username } }),
}
