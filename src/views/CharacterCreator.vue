
<template>
  <div class="min-h-screen bg-gray-50">
    <div class="w-full h-full mx-auto">
      <!-- Wizard principal -->
      <div class="h-full">
        <transition name="fade" mode="out-in">
          <component :is="currentStepComponent" 
            :character="character" 
            :abilities="abilities"
            :selectedRace="character.race"
            @next="handleNext"
            @previous="handlePrev"
            @prev="handlePrev"
            @finalize="handleFinalize"
            :key="step"
          />
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import StepAbilities from '@/components/CreateCharacterSteps/StepAbilities.vue'
import StepRace from '@/components/CreateCharacterSteps/StepRace.vue'
import StepBackground from '@/components/CreateCharacterSteps/StepBackground.vue'
import StepClass from '@/components/CreateCharacterSteps/StepClass.vue'
import StepSubrace from '@/components/CreateCharacterSteps/StepSubrace.vue'
import StepSubclass from '@/components/CreateCharacterSteps/StepSubclass.vue'
import StepSummary from '@/components/CreateCharacterSteps/StepSummary.vue'
import { computed, reactive, ref } from 'vue'

// Ajoutez ici les autres étapes au fur et à mesure
const steps = [
  StepRace,
  StepSubrace,
  StepClass,
  StepBackground,
  StepAbilities,
  StepSubclass,
  StepSummary
]

const step = ref(0)

const character = reactive({
  name: '',
  race: null as any,
  subrace: null as any,
  class: '',
  subclass: null as any,
  background: '',
  abilities: {} as Record<string, number>,
  level: 1
})

const abilities = ref([
  { name: 'Force', value: 13 },
  { name: 'Dextérité', value: 15 },
  { name: 'Constitution', value: 14 },
  { name: 'Intelligence', value: 12 },
  { name: 'Sagesse', value: 10 },
  { name: 'Charisme', value: 16 }
])

const completion = computed(() => {
  return Math.round(((step.value + 1) / steps.length) * 100)
})

const currentStepComponent = computed(() => steps[step.value])

function handleNext(payload: any) {
  // Enregistre le choix de la race
  if (step.value === 0 && payload) {
    character.race = payload
  }
  // Enregistre le choix de la sous-race
  if (step.value === 1 && payload) {
    character.subrace = payload
  }
  // Enregistre le choix de la classe
  if (step.value === 2 && payload) {
    character.class = payload.id
  }
  // Enregistre le choix de l'historique
  if (step.value === 3 && payload) {
    character.background = payload.id
  }
  // Enregistre les caractéristiques
  if (step.value === 4 && payload) {
    character.abilities = payload
  }
  // Enregistre le choix de la sous-classe
  if (step.value === 5) {
    character.subclass = payload // peut être null si pas de sous-classe nécessaire
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

function handleFinalize(finalCharacter: any) {
  console.log('🎉 Personnage finalisé :', finalCharacter)
  // Ici vous pourriez :
  // - Sauvegarder dans une base de données
  // - Rediriger vers la fiche de personnage
  // - Exporter en PDF
  // - etc.
  
  // Pour l'instant, on peut rediriger vers l'accueil ou une autre page
  // router.push('/character-sheet')
}
</script>
