<template>
  <div class="flex flex-col h-full bg-zinc-950">
    <!-- Contenu défilable -->
    <div class="mb-24 flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8">
      <div class="max-w-6xl mx-auto space-y-10">

        <!-- En-tête -->
        <div class="text-center relative z-10 shrink-0">
          <h2 class="text-3xl sm:text-4xl font-bold font-serif text-white mb-0 drop-shadow-md">Vos choix</h2>
          <p class="text-zinc-400 text-lg max-w-2xl mx-auto font-light mt-2">
            Votre race, votre historique et votre classe vous laissent quelques décisions : compétences, langues, équipement, talents.
          </p>
          <div class="mt-4 flex justify-center">
            <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-700 bg-zinc-900 text-zinc-400 text-xs uppercase tracking-widest shadow-sm">
              {{ character.race?.name }} • {{ character.class?.name }}{{ character.subclass?.name ? ` • ${character.subclass.name}` : '' }}
            </span>
          </div>
        </div>

        <!-- Chargement / erreur -->
        <div v-if="!preview && loading" class="flex justify-center py-20">
          <div class="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
        </div>
        <div v-else-if="loadError" class="p-6 rounded-xl border border-red-900/50 bg-red-950/30 text-red-300 text-center">
          Impossible de charger les choix : {{ loadError }}
          <button class="block mx-auto mt-3 text-sm underline" @click="refresh">Réessayer</button>
        </div>

        <!-- Aucun choix -->
        <div v-else-if="preview && !visibleChoices.length" class="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
          <div class="text-5xl mb-6 opacity-30 grayscale">✨</div>
          <h3 class="text-2xl font-serif text-zinc-300 mb-2">Aucun choix requis</h3>
          <p class="text-zinc-500 text-center max-w-md">Votre combinaison ne demande aucune décision supplémentaire.</p>
        </div>

        <!-- Choix -->
        <div v-else-if="preview" class="space-y-10 pb-12" :class="{ 'opacity-70 transition-opacity': loading }">
          <section
            v-for="choice in visibleChoices"
            :key="choice.id"
            class="animate-fade-in-up"
            :class="choice.parentOptionId ? 'ml-4 sm:ml-8 pl-4 sm:pl-6 border-l-2 border-amber-900/40' : ''"
          >
            <!-- En-tête du choix -->
            <div class="flex flex-col md:flex-row md:items-end justify-between mb-4 gap-3 border-b border-zinc-800 pb-3">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  {{ sourceLabel(choice) }}
                </span>
                <h3 class="text-xl sm:text-2xl font-bold font-serif text-amber-500">{{ title(choice) }}</h3>
                <p v-if="choiceDescription(choice)" class="text-zinc-400 text-sm max-w-3xl leading-relaxed">
                  {{ choiceDescription(choice) }}
                </p>
              </div>
              <span
                class="flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold border transition-colors"
                :class="count(choice) === choice.choose ? 'bg-amber-900/30 text-amber-500 border-amber-500/50' : 'bg-zinc-800 text-zinc-400 border-zinc-700'"
              >
                {{ count(choice) }} / {{ choice.choose }}
              </span>
            </div>

            <!-- Défini à l'étape Caractéristiques (demi-elfe) -->
            <p v-if="isLocked(choice)" class="text-sm text-zinc-500 mb-3">
              Défini à l'étape « Caractéristiques ».
            </p>

            <!-- Options listées -->
            <div v-if="choice.options.length" class="grid gap-3" :class="gridClass(choice)">
              <button
                v-for="option in choice.options"
                :key="option.id"
                type="button"
                :disabled="isLocked(choice) || (!isOptionSelected(choice, option.id) && isBlocked(choice))"
                :aria-pressed="isOptionSelected(choice, option.id)"
                class="text-left h-full p-4 rounded-lg border-2 transition-all duration-200 flex flex-col focus-visible:outline-2 focus-visible:outline-amber-500"
                :class="optionClass(isOptionSelected(choice, option.id), isLocked(choice) || isBlocked(choice))"
                @click="toggleOption(choice, option.id)"
              >
                <div class="flex justify-between items-start gap-2">
                  <span class="font-serif font-bold leading-tight" :class="isOptionSelected(choice, option.id) ? 'text-white' : 'text-zinc-300'">
                    {{ optionTitle(option.label) }}
                  </span>
                  <span v-if="isOptionSelected(choice, option.id)" class="flex-shrink-0 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                    <svg class="w-3.5 h-3.5 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                  </span>
                </div>
                <p v-if="optionDescription(choice, option)" class="text-xs leading-relaxed mt-2 text-zinc-500 line-clamp-4">
                  {{ optionDescription(choice, option) }}
                </p>
              </button>
            </div>

            <!-- Réserve : langue au choix, objet d'une catégorie -->
            <div v-else-if="choice.pool" class="flex flex-wrap gap-2">
              <button
                v-for="candidate in choice.pool.candidates"
                :key="candidate.index"
                type="button"
                :disabled="!isPoolSelected(choice, candidate.index) && (isBlocked(choice) || isKnownLanguage(choice, candidate.index))"
                :aria-pressed="isPoolSelected(choice, candidate.index)"
                class="px-4 py-2 rounded-full border-2 text-sm transition-all"
                :class="optionClass(isPoolSelected(choice, candidate.index), isBlocked(choice) || isKnownLanguage(choice, candidate.index))"
                @click="togglePool(choice, candidate.index)"
              >
                {{ candidate.name }}
                <span v-if="isKnownLanguage(choice, candidate.index)" class="text-[10px] uppercase ml-1">(déjà parlée)</span>
              </button>
            </div>
          </section>

          <p v-if="preview.errors.length" class="text-sm text-red-400">
            {{ preview.errors.map((e) => e.message).join(' · ') }}
          </p>
        </div>
      </div>
    </div>

    <StepNavigation
      :current-step="7"
      :total-steps="8"
      step-name="Choix"
      :disable-next="!complete"
      @previous="$emit('previous')"
      @next="validate"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import StepNavigation from '../StepNavigation.vue'
