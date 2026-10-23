<template>
  <div role="status" aria-live="polite" class="space-y-3">
    <!-- Texte en cours de chargement : titre, sous-titre et lignes -->
    <span class="sr-only">{{ label }}</span>
    <div v-if="title" class="ui-skeleton h-9 w-2/3" aria-hidden="true"></div>
    <div v-if="title" class="ui-skeleton h-4 w-1/3" aria-hidden="true"></div>
    <div class="space-y-2 pt-3" aria-hidden="true">
      <div v-for="i in lines" :key="i" class="ui-skeleton h-3.5" :style="{ width: i === lines ? '45%' : `${86 + ((i * 7) % 14)}%` }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ lines?: number; title?: boolean; label?: string }>(), { lines: 6, title: true, label: 'Chargement…' })
</script>
