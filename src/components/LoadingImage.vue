<template>
  <!-- Image distante (bestiaire, objets magiques) : roue de chargement en attendant,
       rien si elle n'existe pas -->
  <div v-if="!failed" class="relative shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900" :class="sizeClass">
    <div v-if="!loaded" class="absolute inset-0 flex items-center justify-center" role="status" aria-label="Chargement de l'image">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-500"></div>
    </div>
    <img
      :src="src"
      :alt="alt"
      loading="lazy"
      class="h-full w-full object-contain transition-opacity duration-300"
      :class="loaded ? 'opacity-100' : 'opacity-0'"
      @load="loaded = true"
      @error="failed = true"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ src: string; alt: string; sizeClass?: string }>()
const loaded = ref(false)
const failed = ref(false)

// Autre image (passage d'une forme ou d'une variante à l'autre) : nouveau chargement
watch(() => props.src, () => {
  loaded.value = false
  failed.value = false
})
</script>
