<template>
  <div class="h-full flex flex-col">
    <div class="mb-24 flex-1 flex flex-col relative pt-8 pb-2">
    
    <div class="flex flex-col justify-center px-4 my-auto h-full">
      <div class="text-center mb-8">
        <h2 class="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-600 mb-3 font-serif drop-shadow-sm">Choisissez votre Race</h2>
        <div class="h-0.5 w-24 bg-gradient-to-r from-transparent via-amber-800 to-transparent mx-auto mb-4"></div>
        <p class="text-xl text-zinc-400 font-light italic">Votre origine détermine vos capacités naturelles</p>
        <div v-if="loading" class="text-amber-500/80 animate-pulse mt-4">Invocation des races...</div>
        <div v-if="error" class="text-red-400 mt-4 bg-red-900/20 px-4 py-2 rounded border border-red-900/50">{{ error }}</div>
      </div>
      
      <div class="races-container w-full flex-1 flex justify-center gap-2 overflow-hidden py-4 min-h-[500px]">
        <div 
          v-for="race in races" 
          :key="race.index" 
          @click="selectedRace = race"
          :class="[
            `race-card cursor-pointer relative overflow-hidden rounded-2xl border transition-all duration-500 ease-out`,
            selectedRace?.index === race.index 
              ? 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.15)] z-20 opacity-100 scale-100 flex-[2_!important]' 
              : 'border-zinc-800 grayscale hover:grayscale-0 opacity-40 hover:opacity-100 hover:border-zinc-600'
          ]"
          style="flex: 1; min-width: 80px;"
        >
          <!-- Background Image with Gradient Overlay -->
          <div class="absolute inset-0 bg-cover bg-center transition-transform duration-700"
               :style="{ backgroundImage: `url(${getImageUrl(race.index + '.jpg')})` }"
               :class="selectedRace?.index === race.index ? 'scale-110' : 'scale-100'">
          </div>
          <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent transition-opacity duration-300"
               :class="selectedRace?.index === race.index ? 'opacity-90' : 'opacity-60 hover:opacity-80'">
          </div>

          <!-- Contenu de la carte -->
          <div class="relative h-full flex flex-col items-center justify-end text-center p-6 pb-12">
            <!-- Badge sélectionné -->
             <div 
                v-if="selectedRace?.index === race.index"
                class="absolute top-4 right-4 w-8 h-8 bg-amber-500 text-black rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-bounce-slow"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
              </div>

            <!-- Bouton détails (Old style removed/hidden or replaced) -->
             <button 
                @click.stop="openRaceDetails(race)"
                class="absolute top-4 left-4 w-8 h-8 bg-black/40 hover:bg-amber-600 text-zinc-300 hover:text-white rounded-lg flex items-center justify-center border border-white/10 hover:border-amber-400 transition-all opacity-0 group-hover:opacity-100"
                :class="selectedRace?.index === race.index ? 'opacity-100' : ''"
              >
                <span class="text-sm font-serif">i</span>
              </button>
            
            <!-- Nom de la race -->
            <h3 class="text-2xl font-bold text-amber-50 mb-2 font-serif tracking-wide drop-shadow-lg transition-all duration-300 transform"
                 :class="selectedRace?.index === race.index ? '-translate-y-2' : ''">
              {{ translateRaceName(race.name) }}
            </h3>
            
            <!-- Description (visible au hover ou si selectionné) -->
            <div class="transition-all duration-500 ease-out overflow-hidden"
                 :class="selectedRace?.index === race.index ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'">
              
              <div class="w-full h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent mb-4"></div>

              <p class="text-sm text-zinc-300 mb-4 leading-relaxed line-clamp-4 px-2 font-light">
                {{ getRaceDescription(race) }}
              </p>
              
              <!-- Stats bonus -->
              <div class="flex flex-wrap justify-center gap-2 mb-3">
                <span 
                  v-for="stat in getRaceStats(race)" 
                  :key="stat" 
                  class="bg-amber-500/10 text-amber-200 px-3 py-1 rounded border border-amber-500/30 text-xs font-bold tracking-wider uppercase"
                >
                  {{ stat }}
                </span>
              </div>
              
              <!-- Traits raciaux -->
              <div v-if="getRaceTraits(race).length > 0" class="flex flex-wrap justify-center gap-1.5">
                <span 
                  v-for="trait in getRaceTraits(race)" 
                  :key="trait" 
                  class="bg-zinc-800/80 text-zinc-300 px-2 py-0.5 rounded text-[10px] border border-zinc-700 font-medium"
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

  </div>
</template>


<style scoped>
/* Accordion Effect */
.races-container:hover .race-card {
  opacity: 0.3;
  transform: scale(0.98);
  filter: grayscale(100%);
}

.races-container:hover .race-card:hover {
  opacity: 1;
  transform: scale(1.02);
  z-index: 30;
  filter: grayscale(0%);
  border-color: #f59e0b; /* amber-500 */
  box-shadow: 0 0 40px rgba(245, 158, 11, 0.3);
}

/* Transition douce */
.race-card {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-bounce-slow {
  animation: bounce-slow 3s infinite ease-in-out;
}

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import StepNavigation from '../StepNavigation.vue'
import RaceDetailsModal from './RaceDetailsModal.vue'
import { loadRaces } from '@/utils/dataLoader'
import type { SRDRace } from '@/types/srd'
import { getRaceDescription, translateRaceName, getRaceStats, getRaceTraits } from '@/utils/race';

const props = defineProps<{
  character: any
  selectedRace?: SRDRace | null
}>()

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
  return new URL(`../../../images/${file}`, import.meta.url).href
}

function openRaceDetails(race: SRDRace) {
  selectedDetailRace.value = race
  showRaceDetails.value = true
}

function closeRaceDetails() {
  showRaceDetails.value = false
  selectedDetailRace.value = null
}
</script>