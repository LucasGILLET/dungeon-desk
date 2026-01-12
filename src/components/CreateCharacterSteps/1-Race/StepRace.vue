<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col">
    <div class="flex flex-col justify-center px-4 my-auto">
      <div class="text-center mb-8">
        <h2 class="text-4xl font-bold text-white mb-2">Choisissez votre Race</h2>
        <p class="text-xl text-blue-100">Votre origine détermine vos capacités naturelles</p>
        <div v-if="loading" class="text-white">Chargement des races...</div>
        <div v-if="error" class="text-red-400">{{ error }}</div>
      </div>
      
      <div class="races-container w-full flex justify-center gap-2 overflow-hidden mb-8">
        <div 
          v-for="race in races" 
          :key="race.index" 
          @click="selectRace(race)"
          :class="[
            `race-card cursor-pointer bg-white/10 backdrop-blur-md rounded-2xl p-4 border-2 transition-all duration-100 ease-out`,
            selectedRace?.index === race.index 
              ? 'border-yellow-400 ring-4 ring-yellow-400/50 bg-white/25 opacity-100' 
              : 'border-white/20 hover:border-white/40 opacity-50'
          ]"
          style="flex: 1; min-width: 120px;"
          :style="{ backgroundImage: `url(${getImageUrl(race.index + '.jpg')})` }"
        >
          <!-- Contenu de la carte -->
          <div class="h-full flex flex-col items-center justify-center text-center">
            <!-- Image de la race -->
            <div class="relative mb-4">
              <!-- Badge sélectionné -->
              <div 
                v-if="selectedRace?.index === race.index"
                class="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
              >
                <svg class="w-4 h-4 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
              </div>
              
              <!-- Bouton détails -->
              <button 
                @click.stop="openRaceDetails(race)"
                class="race-info-btn absolute -top-15 -right-35 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 transition-opacity duration-200 hover:bg-white/30"
              >
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </button>
            </div>
            
            <!-- Nom de la race -->
            <h3 class="text-lg backdrop-brightness-40 font-bold text-white mb-2 race-name transition-all duration-300">
              {{ translateRaceName(race.name) }}
            </h3>
            
            <!-- Description (visible au hover) -->
            <div class="race-details opacity-0 transition-all duration-300 overflow-auto">
              <p class="text-sm text-blue-100 mb-3 leading-relaxed">
                {{ getRaceDescription(race) }}
              </p>
              
              <!-- Stats bonus -->
              <div class="flex flex-wrap justify-center gap-1 mb-2">
                <span 
                  v-for="stat in getRaceStats(race)" 
                  :key="stat" 
                  class="bg-blue-500/30 text-blue-100 px-2 py-1 rounded-full text-xs font-medium border border-blue-400/30"
                >
                  {{ stat }}
                </span>
              </div>
              
              <!-- Traits raciaux -->
              <div v-if="getRaceTraits(race).length > 0" class="flex flex-wrap justify-center gap-1">
                <span 
                  v-for="trait in getRaceTraits(race)" 
                  :key="trait" 
                  class="bg-green-500/30 text-green-100 px-2 py-1 rounded-full text-xs font-medium border border-green-400/30"
                >
                  {{ trait }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Popup détails de la race -->
      <RaceDetailsModal 
        :show="showRaceDetails" 
        :race="selectedDetailRace" 
        @close="closeRaceDetails" 
      />
    </div>

    <!-- Navigation -->
    <StepNavigation 
      :current-step="1" 
      :total-steps="9"
      step-name="Race"
      :disable-previous="true"
      :disable-next="!selectedRace"
      @previous="emit('prev')"
      @next="emit('next', selectedRace!)"
    />
  </div>
</template>


<style scoped>
.races-container:hover .race-card {
  flex: 0.3 !important;
  opacity: 0.4;
  transform: scale(0.95);
}

.races-container:hover .race-card:hover {
  flex: 0.7 !important;
  opacity: 1;
  transform: scale(1);
  z-index: 10;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  min-width: 250px !important;
}

.race-card:hover .race-details {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.5);
}

.race-card:hover .race-name {
  font-size: 1.25rem;
}

