<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  closeDiceRoller,
  openDiceRoller,
  rollCustomExpression,
  rollPreset,
  setDiceExpression,
  useDiceRoller,
} from '@/composables/useDiceRoller'
import Dice3D from '@/components/Dice3D.vue'

const presetSides = [4, 6, 8, 10, 12, 20, 100]
const styleOptions = [
    { value: 'ivory-classic', label: 'Classique' },
  { value: 'arcane-glass', label: 'Verre' },
  { value: 'obsidian-metal', label: 'Métal' },
  { value: 'tavern-wood', label: 'Bois' },
] as const

const diceStyle = ref<(typeof styleOptions)[number]['value']>('arcane-glass')

const roller = useDiceRoller()
const {
  isOpen,
  expression,
  selectedPreset,
  lastResult,
  errorMessage,
} = roller

const expressionInput = ref(expression.value)
const isRollAnimating = ref(false)
const showPreconfigs = ref(true)

watch(
  () => expression.value,
  (value) => {
    expressionInput.value = value
  },
)

const hasError = computed(() => Boolean(errorMessage.value))
const shouldRevealResult = computed(() => Boolean(lastResult.value) && !isRollAnimating.value)

const visibleDice = computed(() => {
  if (!lastResult.value) {
    return []
  }

  return lastResult.value.parts.flatMap((part, partIndex) =>
    part.rolls.map((roll, rollIndex) => ({
      value: roll,
      sides: part.sides,
      key: `${lastResult.value?.id}-${partIndex}-${rollIndex}`,
    })),
  ).slice(0, 12)
})

function rollFromInput() {
  setDiceExpression(expressionInput.value)
  try {
    rollCustomExpression()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Formule invalide.'
    console.error(error)
    return message
  }

  return null
}

function rollPresetDice(sides: number) {
  expressionInput.value = `d${sides}`
  setDiceExpression(expressionInput.value)
  rollPreset(sides)
}

function handleRollStart() {
  isRollAnimating.value = true
}

