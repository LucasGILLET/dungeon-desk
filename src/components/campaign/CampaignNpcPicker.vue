<template>
  <fieldset class="grid gap-2">
    <legend class="ui-label mb-2">{{ label }}</legend>
    <p v-if="!npcs.length" class="text-xs text-zinc-500">Ajoutez d'abord des PNJ à la campagne (onglet PNJ).</p>
    <div v-else class="flex flex-wrap gap-2">
      <label
        v-for="n in npcs" :key="n.id"
        :class="['cursor-pointer rounded-full border px-3 py-1 text-sm transition has-focus-visible:ring-2 has-focus-visible:ring-emerald-500',
                 model.includes(n.id) ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-100' : 'border-zinc-700 text-zinc-400 hover:text-zinc-200']"
      >
        <input v-model="model" type="checkbox" :value="n.id" class="sr-only" />{{ n.name }}
      </label>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import type { CampaignNpc } from '@/api/campaigns'

// PNJ de la campagne liés à une séance ou une quête (id de CampaignNpc)
defineProps<{ npcs: CampaignNpc[]; label: string }>()
const model = defineModel<number[]>({ required: true })
</script>
