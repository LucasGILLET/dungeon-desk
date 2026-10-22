<template>
  <!-- Composant propre à la route : passer d'une fiche partagée à sa copie
       (/character/:id) recrée la fiche au lieu de réutiliser l'instance -->
  <CharacterSheetView />
</template>

<script setup lang="ts">
import CharacterSheetView from '@/views/CharacterSheetView.vue'
</script>
