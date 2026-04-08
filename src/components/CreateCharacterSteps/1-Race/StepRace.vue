<template>
  <div class="h-full flex flex-col relative">

    <!-- Welcome Modal -->
    <transition enter-active-class="ease-out duration-300" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="ease-in duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="showWelcomeModal" class="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/95 backdrop-blur-sm"></div>
        
        <!-- Content -->
        <div class="relative bg-zinc-900 border border-amber-500/20 rounded-2xl p-8 max-w-lg w-full text-center shadow-2xl shadow-amber-900/40 transform transition-all">
          <div class="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
          </div>
          
          <h2 class="text-3xl font-bold font-serif text-white mb-2">Bienvenue sur le créateur de personnages</h2>
          
          <div class="space-y-4 text-zinc-300 mb-8 leading-relaxed">
            <p class="text-amber-500/80">
              Cet espace vous permet de créer pas à pas votre personnage pour <strong>Donjons & Dragons 5ème Edition (2014)</strong>.
            </p>
            <p class="text-sm">
              Des guides interactifs sont disponibles à chaque étape pour vous accompagner dans vos choix.
              Voulez-vous les activer ?
            </p>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              @click="handleWelcomeChoice(false)"
              class="px-6 py-2.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors text-sm font-medium"
            >
              Non, je connais la route
            </button>
            <button 
              @click="handleWelcomeChoice(true)"
              class="px-6 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold shadow-lg shadow-amber-900/20 transition-all transform hover:scale-105"
            >
              Activer les guides
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Tutorial Guide -->
    <TutorialGuide
      :visible="showTutorial"
      :step="currentStep"
      :current-step-index="tutorialStep"
      :total-steps="totalSteps"
      :is-first-step="isFirstStep"
      :is-last-step="isLastStep"
      @close="stopTutorial"
      @next="nextTutorialStep"
      @prev="prevTutorialStep"
    />

    <div class="mb-24 flex-1 flex flex-col relative pt-8 pb-2">
    
    <div class="flex flex-col justify-center px-4 my-auto h-full">
      <div class="text-center mb-8 relative z-40">
        <div class="flex items-center justify-center gap-3 mb-3 relative">
          <h2 class="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-600 font-serif drop-shadow-sm">Choisissez votre Race</h2>
          
          <!-- Help Button -->
          <div class="relative transition-all duration-300">
            <button 
                @click="startTutorial"
                class="p-2 text-sky-400 hover:text-sky-200 bg-sky-900/10 hover:bg-sky-900/30 rounded-full transition-colors border border-sky-500/20 hover:border-sky-500/50 block"
                title="Aide, comment choisir ?"
            >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </button>
          </div>
        </div>

        <div class="h-0.5 w-24 bg-gradient-to-r from-transparent via-amber-800 to-transparent mx-auto mb-4"></div>
        <p class="text-xl text-zinc-400 font-light italic">Votre origine détermine vos capacités naturelles</p>
        
        <div v-if="loading" class="text-amber-500/80 animate-pulse mt-4">Invocation des races...</div>
        <div v-if="error" class="text-red-400 mt-4 bg-red-900/20 px-4 py-2 rounded border border-red-900/50">{{ error }}</div>
      </div>
      
      <div 
        class="races-container w-full flex-1 flex justify-start sm:justify-center gap-2 overflow-x-auto sm:overflow-hidden py-4 min-h-[360px] sm:min-h-[500px] px-1"
        :class="{'relative z-40': isTutorialStep(1) || isTutorialStep(2) || isTutorialStep(3) || isTutorialStep(4)}"
      >
        <div 
          v-for="race in races" 
          :key="race.index" 
          @click="selectedRace = race"
          :class="[
            `race-card cursor-pointer relative overflow-hidden rounded-2xl border transition-all duration-500 ease-out`,
            selectedRace?.index === race.index 
              ? 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.15)] z-20 opacity-100 scale-100 sm:flex-[2_!important]' 
              : 'border-zinc-800 grayscale hover:grayscale-0 opacity-40 hover:opacity-100 hover:border-zinc-600'
          ]"
          style="flex: 1;"
          class="min-w-[150px] sm:min-w-[80px]"
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
                :class="[
                  selectedRace?.index === race.index ? 'opacity-100' : '',
                  (selectedRace?.index === race.index && isTutorialStep(4)) ? 'ring-4 ring-amber-400 bg-amber-600 scale-125 shadow-[0_0_20px_rgba(245,158,11,0.8)] z-50 animate-pulse' : ''
                ]"
              >
                <span class="text-sm">i</span>
              </button>
            
            <div
              class="relative transition-all duration-300 rounded-lg p-2 -mx-2 mb-2 border border-transparent"
              :class="{'z-50 ring-2 ring-amber-500 bg-black/60 shadow-lg border-amber-500/50': selectedRace?.index === race.index && isTutorialStep(2)}"
            >
              <!-- Label tutorial -->
                <div v-if="selectedRace?.index === race.index && isTutorialStep(2)" class="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded shadow animate-bounce z-50 whitespace-nowrap">
                  DESCRIPTION
                </div>

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
              </div>
            </div>

              <!-- Wrapper pour Bonus & Traits -->
              <div 
                 class="relative transition-all duration-300 rounded-lg border border-transparent"
                 :class="[
                   {'z-50 ring-2 ring-amber-500 bg-black/60 shadow-lg border-amber-500/50': selectedRace?.index === race.index && isTutorialStep(3)},
                   selectedRace?.index === race.index ? 'opacity-100 p-2 mt-2' : 'opacity-0 max-h-0 p-0 mt-0 overflow-hidden'
                 ]"
              >
                <!-- Label tutorial -->
                <div v-if="selectedRace?.index === race.index && isTutorialStep(3)" class="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded shadow animate-bounce z-50 whitespace-nowrap">
                  BONUS & TRAITS
                </div>

                <div class="transition-all duration-500 ease-out overflow-hidden"
                     :class="selectedRace?.index === race.index ? 'max-h-[500px]' : 'max-h-0'">
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
    <div 
      class="transition-all duration-300 rounded-xl"
    >
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
import TutorialGuide from '@/components/TutorialGuide.vue'
import { useTutorial, enableTutorials, disableTutorials } from '@/composables/useTutorial'
import { loadRaces } from '@/utils/dataLoader'
import type { SRDRace } from '@/types/srd'
import type { Character } from '@/types/character'
import { getRaceDescription, translateRaceName, getRaceStats, getRaceTraits } from '@/utils/race';

