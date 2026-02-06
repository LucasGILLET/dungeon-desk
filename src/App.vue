<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue';

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
</template>

<style scoped>
</style>
