<template>
  <div class="h-full flex flex-col">
    <div class="mb-24 flex-1 flex flex-col relative pt-8 pb-2 overflow-hidden">
      
      <div class="flex flex-col px-4 h-full max-w-7xl mx-auto w-full">
        <!-- En-tête -->
        <div class="text-center mb-6 shrink-0 z-10">
          <h2 class="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-600 mb-3 font-serif drop-shadow-sm">
            {{ selectedRace?.name }}
          </h2>
          <div class="h-0.5 w-24 bg-gradient-to-r from-transparent via-amber-800 to-transparent mx-auto mb-4"></div>
          <p class="text-xl text-zinc-400 font-light italic">Choisissez votre lignée ancestrale</p>
          <div v-if="loading" class="text-amber-500/80 animate-pulse mt-4 font-serif">Consultation des archives...</div>
        </div>
      
        <!-- Grille des sous-races -->
        <div class="flex-1 overflow-y-auto pb-8 min-h-0 custom-scrollbar p-6">
          <!-- Message quand aucune sous-race -->
          <div v-if="!loading && availableSubraces.length === 0" class="text-center h-full flex flex-col items-center justify-center">
            <div class="bg-zinc-900/50 backdrop-blur-md rounded-2xl p-10 border border-zinc-800 max-w-2xl mx-auto shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <div class="text-6xl mb-6 opacity-50 grayscale">📜</div>
              <h3 class="text-2xl font-bold text-amber-500 mb-4 font-serif">Lignée Unique</h3>
              <p class="text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">
                Cette race ne possède pas de variations connues. Votre destinée est déjà tracée.
              </p>
              <div class="text-sm text-zinc-500 bg-black/20 py-2 px-4 rounded-full inline-block font-medium">
                Cliquez sur "Suivant" pour poursuivre votre aventure
              </div>
            </div>
          </div>
          
          <!-- Grille quand il y a des sous-races -->
          <div 
            v-else-if="!loading"
            :class="[
              'grid gap-6 auto-rows-fr',
              availableSubraces.length === 1 ? 'grid-cols-1 max-w-xl mx-auto' :
              availableSubraces.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' :
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            ]"
          >
            <div 
              v-for="subrace in availableSubraces" 
              :key="subrace.index" 
              @click="selectedSubrace = subrace"
              :class="[
                'subrace-card cursor-pointer group relative bg-zinc-900/40 backdrop-blur-sm rounded-2xl border transition-all duration-300 ease-out flex flex-col overflow-hidden',
                selectedSubrace?.index === subrace.index 
                  ? 'border-amber-500 bg-zinc-800/60 shadow-[0_0_20px_rgba(245,158,11,0.15)] transform scale-[1.02] z-10' 
                  : 'border-zinc-800 hover:border-amber-500/30 hover:bg-zinc-800/40'
              ]"
            >
              <!-- Background accent -->
              <div class="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 transition-opacity duration-300"
                   :class="selectedSubrace?.index === subrace.index ? 'opacity-100' : 'group-hover:opacity-50'"></div>

              <!-- Contenu de la carte -->
              <div class="relative p-6 flex flex-col h-full z-10 text-left">
                <!-- En-tête avec emoji et sélection -->
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center gap-4">
                    <div class="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-700 flex items-center justify-center shadow-inner group-hover:border-amber-500/30 transition-colors">
                      <span class="text-4xl filter drop-shadow-md transform group-hover:scale-110 transition-transform duration-300">{{ getSubraceEmoji(subrace.race.index) }}</span>
                    </div>
                    <div>
                       <h3 class="text-xl font-bold text-zinc-100 font-serif leading-tight group-hover:text-amber-100 transition-colors">{{ subrace.name }}</h3>
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-2">
                    <!-- Badge sélectionné -->
                    <transition name="scale">
                      <div 
                        v-if="selectedSubrace?.index === subrace.index"
                        class="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                      >
                        <svg class="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                      </div>
                    </transition>
                  </div>
                </div>
                
                <!-- Description -->
                <p class="text-sm text-zinc-400 mb-6 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-300 min-h-[3rem]">
                  {{ getSubraceDescription(subrace) }}
                </p>
                
                <div class="mt-auto space-y-5">
                   <!-- Traits -->
                    <div v-if="subrace.racial_traits && subrace.racial_traits.length > 0">
                      <div class="text-[10px] uppercase font-bold text-zinc-600 tracking-widest mb-2">Traits hérités</div>
                      <div class="flex flex-wrap gap-1.5">
                        <span 
                          v-for="trait in subrace.racial_traits" 
                          :key="trait.index" 
                          class="bg-zinc-950/50 text-zinc-300 px-2 py-1 rounded border border-zinc-700 text-xs hover:border-zinc-500 transition-colors"
                        >
                          {{ trait.name }}
                        </span>
                      </div>
                    </div>

                   <!-- Bonus de caractéristiques -->
                   <div v-if="subrace.ability_bonuses && subrace.ability_bonuses.length > 0">
                      <div class="text-[10px] uppercase font-bold text-zinc-600 tracking-widest mb-2">Bonus naturels</div>
                      <div class="flex flex-wrap gap-2">
                        <span 
                          v-for="bonus in subrace.ability_bonuses" 
                          :key="bonus.ability_score.index" 
                          class="bg-amber-900/20 text-amber-500 px-2 py-1 rounded border border-amber-900/50 text-xs font-bold"
                        >
                          +{{ bonus.bonus }} {{ bonus.ability_score.name }}
                        </span>
                      </div>
                   </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    
      <!-- Navigation -->
      <StepNavigation 
        :current-step="2" 
        :total-steps="9"
        step-name="Lignée"
        :disable-next="availableSubraces.length > 0 && !selectedSubrace"
        @previous="emit('prev')"
        @next="validateSubrace"
      />
    </div>

    <!-- Modal de détails de sous-race -->
    <SubraceDetailsModal
      :show="showSubraceDetails"
      :subrace="selectedDetailSubrace!"
      @close="closeSubraceDetails"
    />
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(82, 82, 91, 0.5);
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(245, 158, 11, 0.5); 
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.scale-enter-from,
.scale-leave-to {
  transform: scale(0);
  opacity: 0;
}
</style>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import StepNavigation from '../StepNavigation.vue'
import SubraceDetailsModal from './SubraceDetailsModal.vue'
import type { SRDRace } from '@/types/srd'
import { getSubracesByParentRace, getSubraceEmoji, getSubraceDescription } from '@/utils/subrace'
import type { Character } from '@/stores/app'

