<template>
  <div class="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-amber-500/30 overflow-hidden relative">
    <!-- Background Effects (Global) -->
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-[128px]"></div>
      <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-[128px]"></div>
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#09090b_100%)]"></div>
      <div class="absolute inset-0 opacity-[0.03]" style="background-image: url(&quot;data:image/svg+xml,%3Csvg)" width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg' fill='none' fill-rule='evenodd' fill-opacity='0.4' path d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'></div>
    </div>

    <!-- Grimoire Button (Global) -->
    <!-- Shown only if not in the final step (Summary) where it might be redundant or part of the UI -->
    <button
      v-if="step < steps.length - 1"
      @click="showSummary = true"
      class="fixed top-4 right-4 sm:top-6 sm:right-8 z-50 bg-zinc-900/80 backdrop-blur-md border border-zinc-700 text-zinc-300 hover:text-amber-500 hover:border-amber-500 rounded-full p-3 transition-all duration-300 shadow-xl group"
      title="Voir le Grimoire"
    >
      <svg class="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
      </svg>
    </button>

    <div class="relative w-full h-full mx-auto z-10">
      <!-- Wizard principal -->
      <div class="h-full">
        <transition name="fade" mode="out-in">
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
import StepProficiencies from '@/components/CreateCharacterSteps/7-Proficiencies/StepProficiencies.vue'
import StepSpecialChoices from '@/components/CreateCharacterSteps/8-SpecialChoices/StepSpecialChoices.vue'
import StepSummary from '@/components/CreateCharacterSteps/9-Summary/StepSummary.vue'
import CharacterSummaryModal from '@/components/CharacterSummaryModal.vue'
import { computed, reactive, ref, onMounted } from 'vue'
import { getSubracesByParentRace } from '@/utils/subrace'
import { getAllFeaturesByClass } from '@/utils/features'
import type { SRDBackground, SRDClass, SRDFeature, SRDRace, SRDSubclass } from '@/types/srd'
import { useAppStore, type Character } from '@/stores/app'
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
  StepProficiencies,
  StepSpecialChoices,
  StepSummary
]

const store = useAppStore()
const characterStore = useCharacterStore()
const router = useRouter()
const route = useRoute()
const step = ref(0)
const showSummary = ref(false)
const isLoading = ref(false)
const currentId = ref<string | undefined>(undefined)

const character = reactive<Character>({
  name: '',
  race: {} as SRDRace,
  subrace: {} as  Subrace,
  class: {} as  SRDClass,
  subclass: {} as  SRDSubclass,
  background: {} as SRDBackground,
  abilities: {} as {
    force: number
    dexterite: number
    constitution: number
    intelligence: number
    sagesse: number
    charisme: number
  },
  proficiencies: {} as {
    skills: string[]
    languages: string[]
    tools: string[]
  },
  allProficiencies: {} as {
    skills: { name: string; id: string; description: string; category: string }[]
    languages: { name: string; id: string; description: string; category: string }[]
    tools: { name: string; id: string; description: string; category: string }[]
  },
  allTraits: [] as {
    index: string
    name: string
    url: string
    category: string
  }[],
  specialChoices: {} as Record<string, string[]>,
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
      const fetched = await characterStore.fetchCharacter(Number(currentId.value))
      if (fetched && fetched.data) {
        Object.assign(character, fetched.data)
        if (!character.name) character.name = fetched.name
        step.value = steps.length - 1
      }
    } catch (e) {
      alert("Impossible de charger le personnage.") 
      router.push('/profile')
    } finally {
      isLoading.value = false
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
    character.allTraits = [...character.allTraits || [], ...payload.racial_traits]
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
    character.proficiencies = payload.selectedProficiencies
    character.allProficiencies = payload.allProficiencies
    character.proficiencies = payload.proficiencies
  }

  
  if (step.value < steps.length - 1) {
    step.value++
  }
}

function handlePrev() {
  if (step.value > 0) {
    step.value--
  }
}

function updateCharacter(payload: Partial<Character>) {
    Object.assign(character, payload)
}

async function handleFinalize() {
  try {
    if (currentId.value) {
      await store.updateCharacter(currentId.value, { ...character })
      alert('Personnage mis à jour avec succès !')
    } else {
      await store.createCharacter({ ...character })
      alert('Personnage enregistré avec succès !')
    }
    router.push('/')
  } catch (e: any) {
    alert("Erreur lors de l'enregistrement du personnage.")
  }
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