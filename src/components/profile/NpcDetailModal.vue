<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" @click.self="$emit('close')">
    <section
      class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-emerald-900/40 bg-zinc-900 shadow-2xl"
      role="dialog"
      aria-modal="true"
      :aria-label="current.name"
    >
      <header class="sticky top-0 flex items-start justify-between gap-4 border-b border-zinc-800 bg-zinc-900/95 p-5 backdrop-blur">
        <div class="min-w-0">
          <h2 class="font-serif text-2xl font-bold text-white">{{ current.name }}</h2>
          <p class="mt-1 text-sm text-zinc-400">{{ identity }}</p>
        </div>
        <button type="button" class="text-2xl leading-none text-zinc-500 hover:text-white" aria-label="Fermer" @click="$emit('close')">×</button>
      </header>

      <NpcEditForm v-if="editingSheet" :npc="current" class="p-5" @saved="onSaved" @cancel="editingSheet = false" />
      <div v-else class="grid gap-5 p-5">
        <div class="grid grid-cols-3 gap-2 text-center sm:grid-cols-6">
          <div v-for="a in ABILITIES" :key="a.index" class="rounded-lg border border-zinc-800 bg-zinc-950/60 p-2">
            <div class="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{{ a.label }}</div>
            <div class="text-lg font-semibold text-zinc-100">{{ current.abilityScores?.[a.index] ?? '—' }}</div>
          </div>
        </div>

        <dl class="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <div v-for="f in fields" :key="f.label">
            <dt class="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{{ f.label }}</dt>
            <dd class="mt-0.5 text-zinc-200">{{ f.value }}</dd>
          </div>
        </dl>

        <div v-if="current.history">
          <h3 class="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Histoire</h3>
          <p class="mt-1 whitespace-pre-line text-sm text-zinc-300">{{ current.history }}</p>
        </div>

        <label class="ui-label">
          Notes du MJ
          <textarea v-model="notes" rows="4" class="ui-input" placeholder="Où les joueurs l'ont rencontré, ce qu'il sait…"></textarea>
        </label>
        <p v-if="error" class="text-sm text-red-300">{{ error }}</p>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="ui-btn-primary" :disabled="saving || notes === (current.notes ?? '')" @click="saveNotes">
            {{ saved ? 'Enregistré' : 'Enregistrer les notes' }}
          </button>
          <button type="button" class="ui-btn" @click="editingSheet = true">Modifier la fiche</button>
          <button v-if="deletable" type="button" class="ui-btn-danger ml-auto" @click="$emit('delete', current.id)">Supprimer le PNJ</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import NpcEditForm from '@/components/profile/NpcEditForm.vue'
import { useNpcStore } from '@/stores/npc'

// Depuis une campagne : pas de suppression (le PNJ sert peut-être ailleurs)
const props = withDefaults(defineProps<{ npc: any; deletable?: boolean }>(), { deletable: true })
const emit = defineEmits<{ (e: 'close'): void; (e: 'delete', id: number): void; (e: 'updated', npc: any): void }>()

const ABILITIES = [
  { index: 'str', label: 'For' }, { index: 'dex', label: 'Dex' }, { index: 'con', label: 'Con' },
  { index: 'int', label: 'Int' }, { index: 'wis', label: 'Sag' }, { index: 'cha', label: 'Cha' },
] as const
const GENDERS: Record<string, string> = { MALE: 'Homme', FEMALE: 'Femme', NON_BINARY: 'Non-binaire' }

const npcStore = useNpcStore()
// Fiche affichée : celle reçue, puis celle enregistrée après une modification
const current = ref(props.npc)
const editingSheet = ref(false)
const notes = ref(props.npc.notes ?? '')
const saving = ref(false)
const saved = ref(false)
const error = ref<string | null>(null)

// "Naine, guerrière, loyal bon"
const identity = computed(() => [
  current.value.names?.race ?? current.value.race,
  current.value.names?.class ?? 'roturier',
  current.value.names?.alignment?.replace(/\s*\([^)]*\)$/, '').toLowerCase(),
].filter(Boolean).join(' · '))

const fields = computed(() => {
  const n = current.value
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
    current.value = await npcStore.updateNpc(current.value, { notes: notes.value || null })
    emit('updated', current.value)
    saved.value = true
    setTimeout(() => (saved.value = false), 2000)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Enregistrement impossible.'
  } finally {
    saving.value = false
  }
}

function onSaved(updated: any) {
  current.value = updated
  editingSheet.value = false
  emit('updated', updated)
}
</script>
