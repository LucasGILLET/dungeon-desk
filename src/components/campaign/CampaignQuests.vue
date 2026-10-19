<template>
  <section class="grid gap-4">
    <div class="flex items-center justify-between gap-3">
      <h2 class="font-serif text-2xl font-bold text-amber-200">Quêtes</h2>
      <button v-if="isGm && editing === null" type="button" class="ui-btn-primary" @click="edit()">+ Nouvelle quête</button>
    </div>
    <p v-if="!isGm" class="text-sm text-zinc-500">Seules les quêtes révélées par le MJ apparaissent ici.</p>

    <form v-if="editing !== null" class="ui-panel grid gap-4" @submit.prevent="save">
      <h3 class="font-semibold text-zinc-100">{{ editing === 'new' ? 'Nouvelle quête' : 'Modifier la quête' }}</h3>
      <label class="ui-label">Titre<input v-model="form.title" required maxlength="200" class="ui-input" /></label>
      <div class="grid gap-4 sm:grid-cols-3">
        <label class="ui-label">
          Statut
          <select v-model="form.status" class="ui-input">
            <option v-for="(label, value) in QUEST_STATUS_LABELS" :key="value" :value="value">{{ label }}</option>
          </select>
        </label>
        <label class="ui-label">
          Difficulté
          <select v-model="form.difficulty" class="ui-input">
            <option value="">—</option>
            <option v-for="(label, value) in QUEST_DIFFICULTY_LABELS" :key="value" :value="value">{{ label }}</option>
          </select>
        </label>
        <label class="ui-label">
          Donneur de quête
          <select v-model="form.giverNpcId" class="ui-input">
            <option :value="null">—</option>
            <option v-for="n in campaign.npcs" :key="n.npcId" :value="n.npcId">{{ n.name }}</option>
          </select>
        </label>
      </div>
      <label class="ui-label">Récompense<input v-model="form.reward" maxlength="500" class="ui-input" placeholder="500 po et une épée +1" /></label>
      <label class="ui-label">Description (Markdown)<textarea v-model="form.description" rows="5" class="ui-input"></textarea></label>
      <label class="flex items-center gap-2 text-sm text-zinc-300">
        <input v-model="form.revealed" type="checkbox" class="accent-amber-500" /> Révélée aux joueurs
      </label>
      <FormActions :busy="busy" :error="error" :can-delete="editing !== 'new'" @cancel="editing = null" @delete="remove" />
    </form>

    <p v-if="!campaign.quests.length && editing === null" class="text-sm text-zinc-500">Aucune quête pour l'instant.</p>

    <div class="grid gap-4 md:grid-cols-2">
      <article v-for="q in campaign.quests" :key="q.id" class="ui-panel" :class="{ 'opacity-60': q.status === 'COMPLETED' || q.status === 'FAILED' }">
        <header class="flex items-start justify-between gap-3">
          <h3 class="text-lg font-semibold text-zinc-100">{{ q.title }}</h3>
          <button v-if="isGm" type="button" class="ui-btn shrink-0" @click="edit(q)">Modifier</button>
        </header>
        <div class="mt-2 flex flex-wrap gap-2 text-xs">
          <span class="rounded-full border px-2.5 py-0.5" :class="STATUS_CLASSES[q.status]">{{ QUEST_STATUS_LABELS[q.status] }}</span>
          <span v-if="q.difficulty" class="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-zinc-300">{{ QUEST_DIFFICULTY_LABELS[q.difficulty] }}</span>
          <span v-if="isGm" class="rounded-full border px-2.5 py-0.5" :class="q.revealed ? 'border-sky-500/30 text-sky-200' : 'border-zinc-600 text-zinc-400'">
            {{ q.revealed ? 'Visible des joueurs' : 'Cachée aux joueurs' }}
          </span>
        </div>
        <MarkdownText v-if="q.description" :text="q.description" class="mt-3 text-sm text-zinc-300" />
        <p v-if="q.giver || q.reward" class="mt-3 text-xs text-zinc-400">
          <span v-if="q.giver">Confiée par {{ q.giver.name }}</span><span v-if="q.giver && q.reward"> · </span>
          <span v-if="q.reward">Récompense : {{ q.reward }}</span>
        </p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import MarkdownText from '@/components/MarkdownText.vue'
import FormActions from '@/components/campaign/FormActions.vue'
import { useCampaignItemForm } from '@/composables/useCampaignItemForm'
import { QUEST_DIFFICULTY_LABELS, QUEST_STATUS_LABELS, type Campaign, type Quest, type QuestDifficulty, type QuestStatus } from '@/api/campaigns'

const props = defineProps<{ campaign: Campaign }>()
const emit = defineEmits<{ (e: 'changed'): void }>()

const STATUS_CLASSES: Record<QuestStatus, string> = {
  ACTIVE: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  COMPLETED: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  FAILED: 'border-red-500/30 bg-red-500/10 text-red-200',
  PAUSED: 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300',
}

const isGm = computed(() => props.campaign.role === 'GM')
const form = reactive({
  title: '', description: '', status: 'ACTIVE' as QuestStatus, difficulty: '' as QuestDifficulty | '', reward: '', giverNpcId: null as number | null, revealed: false,
})
const { editing, busy, error, open, submit, remove } = useCampaignItemForm(() => props.campaign.id, 'quests', () => emit('changed'), 'Supprimer cette quête ?')

function edit(q?: Quest) {
  Object.assign(form, q
    ? { title: q.title, description: q.description ?? '', status: q.status, difficulty: q.difficulty ?? '', reward: q.reward ?? '', giverNpcId: q.giver?.id ?? null, revealed: q.revealed }
    : { title: '', description: '', status: 'ACTIVE', difficulty: '', reward: '', giverNpcId: null, revealed: false })
  open(q?.id)
}

const save = () => submit({
  title: form.title.trim(), description: form.description || null, status: form.status, difficulty: form.difficulty || null,
  reward: form.reward.trim() || null, giverNpcId: form.giverNpcId, revealed: form.revealed,
})
</script>
