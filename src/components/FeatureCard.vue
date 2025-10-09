<template>
  <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all group cursor-pointer">
    <div class="text-4xl mb-4 group-hover:scale-110 transition-transform">{{ icon }}</div>
    <h3 class="text-xl font-semibold text-white mb-3">{{ title }}</h3>
    <p class="text-white/70">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon: string
  title: string
  description: string
}

defineProps<Props>()
</script>