import type { Character, CharacterPreview, ChoiceAnswer, PreviewChoice } from '@/types/character'
import { fetchPreview } from '@/utils/characterBuild'

const props = defineProps<{ character: Character }>()
const emit = defineEmits<{
  next: [payload: { choices: ChoiceAnswer[]; preview: CharacterPreview }]
  previous: []
}>()

const preview = ref<CharacterPreview | null>(null)
const answers = ref<ChoiceAnswer[]>([...(props.character.choices ?? [])])
const loading = ref(false)
const loadError = ref<string | null>(null)

const KIND_TITLES: Record<string, string> = {
  PROFICIENCY: 'Maîtrises',
  MULTICLASS_PROFICIENCY: 'Maîtrises de multiclassage',
  EXPERTISE: 'Expertise',
  LANGUAGE: 'Langues',
  STARTING_EQUIPMENT: 'Équipement de départ',
  ABILITY_SCORE_INCREASE: 'Augmentation de caractéristiques',
  SPELL: 'Sort',
  FAVORED_ENEMY: 'Ennemi juré',
  FAVORED_TERRAIN: 'Terrain de prédilection',
}
const SOURCE_TYPES: Record<string, string> = {
  race: 'Race', subrace: 'Sous-race', trait: 'Trait racial', background: 'Historique',
  class: 'Classe', classFeature: 'Capacité de classe', subclass: 'Sous-classe', option: 'Sous-choix',
}

const visibleChoices = computed(() => preview.value?.choices ?? [])
// Tous les choix accessibles sont remplis (le back recalcule ce qui reste)
const complete = computed(() => !!preview.value && !loading.value && (preview.value.sheet?.pending.choices.length ?? 0) === 0 && !preview.value.errors.length)

const title = (choice: PreviewChoice) =>
  choice.kind === 'SUBFEATURE' || choice.kind === 'SPELL' ? choice.source.name ?? 'Choix' : KIND_TITLES[choice.kind] ?? choice.source.name ?? 'Choix'
const sourceLabel = (choice: PreviewChoice) =>
  [SOURCE_TYPES[choice.source.type] ?? choice.source.type, choice.source.name].filter(Boolean).join(' · ')
// "Style de combat : Défense" → "Défense" ; "Compétence : Arcanes" → "Arcanes"
const optionTitle = (label: string) => label.split(' + ').map((part) => part.replace(/^[^:()]+ : /, '')).join(' + ')
// Texte de règle d'une option (style de combat…), sauf s'il est le même pour toutes
const sharedDescription = (choice: PreviewChoice) => {
  const texts = new Set(choice.options.map((o) => (o.items.length === 1 ? o.items[0]!.description : null)))
  return texts.size === 1 && choice.options.length > 1 ? [...texts][0] ?? null : null
}
const optionDescription = (choice: PreviewChoice, option: PreviewChoice['options'][number]) =>
  !sharedDescription(choice) && option.items.length === 1 ? option.items[0]!.description : null
// Maîtrises, langues et équipement : les options suffisent (et le SRD n'a pas
// toujours de description traduite). Sinon, la description du choix, ou celle
// commune à toutes les options.
const SELF_EXPLAINED = new Set(['PROFICIENCY', 'MULTICLASS_PROFICIENCY', 'LANGUAGE', 'STARTING_EQUIPMENT'])
const choiceDescription = (choice: PreviewChoice) => {
  if (SELF_EXPLAINED.has(choice.kind)) return null
  return sharedDescription(choice) ?? (choice.description !== title(choice) ? choice.description : null)
}

