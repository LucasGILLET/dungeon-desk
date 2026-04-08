<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { computed, onBeforeUnmount, onMounted } from 'vue'
import DiceRollerPanel from '@/components/DiceRollerPanel.vue'
import DiceRollerTrigger from '@/components/DiceRollerTrigger.vue'
import { openDiceRoller } from '@/composables/useDiceRoller'

const route = useRoute()
// On masque le bouton home sur les vues où il gêne les contrôles principaux.
const showHomeButton = computed(() => {
  return !['/'].includes(route.path)
})

function handleGlobalKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  const isTypingField = Boolean(target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) || target?.isContentEditable

  if (event.key === 'Escape') {
    return
  }

  if (isTypingField) {
    return
  }

  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'r') {
    event.preventDefault()
    openDiceRoller()
  }
}

onMounted(() => {
    // Nettoyage des anciennes données d'authentification
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    window.addEventListener('keydown', handleGlobalKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<template>
  <RouterView />
  <DiceRollerPanel />
  
  <router-link
    v-if="showHomeButton"
    to="/"
    class="fixed left-3 bottom-20 sm:bottom-auto sm:top-6 sm:left-6 z-50 p-3 bg-zinc-900/90 text-amber-500 rounded-full hover:bg-zinc-800 hover:scale-110 hover:text-amber-400 transition-all border border-amber-500/30 shadow-lg shadow-black/50 backdrop-blur-sm group flex items-center justify-center print:hidden"
    title="Retour à l'accueil"
  >
  
    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 transition-transform group-hover:-translate-y-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  </router-link>

  <DiceRollerTrigger />
</template>

<style scoped>
</style>