const props = defineProps<{
  character: Character
  selectedRace?: SRDRace | null
}>()

const emit = defineEmits<{
  next: [subrace: any]
  prev: []
}>()

const availableSubraces = ref<any[]>([])
const selectedSubrace = ref<any | null>(null)
const loading = ref(false)
const showSubraceDetails = ref(false)
const selectedDetailSubrace = ref<any | null>(null)

async function loadSubraces() {
  if (!props.selectedRace) return
  
  loading.value = true
  try {
    availableSubraces.value = await getSubracesByParentRace(props.selectedRace.index)
    // Si une seule sous-race disponible, on pourrait la sélectionner automatiquement ?
    // Non, laissons le choix explicite ou le clic.
  } catch (error) {
    console.error("Erreur lors du chargement des sous-races:", error)
    availableSubraces.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadSubraces()
})

// Recharger si la race change (cas rare si on revient en arrière)
watch(() => props.selectedRace, () => {
  selectedSubrace.value = null
  loadSubraces()
})

function validateSubrace() {
  // Si pas de sous-races disponibles pour cette race, on passe null
  if (availableSubraces.value.length === 0) {
    emit('next', null)
  } else {
    emit('next', selectedSubrace.value)
  }
}

function closeSubraceDetails() {
  showSubraceDetails.value = false
  selectedDetailSubrace.value = null
}
</script>
