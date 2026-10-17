// Réponses aux choix + aperçu recalculé par le back à chaque modification.
// Les réponses à des choix qui ne sont plus accessibles (sous-choix d'une
// option abandonnée, choix d'une ancienne classe) sont retirées.
import { ref } from 'vue'
import type { CharacterPreview, ChoiceAnswer } from '@/types/character'

export function useChoicePreview(
  fetcher: (answers: ChoiceAnswer[]) => Promise<CharacterPreview>,
  initial: ChoiceAnswer[] = [],
  // Après chaque aperçu : réponses à compléter automatiquement (null si rien à changer)
  sync?: (preview: CharacterPreview, answers: ChoiceAnswer[]) => ChoiceAnswer[] | null,
) {
  const preview = ref<CharacterPreview | null>(null)
  const answers = ref<ChoiceAnswer[]>([...initial])
  const loading = ref(false)
  const loadError = ref<string | null>(null)

  let requestId = 0
  async function refresh() {
    const id = ++requestId
    loading.value = true
    loadError.value = null
    try {
      for (let pass = 0; pass < 3; pass++) {
        const result = await fetcher(answers.value)
        if (id !== requestId) return
        const available = new Set(result.choices.map((c) => c.id))
        const kept = answers.value.filter((a) => available.has(a.choiceId))
        const pruned = kept.length !== answers.value.length
        const synced = sync?.(result, kept) ?? null
        answers.value = synced ?? kept
        preview.value = result
        if (!pruned && !synced) break
      }
    } catch (e) {
      if (id === requestId) loadError.value = e instanceof Error ? e.message : 'erreur inconnue'
    } finally {
      if (id === requestId) loading.value = false
    }
  }

  function setAnswers(next: ChoiceAnswer[]) {
    answers.value = next
    refresh()
  }

  return { preview, answers, loading, loadError, refresh, setAnswers }
}
