<template>
  <div class="grid gap-2">
    <p v-if="error" class="text-sm text-red-300">{{ error }}</p>
    <div class="flex flex-wrap gap-2">
      <button type="submit" class="ui-btn-primary" :disabled="busy">Enregistrer</button>
      <button type="button" class="ui-btn" @click="$emit('cancel')">Annuler</button>
      <button v-if="canDelete" type="button" class="ui-btn-danger ml-auto" @click="$emit('delete')">Supprimer</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ busy: boolean; error: string | null; canDelete?: boolean }>()
defineEmits<{ (e: 'cancel'): void; (e: 'delete'): void }>()
</script>
