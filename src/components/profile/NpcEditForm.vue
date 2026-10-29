<template>
  <form class="grid gap-5" @submit.prevent="save">
    <p v-if="!races.length" class="text-sm text-zinc-500">Chargement…</p>
    <template v-else>
      <div class="flex flex-wrap items-end gap-2">
        <label class="ui-label min-w-0 flex-1">Nom<input v-model="form.name" required maxlength="200" class="ui-input" @input="nameEdited" /></label>
        <!-- Nouveau nom généré selon la race et le genre choisis -->
        <button type="button" class="ui-btn" @click="newName">Autre nom</button>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <label class="ui-label">
          Race
          <select v-model="form.race" required class="ui-input" @change="form.subrace = null">
            <option v-for="r in races" :key="r.index" :value="r.index">{{ r.name }}</option>
          </select>
        </label>
        <label v-if="subraces.length" class="ui-label">
          Sous-race
          <select v-model="form.subrace" class="ui-input">
            <option :value="null">—</option>
            <option v-for="s in subraces" :key="s.index" :value="s.index">{{ s.name }}</option>
          </select>
        </label>
        <label class="ui-label">
          Classe
          <select v-model="form.class" class="ui-input">
            <option :value="null">Aucune (roturier)</option>
            <option v-for="c in classes" :key="c.index" :value="c.index">{{ c.name }}</option>
          </select>
        </label>
        <label class="ui-label">
          Alignement
          <select v-model="form.alignment" class="ui-input">
            <option :value="null">—</option>
            <option v-for="a in alignments" :key="a.index" :value="a.index">{{ a.name }}</option>
          </select>
        </label>
        <label class="ui-label">
          Genre
          <select v-model="form.gender" class="ui-input">
            <option :value="null">—</option>
            <option v-for="g in GENDERS" :key="g.code" :value="g.code">{{ g.label }}</option>
          </select>
        </label>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <label class="ui-label">Âge<input v-model.number="form.age" type="number" min="0" max="10000" class="ui-input" /></label>
        <label class="ui-label">Taille (cm)<input v-model.number="form.heightCm" type="number" min="1" max="2000" class="ui-input" /></label>
        <label class="ui-label">Poids (kg)<input v-model.number="form.weightKg" type="number" min="1" max="100000" class="ui-input" /></label>
      </div>

      <fieldset>
        <legend class="ui-label mb-2">Caractéristiques</legend>
        <div class="grid grid-cols-3 gap-2 sm:grid-cols-6">
          <label v-for="a in ABILITIES" :key="a.index" class="ui-label text-center">
            {{ a.label }}
            <input v-model.number="form.abilityScores[a.index]" type="number" min="1" max="30" class="ui-input text-center" />
          </label>
        </div>
      </fieldset>

      <div class="grid gap-4 sm:grid-cols-2">
        <label v-for="f in TEXT_FIELDS" :key="f.key" class="ui-label">
          {{ f.label }}<input v-model="form[f.key]" maxlength="500" class="ui-input" />
        </label>
      </div>
      <label class="ui-label">Histoire<textarea v-model="form.history" rows="4" maxlength="20000" class="ui-input"></textarea></label>

      <p v-if="error" class="text-sm text-red-300" role="alert">{{ error }}</p>
      <div class="flex flex-wrap gap-2">
        <button type="submit" class="ui-btn-primary" :disabled="saving">{{ saving ? 'Enregistrement…' : 'Enregistrer' }}</button>
        <button type="button" class="ui-btn" @click="$emit('cancel')">Annuler</button>
      </div>
    </template>
  </form>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { GENDERS, type GenderCode } from '@/utils/npcGenerator'
import { generateNpcName } from '@/utils/npcNames'
import { loadAlignments, loadApiRaces, loadClassRefs, type Ref as GameRef } from '@/utils/dataLoader'
import { useNpcStore } from '@/stores/npc'

const props = defineProps<{ npc: any }>()
const emit = defineEmits<{ (e: 'saved', npc: any): void; (e: 'cancel'): void }>()

const ABILITIES = [
  { index: 'str', label: 'For' }, { index: 'dex', label: 'Dex' }, { index: 'con', label: 'Con' },
  { index: 'int', label: 'Int' }, { index: 'wis', label: 'Sag' }, { index: 'cha', label: 'Cha' },
] as const
const TEXT_FIELDS = [
  { key: 'profession', label: 'Métier' }, { key: 'socialStatus', label: 'Statut social' },
  { key: 'bodyType', label: 'Silhouette' }, { key: 'relations', label: 'Relations' },
  { key: 'personality', label: 'Personnalité' }, { key: 'motivation', label: 'Motivation' },
  { key: 'quirk', label: 'Manie' },
] as const

const npcStore = useNpcStore()
const races = ref<(GameRef & { subraces: GameRef[] })[]>([])
const classes = ref<GameRef[]>([])
const alignments = ref<GameRef[]>([])
const saving = ref(false)
const error = ref<string | null>(null)

const n = props.npc
const form = reactive({
  name: n.name as string,
  firstName: n.firstName as string | null,
  lastName: n.lastName as string | null,
  race: n.race as string,
  subrace: n.subrace as string | null,
  class: n.class as string | null,
  alignment: n.alignment as string | null,
  gender: n.gender as GenderCode | null,
  age: n.age as number | '' | null,
  heightCm: n.heightCm as number | '' | null,
  weightKg: n.weightKg as number | '' | null,
  abilityScores: Object.fromEntries(ABILITIES.map((a) => [a.index, n.abilityScores?.[a.index] ?? 10])) as Record<string, number | ''>,
  profession: n.profession ?? '', socialStatus: n.socialStatus ?? '', bodyType: n.bodyType ?? '', relations: n.relations ?? '',
  personality: n.personality ?? '', motivation: n.motivation ?? '', quirk: n.quirk ?? '',
  history: n.history ?? '',
})

const subraces = computed(() => races.value.find((r) => r.index === form.race)?.subraces ?? [])

// Nom saisi à la main : prénom et nom de famille ne le décrivent plus
function nameEdited() {
  form.firstName = null
  form.lastName = null
}
function newName() {
  const name = generateNpcName(form.race, form.gender ?? 'NON_BINARY')
  Object.assign(form, { name: name.fullName, firstName: name.firstName, lastName: name.lastName || null })
}

// Champ numérique vidé : valeur absente
const num = (v: number | '' | null) => (typeof v === 'number' && !Number.isNaN(v) ? v : null)
const txt = (v: string) => v.trim() || null

async function save() {
  saving.value = true
  error.value = null
  try {
    const updated = await npcStore.updateNpc(props.npc, {
      name: form.name.trim(), firstName: form.firstName, lastName: form.lastName,
      race: form.race, subrace: form.subrace, class: form.class, alignment: form.alignment, gender: form.gender,
      age: num(form.age), heightCm: num(form.heightCm), weightKg: num(form.weightKg),
      abilityScores: Object.fromEntries(Object.entries(form.abilityScores).flatMap(([k, v]) => (num(v) != null ? [[k, num(v)!]] : []))),
      profession: txt(form.profession), socialStatus: txt(form.socialStatus), bodyType: txt(form.bodyType), relations: txt(form.relations),
      personality: txt(form.personality), motivation: txt(form.motivation), quirk: txt(form.quirk),
      history: form.history.trim() || null,
    })
    emit('saved', updated)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Enregistrement impossible.'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  const [r, c, a] = await Promise.all([loadApiRaces(), loadClassRefs(), loadAlignments()])
  races.value = r
  classes.value = c
  alignments.value = a
})
</script>
