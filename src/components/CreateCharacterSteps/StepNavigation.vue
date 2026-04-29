<template>
  <div class="min-h-20 sm:h-24 bg-zinc-950/80 backdrop-blur-md border-t border-amber-500/10 p-3 sm:p-6 z-40 fixed bottom-0 left-0 right-0 w-full shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
    <div class="max-w-6xl mx-auto flex justify-between items-center gap-2 font-sans">
      <button 
        @click="$emit('previous')" 
        :disabled="disablePrevious"
        class="group relative px-3 sm:px-6 py-2 rounded-lg font-bold uppercase tracking-wider text-xs sm:text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
        <span class="absolute inset-0 border border-zinc-700 group-hover:border-amber-500/50 rounded-lg transition-colors"></span>
        <span class="relative text-zinc-400 group-hover:text-amber-100 flex items-center gap-2">
          <span>←</span>
          <span class="hidden sm:inline">Précédent</span>
        </span>
      </button>
      
      <div class="text-center min-w-0">
        <div class="text-amber-500/80 text-[10px] sm:text-xs uppercase tracking-[0.16em] sm:tracking-[0.2em] font-bold mb-1">Étape {{ currentStep }} / {{ totalSteps }}</div>
        <div class="hidden sm:block text-zinc-200 text-lg font-serif font-bold tracking-wide">{{ stepName }}</div>
      </div>
      
      <div class="relative" data-step-navigation-finalize>
        <button 
          v-if="!isLastStep"
          @click="$emit('next')" 
          :disabled="disableNext"
          class="group relative px-4 sm:px-8 py-2.5 sm:py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 text-zinc-950 disabled:text-zinc-500 font-bold uppercase text-xs sm:text-sm warning-wider rounded-lg transition-all duration-300 shadow-[0_0_10px_rgba(217,119,6,0.3)] hover:shadow-[0_0_20px_rgba(217,119,6,0.5)] disabled:shadow-none font-sans tracking-wide">
          <span class="flex items-center gap-2">
            <span class="hidden sm:inline">Suivant</span>
            <span>→</span>
          </span>
        </button>

        <div v-else class="relative">
          <button
            type="button"
            @click="toggleFinalizeMenu"
            :disabled="disableNext"
            class="group relative px-4 sm:px-8 py-2.5 sm:py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 text-zinc-950 disabled:text-zinc-500 font-bold uppercase text-xs sm:text-sm warning-wider rounded-lg transition-all duration-300 shadow-[0_0_10px_rgba(217,119,6,0.3)] hover:shadow-[0_0_20px_rgba(217,119,6,0.5)] disabled:shadow-none font-sans tracking-wide">
            <span class="flex items-center gap-2">
              Finaliser <span>▾</span>
            </span>
          </button>

          <transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 translate-y-2 scale-95"
            enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 translate-y-0 scale-100"
            leave-to-class="opacity-0 translate-y-2 scale-95">
            <div
              v-if="showFinalizeMenu"
              class="absolute right-0 bottom-[calc(100%+0.75rem)] w-64 rounded-2xl border border-amber-500/20 bg-zinc-900/98 shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-md overflow-hidden">
              <div class="px-4 py-3 border-b border-white/5">
                <div class="text-[10px] uppercase tracking-[0.22em] text-amber-400 font-bold">Finalisation</div>
                <div class="text-sm text-zinc-300 mt-1">Choisis l’action à lancer.</div>
              </div>
              <div class="p-2 space-y-2">
                <button
                  type="button"
                  @click="emitNext"
                  class="w-full flex items-center justify-between rounded-xl px-4 py-3 text-left text-zinc-100 hover:bg-white/5 transition-colors">
                  <span>
                    <span class="block font-semibold">Sauvegarder</span>
                    <span class="block text-xs text-zinc-400">Valider et enregistrer le personnage</span>
                  </span>
                  <span class="text-amber-400">↗</span>
                </button>
                <button
                  type="button"
                  @click="emitPdf"
                  class="w-full flex items-center justify-between rounded-xl px-4 py-3 text-left text-zinc-100 hover:bg-white/5 transition-colors">
                  <span>
                    <span class="block font-semibold">Télécharger PDF</span>
                    <span class="block text-xs text-zinc-400">Générer le PDF de la fiche</span>
                  </span>
                  <span class="text-amber-400">⬇</span>
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

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
  (e: 'pdf'): void
}

const props = withDefaults(defineProps<Props>(), {
  stepName: '',
  disablePrevious: false,
  disableNext: false
})

const emit = defineEmits<Emits>()

const isLastStep = computed(() => props.currentStep === props.totalSteps)
const showFinalizeMenu = ref(false)

function toggleFinalizeMenu() {
  showFinalizeMenu.value = !showFinalizeMenu.value
}

function emitNext() {
  showFinalizeMenu.value = false
  emit('next')
}

function emitPdf() {
  showFinalizeMenu.value = false
  emit('pdf')
}

function handleDocumentClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (!target?.closest('[data-step-navigation-finalize]')) {
    showFinalizeMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<script lang="ts">
export default {
  name: 'StepNavigation'
}
</script>