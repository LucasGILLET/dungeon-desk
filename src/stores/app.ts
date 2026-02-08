import type { SRDBackground, SRDClass, SRDFeature, SRDRace, SRDSubclass } from '@/types/srd'
import type { Subrace } from '@/utils/subrace'
import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

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
  allTraits?: {
    index: string
    name: string
    url: string
    category: string
  }[]
  features?: SRDFeature[]
  vision?: string
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

import { authenticatedFetch } from '@/utils/api';

const router = useRouter()
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
  const createCharacter = async (character: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Not authenticated");

      const payload = {
        name: character.name,
        race: character.race.name,
        class: character.class.name,
        level: character.level,
        data: character
      };

      const response = await authenticatedFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/characters`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to save character');
      }

      const savedChar = await response.json();
      
      const newCharacter: Character = {
        ...character,
        id: savedChar.id,
        createdAt: new Date(savedChar.createdAt),
        updatedAt: new Date(savedChar.updatedAt)
      }
      characters.value.push(newCharacter)
      currentCharacter.value = newCharacter
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
      const payload: any = { data: updates };
      if (updates.name) payload.name = updates.name;
      if (updates.race?.name) payload.race = updates.race.name;
      if (updates.class?.name) payload.class = updates.class.name;
      if (updates.level) payload.level = updates.level;

      const response = await authenticatedFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/characters/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to update character');
      }
      
      const updatedChar = await response.json();
      
      const index = characters.value.findIndex(c => c.id == id)
      if (index !== -1) {
        const newChar = {
          ...characters.value[index],
          ...updatedChar,
          id: updatedChar.id,
          createdAt: new Date(updatedChar.createdAt),
          updatedAt: new Date(updatedChar.updatedAt)
        }
        characters.value[index] = newChar
        if (currentCharacter.value?.id == id) {
          currentCharacter.value = newChar
        }
      }
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
