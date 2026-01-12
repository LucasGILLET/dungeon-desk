<template>
  <div class="bg-black/20 backdrop-blur-md border-t border-white/10 p-6">
    <div class="max-w-6xl mx-auto flex justify-between items-center">
      <button 
        @click="$emit('previous')" 
        :disabled="disablePrevious"
        class="bg-white/10 hover:bg-white/20 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 border border-white/20 disabled:border-gray-500">
        ← Précédent
      </button>
      
      <div class="text-center">
        <div class="text-purple-200 text-sm">Étape {{ currentStep }} sur {{ totalSteps }}</div>
        <div class="text-purple-300 text-xs mt-1">{{ stepName }}</div>
      </div>
      
      <button 
        @click="$emit('next')" 
        :disabled="disableNext"
        class="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 border border-purple-500 disabled:border-gray-500">
        {{ isLastStep ? 'Finaliser' : 'Suivant' }} →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  currentStep: number
  totalSteps: number
  stepName?: string
  disablePrevious?: boolean
  disableNext?: boolean
}

interface Emits {
  (e: 'previous'): void
  (e: 'next'): void
}

const props = withDefaults(defineProps<Props>(), {
  stepName: '',
  disablePrevious: false,
  disableNext: false
})

const emit = defineEmits<Emits>()

const isLastStep = computed(() => props.currentStep === props.totalSteps)
</script>

<script lang="ts">
import { computed } from 'vue'

export default {
  name: 'StepNavigation'
}
</script>
