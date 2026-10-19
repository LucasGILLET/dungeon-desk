<template>
  <div class="bg-zinc-900/30 border border-zinc-800 border-dashed rounded-xl p-12 text-center">
    <div class="text-5xl mb-4 grayscale opacity-30">{{ icon }}</div>
    <h3 class="text-lg font-medium text-zinc-300 mb-2">{{ text }}</h3>
    <router-link :to="to" class="inline-flex items-center px-4 py-2 mt-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors">
      {{ label }}
    </router-link>
  </div>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

defineProps<{ icon: string; text: string; label: string; to: RouteLocationRaw }>()
</script>
