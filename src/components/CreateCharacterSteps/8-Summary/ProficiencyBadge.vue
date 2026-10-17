<template>
  <div class="relative group/tooltip">
    <div 
      class="px-3 py-1.5 rounded border border-zinc-700 text-xs font-medium cursor-help transition-colors bg-zinc-800"
      :class="tagClasses"
    >
      {{ name }}
    </div>
    <!-- Tooltip -->
    <div class="absolute bottom-full left-0 mb-2 w-64 p-3 bg-zinc-950 border border-zinc-700 rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:visible group-hover/tooltip:opacity-100 transition-all duration-200 pointer-events-none z-50">
      <div class="font-bold text-xs mb-1" :class="titleClasses">{{ name }}</div>
      <div class="text-[10px] text-zinc-400 leading-relaxed">{{ description }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  name: string
  description?: string
  variant?: 'default' | 'skill' | 'language' | 'tool'
}>(), {
  variant: 'default',
  description: ''
})

const tagClasses = computed(() => {
  switch (props.variant) {
    case 'skill':
      return 'text-amber-200/80 hover:text-amber-100 hover:border-amber-900/50'
    case 'language':
      return 'text-cyan-200/80 hover:text-cyan-100'
    case 'tool':
      return 'text-orange-200/80 hover:text-orange-100'
    default:
      return 'text-zinc-300 hover:bg-zinc-700'
  }
})

const titleClasses = computed(() => {
  switch (props.variant) {
    case 'skill':
      return 'text-amber-500'
    case 'language':
      return 'text-cyan-400'
    case 'tool':
      return 'text-orange-400'
    default:
      return 'text-zinc-200'
  }
})
</script>
