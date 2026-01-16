<template>
  <div class="h-24 bg-zinc-950/80 backdrop-blur-md border-t border-amber-500/10 p-6 z-40 fixed bottom-0 left-0 right-0 w-full shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
    <div class="max-w-6xl mx-auto flex justify-between items-center font-sans">
      <button 
        @click="$emit('previous')" 
        :disabled="disablePrevious"
        class="group relative px-6 py-2 rounded-lg font-bold uppercase tracking-wider text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
        <span class="absolute inset-0 border border-zinc-700 group-hover:border-amber-500/50 rounded-lg transition-colors"></span>
        <span class="relative text-zinc-400 group-hover:text-amber-100 flex items-center gap-2">
          <span>←</span> Précédent
        </span>
      </button>
      
      <div class="text-center">
        <div class="text-amber-500/80 text-xs uppercase tracking-[0.2em] font-bold mb-1">Étape {{ currentStep }} / {{ totalSteps }}</div>
        <div class="text-zinc-200 text-lg font-serif font-bold tracking-wide">{{ stepName }}</div>
      </div>
      
      <button 
        @click="$emit('next')" 
        :disabled="disableNext"
        class="group relative px-8 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 text-zinc-950 disabled:text-zinc-500 font-bold uppercase warning-wider rounded-lg transition-all duration-300 shadow-[0_0_10px_rgba(217,119,6,0.3)] hover:shadow-[0_0_20px_rgba(217,119,6,0.5)] disabled:shadow-none font-sans tracking-wide">
        <span class="flex items-center gap-2">
          {{ isLastStep ? 'Finaliser' : 'Suivant' }} <span>→</span>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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
export default {
  name: 'StepNavigation'
}
</script>