const answersOf = (choice: PreviewChoice) => answers.value.filter((a) => a.choiceId === choice.id)
const count = (choice: PreviewChoice) => answersOf(choice).length
const isFull = (choice: PreviewChoice) => count(choice) >= choice.choose
// Plus de sélection possible (un choix unique se remplace d'un clic : jamais bloqué)
const isBlocked = (choice: PreviewChoice) => choice.choose > 1 && isFull(choice)
// Bonus du demi-elfe déjà choisis à l'étape Caractéristiques
const halfElfAbilities = () => (props.character.specialChoices?.halfElfAbilities ?? []).filter((a) => a !== 'cha')
const isLocked = (choice: PreviewChoice) => choice.kind === 'ABILITY_SCORE_INCREASE' && halfElfAbilities().length > 0
const isOptionSelected = (choice: PreviewChoice, optionId: number) => answersOf(choice).some((a) => a.optionId === optionId)
const isPoolSelected = (choice: PreviewChoice, index: string) =>
  answersOf(choice).some((a) => (choice.pool?.type === 'ANY_LANGUAGE' ? a.language : a.equipment) === index)
// Langue déjà connue par une autre source (race, autre choix)
const isKnownLanguage = (choice: PreviewChoice, index: string) =>
  choice.pool?.type === 'ANY_LANGUAGE' && !isPoolSelected(choice, index) && !!preview.value?.sheet?.languages.some((l) => l.index === index)

const gridClass = (choice: PreviewChoice) =>
  choice.options.length > 6 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
const optionClass = (selected: boolean, blocked: boolean) =>
  selected
    ? 'border-amber-500 bg-zinc-900 text-white shadow-[0_0_15px_rgba(245,158,11,0.15)]'
    : blocked
      ? 'border-zinc-800 bg-zinc-950/50 text-zinc-600 opacity-60 cursor-not-allowed'
      : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800 cursor-pointer'

function toggleOption(choice: PreviewChoice, optionId: number) {
  if (isLocked(choice)) return
  if (isOptionSelected(choice, optionId)) {
    answers.value = answers.value.filter((a) => !(a.choiceId === choice.id && a.optionId === optionId))
  } else if (choice.choose === 1) {
    // Choix unique : on remplace la sélection
    answers.value = [...answers.value.filter((a) => a.choiceId !== choice.id), { choiceId: choice.id, optionId }]
  } else if (!isFull(choice)) {
    answers.value = [...answers.value, { choiceId: choice.id, optionId }]
  }
  refresh()
}

function togglePool(choice: PreviewChoice, index: string) {
  const field = choice.pool?.type === 'ANY_LANGUAGE' ? 'language' : 'equipment'
  if (isPoolSelected(choice, index)) {
    answers.value = answers.value.filter((a) => !(a.choiceId === choice.id && a[field] === index))
  } else if (choice.choose === 1) {
    answers.value = [...answers.value.filter((a) => a.choiceId !== choice.id), { choiceId: choice.id, [field]: index }]
  } else if (!isFull(choice)) {
    answers.value = [...answers.value, { choiceId: choice.id, [field]: index }]
  }
  refresh()
}

// Bonus du demi-elfe choisis à l'étape Caractéristiques → réponses au choix de la race
function syncAbilityIncreases(p: CharacterPreview): boolean {
  const chosen = halfElfAbilities()
  if (!chosen.length) return false
  let changed = false
  for (const choice of p.choices.filter((c) => c.kind === 'ABILITY_SCORE_INCREASE')) {
    const wanted = choice.options.filter((o) => chosen.includes(o.items[0]?.index ?? '')).map((o) => o.id).slice(0, choice.choose)
    const current = answersOf(choice).map((a) => a.optionId)
    if (wanted.length === current.length && wanted.every((id) => current.includes(id))) continue
    answers.value = [...answers.value.filter((a) => a.choiceId !== choice.id), ...wanted.map((optionId) => ({ choiceId: choice.id, optionId }))]
    changed = true
  }
  return changed
}

// Recalcul par le back. Les réponses à des choix qui ne sont plus accessibles
// (sous-choix d'une option abandonnée, choix d'une ancienne classe) sont retirées.
let requestId = 0
async function refresh() {
  const id = ++requestId
  loading.value = true
  loadError.value = null
  try {
    for (let pass = 0; pass < 3; pass++) {
      const result = await fetchPreview(props.character, answers.value)
      if (id !== requestId) return
      const available = new Set(result.choices.map((c) => c.id))
      const kept = answers.value.filter((a) => available.has(a.choiceId))
      const pruned = kept.length !== answers.value.length
      answers.value = kept
      const synced = syncAbilityIncreases(result)
      preview.value = result
      if (!pruned && !synced) break
    }
  } catch (e) {
    if (id === requestId) loadError.value = e instanceof Error ? e.message : 'erreur inconnue'
  } finally {
    if (id === requestId) loading.value = false
  }
}

function validate() {
  if (!complete.value || !preview.value) return
  emit('next', { choices: answers.value, preview: preview.value })
}

onMounted(refresh)
</script>
