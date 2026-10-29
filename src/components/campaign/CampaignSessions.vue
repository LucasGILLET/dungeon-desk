<template>
  <section class="grid gap-4">
    <div class="flex items-center justify-between gap-3">
      <h2 class="font-serif text-2xl font-bold text-amber-200">Journal des séances</h2>
      <button v-if="isGm && editing === null" type="button" class="ui-btn-primary" @click="edit()">+ Nouvelle séance</button>
    </div>

    <!-- Formulaire unique : nouvelle séance ou séance modifiée -->
    <form v-if="editing !== null" class="ui-panel grid gap-4" @submit.prevent="save">
      <h3 class="font-semibold text-zinc-100">{{ editing === 'new' ? 'Nouvelle séance' : `Modifier la séance ${form.number}` }}</h3>
      <div class="grid gap-4 sm:grid-cols-[8rem_12rem_minmax(0,1fr)]">
        <label class="ui-label">Numéro<input v-model.number="form.number" type="number" min="1" required class="ui-input" /></label>
        <label class="ui-label">Date<input v-model="form.playedOn" type="date" class="ui-input" /></label>
        <label class="ui-label">Titre<input v-model="form.title" maxlength="500" class="ui-input" placeholder="L'embuscade gobeline" /></label>
      </div>
      <label class="ui-label">Résumé (Markdown, visible des joueurs)<textarea v-model="form.summary" rows="6" class="ui-input"></textarea></label>
      <label class="ui-label">Notes du MJ (privées)<textarea v-model="form.gmNotes" rows="4" class="ui-input"></textarea></label>
      <CampaignNpcPicker v-model="form.campaignNpcIds" :npcs="campaign.npcs" label="PNJ rencontrés (privé)" />
      <FormActions :busy="busy" :error="error" :can-delete="editing !== 'new'" @cancel="editing = null" @delete="remove" />
    </form>

    <p v-if="!campaign.sessions.length && editing === null" class="text-sm text-zinc-500">Aucune séance pour l'instant.</p>

    <article v-for="s in sessionsDesc" :key="s.id" class="ui-panel">
      <header class="flex flex-wrap items-baseline justify-between gap-2">
        <h3 class="text-lg font-semibold text-zinc-100">
          Séance {{ s.number }}<span v-if="s.title"> · {{ s.title }}</span>
        </h3>
        <div class="flex items-center gap-3 text-xs text-zinc-500">
          <span v-if="s.playedOn">{{ formatDate(s.playedOn) }}</span>
          <button v-if="isGm" type="button" class="ui-btn" @click="edit(s)">Modifier</button>
        </div>
      </header>
      <MarkdownText v-if="s.summary" :text="s.summary" class="mt-3 text-zinc-300" />
      <p v-if="npcNames(s.campaignNpcIds)" class="mt-3 text-xs text-zinc-400">PNJ rencontrés : {{ npcNames(s.campaignNpcIds) }}</p>
      <div v-if="isGm && s.gmNotes" class="mt-4 rounded-2xl border border-red-900/40 bg-red-950/20 p-4">
        <p class="mb-2 text-[10px] uppercase tracking-[0.25em] text-red-300/70">Notes du MJ (privées)</p>
        <MarkdownText :text="s.gmNotes" class="text-sm text-zinc-300" />
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import MarkdownText from '@/components/MarkdownText.vue'
import CampaignNpcPicker from '@/components/campaign/CampaignNpcPicker.vue'
import FormActions from '@/components/campaign/FormActions.vue'
import { useCampaignItemForm } from '@/composables/useCampaignItemForm'
import { campaignNpcNames, type Campaign, type CampaignSession } from '@/api/campaigns'

const props = defineProps<{ campaign: Campaign }>()
const emit = defineEmits<{ (e: 'changed'): void }>()

const isGm = computed(() => props.campaign.role === 'GM')
// Plus récente en premier
const sessionsDesc = computed(() => [...props.campaign.sessions].sort((a, b) => b.number - a.number))
const form = reactive({ number: 1, playedOn: '', title: '', summary: '', gmNotes: '', campaignNpcIds: [] as number[] })
const npcNames = (ids: number[]) => campaignNpcNames(props.campaign, ids)
const { editing, busy, error, open, submit, remove } = useCampaignItemForm(() => props.campaign.id, 'sessions', () => emit('changed'), 'Supprimer cette séance ?')

const formatDate = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

function edit(s?: CampaignSession) {
  const next = Math.max(0, ...props.campaign.sessions.map((x) => x.number)) + 1
  Object.assign(form, s
    ? { number: s.number, playedOn: s.playedOn ?? '', title: s.title ?? '', summary: s.summary ?? '', gmNotes: s.gmNotes ?? '', campaignNpcIds: [...s.campaignNpcIds] }
    : { number: next, playedOn: new Date().toISOString().slice(0, 10), title: '', summary: '', gmNotes: '', campaignNpcIds: [] })
  open(s?.id)
}

const save = () => submit({
  number: form.number, playedOn: form.playedOn || null, title: form.title.trim() || null, summary: form.summary || null, gmNotes: form.gmNotes || null,
  campaignNpcIds: form.campaignNpcIds,
})
</script>