function handleRollComplete() {
  isRollAnimating.value = false
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && roller.isOpen.value) {
    closeDiceRoller()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

watch(
  () => lastResult.value?.id,
  (nextId, prevId) => {
    if (nextId && nextId !== prevId) {
      isRollAnimating.value = true
    }
  },
)

defineExpose({
  openDiceRoller,
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <section
        v-if="isOpen"
        class="fixed inset-0 z-[9999] overflow-hidden bg-transparent"
        @click.self="closeDiceRoller"
      >
        <div class="pointer-events-none absolute inset-0 z-20">
          <Dice3D
            :dice="visibleDice"
            :roll-key="lastResult?.id ?? 'initial-roll'"
            :style-preset="diceStyle"
            size="full"
            @roll-start="handleRollStart"
            @roll-complete="handleRollComplete"
          />
        </div>

        <div class="absolute inset-x-0 bottom-0 z-[15] px-3 pb-3 sm:px-6 sm:pb-6">
          <div class="mx-auto max-w-5xl rounded-2xl border border-amber-500/20 bg-zinc-950/86 p-4 shadow-[0_28px_100px_rgba(0,0,0,0.7)] backdrop-blur-md">
            <div class="mb-3 flex items-center justify-center gap-3">
              <button
                type="button"
                class="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-colors hover:border-amber-500/40 hover:text-amber-200"
                @click="showPreconfigs = !showPreconfigs"
                :aria-label="showPreconfigs ? 'Masquer les préconfigurations' : 'Afficher les préconfigurations'"
              >
                <svg
                  class="h-4 w-4 transition-transform duration-200"
                  :class="showPreconfigs ? 'rotate-0' : '-rotate-180'"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </div>

            <Transition
              enter-active-class="transition-all duration-400 ease-out"
              enter-from-class="max-h-0 -translate-y-1 opacity-0"
              enter-to-class="max-h-[520px] translate-y-0 opacity-100"
              leave-active-class="transition-all duration-400 ease-in"
              leave-from-class="max-h-[520px] translate-y-0 opacity-100"
              leave-to-class="max-h-0 -translate-y-1 opacity-0"
            >
              <div v-if="showPreconfigs" class="space-y-3 overflow-hidden">
                <div class="grid grid-cols-4 gap-2 sm:grid-cols-7">
                  <button
                    v-for="sides in presetSides"
                    :key="sides"
                    type="button"
                    class="rounded-2xl border px-2 py-3 text-center text-sm font-bold transition-all duration-200"
                    :class="selectedPreset === sides ? 'border-amber-400 bg-amber-500/15 text-amber-200 shadow-lg shadow-amber-900/20' : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-amber-500/40 hover:bg-zinc-800 hover:text-amber-100'"
                    @click="rollPresetDice(sides)"
                  >
                    d{{ sides }}
                  </button>
                </div>

                <div class="rounded-2xl border border-zinc-800 bg-zinc-900/65 p-3">
                  <div class="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">Style des dés</div>
                  <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <button
                      v-for="style in styleOptions"
                      :key="style.value"
                      type="button"
                      class="rounded-xl border px-3 py-2 text-xs font-semibold transition-colors"
                      :class="diceStyle === style.value ? 'border-amber-400 bg-amber-500/15 text-amber-200' : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-amber-500/35 hover:text-amber-100'"
                      @click="diceStyle = style.value"
                    >
                      {{ style.label }}
                    </button>
                  </div>
                </div>
              </div>
            </Transition>

            <form class="mt-3 space-y-3" @submit.prevent="rollFromInput()">
              <label class="block space-y-2">
                <span class="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">Formule</span>
                <input
                  v-model="expressionInput"
                  type="text"
                  inputmode="text"
                  class="w-full rounded-2xl border border-zinc-700 bg-zinc-900/90 px-4 py-3 text-base text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
                  placeholder="2d6+3"
                />
              </label>
              
              <div class="flex items-center gap-3">
                  <button
                  type="submit"
                  class="flex-1 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-bold text-zinc-950 transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0"
                  >
                  Lancer
                </button>
            </div>
            <p class="mt-1 text-xs text-zinc-400">Raccourci: Ctrl + Shift + R</p>
            </form>

            <Transition
              enter-active-class="transition duration-400 ease-out"
              enter-from-class="translate-y-2 opacity-0"
              enter-to-class="translate-y-0 opacity-100"
              leave-active-class="transition duration-400 ease-in"
              leave-from-class="translate-y-0 opacity-100"
              leave-to-class="translate-y-2 opacity-0"
            >
              <div v-if="lastResult && shouldRevealResult" class="mt-3 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-950 p-4">

                <div class="flex items-start justify-between gap-4">
                    <div>
                        <p class="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-300/70">Résultat</p>
                        <p class="mt-2 text-lg font-bold text-amber-50">{{ lastResult.originalExpression }}</p>
                    </div>

                    <div class="rounded-2xl border border-amber-300/45 bg-gradient-to-br from-amber-400/20 via-zinc-950/90 to-zinc-950 px-4 py-3 text-right shadow-[0_0_24px_rgba(251,191,36,0.22)]">
                      <p class="text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-200/85">Total</p>
                      <p v-if="shouldRevealResult" class="mt-1 text-4xl font-black leading-none text-amber-200 drop-shadow-[0_0_12px_rgba(251,191,36,0.7)]">{{ lastResult.total }}</p>
                    </div>
                </div>

                <div v-if="shouldRevealResult" class="mt-4 space-y-2 text-sm text-zinc-300">
                  <div
                    v-for="part in lastResult.parts"
                    :key="`${part.sides}-${part.count}-${part.rolls.join('-')}`"
                    class="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/70 px-3 py-2"
                  >
                    <span class="font-semibold text-zinc-200">
                      {{ part.sign === -1 ? '-' : '' }}{{ part.count === 1 ? '' : part.count }}d{{ part.sides }}
                    </span>
                    <span class="text-zinc-400">{{ part.rolls.join(' + ') }} = {{ Math.abs(part.subtotal) }}</span>
                  </div>

                  <div v-if="lastResult.totalModifier" class="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950/70 px-3 py-2">
                    <span class="font-semibold text-zinc-200">Modificateur</span>
                    <span class="text-zinc-400">{{ lastResult.totalModifier > 0 ? '+' : '' }}{{ lastResult.totalModifier }}</span>
                  </div>
                </div>
              </div>
            </Transition>

            <div v-if="hasError && errorMessage" class="mt-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {{ errorMessage }}
            </div>
          </div>
        </div>
      </section>
    </Transition>
  </Teleport>
</template>
