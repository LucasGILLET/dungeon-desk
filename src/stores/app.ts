import type { SRDBackground, SRDClass, SRDRace, SRDSubclass } from '@/types/srd'
import type { Subrace } from '@/utils/subrace'
import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export interface Character {
  id?: string
  name: string
  race: SRDRace
  subrace: Subrace
  class: SRDClass
  subclass?: SRDSubclass
  level: number
  abilities: {
    force: number
    dexterite: number
    constitution: number
    intelligence: number
    sagesse: number
    charisme: number
  }
  // hitPoints: number
  // armorClass: number
  background: SRDBackground
  // equipment: string[]
  // spells: string[]
  proficiencies?: { // usefulleness ???
    skills: string[]
    languages: string[]
    tools: string[]
  }
  specialChoices?: Record<string, string[]>
  createdAt?: Date
  updatedAt?: Date
  allProficiencies?: {
    skills: { name: string; id: string; description: string; category: string }[]
    languages: { name: string; id: string; description: string; category: string }[]
    tools: { name: string; id: string; description: string; category: string }[]
  }
}

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
  name: string
  race: string
  class?: string
  personality: string
  motivation: string
  location?: string
  campaignId: string
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

export const useAppStore = defineStore('app', () => {
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
  const createCharacter = (character: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCharacter: Character = {
      ...character,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    characters.value.push(newCharacter)
    currentCharacter.value = newCharacter
    return newCharacter
  }

  const updateCharacter = (id: string, updates: Partial<Character>) => {
    const index = characters.value.findIndex(c => c.id === id)
    if (index !== -1) {
      const currentChar = characters.value[index]
      characters.value[index] = {
        ...currentChar,
        ...updates,
        updatedAt: new Date()
      } as Character
      if (currentCharacter.value?.id === id) {
        currentCharacter.value = characters.value[index]
      }
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
  const generateNPC = (campaignId: string) => {
    const names = ['Tobias Bergamote', 'Elara Lunargent', 'Grim Barbe-de-fer', 'Luna Chantebrise', 'Theron Ventdacier']
    const races = ['Humain', 'Elfe', 'Nain', 'Halfelin', 'Tieffelin']
    const personalities = ['Amical', 'Mystérieux', 'Colérique', 'Sage', 'Cupide', 'Loyal']
    const motivations = ['Richesse', 'Pouvoir', 'Connaissance', 'Vengeance', 'Protection', 'Liberté']

    const newNPC: NPC = {
      id: crypto.randomUUID(),
      name: names[Math.floor(Math.random() * names.length)] || 'Personnage Mystérieux',
      race: races[Math.floor(Math.random() * races.length)] || 'Humain',
      personality: personalities[Math.floor(Math.random() * personalities.length)] || 'Amical',
      motivation: motivations[Math.floor(Math.random() * motivations.length)] || 'Inconnu',
      campaignId,
      createdAt: new Date()
    }

    npcs.value.push(newNPC)
    return newNPC
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
  }

  const logout = () => {
    user.value = null
    isAuthenticated.value = false
    currentCharacter.value = null
    currentCampaign.value = null
  }

  // Getters
  const getCharactersByUser = (userId: string) => {
    return characters.value.filter(c => c.id === userId)
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
    generateNPC,
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
