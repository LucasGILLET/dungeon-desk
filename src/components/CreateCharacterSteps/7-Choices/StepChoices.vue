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
          <ChoicesPanel
            :choices="visibleChoices"
            :answers="answers"
            :known-languages="preview.sheet?.languages.map((l) => l.index) ?? []"
            :locked-kinds="halfElfAbilities().length ? ['ABILITY_SCORE_INCREASE'] : []"
            locked-message="Défini à l'étape « Caractéristiques »."
            @update:answers="setAnswers"
          />

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
import { computed, onMounted } from 'vue'
import StepNavigation from '../StepNavigation.vue'
import ChoicesPanel from '@/components/choices/ChoicesPanel.vue'
import type { Character, CharacterPreview, ChoiceAnswer } from '@/types/character'
import { fetchPreview } from '@/utils/characterBuild'
import { useChoicePreview } from '@/composables/useChoicePreview'

const props = defineProps<{ character: Character }>()
const emit = defineEmits<{
  next: [payload: { choices: ChoiceAnswer[]; preview: CharacterPreview }]
  previous: []
}>()

// Bonus du demi-elfe déjà choisis à l'étape Caractéristiques
const halfElfAbilities = () => (props.character.specialChoices?.halfElfAbilities ?? []).filter((a) => a !== 'cha')

// … recopiés dans les réponses au choix de la race
function syncAbilityIncreases(p: CharacterPreview, current: ChoiceAnswer[]): ChoiceAnswer[] | null {
  const chosen = halfElfAbilities()
  if (!chosen.length) return null
  let next = current
  for (const choice of p.choices.filter((c) => c.kind === 'ABILITY_SCORE_INCREASE')) {
    const wanted = choice.options.filter((o) => chosen.includes(o.items[0]?.index ?? '')).map((o) => o.id).slice(0, choice.choose)
    const answered = next.filter((a) => a.choiceId === choice.id).map((a) => a.optionId)
    if (wanted.length === answered.length && wanted.every((id) => answered.includes(id))) continue
    next = [...next.filter((a) => a.choiceId !== choice.id), ...wanted.map((optionId) => ({ choiceId: choice.id, optionId }))]
  }
  return next === current ? null : next
}

const { preview, answers, loading, loadError, refresh, setAnswers } = useChoicePreview(
  (current) => fetchPreview(props.character, current),
  props.character.choices ?? [],
  syncAbilityIncreases,
)

const visibleChoices = computed(() => preview.value?.choices ?? [])
// Tous les choix accessibles sont remplis (le back recalcule ce qui reste)
const complete = computed(() => !!preview.value && !loading.value && (preview.value.sheet?.pending.choices.length ?? 0) === 0 && !preview.value.errors.length)

function validate() {
  if (!complete.value || !preview.value) return
  emit('next', { choices: answers.value, preview: preview.value })
}

onMounted(refresh)
</script>
