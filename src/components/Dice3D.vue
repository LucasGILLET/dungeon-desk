<script setup lang="ts">
import DiceBox from '@3d-dice/dice-box-threejs'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const emit = defineEmits<{
  (e: 'roll-start'): void
  (e: 'roll-complete'): void
}>()

export interface DiceRollVisual {
  value: number
  sides: number
  key: string
}

type DiceStylePreset = 'arcane-glass' | 'obsidian-metal' | 'tavern-wood' | 'ivory-classic'

const props = withDefaults(defineProps<{
  dice: DiceRollVisual[]
  rollKey: string | number
  size?: 'sm' | 'md' | 'lg' | 'full'
  stylePreset?: DiceStylePreset
}>(), {
  size: 'md',
  stylePreset: 'arcane-glass',
})

const containerId = `dice-box-${Math.random().toString(36).slice(2, 10)}`
const initError = ref<string | null>(null)

let box: DiceBox | null = null
let initialized = false
let pendingNotation: string | null = null

const STYLE_PRESETS: Record<DiceStylePreset, {
  theme_surface: string
  theme_material: string
  theme_colorset: string
  theme_texture: string
}> = {
  'arcane-glass': {
    theme_surface: 'green-felt',
    theme_material: 'glass',
    theme_colorset: 'white',
    theme_texture: 'stainedglass',
  },
  'obsidian-metal': {
    theme_surface: 'stainless',
    theme_material: 'metal',
    theme_colorset: 'radiant',
    theme_texture: 'metal',
  },
  'tavern-wood': {
    theme_surface: 'mahogany',
    theme_material: 'wood',
    theme_colorset: 'bronze',
    theme_texture: 'wood',
  },
  'ivory-classic': {
    theme_surface: 'red-felt',
    theme_material: 'plastic',
    theme_colorset: 'white',
    theme_texture: 'paper',
  },
}

const selectedStyleConfig = computed(() => STYLE_PRESETS[props.stylePreset])

const mountStyles = computed(() => {
  if (props.size === 'full') {
    return { width: '100%', height: '100%' }
  }

  if (props.size === 'sm') {
    return { width: '260px', height: '140px' }
  }

  if (props.size === 'lg') {
    return { width: '420px', height: '220px' }
  }

  return { width: '340px', height: '180px' }
})

const isFullSize = computed(() => props.size === 'full')

function normalizeForNotation(die: DiceRollVisual): Array<{ sides: number; value: number }> {
  if (die.sides !== 100) {
    return [{ sides: die.sides, value: die.value }]
  }

  // Keep a percentile visual roll: one d100 (00/10/.../90) plus one d10 for units.
  const safeValue = Math.min(Math.max(Math.trunc(die.value), 1), 100)
  const tensBucket = safeValue === 100 ? 0 : Math.floor(safeValue / 10) * 10
  const d100Face = tensBucket === 0 ? 100 : tensBucket
  const onesDigit = safeValue === 100 ? 0 : safeValue % 10
  const d10Face = onesDigit === 0 ? 10 : onesDigit

  return [
    { sides: 100, value: d100Face },
    { sides: 10, value: d10Face },
  ]
}

const diceNotation = computed(() => {
  if (!props.dice.length) {
    return 'd20@20'
  }

  const groupedDice = new Map<number, number[]>()

  for (const die of props.dice) {
    const normalizedDice = normalizeForNotation(die)

    for (const normalizedDie of normalizedDice) {
      const values = groupedDice.get(normalizedDie.sides) ?? []
      values.push(normalizedDie.value)
      groupedDice.set(normalizedDie.sides, values)
    }
  }

  const groupedEntries = Array.from(groupedDice.entries())
  const setNotation = groupedEntries
    .map(([sides, values]) => `${values.length === 1 ? '' : values.length}d${sides}`)
    .join('+')
  const predeterminedResults = groupedEntries
    .flatMap(([, values]) => values)
    .join(',')

  return `${setNotation}@${predeterminedResults}`
})

async function triggerRoll() {
  if (!box) {
    pendingNotation = diceNotation.value
    return
  }

  if (!initialized) {
    pendingNotation = diceNotation.value
    return
  }

  const notation = pendingNotation ?? diceNotation.value
  pendingNotation = null

  try {
    emit('roll-start')
    await box.roll(notation)
    emit('roll-complete')
  } catch (error) {
    console.error('DiceBox roll failed', error)
    emit('roll-complete')
  }
}

async function initializeDiceBox() {
  try {
    const host = document.getElementById(containerId)
    if (host) {
      host.innerHTML = ''
    }

    const styleConfig = selectedStyleConfig.value

    box = new DiceBox(`#${containerId}`, {
      assetPath: '/dice-box/',
      sounds: false,
      volume: 0,
      shadows: true,
      strength: 0.9,
      light_intensity: 0.75,
      theme_surface: styleConfig.theme_surface,
      theme_material: styleConfig.theme_material,
      theme_texture: styleConfig.theme_texture,
      theme_colorset: styleConfig.theme_colorset,
    })

    await box.initialize()
    initialized = true
    await triggerRoll()
  } catch (error) {
    console.error('DiceBox init failed', error)
    initError.value = 'La scène 3D n’a pas pu se charger.'
  }
}

function disposeDiceBox() {
  initialized = false
  const host = document.getElementById(containerId)
  if (host) {
    host.innerHTML = ''
  }
  box = null
}

watch(
  () => `${props.rollKey}:${diceNotation.value}`,
  () => {
    void triggerRoll()
  },
)

watch(
  () => props.stylePreset,
  async (nextStyle, previousStyle) => {
    if (nextStyle === previousStyle) {
      return
    }

    pendingNotation = diceNotation.value
    disposeDiceBox()
    await initializeDiceBox()
  },
)

onMounted(() => {
  void initializeDiceBox()
})

onBeforeUnmount(() => {
  disposeDiceBox()
})
</script>

<template>
  <div :class="isFullSize ? 'dice-scene-full' : 'dice-scene rounded-3xl border border-amber-500/15 bg-zinc-950/75 p-3 shadow-inner shadow-black/20'">
    <div v-if="!isFullSize" class="mb-3 flex items-center justify-between gap-3">
      <div>
        <p class="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">Rendu 3D</p>
        <p class="mt-1 text-sm text-zinc-400">Moteur DiceBox ThreeJS + physique cannon-es.</p>
      </div>
      <span class="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-amber-200">
        DiceBox
      </span>
    </div>

    <div
      :id="containerId"
      :class="isFullSize ? 'dice-mount-full overflow-hidden bg-transparent' : 'dice-mount mx-auto overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950'"
      :style="mountStyles"
    ></div>

    <p v-if="initError" class="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
      {{ initError }}
    </p>
  </div>
</template>

<style scoped>
.dice-mount {
  min-height: 140px;
}

.dice-scene-full {
  position: absolute;
  inset: 0;
}

.dice-mount-full {
  width: 100%;
  height: 100%;
}
</style>
