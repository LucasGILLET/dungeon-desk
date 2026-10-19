// Formulaire d'un élément de campagne (séance, quête, PNJ, rencontre) : un seul
// formulaire, ouvert pour un nouvel élément ou pour en modifier un.
import { ref } from 'vue'
import { campaignsApi, type CampaignCollection } from '@/api/campaigns'

export function useCampaignItemForm(campaignId: () => number, collection: CampaignCollection, onChanged: () => void, deleteQuestion: string) {
  const editing = ref<number | 'new' | null>(null)
  const busy = ref(false)
  const error = ref<string | null>(null)

  function open(id?: number) {
    error.value = null
    editing.value = id ?? 'new'
  }

  async function run(action: () => Promise<unknown>) {
    busy.value = true
    error.value = null
    try {
      await action()
      editing.value = null
      onChanged()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Enregistrement impossible.'
    } finally {
      busy.value = false
    }
  }

  const submit = (body: Parameters<typeof campaignsApi.save>[2]) =>
    run(() => campaignsApi.save(campaignId(), collection, body, editing.value === 'new' ? undefined : (editing.value as number)))

  async function remove() {
    if (typeof editing.value !== 'number' || !window.confirm(deleteQuestion)) return
    const id = editing.value
    await run(() => campaignsApi.removeItem(campaignId(), collection, id))
  }

  return { editing, busy, error, open, submit, remove }
}
