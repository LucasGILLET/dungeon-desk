<template>
  <!-- Overlay Layer (z-30) -->
  <transition enter-active-class="ease-out duration-300" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="ease-in duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
    <div v-if="visible" class="fixed inset-0 z-30 pointer-events-none bg-black/80 transition-opacity duration-500"></div>
  </transition>

  <!-- Card Layer (z-100) -->
  <transition enter-active-class="ease-out duration-300" enter-from-class="opacity-0 translate-y-10" enter-to-class="opacity-100 translate-y-0" leave-active-class="ease-in duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0 translate-y-10">
    <div v-if="visible" class="fixed bottom-24 left-0 right-0 px-4 flex justify-center z-[100] pointer-events-none">
          <div class="pointer-events-auto bg-zinc-900/95 border border-amber-500/30 w-full max-w-xl rounded-xl p-4 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col gap-3">
             
             <!-- Progress Bar -->
             <div class="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                <div class="h-full bg-amber-500 transition-all duration-300" :style="{width: ((currentStepIndex + 1) / totalSteps) * 100 + '%'}"></div>
             </div>
             
             <div class="flex gap-4">
                <!-- Mascot / Icon -->
                <div class="hidden sm:flex flex-col items-center justify-center w-16 shrink-0 text-amber-500">
                    <svg class="w-10 h-10 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                    <span class="text-[10px] uppercase font-bold tracking-wider">Guide</span>
                </div>
                
                <!-- Content -->
                <div class="flex-1">
                    <h3 class="text-amber-100 font-bold font-serif text-lg mb-1">{{ step.title }}</h3>
                    <p class="text-zinc-400 text-sm leading-relaxed">{{ step.text }}</p>
                </div>
             </div>

             <!-- Footer Controls -->
             <div class="flex items-center justify-between mt-1 pt-2 border-t border-zinc-800">
                  <button @click="$emit('close')" class="text-xs text-zinc-500 hover:text-red-400 transition-colors">Fermer</button>
                  <div class="flex gap-2">
                      <button v-if="!isFirstStep" @click="$emit('prev')" class="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 text-xs hover:bg-zinc-700">Précédent</button>
                      <button @click="$emit('next')" class="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-900/20">
                          {{ isLastStep ? 'Terminer' : 'Suivant' }}
                      </button>
                  </div>
             </div>
          </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import type { TutorialStep } from '@/composables/useTutorial'

defineProps<{
  visible: boolean
  step: TutorialStep
  currentStepIndex: number
  totalSteps: number
  isFirstStep: boolean
  isLastStep: boolean
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'next'): void
  (e: 'prev'): void
}>()
</script>
