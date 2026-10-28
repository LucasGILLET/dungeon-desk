import { computed, ref } from 'vue'
import { loadConditions } from '@/utils/dataLoader'
import { conditionEntries, keywordMatcher, RULE_TERMS, type GlossaryEntry } from '@/utils/glossary'

// Glossaire partagé : termes de règles tout de suite, états une fois chargés
const conditions = ref<GlossaryEntry[]>([])
let requested = false

const matcher = computed(() => keywordMatcher([...RULE_TERMS, ...conditions.value]))

export function useGlossary() {
  if (!requested) {
    requested = true
    loadConditions()
      .then((rows) => (conditions.value = conditionEntries(rows)))
      .catch(() => (requested = false))
  }
  return { split: (text: string) => matcher.value(text) }
}
