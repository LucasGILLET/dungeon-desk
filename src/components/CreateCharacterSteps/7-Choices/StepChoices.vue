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

        <!-- Déjà acquis par la race, l'historique et la classe : à ne pas reprendre dans les choix -->
        <div v-if="acquired.length" class="rounded-xl border border-zinc-700/50 bg-zinc-900/50 overflow-hidden">
          <div class="px-6 py-4 border-b border-zinc-700/50 bg-zinc-900/80 flex items-center justify-between">
            <h3 class="text-lg font-bold font-serif text-white flex items-center gap-2"><span class="text-amber-500">✦</span> Déjà acquis</h3>
            <span class="text-[10px] uppercase text-zinc-500 tracking-widest font-bold">Race, historique, classe</span>
          </div>
          <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div v-for="group in acquired" :key="group.label">
              <h4 class="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-3">{{ group.label }}</h4>
              <div class="flex flex-wrap gap-2">
                <ProficiencyBadge v-for="item in group.items" :key="item.index" :name="item.name" :variant="group.variant" />
              </div>
            </div>
          </div>
        </div>

        <!-- Chargement / erreur -->
        <div v-if="!preview && loading" role="status" class="space-y-10">
          <span class="sr-only">Chargement des choix…</span>
          <div v-for="i in 3" :key="i" aria-hidden="true">
            <div class="flex items-end justify-between border-b border-zinc-800 pb-3 mb-4">
              <div class="space-y-2"><div class="ui-skeleton h-3 w-28"></div><div class="ui-skeleton h-7 w-48"></div></div>
              <div class="ui-skeleton h-6 w-12 rounded-full"></div>
            </div>
            <div class="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              <div v-for="j in 4" :key="j" class="ui-skeleton h-16 rounded-lg"></div>
            </div>
          </div>
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
            :known-proficiencies="preview.sheet?.proficiencies.map((p) => p.index) ?? []"
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
import ProficiencyBadge from '../8-Summary/ProficiencyBadge.vue'
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

// Compétences, outils et langues acquis sans choix : tout ce que donne l'aperçu,
// moins ce qui vient des réponses de cette étape
const TOOL_TYPES = new Set(['ARTISAN_TOOL', 'MUSICAL_INSTRUMENT', 'GAMING_SET', 'VEHICLE', 'OTHER'])
const shortName = (name: string) => name.replace(/^[^:()]+ : /, '')
const acquired = computed(() => {
  const sheet = preview.value?.sheet
  if (!sheet) return []
  const chosen = new Set<string>()
  for (const a of answers.value) {
    if (a.language) chosen.add(a.language)
    const option = visibleChoices.value.find((c) => c.id === a.choiceId)?.options.find((o) => o.id === a.optionId)
    for (const item of option?.items ?? []) if (item.index) chosen.add(item.index)
  }
  const proficiencies = sheet.proficiencies.filter((p) => !chosen.has(p.index))
  return [
    { label: 'Compétences', variant: 'skill' as const, items: proficiencies.filter((p) => p.type === 'SKILL') },
    { label: 'Outils', variant: 'tool' as const, items: proficiencies.filter((p) => TOOL_TYPES.has(p.type)) },
    { label: 'Langues', variant: 'language' as const, items: sheet.languages.filter((l) => !chosen.has(l.index)) },
  ].filter((g) => g.items.length).map((g) => ({ ...g, items: g.items.map((i) => ({ index: i.index, name: shortName(i.name) })) }))
})
// Tous les choix accessibles sont remplis (le back recalcule ce qui reste)
const complete = computed(() => !!preview.value && !loading.value && (preview.value.sheet?.pending.choices.length ?? 0) === 0 && !preview.value.errors.length)

function validate() {
  if (!complete.value || !preview.value) return
  emit('next', { choices: answers.value, preview: preview.value })
}

onMounted(refresh)
</script>
