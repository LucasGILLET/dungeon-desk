<script setup lang="ts">
import { computed } from 'vue';

// Un champ traduisible : anglais (référence) et français côte à côte
const props = defineProps<{
  label: string;
  multiline?: boolean;
  required?: boolean;
  readonlyReference?: boolean;
}>();

const en = defineModel<string | null>('en', { default: null });
const fr = defineModel<string | null>('fr', { default: null });

const status = computed(() => {
  if (!fr.value?.trim()) return en.value?.trim() ? 'missing' : null;
  if (props.multiline && fr.value.trim() === en.value?.trim()) return 'identical';
  return null;
});

const inputClass =
  'w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all';
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
    <label class="block">
      <span class="block text-xs font-medium text-zinc-500 mb-1">{{ label }} · anglais</span>
      <textarea v-if="multiline" v-model="en" rows="4" :class="inputClass" :readonly="readonlyReference" data-locale="en" />
      <input v-else v-model="en" :class="inputClass" :readonly="readonlyReference" data-locale="en" />
    </label>
    <label class="block">
      <span class="flex items-center gap-2 text-xs font-medium text-zinc-400 mb-1">
        {{ label }} · français<span v-if="required" class="text-violet-400">*</span>
        <span v-if="status === 'missing'" class="px-1.5 py-0.5 rounded bg-amber-900/40 text-amber-300 border border-amber-800/50" data-status="missing">à traduire</span>
        <span v-else-if="status === 'identical'" class="px-1.5 py-0.5 rounded bg-amber-900/40 text-amber-300 border border-amber-800/50" data-status="identical">identique à l'anglais</span>
      </span>
      <textarea v-if="multiline" v-model="fr" rows="4" :class="inputClass" data-locale="fr" />
      <input v-else v-model="fr" :class="inputClass" data-locale="fr" />
    </label>
  </div>
</template>
