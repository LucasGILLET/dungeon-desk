// Campagnes du MJ et des joueurs (/api/campaigns), appelées avec le jeton de
// l'utilisateur connecté.
import { authenticatedFetch, buildApiUrl } from '@/utils/api'

export type CampaignRole = 'GM' | 'PLAYER'
export type CampaignStatus = 'PREPARATION' | 'ACTIVE' | 'PAUSED' | 'FINISHED'
export type QuestStatus = 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'PAUSED'
export type QuestDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'DEADLY'
export type EncounterDifficulty = 'TRIVIAL' | 'EASY' | 'MEDIUM' | 'HARD' | 'DEADLY'

export interface CampaignSummary {
  id: number
  name: string
  theme: string | null
  status: CampaignStatus
  role: CampaignRole
  gm: string
  memberCount: number
  sessionCount: number
  // Personnage joué par l'utilisateur (joueur seulement)
  myCharacter: { id: number; name: string } | null
  updatedAt: string
}

export interface CampaignMember {
  userId: number
  name: string
  isMe: boolean
  joinedAt: string
  character: { id: number; name: string; level: number | null; race: string | null; classes: { name: string | null; level: number }[] } | null
}
export interface CampaignSession { id: number; number: number; playedOn: string | null; title: string | null; summary: string | null; gmNotes: string | null }
export interface Quest {
  id: number
  position: number
  title: string
  description: string | null
  status: QuestStatus
  difficulty: QuestDifficulty | null
  reward: string | null
  revealed: boolean
  giver: { id: number; name: string } | null
}
export interface CampaignNpc {
  id: number
  npcId: number
  name: string
  profession: string | null
  race: string | null
  class: string | null
  role: string | null
  location: string | null
  notes: string | null
}
export interface Encounter {
  id: number
  position: number
  name: string
  description: string | null
  status: 'PLANNED' | 'DONE'
  sessionId: number | null
  monsters: { index: string; name: string; count: number; xp: number; challengeRating: number }[]
  evaluation: {
    totalXp: number
    adjustedXp: number
    multiplier: number
    thresholds: { easy: number; medium: number; hard: number; deadly: number } | null
    difficulty: EncounterDifficulty | null
  }
}

export interface Campaign {
  id: number
  edition: string
  name: string
  description: string | null
  theme: string | null
  status: CampaignStatus
  role: CampaignRole
  gm: { id: number; name: string }
  inviteCode: string | null // MJ seulement
  members: CampaignMember[]
  partyLevels: number[]
  sessions: CampaignSession[]
  quests: Quest[]
  npcs: CampaignNpc[]
  encounters: Encounter[]
}

export interface CampaignInvite {
  campaignId: number
  name: string
  theme: string | null
  gm: string
  memberCount: number
  isGm: boolean
  alreadyMember: boolean
}

export interface CampaignInput { name: string; description?: string | null; theme?: string | null; status?: CampaignStatus }
export interface SessionInput { number?: number; playedOn?: string | null; title?: string | null; summary?: string | null; gmNotes?: string | null }
export interface QuestInput {
  title: string
  description?: string | null
  status?: QuestStatus
  difficulty?: QuestDifficulty | null
  reward?: string | null
  giverNpcId?: number | null
  revealed?: boolean
}
export interface CampaignNpcInput { npcId: number; role?: string | null; location?: string | null; notes?: string | null }
export interface EncounterInput {
  name: string
  description?: string | null
  status?: 'PLANNED' | 'DONE'
  sessionId?: number | null
  monsters: { monster: string; count: number }[]
}

export type CampaignCollection = 'sessions' | 'quests' | 'npcs' | 'encounters'

// Erreur de l'API avec ses messages de validation
export class CampaignApiError extends Error {
  constructor(message: string, readonly status: number, readonly errors: { path: string; message: string }[] = []) {
    super(message)
  }
}

async function call<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const response = await authenticatedFetch(buildApiUrl(`campaigns${path}`), {
    method: options.method ?? 'GET',
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const errors = (data.errors ?? []) as { path: string; message: string }[]
    throw new CampaignApiError(errors.map((e) => e.message).join(', ') || data.message || `Erreur ${response.status}`, response.status, errors)
  }
  return data as T
}

export const campaignsApi = {
  list: () => call<CampaignSummary[]>(''),
  get: (id: number) => call<Campaign>(`/${id}?lang=fr`),
  create: (input: CampaignInput) => call<{ id: number }>('', { method: 'POST', body: input }),
  update: (id: number, input: CampaignInput) => call<{ id: number }>(`/${id}`, { method: 'PUT', body: input }),
  remove: (id: number) => call<{ message: string }>(`/${id}`, { method: 'DELETE' }),
  regenerateInvite: (id: number) => call<{ inviteCode: string }>(`/${id}/invite`, { method: 'POST' }),
  invite: (code: string) => call<CampaignInvite>(`/invite/${encodeURIComponent(code)}`),
  join: (code: string, characterId: number | null) => call<{ campaignId: number }>(`/invite/${encodeURIComponent(code)}/join`, { method: 'POST', body: { characterId } }),
  setCharacter: (id: number, characterId: number | null) => call<{ campaignId: number }>(`/${id}/membership`, { method: 'PUT', body: { characterId } }),
  removeMember: (id: number, userId: number) => call<{ message: string }>(`/${id}/members/${userId}`, { method: 'DELETE' }),
  // Séances, quêtes, PNJ, rencontres : création si childId absent, sinon modification
  save: (id: number, collection: CampaignCollection, body: SessionInput | QuestInput | CampaignNpcInput | EncounterInput, childId?: number) =>
    call<{ id: number }>(`/${id}/${collection}${childId ? `/${childId}` : ''}`, { method: childId ? 'PUT' : 'POST', body }),
  removeItem: (id: number, collection: CampaignCollection, childId: number) =>
    call<{ message: string }>(`/${id}/${collection}/${childId}`, { method: 'DELETE' }),
}

// Lien d'invitation à partager
export const inviteUrl = (code: string) => `${window.location.origin}/campaigns/join/${code}`

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  PREPARATION: 'En préparation', ACTIVE: 'En cours', PAUSED: 'En pause', FINISHED: 'Terminée',
}
export const QUEST_STATUS_LABELS: Record<QuestStatus, string> = { ACTIVE: 'En cours', COMPLETED: 'Réussie', FAILED: 'Échouée', PAUSED: 'En pause' }
export const QUEST_DIFFICULTY_LABELS: Record<QuestDifficulty, string> = { EASY: 'Facile', MEDIUM: 'Moyenne', HARD: 'Difficile', DEADLY: 'Mortelle' }
export const ENCOUNTER_DIFFICULTY_LABELS: Record<EncounterDifficulty, string> = {
  TRIVIAL: 'Triviale', EASY: 'Facile', MEDIUM: 'Moyenne', HARD: 'Difficile', DEADLY: 'Mortelle',
}
