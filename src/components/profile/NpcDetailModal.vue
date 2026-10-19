<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" @click.self="$emit('close')">
    <section
      class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-emerald-900/40 bg-zinc-900 shadow-2xl"
      role="dialog"
      aria-modal="true"
      :aria-label="npc.name"
    >
      <header class="sticky top-0 flex items-start justify-between gap-4 border-b border-zinc-800 bg-zinc-900/95 p-5 backdrop-blur">
        <div class="min-w-0">
          <h2 class="font-serif text-2xl font-bold text-white">{{ npc.name }}</h2>
          <p class="mt-1 text-sm text-zinc-400">{{ identity }}</p>
        </div>
        <button type="button" class="text-2xl leading-none text-zinc-500 hover:text-white" aria-label="Fermer" @click="$emit('close')">×</button>
      </header>

      <div class="grid gap-5 p-5">
        <div class="grid grid-cols-3 gap-2 text-center sm:grid-cols-6">
          <div v-for="a in ABILITIES" :key="a.index" class="rounded-lg border border-zinc-800 bg-zinc-950/60 p-2">
            <div class="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{{ a.label }}</div>
            <div class="text-lg font-semibold text-zinc-100">{{ npc.abilityScores?.[a.index] ?? '—' }}</div>
          </div>
        </div>

        <dl class="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <div v-for="f in fields" :key="f.label">
            <dt class="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{{ f.label }}</dt>
            <dd class="mt-0.5 text-zinc-200">{{ f.value }}</dd>
          </div>
        </dl>

        <div v-if="npc.history">
          <h3 class="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Histoire</h3>
          <p class="mt-1 whitespace-pre-line text-sm text-zinc-300">{{ npc.history }}</p>
        </div>

        <label class="ui-label">
          Notes du MJ
          <textarea v-model="notes" rows="4" class="ui-input" placeholder="Où les joueurs l'ont rencontré, ce qu'il sait…"></textarea>
        </label>
        <p v-if="error" class="text-sm text-red-300">{{ error }}</p>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="ui-btn-primary" :disabled="saving || notes === (npc.notes ?? '')" @click="saveNotes">
            {{ saved ? 'Enregistré' : 'Enregistrer les notes' }}
          </button>
          <button type="button" class="ui-btn-danger ml-auto" @click="$emit('delete', npc.id)">Supprimer le PNJ</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useNpcStore } from '@/stores/npc'

const props = defineProps<{ npc: any }>()
defineEmits<{ (e: 'close'): void; (e: 'delete', id: number): void }>()

const ABILITIES = [
  { index: 'str', label: 'For' }, { index: 'dex', label: 'Dex' }, { index: 'con', label: 'Con' },
  { index: 'int', label: 'Int' }, { index: 'wis', label: 'Sag' }, { index: 'cha', label: 'Cha' },
] as const
const GENDERS: Record<string, string> = { MALE: 'Homme', FEMALE: 'Femme', NON_BINARY: 'Non-binaire' }

const npcStore = useNpcStore()
const notes = ref(props.npc.notes ?? '')
const saving = ref(false)
const saved = ref(false)
const error = ref<string | null>(null)

// "Naine, guerrière, loyal bon"
const identity = computed(() => [
  props.npc.names?.race ?? props.npc.race,
  props.npc.names?.class ?? 'roturier',
  props.npc.names?.alignment?.replace(/\s*\([^)]*\)$/, '').toLowerCase(),
].filter(Boolean).join(' · '))

const fields = computed(() => {
  const n = props.npc
  return [
    { label: 'Genre', value: GENDERS[n.gender] },
    { label: 'Âge', value: n.age != null ? `${n.age} ans` : null },
    { label: 'Taille', value: n.heightCm ? `${n.heightCm} cm` : null },
    { label: 'Poids', value: n.weightKg ? `${n.weightKg} kg` : null },
    { label: 'Silhouette', value: n.bodyType },
    { label: 'Métier', value: n.profession },
    { label: 'Statut social', value: n.socialStatus },
    { label: 'Relations', value: n.relations },
    { label: 'Personnalité', value: n.personality },
    { label: 'Motivation', value: n.motivation },
    { label: 'Manie', value: n.quirk },
  ].filter((f) => f.value)
})

async function saveNotes() {
  saving.value = true
  error.value = null
  try {
    await npcStore.updateNpc(props.npc, { notes: notes.value || null })
    saved.value = true
    setTimeout(() => (saved.value = false), 2000)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Enregistrement impossible.'
  } finally {
    saving.value = false
  }
}
</script>
