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
  character: CampaignCharacter | null
}
export interface CampaignCharacter { id: number; name: string; level: number | null; race: string | null; classes: { name: string | null; level: number }[] }
export interface CampaignSession {
  id: number
  number: number
  playedOn: string | null
  title: string | null
  summary: string | null
  gmNotes: string | null
  // PNJ de la campagne rencontrés (id de CampaignNpc, MJ seulement)
  campaignNpcIds: number[]
}
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
  // PNJ de la campagne mêlés à la quête (MJ seulement)
  campaignNpcIds: number[]
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
  monsters: { index: string; name: string; count: number; xp: number; challengeRating: number; homebrew?: boolean }[]
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
  // Personnages joués par le MJ lui-même, membres du groupe
  gmCharacters: CampaignCharacter[]
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
export interface SessionInput { number?: number; playedOn?: string | null; title?: string | null; summary?: string | null; gmNotes?: string | null; campaignNpcIds?: number[] }
export interface QuestInput {
  title: string
  description?: string | null
  status?: QuestStatus
  difficulty?: QuestDifficulty | null
  reward?: string | null
  giverNpcId?: number | null
  revealed?: boolean
  campaignNpcIds?: number[]
}
export interface CampaignNpcInput { npcId: number; role?: string | null; location?: string | null; notes?: string | null }
export interface EncounterInput {
  name: string
  description?: string | null
  status?: 'PLANNED' | 'DONE'
  sessionId?: number | null
  monsters: { monster: string; count: number }[]
}

// --- Gestionnaire de combat ------------------------------------------------------

export type CombatantKind = 'CHARACTER' | 'MONSTER' | 'OTHER'
export interface Combatant {
  id?: number
  kind: CombatantKind
  character: { id: number; name: string } | null
  monster: { index: string; name: string; homebrew: boolean } | null
  name: string
  initiative: number | null
  initiativeBonus: number
  armorClass: number | null
  maxHitPoints: number | null
  hitPoints: number | null
  tempHitPoints: number
  // Personnage : PV reçus du serveur (ceux de sa fiche), renvoyés tels quels pour
  // que seuls les PV changés dans le combat soient reportés sur la fiche
  syncedHitPoints?: number | null
  syncedTempHitPoints?: number | null
  conditions: string[]
  note: string | null
  hidden: boolean
}
export interface Combat {
  id: number
  name: string
  encounterId: number | null
  round: number
  turn: number
  finished: boolean
  shareCode: string | null
  updatedAt: string
  combatants: Combatant[]
}
export interface CombatSummary { id: number; name: string; round: number; finished: boolean; encounterId: number | null; updatedAt: string; combatantCount: number }

// État envoyé à l'API : liens par id de personnage et index de monstre
export const combatState = (c: Combat) => ({
  name: c.name, round: c.round, turn: c.turn, finished: c.finished,
  combatants: c.combatants.map((x) => ({
    kind: x.kind, characterId: x.character?.id ?? null, monster: x.monster?.index ?? null, name: x.name,
    initiative: x.initiative, initiativeBonus: x.initiativeBonus, armorClass: x.armorClass, maxHitPoints: x.maxHitPoints,
    hitPoints: x.hitPoints, tempHitPoints: x.tempHitPoints, conditions: x.conditions, note: x.note, hidden: x.hidden,
    ...(x.character ? { syncedHitPoints: x.syncedHitPoints, syncedTempHitPoints: x.syncedTempHitPoints } : {}),
  })),
})

// Vue censurée des joueurs (publique, par le lien du MJ)
export type HealthLabel = 'UNHURT' | 'HURT' | 'BLOODIED' | 'DOWN'
export interface CombatView {
  name: string
  campaign: string
  round: number
  finished: boolean
  currentId: number | null
  combatants: { id: number; name: string; kind: CombatantKind; initiative: number | null; conditions: string[]; hitPoints: number | null; maxHitPoints: number | null; tempHitPoints: number | null; health: HealthLabel | null }[]
  updatedAt: string
}
export const HEALTH_LABELS: Record<HealthLabel, string> = { UNHURT: 'Indemne', HURT: 'Blessé', BLOODIED: 'En sang', DOWN: 'Hors de combat' }

export async function fetchCombatView(code: string): Promise<CombatView | null> {
  const response = await fetch(buildApiUrl(`combat-view/${encodeURIComponent(code)}`))
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`Erreur ${response.status}`)
  return response.json()
}
export const combatViewUrl = (code: string) => `${window.location.origin}/combat/${code}`

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
  addGmCharacter: (id: number, characterId: number) => call<{ campaignId: number }>(`/${id}/gm-characters`, { method: 'POST', body: { characterId } }),
  removeGmCharacter: (id: number, characterId: number) => call<{ message: string }>(`/${id}/gm-characters/${characterId}`, { method: 'DELETE' }),
  combats: (id: number) => call<CombatSummary[]>(`/${id}/combats`),
  combat: (id: number, combatId: number) => call<Combat>(`/${id}/combats/${combatId}?lang=fr`),
  startCombat: (id: number, body: { encounterId?: number | null; name?: string }) => call<{ id: number }>(`/${id}/combats?lang=fr`, { method: 'POST', body }),
  saveCombat: (id: number, combat: Combat) => call<Combat>(`/${id}/combats/${combat.id}?lang=fr`, { method: 'PUT', body: combatState(combat) }),
  removeCombat: (id: number, combatId: number) => call<{ message: string }>(`/${id}/combats/${combatId}`, { method: 'DELETE' }),
  shareCombat: (id: number, combatId: number, share: boolean) =>
    call<{ shareCode: string | null }>(`/${id}/combats/${combatId}/share`, { method: share ? 'POST' : 'DELETE' }),
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
// « Thorek, Lia » : noms des PNJ de la campagne liés à une séance ou une quête
export const campaignNpcNames = (campaign: Campaign, ids: number[]) =>
  campaign.npcs.filter((n) => ids.includes(n.id)).map((n) => n.name).join(', ')

export const QUEST_STATUS_LABELS: Record<QuestStatus, string> = { ACTIVE: 'En cours', COMPLETED: 'Réussie', FAILED: 'Échouée', PAUSED: 'En pause' }
export const QUEST_DIFFICULTY_LABELS: Record<QuestDifficulty, string> = { EASY: 'Facile', MEDIUM: 'Moyenne', HARD: 'Difficile', DEADLY: 'Mortelle' }
export const ENCOUNTER_DIFFICULTY_LABELS: Record<EncounterDifficulty, string> = {
  TRIVIAL: 'Triviale', EASY: 'Facile', MEDIUM: 'Moyenne', HARD: 'Difficile', DEADLY: 'Mortelle',
}
