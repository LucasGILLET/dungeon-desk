<template>
  <div class="space-y-10">
    <section
      v-for="choice in choices"
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

      <p v-if="isLocked(choice) && lockedMessage" class="text-sm text-zinc-500 mb-3">{{ lockedMessage }}</p>

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
  </div>
</template>

<script setup lang="ts">
// Choix décrits par le back (POST /characters/preview), affichés sans
// connaître les règles : créateur et montée de niveau.
import type { ChoiceAnswer, PreviewChoice } from '@/types/character'

const props = defineProps<{
  choices: PreviewChoice[]
  answers: ChoiceAnswer[]
  // Langues déjà parlées (désactivées dans les réserves de langues)
  knownLanguages?: string[]
  // Choix réglés ailleurs (bonus du demi-elfe à l'étape Caractéristiques)
  lockedKinds?: string[]
  lockedMessage?: string
}>()
const emit = defineEmits<{ 'update:answers': [answers: ChoiceAnswer[]] }>()

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

const answersOf = (choice: PreviewChoice) => props.answers.filter((a) => a.choiceId === choice.id)
const count = (choice: PreviewChoice) => answersOf(choice).length
const isFull = (choice: PreviewChoice) => count(choice) >= choice.choose
// Plus de sélection possible (un choix unique se remplace d'un clic : jamais bloqué)
const isBlocked = (choice: PreviewChoice) => choice.choose > 1 && isFull(choice)
const isLocked = (choice: PreviewChoice) => !!props.lockedKinds?.includes(choice.kind)
const isOptionSelected = (choice: PreviewChoice, optionId: number) => answersOf(choice).some((a) => a.optionId === optionId)
const isPoolSelected = (choice: PreviewChoice, index: string) =>
  answersOf(choice).some((a) => (choice.pool?.type === 'ANY_LANGUAGE' ? a.language : a.equipment) === index)
const isKnownLanguage = (choice: PreviewChoice, index: string) =>
  choice.pool?.type === 'ANY_LANGUAGE' && !isPoolSelected(choice, index) && !!props.knownLanguages?.includes(index)

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
  const others = props.answers.filter((a) => a.choiceId !== choice.id)
  if (isOptionSelected(choice, optionId)) {
    emit('update:answers', props.answers.filter((a) => !(a.choiceId === choice.id && a.optionId === optionId)))
  } else if (choice.choose === 1) {
    // Choix unique : on remplace la sélection
    emit('update:answers', [...others, { choiceId: choice.id, optionId }])
  } else if (!isFull(choice)) {
    emit('update:answers', [...props.answers, { choiceId: choice.id, optionId }])
  }
}

function togglePool(choice: PreviewChoice, index: string) {
  const field = choice.pool?.type === 'ANY_LANGUAGE' ? 'language' : 'equipment'
  if (isPoolSelected(choice, index)) {
    emit('update:answers', props.answers.filter((a) => !(a.choiceId === choice.id && a[field] === index)))
  } else if (choice.choose === 1) {
    emit('update:answers', [...props.answers.filter((a) => a.choiceId !== choice.id), { choiceId: choice.id, [field]: index }])
  } else if (!isFull(choice)) {
    emit('update:answers', [...props.answers, { choiceId: choice.id, [field]: index }])
  }
}
</script>