const props = defineProps<{
  character: Character
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
const showWelcomeModal = ref(false)

/* --- Tutorial Logic --- */
const raceTutorialSteps = [
    { title: "Votre Origine", text: "Tout commence ici. Votre race déterminera votre apparence, votre culture, mais aussi vos bonus de caractéristiques naturelles." },
    { title: "Le Choix", text: "Passez votre souris sur les cartes pour voir les races disponibles. Cliquez sur l'une d'elles pour la sélectionner." },
    { title: "Aperçu", text: "Le nom de la race et une brève description s'affichent ici pour vous donner une idée de son identité." },
    { title: "Bonus & Traits", text: "Chaque race offre des bonus (+2 Force, etc.) et des traits uniques (Vision nocturne...). Ils s'affichent ici après sélection." },
    { title: "Fiche Détaillée", text: "Cliquez sur l'icône 'i' ou sur le bouton de détails pour ouvrir une fenêtre complète sur l'histoire et les capacités de la race." },
    { title: "Validation", text: "Quand votre choix est fait, le bouton 'Suivant' s'activera en bas de page pour passer à l'étape suivante." }
]

const isWelcomeComplete = !!localStorage.getItem('dungeon-desk-welcome-complete')

// If we are mounting and welcome is NOT complete, show modal
onMounted(() => {
    if (!isWelcomeComplete) {
        showWelcomeModal.value = true
    }
})

const { 
  isVisible: showTutorial, 
  currentStepIndex: tutorialStep, 
  currentStep, 
  totalSteps, 
  isFirstStep, 
  isLastStep, 
  start: startTutorial, 
  stop: stopTutorial, 
  next, 
  prev: prevTutorialStep, 
  isStep: isTutorialStep 
} = useTutorial('race-selection', raceTutorialSteps, { autoStart: isWelcomeComplete })

function handleWelcomeChoice(enable: boolean) {
  if (enable) {
    enableTutorials()
    localStorage.setItem('dungeon-desk-welcome-complete', 'true')
    showWelcomeModal.value = false
    // Start race tutorial manually
    startTutorial()
  } else {
    disableTutorials()
    localStorage.setItem('dungeon-desk-welcome-complete', 'true')
    showWelcomeModal.value = false
  }
}


// Custom next function to validation
function nextTutorialStep() {
    // If we are at the selection step (index 1) and no race is selected, force selection
    if (tutorialStep.value === 1 && !selectedRace.value) {
        // Find 'Elf' or first race to select automatically for demo
        const demoRace = races.value.find(r => r.index === 'elf') || races.value[0]
        if (demoRace) selectedRace.value = demoRace
    }
    next()
}
/* --- End Tutorial Logic --- */

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