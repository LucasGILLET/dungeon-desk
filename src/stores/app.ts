import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { SRDRace, SRDClass } from '@/types/srd'

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
  // État utilisateur
  const user = ref<{ id: string; name: string; email: string; role: 'player' | 'gm' } | null>(null)
  const isAuthenticated = ref(false)

  // État des campagnes (pour les MJ)
  const campaigns = ref<Campaign[]>([])
  const currentCampaign = ref<Campaign | null>(null)

  // État des PNJ
  const npcs = ref<NPC[]>([])

  // État des quêtes
  const quests = ref<Quest[]>([])

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
    currentCampaign.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    if (router) router.push('/login')
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
    campaigns,
    currentCampaign,
    npcs,
    quests,
    
    // Actions
    createCampaign,
    saveNPC,
    deleteNPC,
    register,
    createQuest,
    login,
    logout,
    
    // Getters
    getCampaignsByGM,
    getNPCsByCampaign,
    getQuestsByCampaign
  }
})
