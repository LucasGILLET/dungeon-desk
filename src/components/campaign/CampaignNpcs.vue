<template>
  <section class="grid gap-4">
    <div class="flex items-center justify-between gap-3">
      <h2 class="font-serif text-2xl font-bold text-amber-200">PNJ de la campagne</h2>
      <button v-if="editing === null" type="button" class="ui-btn-primary" :disabled="!available.length" @click="edit()">+ Ajouter un PNJ</button>
    </div>
    <p class="text-sm text-zinc-500">
      Choisissez parmi les PNJ enregistrés depuis le
      <router-link :to="{ name: 'npc-generator' }" class="text-sky-300 hover:underline">générateur de PNJ</router-link>.
      Ils ne sont pas visibles des joueurs.
    </p>

    <form v-if="editing !== null" class="ui-panel grid gap-4" @submit.prevent="save">
      <label class="ui-label">
        PNJ
        <select v-model.number="form.npcId" required class="ui-input" :disabled="editing !== 'new'">
          <option v-for="n in editing === 'new' ? available : myNpcs" :key="n.id" :value="n.id">{{ n.name }}<template v-if="n.profession"> ({{ n.profession }})</template></option>
        </select>
      </label>
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="ui-label">Rôle<input v-model="form.role" maxlength="500" class="ui-input" placeholder="Aubergiste, informateur" /></label>
        <label class="ui-label">Lieu<input v-model="form.location" maxlength="500" class="ui-input" placeholder="Phandaline" /></label>
      </div>
      <label class="ui-label">Notes<textarea v-model="form.notes" rows="3" class="ui-input"></textarea></label>
      <FormActions :busy="busy" :error="error" :can-delete="editing !== 'new'" @cancel="editing = null" @delete="remove" />
    </form>

    <p v-if="!campaign.npcs.length && editing === null" class="text-sm text-zinc-500">Aucun PNJ rattaché pour l'instant.</p>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article v-for="n in campaign.npcs" :key="n.id" class="ui-panel">
        <header class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h3 class="text-lg font-semibold text-zinc-100">
              <button v-if="fullNpc(n)" type="button" class="text-left hover:text-emerald-200 hover:underline" :aria-label="`Voir la fiche de ${n.name}`" @click="opened = fullNpc(n)">{{ n.name }}</button>
              <template v-else>{{ n.name }}</template>
            </h3>
            <p class="text-xs text-zinc-500">{{ [n.race, n.class, n.profession].filter(Boolean).join(' · ') }}</p>
          </div>
          <button type="button" class="ui-btn shrink-0" @click="edit(n)">Modifier</button>
        </header>
        <p v-if="n.role || n.location" class="mt-3 text-sm text-zinc-300">
          <span v-if="n.role">{{ n.role }}</span><span v-if="n.role && n.location"> · </span><span v-if="n.location" class="text-zinc-400">{{ n.location }}</span>
        </p>
        <p v-if="n.notes" class="mt-2 whitespace-pre-line text-sm text-zinc-400">{{ n.notes }}</p>
      </article>
    </div>

    <NpcDetailModal v-if="opened" :npc="opened" :deletable="false" @close="opened = null" />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import FormActions from '@/components/campaign/FormActions.vue'
import NpcDetailModal from '@/components/profile/NpcDetailModal.vue'
import { useCampaignItemForm } from '@/composables/useCampaignItemForm'
import type { Campaign, CampaignNpc } from '@/api/campaigns'
import { useNpcStore } from '@/stores/npc'

const props = defineProps<{ campaign: Campaign }>()
const emit = defineEmits<{ (e: 'changed'): void }>()

const npcStore = useNpcStore()
const myNpcs = ref<{ id: number; name: string; profession: string | null }[]>([])
// PNJ du MJ pas encore rattachés à la campagne
const available = computed(() => myNpcs.value.filter((n) => !props.campaign.npcs.some((c) => c.npcId === n.id)))
const form = reactive({ npcId: 0, role: '', location: '', notes: '' })
// Fiche complète du PNJ (celle du générateur), depuis la liste du MJ : à jour après ses notes
const opened = ref<any>(null)
const fullNpc = (n: CampaignNpc) => npcStore.npcs.find((full) => full.id === n.npcId) ?? null
const { editing, busy, error, open, submit, remove } = useCampaignItemForm(() => props.campaign.id, 'npcs', () => emit('changed'), 'Retirer ce PNJ de la campagne ?')

function edit(n?: CampaignNpc) {
  Object.assign(form, n
    ? { npcId: n.npcId, role: n.role ?? '', location: n.location ?? '', notes: n.notes ?? '' }
    : { npcId: available.value[0]?.id ?? 0, role: '', location: '', notes: '' })
  open(n?.id)
}

const save = () => submit({ npcId: form.npcId, role: form.role.trim() || null, location: form.location.trim() || null, notes: form.notes || null })

onMounted(async () => {
  myNpcs.value = await npcStore.fetchNpcs()
})
</script>
