import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useQueryClient } from '@tanstack/vue-query'
import {
  getGetCharactersQueryKey,
  useCreateCharacter,
  useUpdateCharacter,
} from '@/api/generated/endpoints'
import type { SRDRace, SRDClass } from '@/types/srd'
import {
  mapApiCharacterToCharacter,
  toCharacterCreateInput,
  type ApiCharacterModel,
  type Character,
} from '@/types/character'

export interface Campaign {
  id: string
  name: string
  description: string
  theme: string
  players: string[]
  gmId: string
  sessions: number
  createdAt: Date
  updatedAt: Date
}

export interface NPC {
  id: string
  firstName: string
  lastName: string
  race: SRDRace
  class?: SRDClass | null
  gender: string
  age: number
  ageCategory: string
  height: string
  weight: string
  bodyType: string
  profession: string
  socialStatus: string
  relations: string
  history: string
  stats: {
    FOR: number
    DEX: number
    CON: number
    INT: number
    SAG: number
    CHA: number
  }
  alignment: string
  personality: string
  motivation: string
  quirk: string
  location?: string
  campaignId?: string
  createdAt: Date
}

export interface Quest {
  id: string
  title: string
  description: string
  status: 'active' | 'completed' | 'failed' | 'paused'
  campaignId: string
  reward?: string
  difficulty: 'easy' | 'medium' | 'hard' | 'deadly'
  createdAt: Date
  updatedAt: Date
}

const router = useRouter()
export const useAppStore = defineStore('app', () => {
  const queryClient = useQueryClient()
  const createCharacterMutation = useCreateCharacter()
  const updateCharacterMutation = useUpdateCharacter()

  // État utilisateur
  const user = ref<{ id: string; name: string; email: string; role: 'player' | 'gm' } | null>(null)
  const isAuthenticated = ref(false)

  // État des personnages
  const characters = ref<Character[]>([])
  const currentCharacter = ref<Character | null>(null)

  // État des campagnes (pour les MJ)
  const campaigns = ref<Campaign[]>([])
  const currentCampaign = ref<Campaign | null>(null)

  // État des PNJ
  const npcs = ref<NPC[]>([])

  // État des quêtes
  const quests = ref<Quest[]>([])

  // Actions pour les personnages
  const createCharacter = async (character: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await createCharacterMutation.mutateAsync({
        data: toCharacterCreateInput(character as Character),
      });
      const newCharacter = mapApiCharacterToCharacter(response.data as ApiCharacterModel)

      characters.value.push(newCharacter)
      currentCharacter.value = newCharacter
      await queryClient.invalidateQueries({ queryKey: getGetCharactersQueryKey() })
      return newCharacter;
    } catch (error) {
      console.error("Error saving character:", error);
      // Fallback local only if offline or error? Or allow failure in UI
      // For now, let's keep the local adding as fallback or just re-throw
      // But preserving specific ID behavior is hard.
      // Let's just alert the user in the view if this fails.
      throw error;
    }
  }

  const updateCharacter = async (id: string | number, updates: Partial<Character>) => {
    try {
      const response = await updateCharacterMutation.mutateAsync({
        id: String(id),
        data: toCharacterCreateInput(updates as Character),
      });

      const updatedChar = mapApiCharacterToCharacter(response.data as ApiCharacterModel)

      const index = characters.value.findIndex(c => c.id == id)
      if (index !== -1) {
        characters.value[index] = updatedChar
        if (currentCharacter.value?.id == id) {
          currentCharacter.value = updatedChar
        }
      }
      await queryClient.invalidateQueries({ queryKey: getGetCharactersQueryKey() })
      return updatedChar;
    } catch (error) {
      console.error("Error updating character:", error);
      throw error;
    }
  }

  // Actions pour les campagnes
  const createCampaign = (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCampaign: Campaign = {
      ...campaign,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    campaigns.value.push(newCampaign)
    currentCampaign.value = newCampaign
    return newCampaign
  }

  // Actions pour les PNJ
  const saveNPC = (npc: Omit<NPC, 'id' | 'createdAt'>) => {
    const newNPC: NPC = {
      ...npc,
      id: crypto.randomUUID(),
      createdAt: new Date()
    }
    npcs.value.push(newNPC)
    return newNPC
  }

  const deleteNPC = (id: string) => {
    const index = npcs.value.findIndex(n => n.id === id)
    if (index !== -1) {
      npcs.value.splice(index, 1)
    }
  }

  // Actions pour les quêtes
  const createQuest = (quest: Omit<Quest, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newQuest: Quest = {
      ...quest,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    quests.value.push(newQuest)
    return newQuest
  }

  // Actions d'authentification
  const login = (userData: { id: string; name: string; email: string; role: 'player' | 'gm' }) => {
    user.value = userData
    isAuthenticated.value = true
    // Mock persistence
    localStorage.setItem('user', JSON.stringify(userData))
  }
  
  const register = (userData: { name: string; email: string; password: string }) => {
    // Mock registration - in a real app, this would be an API call
    const newUser = {
      id: crypto.randomUUID(),
      name: userData.name,
      email: userData.email,
      role: 'player' as const
    }
    login(newUser)
    return newUser
  }

  const logout = () => {
    user.value = null
    isAuthenticated.value = false
    currentCharacter.value = null
    currentCampaign.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    if (router) router.push('/login')
  }

  const getCharactersByUser = (userId: string) => {
    return characters.value.filter(c => c.createdAt && c.createdAt.toString().includes(userId)) // Mock filter, replace with actual userId field in character
  }
  
  // Initialize from local storage
  const initAuth = () => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
        user.value = JSON.parse(savedUser)
        isAuthenticated.value = true
    }
  }


  const getCampaignsByGM = (gmId: string) => {
    return campaigns.value.filter(c => c.gmId === gmId)
  }

  const getNPCsByCampaign = (campaignId: string) => {
    return npcs.value.filter(n => n.campaignId === campaignId)
  }

  const getQuestsByCampaign = (campaignId: string) => {
    return quests.value.filter(q => q.campaignId === campaignId)
  }

  return {
    // État
    user,
    isAuthenticated,
    characters,
    currentCharacter,
    campaigns,
    currentCampaign,
    npcs,
    quests,
    
    // Actions
    createCharacter,
    updateCharacter,
    createCampaign,
    saveNPC,
    deleteNPC,
    register,
    createQuest,
    login,
    logout,
    
    // Getters
    getCharactersByUser,
    getCampaignsByGM,
    getNPCsByCampaign,
    getQuestsByCampaign
  }
})
