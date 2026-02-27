<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { onMounted, computed } from 'vue';

const route = useRoute();
// On cache le bouton sur la home, login et register pour ne pas gêner
const showHomeButton = computed(() => {
  return !['/'].includes(route.path);
});

onMounted(() => {
    // Nettoyage temporaire des données corrompues si nécessaire
    try {
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            // Si l'utilisateur n'a pas de nom d'utilisateur (ancien format ou bug), on nettoie tout
            if (!userData.username && userData.name) {
                console.warn('Nettoyage des données localeStorage obsolètes...');
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                window.location.reload();
            }
        }
    } catch (e) {
        console.error('Erreur lors de la vérification du localStorage', e);
        localStorage.clear();
    }
});
</script>

<template>
  <RouterView />
  
  <router-link
    v-if="showHomeButton"
    to="/"
    class="fixed top-6 left-6 z-50 p-3 bg-zinc-900/90 text-amber-500 rounded-full hover:bg-zinc-800 hover:scale-110 hover:text-amber-400 transition-all border border-amber-500/30 shadow-lg shadow-black/50 backdrop-blur-sm group flex items-center justify-center print:hidden"
    title="Retour à l'accueil"
  >
  
    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 transition-transform group-hover:-translate-y-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  </router-link>
</template>

<style scoped>
</style>