.race-card {
  transition: all 0.35s ease-out;
  background-size: cover;
  background-position: center;
}

.race-card:hover .race-info-btn {
  opacity: 1;
}

.race-card > div {
  width: 100%;
  height: 500px;
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
  max-height: 250px;
  overflow-y: auto;
  padding: 1px;
  border-radius: 4px;
}

.race-card .race-details::-webkit-scrollbar {
  width: 6px;
}

.race-card .race-details::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.race-card .race-details::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.6);
  border-radius: 3px;
}

.race-card .race-details::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.8);
}


</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import StepNavigation from '../StepNavigation.vue'
import RaceDetailsModal from './RaceDetailsModal.vue'
import { loadRaces } from '@/utils/dataLoader'
import type { SRDRace } from '@/types/srd'

const emit = defineEmits<{
  next: [race: SRDRace]
  prev: []
}>()

const races = ref<SRDRace[]>([])
const selectedRace = ref<SRDRace | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const showRaceDetails = ref(false)
const selectedDetailRace = ref<SRDRace | null>(null)

onMounted(async () => {
  try {
    races.value = await loadRaces()
  } catch (err) {
    error.value = 'Erreur lors du chargement des races'
    console.error(err)
  } finally {
    loading.value = false
  }
})

const getImageUrl = (file: any) => {
  return new URL(`../../images/${file}`, import.meta.url).href
}

function selectRace(race: SRDRace) {
  selectedRace.value = race
  console.log('Race', selectedRace.value)
}

function openRaceDetails(race: SRDRace) {
  selectedDetailRace.value = race
  showRaceDetails.value = true
}

function closeRaceDetails() {
  showRaceDetails.value = false
  selectedDetailRace.value = null
}

function getRaceStats(race: SRDRace): string[] {
  return race.ability_bonuses.map(bonus => `+${bonus.bonus} ${translateAbilityScore(bonus.ability_score.name)}`)
}

function getRaceTraits(race: SRDRace): string[] {
  return race.traits.map(trait => trait.name)
}

function translateAbilityScore(englishName: string): string {
  const translations: Record<string, string> = {
    'STR': 'FOR',
    'DEX': 'DEX',
    'CON': 'CON',
    'INT': 'INT',
    'WIS': 'SAG',
    'CHA': 'CHA'
  }
  return translations[englishName] || englishName
}

function getRaceDescription(race: SRDRace): string {
  // Descriptions traduites en français pour chaque race
  const descriptions: Record<string, string> = {
    'Dwarf': 'Créatures robustes et résistantes, les nains excellent dans l\'artisanat et la guerre souterraine.',
    'Elf': 'Gracieux et longévives, les elfes sont des êtres magiques connectés à la nature et aux arts.',
    'Halfling': 'Petits et chanceux, les halfelins sont des aventuriers intrépides et opportunistes.',
    'Human': 'Adaptables et ambitieux, les humains sont la race la plus répandue et diverse de Faerûn.',
    'Dragonborn': 'Descendants des dragons, ils possèdent une force impressionnante et un souffle draconique.',
    'Gnome': 'Ingénieux et curieux, les gnomes excellent dans l\'invention et la magie illusionniste.',
    'Half-Elf': 'Mélange d\'elfe et d\'humain, ils combinent la grâce elfique avec l\'adaptabilité humaine.',
    'Half-Orc': 'Puissants et endurants, les demi-orcs allient la force orc avec d\'autres héritages.',
    'Tiefling': 'Marqués par un héritage infernal, ils possèdent des pouvoirs surnaturels et une résistance aux éléments.'
  }
  return descriptions[race.name] || race.size_description || race.alignment
}

function translateRaceName(englishName: string): string {
  const translations: Record<string, string> = {
    'Dwarf': 'Nain',
    'Elf': 'Elfe',
    'Halfling': 'Halfelin',
    'Human': 'Humain',
    'Dragonborn': 'Drakéide',
    'Gnome': 'Gnome',
    'Half-Elf': 'Demi-elfe',
    'Half-Orc': 'Demi-orc',
    'Tiefling': 'Tieffelin'
  }
  return translations[englishName] || englishName
}
</script>
