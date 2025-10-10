<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col">
    <div class="flex flex-col justify-center px-4 my-auto">
      <div class="text-center mb-8">
        <h2 class="text-4xl font-bold text-white mb-2">Choisissez votre Race</h2>
        <p class="text-xl text-blue-100">Votre origine détermine vos capacités naturelles</p>
      </div>
      
      <div class="races-container w-full flex justify-center gap-2 overflow-hidden mb-8">
        <div 
          v-for="race in races" 
          :key="race.id" 
          @click="selectRace(race)"
          :class="[
            'race-card cursor-pointer bg-white/10 backdrop-blur-md rounded-2xl p-4 border-2 transition-all duration-100 ease-out',
            selectedRace?.id === race.id 
              ? 'border-yellow-400 ring-4 ring-yellow-400/50 bg-white/25' 
              : 'border-white/20 hover:border-white/40'
          ]"
          style="flex: 1; min-width: 120px;"
        >
          <!-- Contenu de la carte -->
          <div class="h-full flex flex-col items-center justify-center text-center">
            <!-- Image de la race -->
            <div class="relative mb-4">
              <div class="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-all">
                <span class="text-3xl">{{ getRaceEmoji(race.id) }}</span>
              </div>
              <!-- Badge sélectionné -->
              <div 
                v-if="selectedRace?.id === race.id"
                class="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
              >
                <svg class="w-4 h-4 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </div>
            
            <!-- Nom de la race -->
            <h3 class="text-lg font-bold text-white mb-2 race-name transition-all duration-300">
              {{ race.name }}
            </h3>
            
            <!-- Description (visible au hover) -->
            <div class="race-details opacity-0 transition-all duration-300 overflow-hidden">
              <p class="text-sm text-blue-100 mb-3 leading-relaxed">
                {{ race.description }}
              </p>
              
              <!-- Stats bonus -->
              <div class="flex flex-wrap justify-center gap-1">
                <span 
                  v-for="stat in race.stats" 
                  :key="stat" 
                  class="bg-blue-500/30 text-blue-100 px-2 py-1 rounded-full text-xs font-medium border border-blue-400/30"
                >
                  {{ stat }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Boutons de navigation -->
      <div class="flex justify-center space-x-6">
        <button 
          @click="emit('prev')"
          class="bg-gray-500/30 text-white px-6 py-3 rounded-xl font-bold text-base hover:bg-gray-500/50 transition-all duration-200 flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"></path>
          </svg>
          Retour
        </button>
        
        <button 
          class="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:from-yellow-300 hover:to-orange-400 transition-all duration-100 hover:scale-105"
          :class="{
            'opacity-50 cursor-not-allowed': !selectedRace
          }"
          @click="emit('next', selectedRace)"
          :disabled="!selectedRace"
        >
          <span class="flex items-center gap-2">
            {{ selectedRace?.name ? "Continuer avec " + selectedRace.name : "Sélectionnez une race" }}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>


<style scoped>
.races-container:hover .race-card {
  flex: 0.3 !important;
  opacity: 0.4;
}

.races-container:hover .race-card:hover {
  flex: 4 !important;
  opacity: 1;
}

.race-card:hover .race-details {
  opacity: 1;
}

.race-card:hover .race-name {
  font-size: 1.25rem;
}

.race-card {
  transition: all 0.35s ease-out;
}

.race-card > div {
  width: 100%;
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.race-card .relative {
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
}

.race-card .race-name {
  position: absolute;
  top: 150px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 90%;
  transition: font-size 0.35s ease-out;
}

.race-card .race-details {
  position: absolute;
  top: 190px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  transition: opacity 0.35s ease-out;
  max-height: 150px;
  overflow: hidden;
}


</style>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  next: [race: any]
  prev: []
}>()

interface Race {
  id: string
  name: string
  img: string
  description: string
  stats: string[]
}

const races: Race[] = [
  {
    id: 'humain',
    name: 'Humain',
    img: 'https://www.dungeon-desk-assets.com/races/humain.png',
    description: 'Polyvalents et ambitieux, ils excellent dans toutes les classes.',
    stats: ['+1 à toutes les caractéristiques']
  },
  {
    id: 'elfe',
    name: 'Elfe',
    img: 'https://www.dungeon-desk-assets.com/races/elfe.png',
    description: 'Gracieux et magiques, parfaits pour les magiciens et rôdeurs.',
    stats: ['+2 Dextérité', '+1 Intelligence']
  },
  {
    id: 'nain',
    name: 'Nain',
    img: 'https://www.dungeon-desk-assets.com/races/nain.png',
    description: 'Robustes et tenaces, excellents guerriers et clercs.',
    stats: ['+2 Constitution', '+1 Sagesse']
  },
  {
    id: 'halfelin',
    name: 'Halfelin',
    img: 'https://www.dungeon-desk-assets.com/races/halfelin.png',
    description: 'Petits mais courageux, parfaits pour les roublards.',
    stats: ['+2 Dextérité', '+1 Charisme']
  },
  {
    id: 'drakéide',
    name: 'Drakéide',
    img: 'https://www.dungeon-desk-assets.com/races/drakeide.png',
    description: 'Fiers et puissants, dotés d’un souffle draconique.',
    stats: ['+2 Force', '+1 Charisme']
  },
  {
    id: 'gnome',
    name: 'Gnome',
    img: 'https://www.dungeon-desk-assets.com/races/gnome.png',
    description: 'Inventifs et rusés, parfaits pour les classes magiques.',
    stats: ['+2 Intelligence', '+1 Dextérité']
  },
  {
    id: 'demi-elfe',
    name: 'Demi-Elfe',
    img: 'https://www.dungeon-desk-assets.com/races/demi-elfe.png',
    description: 'Adaptables, ils combinent les talents des humains et des elfes.',
    stats: ['+2 Charisme', '+1 à deux caractéristiques']
  },
  {
    id: 'demi-orc',
    name: 'Demi-Orc',
    img: 'https://www.dungeon-desk-assets.com/races/demi-orc.png',
    description: 'Puissants et féroces, parfaits pour le combat.',
    stats: ['+2 Force', '+1 Constitution']
  },
  {
    id: 'tieffelin',
    name: 'Tieffelin',
    img: 'https://www.dungeon-desk-assets.com/races/tieffelin.png',
    description: 'Mystérieux, dotés de pouvoirs surnaturels.',
    stats: ['+2 Charisme', '+1 Intelligence']
  }
]

const selectedRace = ref<Race | null>(null)

function selectRace(race: Race) {
  selectedRace.value = race
}

function getRaceEmoji(raceId: string): string {
  const emojis: Record<string, string> = {
    'humain': '👤',
    'elfe': '🧝',
    'nain': '⚔️',
    'halfelin': '🌱',
    'drakeide': '🐲',
    'gnome': '🔮',
    'demi-elfe': '✨',
    'demi-orc': '💪',
    'tieffelin': '😈'
  }
  return emojis[raceId] || '❓'
}
</script>
