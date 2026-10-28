<template>
  <div class="min-h-[calc(100vh-5rem)] bg-zinc-950 text-zinc-200 font-sans selection:bg-amber-500/30 overflow-hidden relative">
    <!-- Grimoire Button (Global) -->
    <!-- Shown only if not in the final step (Summary) where it might be redundant or part of the UI -->
    <button
      v-if="step < steps.length - 1"
      @click="showSummary = true"
      class="hidden sm:block fixed top-20 right-3 sm:top-24 sm:right-6 xl:top-26 xl:right-8 z-40 bg-zinc-900/80 backdrop-blur-md border border-zinc-700 text-zinc-300 hover:text-amber-500 hover:border-amber-500 rounded-full p-2.5 sm:p-3 xl:p-3.5 transition-all duration-300 shadow-xl group"
      title="Voir le Grimoire"
    >
      <svg class="w-5 h-5 sm:w-6 sm:h-6 xl:w-7 xl:h-7 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
      </svg>
    </button>

    <div class="relative w-full h-full mx-auto z-10">
      <!-- Wizard principal -->
      <div class="h-full">
        <!-- Modification : personnage relu depuis l'API avant d'afficher le récapitulatif -->
        <div v-if="isLoading" class="p-6 sm:p-8">
          <SkeletonSheet />
        </div>
        <transition v-else name="fade" mode="out-in">
          <component :is="currentStepComponent" 
            :character="character" 
            :selectedRace="character.race"
            @next="handleNext"
            @previous="handlePrev"
            @prev="handlePrev"
            @finalize="handleFinalize"
            @update:character="updateCharacter"
            :key="step"
          />
        </transition>
      </div>
    </div>
    
    <!-- Modal de récapitulatif (Global) -->
    <CharacterSummaryModal
      :is-open="showSummary"
      :character="character"
      @close="showSummary = false"
    />
  </div>
</template>

<script setup lang="ts">
import StepAbilities from '@/components/CreateCharacterSteps/5-Caracteristics/StepAbilities.vue'
import StepRace from '@/components/CreateCharacterSteps/1-Race/StepRace.vue'
import StepBackground from '@/components/CreateCharacterSteps/4-Background/StepBackground.vue'
import StepClass from '@/components/CreateCharacterSteps/3-Class/StepClass.vue'
import StepSubrace from '@/components/CreateCharacterSteps/2-Subrace/StepSubrace.vue'
import StepSubclass from '@/components/CreateCharacterSteps/6-Subclass/StepSubclass.vue'
import StepChoices from '@/components/CreateCharacterSteps/7-Choices/StepChoices.vue'
import StepSummary from '@/components/CreateCharacterSteps/8-Summary/StepSummary.vue'
import CharacterSummaryModal from '@/components/CharacterSummaryModal.vue'
import SkeletonSheet from '@/components/skeleton/SkeletonSheet.vue'
import { computed, reactive, ref, onMounted } from 'vue'
import { getSubracesByParentRace } from '@/utils/subrace'
import { getAllFeaturesByClass } from '@/utils/features'
import type { SRDBackground, SRDClass, SRDFeature, SRDRace, SRDSubclass } from '@/types/srd'
import type { Character, CharacterPreview, ChoiceAnswer } from '@/types/character'
import { applyPreview, fetchPreview, fromSavedCharacter } from '@/utils/characterBuild'
import { useCharacterStore } from '@/stores/character'
import { useRouter, useRoute } from 'vue-router'
import type { Subrace } from '@/utils/subrace'

// Ajoutez ici les autres étapes au fur et à mesure
const steps = [
  StepRace,
  StepSubrace,
  StepClass,
  StepBackground,
  StepAbilities,
  StepSubclass,
  StepChoices,
  StepSummary
]

const characterStore = useCharacterStore()
const router = useRouter()
const route = useRoute()
const step = ref(0)
const showSummary = ref(false)
// Modification d'un personnage : squelette dès le premier affichage, pas l'étape Race vide
const isLoading = ref(!!route.params.id)
const currentId = ref<string | undefined>(undefined)

const character = reactive<Character>({
  name: '',
  race: {} as SRDRace,
  subrace: {} as  Subrace,
  class: {} as  SRDClass,
  subclass: {} as  SRDSubclass,
  background: {} as SRDBackground,
  abilities: {
    str: 8,
    dex: 8,
    con: 8,
    int: 8,
    wis: 8,
    cha: 8
  },
  proficiencies: {
    skills: [],
    languages: [],
    tools: []
  },
  allTraits: [] as {
    index: string
    name: string
    url: string
    category: string
  }[],
  specialChoices: {} as Record<string, string[]>,
  choices: [] as ChoiceAnswer[],
  level: 1,
  vision: 'Vision normale',
  features: [] as SRDFeature[]
})

