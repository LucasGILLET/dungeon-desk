<template>
  <div>
    <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col relative">
    <!-- Bouton récapitulatif -->
    <button
      @click="showSummary = true"
      class="absolute top-4 right-4 z-10 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white rounded-full p-3 transition-all duration-200 shadow-lg"
      title="Voir le récapitulatif"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
      </svg>
    </button>

    <div class="flex flex-col justify-center px-4 my-auto">
      
      <!-- En-tête -->
      <div class="text-center mb-8">
        <h2 class="text-4xl font-bold text-white mb-2">{{ selectedRace?.name }}</h2>
        <p class="text-xl text-blue-100">Choisissez votre sous-race</p>
        <div v-if="loading" class="text-white mt-4">Chargement des sous-races...</div>
      </div>
      
      <!-- Grille des sous-races -->
      <div class="subraces-container w-full max-w-7xl mx-auto mb-8">
        <!-- Message quand aucune sous-race -->
        <div v-if="!loading && availableSubraces.length === 0" class="text-center">
          <div class="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-2xl mx-auto">
            <h3 class="text-2xl font-bold text-white mb-4">Aucune sous-race disponible</h3>
            <p class="text-blue-100 mb-6">
              Cette race n'a pas de sous-races dans les règles officielles D&D 5e.
            </p>
            <p class="text-sm text-blue-200">
              Cliquez sur "Suivant" pour continuer avec la race de base.
            </p>
          </div>
        </div>
        
        <!-- Grille quand il y a des sous-races -->
        <div 
          v-else-if="!loading"
          :class="[
            'grid gap-6',
            availableSubraces.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' :
            availableSubraces.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
            availableSubraces.length === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          ]"
        >
          <div 
            v-for="subrace in availableSubraces" 
            :key="subrace.index" 
            @click="selectedSubrace = subrace"
            :class="[
              'subrace-card cursor-pointer bg-white/10 backdrop-blur-md rounded-2xl p-6 border-2 transition-all duration-300 ease-out',
              selectedSubrace?.index === subrace.index 
                ? 'border-yellow-400 ring-4 ring-yellow-400/50 bg-white/25' 
                : 'border-white/20 hover:border-white/40'
            ]"
          >
            <!-- Contenu de la carte -->
            <div class="h-full flex flex-col text-left">
              <!-- En-tête avec emoji et sélection -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center">
                  <div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mr-4">
                    <span class="text-3xl">{{ getSubraceEmoji(subrace.race.index) }}</span>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-white mb-1">{{ subrace.name }}</h3>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <!-- Bouton détails -->
                  <button 
                    @click.stop="openSubraceDetails(subrace)"
                    class="subrace-info-btn w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 transition-opacity duration-200 hover:bg-white/30"
                    title="Voir les détails"
                  >
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </button>
                  <!-- Badge sélectionné -->
                  <div 
                    v-if="selectedSubrace?.index === subrace.index"
                    class="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
                  >
                    <svg class="w-5 h-5 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                </div>
              </div>
              
              <!-- Description -->
              <p class="text-sm text-blue-100 mb-4 leading-relaxed">
                {{ getSubraceDescription(subrace) }}
              </p>
              
              <!-- Bonus de caractéristiques -->
              <div class="mb-4">
                <h4 class="text-sm font-semibold text-white mb-2">Augmentation de caractéristiques</h4>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="(bonus, stat) in getSubraceAbilityBonuses(subrace)" 
                    :key="stat"
                    class="bg-yellow-500/30 text-yellow-100 px-3 py-1 rounded-full text-sm font-medium border border-yellow-400/30"
                  >
                    {{ stat }} +{{ bonus }}
                  </span>
                </div>
              </div>
              
              <!-- Traits raciaux -->
              <div class="flex-1">
                <h4 class="text-sm font-semibold text-white mb-2">Traits raciaux</h4>
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="trait in subrace.racial_traits" 
                    :key="trait.index"
                    class="relative bg-emerald-500/30 text-emerald-100 px-2 py-1 rounded text-xs leading-relaxed cursor-help group"
                  >
                    {{ trait.name }}
                    <!-- Tooltip simple -->
                    <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-64 text-center">
                      Trait racial de {{ subrace.name }}
                      <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Popup détails de la sous-race -->
      <SubraceDetailsModal 
        :show="showSubraceDetails" 
        :subrace="selectedDetailSubrace" 
        @close="closeSubraceDetails" 
      />
    </div>
    
    <!-- Navigation -->
    <StepNavigation 
      :current-step="2" 
      :total-steps="9"
      step-name="Sous-race"
      :disable-previous="false"
      :disable-next="!canGoNext"
      @previous="emit('prev')"
      @next="validateSelection"
    />
  </div>

  <!-- Modal de récapitulatif -->
  <CharacterSummaryModal
    :is-open="showSummary"
    :character="character"
    @close="showSummary = false"
  />
  </div>
</template>

<style scoped>
/* Animation des sous-races */
.subrace-card:hover {
  transform: none;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.subrace-card:hover .subrace-info-btn {
  opacity: 1;
}

/* Animation plus fluide */
.subrace-card {
  transition: all 0.3s ease-out;
  min-height: 420px;
}

/* Stabilisation complète du contenu */
.subrace-card > div {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}
</style>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { getTraitDescription } from '@/utils/traits'
import { getSubracesByParentRace, getSubraceEmoji, getSubraceAbilityBonuses, getSubraceDescription } from '@/utils/subrace'
import type { SRDRace, SRDSubclass } from '@/types/srd'
import StepNavigation from '../StepNavigation.vue'
import SubraceDetailsModal from './SubraceDetailsModal.vue'
import CharacterSummaryModal from '../../CharacterSummaryModal.vue'
import type { Character } from '@/stores/app'

const props = defineProps<{
  selectedRace: SRDRace | null
  character: Character
}>()

const emit = defineEmits<{
  next: [subrace: SRDSubclass | null]
  prev: []
}>()

const selectedSubrace = ref<SRDSubclass | null>(null)
const loading = ref(false)
const showSubraceDetails = ref(false)
const selectedDetailSubrace = ref<SRDSubclass | null>(null)
const showSummary = ref(false)

const availableSubraces = ref<SRDSubclass[]>([])

const canGoNext = computed(() => {
  return availableSubraces.value.length === 0 || selectedSubrace.value !== null
})

watch(() => props.selectedRace, async (newRace) => {
  if (newRace) {
    loading.value = true
    try {
      availableSubraces.value = await getSubracesByParentRace(newRace.index)
    } catch (error) {
      console.error('Erreur lors du chargement des sous-races:', error)
      availableSubraces.value = []
    } finally {
      loading.value = false
    }
  } else {
    availableSubraces.value = []
  }
}, { immediate: true })

function openSubraceDetails(subrace: SRDSubclass) {
  selectedDetailSubrace.value = subrace
  showSubraceDetails.value = true
}

function closeSubraceDetails() {
  showSubraceDetails.value = false
  selectedDetailSubrace.value = null
}

function validateSelection() {
  if (availableSubraces.value.length === 0) {
    emit('next', null)
  } else if (selectedSubrace.value) {
    emit('next', selectedSubrace.value)
  }
}

</script>
