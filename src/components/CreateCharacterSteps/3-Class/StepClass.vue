<template>
  <div>
    <div class="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 flex flex-col relative">
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

    <!-- Classes en deux lignes : martiales et magiques -->
    <div class="flex flex-col justify-center px-4 my-auto">
      <!-- Toutes les classes -->
      <div class="mb-6">
        <div v-if="loading" class="text-center">
          <div class="text-white">Chargement des classes...</div>
        </div>
        <div v-if="error" class="text-center">
          <div class="text-red-400">{{ error }}</div>
        </div>
        <div class="classes-container w-full grid grid-cols-6 gap-2 mb-4">
          <div 
            v-for="classe in classes" 
            :key="classe.index" 
            @click="selectedClass = classe"
            :class="[
              'class-card cursor-pointer bg-white/10 backdrop-blur-md rounded-2xl p-4 border-2 transition-all duration-100 ease-out',
              selectedClass?.index === classe.index 
                ? 'border-yellow-400 ring-4 ring-yellow-400/50 bg-white/25 opacity-100' 
                : 'border-white/20 hover:border-white/40 opacity-50'
            ]"
              :style="{ backgroundImage: `url(${getImageUrl(classe.index + '.jpg')})` }"

          >
            <!-- Contenu de la carte -->
            <div class="h-full flex flex-col items-center justify-center text-center">
              <!-- Image de la classe -->
              <div class="relative mb-4">
                <!-- Badge sélectionné -->
                <div 
                  v-if="selectedClass?.index === classe.index"
                  class="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
                >
                  <svg class="w-4 h-4 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>
              
              <!-- Nom de la classe -->
              <h3 class="text-lg backdrop-brightness-50 font-bold text-white mb-2 class-name transition-all duration-300">
                {{ getTranslatedClassName(classe.name) }}
              </h3>
              
              <!-- Bouton détails -->
              <button 
                @click.stop="openClassDetails(classe)"
                class="absolute top-2 right-2 z-20 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white rounded-full p-2 transition-all duration-200 shadow-lg"
                title="Voir les détails"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </button>
              
              <!-- Description (visible au hover) -->
              <div class="class-details opacity-0 transition-all duration-300 overflow-hidden">
                <p class="text-sm text-orange-100 mb-3 leading-relaxed">
                  {{ getClassDescription(classe) }}
                </p>
                
                <!-- Caractéristiques principales -->
                <div class="flex flex-wrap justify-center gap-2 mb-3">
                  <span 
                    v-for="stat in getClassMainStats(classe)" 
                    :key="stat" 
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-medium border',
                      isMartialClass(classe.index) 
                        ? 'bg-red-500/30 text-red-100 border-red-400/30'
                        : 'bg-purple-500/30 text-purple-100 border-purple-400/30'
                    ]"
                  >
                    {{ stat }}
                  </span>
                </div>
                
                <!-- Difficulté -->
                <div class="flex justify-center">
                  <span 
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-bold',
                      getClassDifficulty(classe) === 'Facile' ? 'bg-green-500/30 text-green-100 border border-green-400/30' :
                      getClassDifficulty(classe) === 'Moyen' ? 'bg-yellow-500/30 text-yellow-100 border border-yellow-400/30' :
                      'bg-red-500/30 text-red-100 border border-red-400/30'
                    ]"
                  >
                    {{ getClassDifficulty(classe) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <StepNavigation 
      :current-step="3" 
      :total-steps="9"
      step-name="Classe"
      :disable-next="!selectedClass"
      @previous="emit('prev')"
      @next="emit('next', selectedClass!)"
    />
  </div>

  <!-- Modal de récapitulatif -->
  <CharacterSummaryModal
    :is-open="showSummary"
    :character="character"
    @close="showSummary = false"
  />

  <!-- Modal de détails de classe -->
  <ClassDetailsModal
    :show="showClassDetails"
    :classe="selectedDetailClass!"
    @close="closeClassDetails"
  />
  </div>
</template>

<style scoped>
/* Effet d'agrandissement au hover */
.classes-container:hover .class-card {
  transform: scale(0.9);
  opacity: 0.4;
}

.classes-container:hover .class-card:hover {
  transform: scale(1.1);
  opacity: 1;
  z-index: 10;
}

/* Révélation du contenu au hover */
.class-card:hover .class-details {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.5);
}

.class-card:hover .class-name {
  font-size: 1.25rem;
}

/* Animation plus fluide */
.class-card {
  transition: all 0.35s ease-out;
  background-size: cover;
  background-position: center;
}

/* Stabilisation complète du contenu pour éviter les mouvements */
.class-card > div {
  width: 100%;
  height: 300px; /* Hauteur réduite pour un meilleur ajustement */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  overflow: hidden;
}

/* Positionnement absolu pour stabiliser complètement */
.class-card .relative {
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
}

.class-card .class-name {
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 90%;
  transition: font-size 0.35s ease-out;
}

.class-card .class-details {
  position: absolute;
  top: 140px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  transition: opacity 0.35s ease-out;
  max-height: 170px;
  overflow: hidden;
  padding: 1px;
  border-radius: 4px;
}
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import StepNavigation from '../StepNavigation.vue'
import CharacterSummaryModal from '../../CharacterSummaryModal.vue'
import ClassDetailsModal from './ClassDetailsModal.vue'
import { loadClasses } from '@/utils/dataLoader'
import type { SRDClass, SRDRace } from '@/types/srd'
import type { Character } from '@/stores/app'
import { getClassDescription, getClassMainStats, getClassDifficulty, isMartialClass, getTranslatedClassName } from '@/utils/classes'

const props = defineProps<{
  character: Character
  selectedRace?: SRDRace | null
}>()

const emit = defineEmits<{
  next: [classe: SRDClass]
  prev: []
}>()

const classes = ref<SRDClass[]>([])
const selectedClass = ref<SRDClass | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const showSummary = ref(false)
const showClassDetails = ref(false)
const selectedDetailClass = ref<SRDClass | null>(null)

onMounted(async () => {
  try {
    classes.value = await loadClasses()
  } catch (err) {
    error.value = 'Erreur lors du chargement des classes'
    console.error(err)
  } finally {
    loading.value = false
  }
})

const getImageUrl = (file: any) => {
  return new URL(`../../../images/classes/${file}`, import.meta.url).href
}

const openClassDetails = (classe: SRDClass) => {
  selectedDetailClass.value = classe
  showClassDetails.value = true
}

const closeClassDetails = () => {
  showClassDetails.value = false
  selectedDetailClass.value = null
}

</script>
