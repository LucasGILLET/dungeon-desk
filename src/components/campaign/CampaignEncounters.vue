<template>
  <section class="grid gap-4">
    <div class="flex items-center justify-between gap-3">
      <h2 class="font-serif text-2xl font-bold text-amber-200">Rencontres</h2>
      <button v-if="editing === null" type="button" class="ui-btn-primary" @click="edit()">+ Nouvelle rencontre</button>
    </div>
    <p class="text-sm text-zinc-500">
      Difficulté calculée d'après le niveau des personnages de la campagne
      <template v-if="campaign.partyLevels.length">({{ campaign.partyLevels.join(', ') }})</template><template v-else>(aucun personnage pour l'instant)</template>.
      Non visible des joueurs.
    </p>

    <form v-if="editing !== null" class="ui-panel grid gap-4" @submit.prevent="save">
      <h3 class="font-semibold text-zinc-100">{{ editing === 'new' ? 'Nouvelle rencontre' : 'Modifier la rencontre' }}</h3>
      <div class="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem_12rem]">
        <label class="ui-label">Nom<input v-model="form.name" required maxlength="200" class="ui-input" placeholder="Embuscade sur la route" /></label>
        <label class="ui-label">
          Séance
          <select v-model="form.sessionId" class="ui-input">
            <option :value="null">—</option>
            <option v-for="s in campaign.sessions" :key="s.id" :value="s.id">Séance {{ s.number }}{{ s.title ? ` · ${s.title}` : '' }}</option>
          </select>
        </label>
        <label class="ui-label">
          Statut
          <select v-model="form.status" class="ui-input">
            <option value="PLANNED">Prévue</option>
            <option value="DONE">Jouée</option>
          </select>
        </label>
      </div>

      <div class="grid gap-2">
        <span class="text-sm text-zinc-400">Monstres</span>
        <div v-for="(row, i) in form.monsters" :key="row.monster" class="flex items-center gap-2">
          <input v-model.number="row.count" type="number" min="1" max="100" class="ui-input w-20" :aria-label="`Nombre de ${nameOf(row.monster)}`" />
          <span class="flex-1 text-sm text-zinc-200">{{ nameOf(row.monster) }} <span class="text-zinc-500">· FP {{ crOf(row.monster) }}</span></span>
          <button type="button" class="ui-btn-danger" @click="form.monsters.splice(i, 1)">Retirer</button>
        </div>
        <div class="relative">
          <input v-model="search" type="search" class="ui-input" placeholder="Ajouter un monstre du bestiaire…" aria-label="Rechercher un monstre" />
          <ul v-if="matches.length" class="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-white/10 bg-zinc-900 shadow-xl">
            <li v-for="m in matches" :key="m.index">
              <button type="button" class="flex w-full justify-between px-3 py-2 text-left text-sm hover:bg-white/10" @click="addMonster(m.index)">
                <span>{{ m.name }}<span v-if="m.source === 'HOMEBREW'" class="ml-2 text-xs text-violet-300">maison</span></span>
                <span class="text-zinc-500">FP {{ formatChallenge(m.challengeRating) }}</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      <label class="ui-label">Description (Markdown)<textarea v-model="form.description" rows="4" class="ui-input"></textarea></label>
      <FormActions :busy="busy" :error="error" :can-delete="editing !== 'new'" @cancel="editing = null" @delete="remove" />
    </form>

    <p v-if="!campaign.encounters.length && editing === null" class="text-sm text-zinc-500">Aucune rencontre préparée.</p>

    <article v-for="e in campaign.encounters" :key="e.id" class="ui-panel" :class="{ 'opacity-60': e.status === 'DONE' }">
      <header class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 class="text-lg font-semibold text-zinc-100">{{ e.name }}</h3>
          <p class="text-xs text-zinc-500">
            {{ e.status === 'DONE' ? 'Jouée' : 'Prévue' }}<template v-if="sessionOf(e.sessionId)"> · séance {{ sessionOf(e.sessionId)!.number }}</template>
          </p>
        </div>
        <div class="flex items-center gap-2">
          <span v-if="e.evaluation.difficulty" class="rounded-full border px-3 py-1 text-xs font-semibold" :class="DIFFICULTY_CLASSES[e.evaluation.difficulty]">
            {{ ENCOUNTER_DIFFICULTY_LABELS[e.evaluation.difficulty] }}
          </span>
          <button type="button" class="ui-btn" @click="edit(e)">Modifier</button>
        </div>
      </header>
      <ul class="mt-3 flex flex-wrap gap-2 text-sm">
        <li v-for="m in e.monsters" :key="m.index">
          <router-link :to="{ name: m.homebrew ? 'homebrew-monster' : 'monster-view', params: { index: m.index } }" class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-zinc-200 hover:border-amber-500/40">
            {{ m.count }} × {{ m.name }} <span class="text-zinc-500">(FP {{ formatChallenge(m.challengeRating) }})</span>
          </router-link>
        </li>
      </ul>
      <p class="mt-3 text-xs text-zinc-400">
        {{ e.evaluation.totalXp.toLocaleString('fr-FR') }} PX à partager
        · XP ajustée {{ e.evaluation.adjustedXp.toLocaleString('fr-FR') }} (×{{ String(e.evaluation.multiplier).replace('.', ',') }})
        <template v-if="e.evaluation.thresholds">
          · seuils : facile {{ e.evaluation.thresholds.easy }}, moyenne {{ e.evaluation.thresholds.medium }}, difficile {{ e.evaluation.thresholds.hard }}, mortelle {{ e.evaluation.thresholds.deadly }}
        </template>
      </p>
      <MarkdownText v-if="e.description" :text="e.description" class="mt-3 text-sm text-zinc-300" />
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import MarkdownText from '@/components/MarkdownText.vue'
import FormActions from '@/components/campaign/FormActions.vue'
import { useCampaignItemForm } from '@/composables/useCampaignItemForm'
import { ENCOUNTER_DIFFICULTY_LABELS, type Campaign, type Encounter, type EncounterDifficulty } from '@/api/campaigns'
import { monstersApi } from '@/api/monsters'
import { loadMonsters, type ApiMonsterSummary } from '@/utils/dataLoader'
import { formatChallenge } from '@/utils/monsterFormat'

const props = defineProps<{ campaign: Campaign }>()
const emit = defineEmits<{ (e: 'changed'): void }>()

const DIFFICULTY_CLASSES: Record<EncounterDifficulty, string> = {
  TRIVIAL: 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300',
  EASY: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  MEDIUM: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  HARD: 'border-orange-500/30 bg-orange-500/10 text-orange-200',
  DEADLY: 'border-red-500/30 bg-red-500/10 text-red-200',
}

const monsters = ref<ApiMonsterSummary[]>([])
const search = ref('')
const form = reactive({ name: '', description: '', status: 'PLANNED' as 'PLANNED' | 'DONE', sessionId: null as number | null, monsters: [] as { monster: string; count: number }[] })
const { editing, busy, error, open, submit, remove } = useCampaignItemForm(() => props.campaign.id, 'encounters', () => emit('changed'), 'Supprimer cette rencontre ?')

const byIndex = computed(() => new Map(monsters.value.map((m) => [m.index, m])))
const nameOf = (index: string) => byIndex.value.get(index)?.name ?? index
const crOf = (index: string) => formatChallenge(byIndex.value.get(index)?.challengeRating ?? 0)
const sessionOf = (id: number | null) => props.campaign.sessions.find((s) => s.id === id)

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const matches = computed(() => {
  const query = normalize(search.value.trim())
  if (query.length < 2) return []
  return monsters.value.filter((m) => normalize(m.name).includes(query) && !form.monsters.some((r) => r.monster === m.index)).slice(0, 12)
})

function addMonster(index: string) {
  form.monsters.push({ monster: index, count: 1 })
  search.value = ''
}

function edit(e?: Encounter) {
  Object.assign(form, e
    ? { name: e.name, description: e.description ?? '', status: e.status, sessionId: e.sessionId, monsters: e.monsters.map((m) => ({ monster: m.index, count: m.count })) }
    : { name: '', description: '', status: 'PLANNED', sessionId: null, monsters: [] })
  search.value = ''
  open(e?.id)
}

const save = () => submit({
  name: form.name.trim(), description: form.description || null, status: form.status, sessionId: form.sessionId,
  monsters: form.monsters.filter((m) => m.count > 0),
})

onMounted(async () => {
  // Monstres maison du MJ d'abord, puis le bestiaire du SRD
  const [mine, srd] = await Promise.all([monstersApi.list().catch(() => []), loadMonsters()])
  monsters.value = [...mine, ...srd]
})
</script>
