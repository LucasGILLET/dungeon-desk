<template>
  <div role="status" aria-live="polite" :class="['grid gap-4', columns]">
    <!-- Liste en cours de chargement : cartes à la forme des vraies -->
    <span class="sr-only">{{ label }}</span>
    <div v-for="i in count" :key="i" :class="['rounded-3xl border border-white/10 bg-white/[0.03] p-5', compact ? '' : 'min-h-36']" aria-hidden="true">
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 space-y-2">
          <div class="ui-skeleton h-5" :style="{ width: `${55 + ((i * 17) % 35)}%` }"></div>
          <div class="ui-skeleton h-3 w-2/5"></div>
        </div>
        <div v-if="!compact" class="ui-skeleton h-12 w-12 rounded-2xl"></div>
      </div>
      <div v-if="!compact" class="mt-5 flex gap-2">
        <div class="ui-skeleton h-6 w-16 rounded-full"></div>
        <div class="ui-skeleton h-6 w-16 rounded-full"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ count?: number; columns?: string; compact?: boolean; label?: string }>(), {
  count: 6,
  columns: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3',
  compact: false,
  label: 'Chargement…',
})
</script>