onMounted(async () => {
  const id = route.params.id
  if (id) {
    currentId.value = Array.isArray(id) ? id[0] : id
    isLoading.value = true
    try {
      const saved = await characterStore.fetchCharacter(Number(currentId.value))
      if (saved) {
        // Objets SRD rechargés par index, puis traits, capacités et affichage des choix
        Object.assign(character, await fromSavedCharacter(saved))
        const raceTraits = (character.race?.traits ?? []).map((t: any) => ({ ...t, category: 'race' }))
        const subraceTraits = ((character.subrace as any)?.racial_traits ?? []).map((t: any) => ({ ...t, category: 'subrace' }))
        character.allTraits = [...raceTraits, ...subraceTraits]
        character.vision = character.allTraits.some(t => t.index === 'superior-darkvision') ? 'Vision dans le noir suppérieure (36m)'
          : character.allTraits.some(t => t.index === 'darkvision') ? 'Vision dans le noir (18m)' : 'Vision normale'
        character.features = await getAllFeaturesByClass(character.class.index).catch(() => [])
        applyPreview(character, await fetchPreview(character))
        step.value = steps.length - 1
      }
    } catch (e) {
      alert("Impossible de charger le personnage.") 
      router.push('/profile')
    } finally {
      isLoading.value = false
    }
  } else {
      // Check for pending character checks (e.g. after login redirect)
      const pending = localStorage.getItem('pendingCharacter');
      if (pending) {
          if (confirm("Une création de personnage non sauvegardée a été trouvée. Voulez-vous la reprendre ?")) {
                try {
                    const parsed = JSON.parse(pending);
                    Object.assign(character, parsed);
                    // Jump to Summary
                    step.value = steps.length - 1;
                } catch (e) {
                    console.error("Failed to restore pending character", e);
                    localStorage.removeItem('pendingCharacter');
                }
          } else {
              localStorage.removeItem('pendingCharacter');
          }
      }
  }
})

const currentStepComponent = computed(() => steps[step.value])

async function hasSubraces(raceIndex: string): Promise<boolean> {
  try {
    const subraces = await getSubracesByParentRace(raceIndex)
    return subraces.length > 0
  } catch {
    return false
  }
}

async function handleNext(payload: any) {
  // Scroll to top when changing step
  window.scrollTo({ top: 0, behavior: 'smooth' })
  
  if (step.value === 0 && payload) {
    character.race = payload
    payload.traits.forEach((trait: any) => {
      trait.category = "race"
    });
    character.allTraits = [...payload.traits]
    character.vision = character.allTraits.find(trait => trait.index === 'darkvision') ? 'Vision dans le noir (18m)' : 'Vision normale'
    const raceHasSubraces = await hasSubraces(payload.index)
    if (!raceHasSubraces) {
      character.subrace = {} as Subrace
      step.value = 2
      return
    }
  }

  if (step.value === 1 && payload !== undefined) {
    character.subrace = payload
    payload.racial_traits.forEach((trait: any) => {
      trait.category = "subrace"
    });
    
    // Filter out previous subrace traits to avoid accumulation
    const otherTraits = (character.allTraits || []).filter((t: any) => t.category !== 'subrace');
    character.allTraits = [...otherTraits, ...payload.racial_traits];

    character.vision = character.allTraits.find(trait => trait.index === 'darkvision') ? 'Vision dans le noir (18m)' : 'Vision normale'
    character.vision = character.allTraits.find(trait => trait.index === 'superior-darkvision') ? 'Vision dans le noir suppérieure (36m)' : character.vision
  }

  if (step.value === 2 && payload) {
    character.class = payload
    try {
      const features = await getAllFeaturesByClass(payload.index)
      character.features = features
    } catch (error) {
      console.error('Erreur lors du chargement des features de classe:', error)
      character.features = []
    }
  }

  if (step.value === 3 && payload) {
    character.background = payload
  }

  if (step.value === 4 && payload) {
    character.abilities = payload
  }

  if (step.value === 5) {
    character.subclass = payload
  }

  if (step.value === 6 && payload) {
    // Étape des choix : réponses, et affichage recalculé par le back
    const { choices, preview } = payload as { choices: ChoiceAnswer[]; preview: CharacterPreview }
    character.choices = choices
    applyPreview(character, preview, choices)
  }

  
  if (step.value < steps.length - 1) {
    step.value++
  }
}

function handlePrev() {
  // Scroll to top when changing step
  window.scrollTo({ top: 0, behavior: 'smooth' })
  
  if (step.value > 0) {
    step.value--
  }
}

function updateCharacter(payload: Partial<Character>) {
    Object.assign(character, payload)
}

async function handleFinalize() {
  const result = currentId.value
    ? await characterStore.updateCharacter(currentId.value, { ...character })
    : await characterStore.saveCharacter({ ...character })
  if (!result.success) {
    alert(`Erreur lors de l'enregistrement du personnage : ${result.error}`)
    return
  }
  alert(currentId.value ? 'Personnage mis à jour avec succès !' : 'Personnage enregistré avec succès !')
  localStorage.removeItem('pendingCharacter');
  router.push('/')
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>