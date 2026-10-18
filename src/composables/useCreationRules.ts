// Règles de création des caractéristiques de l'édition (achat de points,
// tableau standard) et accroches des caractéristiques, lues depuis l'API.
import { computed, ref } from 'vue'
import { loadAbilityScores, loadCreationRules, type ApiAbilityScore, type ApiCreationRules } from '@/utils/dataLoader'

const rules = ref<ApiCreationRules | null>(null)
const abilityScores = ref<ApiAbilityScore[]>([])
let loading: Promise<void> | null = null

export function useCreationRules() {
  loading ??= Promise.all([loadCreationRules(), loadAbilityScores()])
    .then(([r, a]) => {
      rules.value = r
      abilityScores.value = a
    })
    .catch((e) => {
      loading = null
      throw e
    })

  const values = computed(() => Object.keys(rules.value?.pointBuy.costs ?? {}).map(Number).sort((a, b) => a - b))
  return {
    ready: computed(() => !!rules.value),
    loaded: loading,
    // Achat de points : coût d'une valeur, budget, valeurs possibles
    cost: (value: number) => rules.value?.pointBuy.costs[String(value)] ?? 0,
    budget: computed(() => rules.value?.pointBuy.budget ?? 0),
    minValue: computed(() => values.value[0] ?? 8),
    maxValue: computed(() => values.value.at(-1) ?? 15),
    standardArray: computed(() => rules.value?.standardArray ?? []),
    // "Force" → "Puissance physique, combat au corps à corps"
    summaryOf: (name: string) => abilityScores.value.find((a) => a.name === name || a.index === name)?.summary ?? '',
  }
}
