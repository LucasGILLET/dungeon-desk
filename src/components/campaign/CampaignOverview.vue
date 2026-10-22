<template>
  <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
    <section class="ui-panel">
      <div class="mb-4 flex items-center justify-between gap-3">
        <h2 class="font-serif text-2xl font-bold text-amber-200">Présentation</h2>
        <button v-if="isGm && !editing" type="button" class="ui-btn" @click="startEdit">Modifier</button>
      </div>

      <form v-if="editing" class="grid gap-4" @submit.prevent="saveCampaign">
        <label class="ui-label">Nom<input v-model="form.name" required maxlength="200" class="ui-input" /></label>
        <label class="ui-label">Thème<input v-model="form.theme" maxlength="500" class="ui-input" /></label>
        <label class="ui-label">
          Statut
          <select v-model="form.status" class="ui-input">
            <option v-for="(label, value) in CAMPAIGN_STATUS_LABELS" :key="value" :value="value">{{ label }}</option>
          </select>
        </label>
        <label class="ui-label">Présentation (Markdown, visible des joueurs)<textarea v-model="form.description" rows="8" class="ui-input"></textarea></label>
        <p v-if="error" class="text-sm text-red-300">{{ error }}</p>
        <div class="flex flex-wrap gap-2">
          <button type="submit" class="ui-btn-primary" :disabled="busy || !form.name.trim()">Enregistrer</button>
          <button type="button" class="ui-btn" @click="editing = false">Annuler</button>
          <button type="button" class="ui-btn-danger ml-auto" @click="removeCampaign">Supprimer la campagne</button>
        </div>
      </form>

      <template v-else>
        <MarkdownText v-if="campaign.description" :text="campaign.description" class="text-zinc-300" />
        <p v-else class="text-sm text-zinc-500">Aucune présentation pour l'instant.</p>
      </template>
    </section>

    <aside class="grid content-start gap-6">
      <section class="ui-panel">
        <h2 class="mb-3 font-serif text-xl font-bold text-amber-200">Joueurs</h2>
        <p class="mb-3 text-sm text-zinc-400">MJ : <span class="text-zinc-200">{{ campaign.gm.name }}</span></p>
        <p v-if="!campaign.members.length" class="text-sm text-zinc-500">Personne n'a encore rejoint la campagne.</p>
        <ul class="grid gap-3">
          <li v-for="m in campaign.members" :key="m.userId" class="rounded-2xl border border-white/10 bg-black/20 p-3">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="text-sm font-semibold text-zinc-100">{{ m.name }}<span v-if="m.isMe" class="text-zinc-500"> (vous)</span></p>
                <template v-if="m.character">
                  <router-link
                    v-if="isGm || m.isMe"
                    :to="`/character/${m.character.id}`"
                    class="text-sm text-sky-300 hover:underline"
                  >{{ m.character.name }}</router-link>
                  <span v-else class="text-sm text-zinc-300">{{ m.character.name }}</span>
                  <p class="text-xs text-zinc-500">
                    {{ m.character.race }} · {{ m.character.classes.map((c) => `${c.name} ${c.level}`).join(' / ') }}
                  </p>
                </template>
                <p v-else class="text-xs text-zinc-500">Pas encore de personnage</p>
              </div>
              <button
                v-if="isGm || m.isMe"
                type="button"
                class="ui-btn-danger shrink-0"
                @click="removeMember(m)"
              >{{ m.isMe ? 'Quitter' : 'Retirer' }}</button>
            </div>
            <!-- Le joueur choisit le personnage qu'il joue -->
            <label v-if="m.isMe" class="ui-label mt-3">
              Mon personnage
              <select class="ui-input" :value="m.character?.id ?? ''" @change="setCharacter(($event.target as HTMLSelectElement).value)">
                <option value="">Aucun</option>
                <option v-for="c in myCharacters" :key="c.id" :value="c.id">{{ c.name }} (niveau {{ c.level }})</option>
              </select>
            </label>
          </li>
        </ul>
      </section>

      <!-- Personnages joués par le MJ (compagnon, partie en solo…) -->
      <section v-if="isGm || campaign.gmCharacters.length" class="ui-panel">
        <h2 class="mb-3 font-serif text-xl font-bold text-amber-200">Personnages du MJ</h2>
        <p v-if="!campaign.gmCharacters.length" class="mb-3 text-sm text-zinc-500">Ajoutez vos propres personnages au groupe : ils comptent dans la difficulté des rencontres.</p>
        <ul class="grid gap-3">
          <li v-for="c in campaign.gmCharacters" :key="c.id" class="flex items-start justify-between gap-2 rounded-2xl border border-white/10 bg-black/20 p-3">
            <div class="min-w-0">
              <router-link v-if="isGm" :to="`/character/${c.id}`" class="text-sm text-sky-300 hover:underline">{{ c.name }}</router-link>
              <span v-else class="text-sm text-zinc-300">{{ c.name }}</span>
              <p class="text-xs text-zinc-500">{{ c.race }} · {{ c.classes.map((k) => `${k.name} ${k.level}`).join(' / ') }}</p>
            </div>
            <button v-if="isGm" type="button" class="ui-btn-danger shrink-0" :disabled="busy" @click="removeGmCharacter(c)">Retirer</button>
          </li>
        </ul>
        <label v-if="isGm && addableCharacters.length" class="ui-label mt-3">
          Ajouter un de mes personnages
          <select class="ui-input" value="" :disabled="busy" @change="addGmCharacter($event.target as HTMLSelectElement)">
            <option value="" disabled>Choisir…</option>
            <option v-for="c in addableCharacters" :key="c.id" :value="c.id">{{ c.name }} (niveau {{ c.level }})</option>
          </select>
        </label>
        <p v-else-if="isGm && !campaign.gmCharacters.length" class="text-xs text-zinc-500">
          Vous n'avez pas encore de personnage : <router-link to="/character-creator" class="underline">en créer un</router-link>.
        </p>
      </section>

      <section v-if="isGm && campaign.inviteCode" class="ui-panel">
        <h2 class="mb-2 font-serif text-xl font-bold text-amber-200">Inviter des joueurs</h2>
        <p class="mb-3 text-xs text-zinc-400">Partagez ce lien : un joueur connecté rejoint la campagne et y rattache un de ses personnages. Vous pourrez consulter sa fiche.</p>
        <div class="flex gap-2">
          <input :value="link" readonly class="ui-input font-mono text-xs" aria-label="Lien d'invitation" @focus="($event.target as HTMLInputElement).select()" />
          <button type="button" class="ui-btn shrink-0" @click="copy">{{ copied ? 'Copié' : 'Copier' }}</button>
        </div>
        <button type="button" class="mt-3 text-xs text-zinc-400 underline hover:text-zinc-200" @click="regenerate">Générer un nouveau lien (l'ancien ne marchera plus)</button>
      </section>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import MarkdownText from '@/components/MarkdownText.vue'
import { CAMPAIGN_STATUS_LABELS, campaignsApi, inviteUrl, type Campaign, type CampaignCharacter, type CampaignMember } from '@/api/campaigns'
import { useCharacterStore } from '@/stores/character'
import type { CharacterSummary } from '@/types/character'

const props = defineProps<{ campaign: Campaign }>()
const emit = defineEmits<{ (e: 'changed'): void }>()

const router = useRouter()
const characterStore = useCharacterStore()
const isGm = computed(() => props.campaign.role === 'GM')
const link = computed(() => (props.campaign.inviteCode ? inviteUrl(props.campaign.inviteCode) : ''))
const myCharacters = ref<CharacterSummary[]>([])
const copied = ref(false)
const editing = ref(false)
const busy = ref(false)
const error = ref<string | null>(null)
const form = reactive({ name: '', theme: '', status: props.campaign.status, description: '' })

function startEdit() {
  Object.assign(form, { name: props.campaign.name, theme: props.campaign.theme ?? '', status: props.campaign.status, description: props.campaign.description ?? '' })
  error.value = null
  editing.value = true
}

async function run(action: () => Promise<unknown>) {
  busy.value = true
  error.value = null
  try {
    await action()
    emit('changed')
    return true
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Action impossible.'
    return false
  } finally {
    busy.value = false
  }
}

async function saveCampaign() {
  if (await run(() => campaignsApi.update(props.campaign.id, {
    name: form.name.trim(), theme: form.theme.trim() || null, status: form.status, description: form.description || null,
  }))) editing.value = false
}

async function removeCampaign() {
  if (!window.confirm(`Supprimer définitivement « ${props.campaign.name} », ses séances, quêtes et rencontres ?`)) return
  await campaignsApi.remove(props.campaign.id)
  router.push({ name: 'gm-dashboard' })
}

async function removeMember(m: CampaignMember) {
  const question = m.isMe ? 'Quitter cette campagne ?' : `Retirer ${m.name} de la campagne ?`
  if (!window.confirm(question)) return
  await campaignsApi.removeMember(props.campaign.id, m.userId)
  if (m.isMe) router.push({ name: 'gm-dashboard' })
  else emit('changed')
}

// Personnages du MJ pas encore dans le groupe
const addableCharacters = computed(() => myCharacters.value.filter((c) => !props.campaign.gmCharacters.some((g) => g.id === c.id)))
function addGmCharacter(select: HTMLSelectElement) {
  const characterId = Number(select.value)
  select.value = ''
  if (characterId) run(() => campaignsApi.addGmCharacter(props.campaign.id, characterId))
}
async function removeGmCharacter(c: CampaignCharacter) {
  if (!window.confirm(`Retirer ${c.name} du groupe ?`)) return
  await run(() => campaignsApi.removeGmCharacter(props.campaign.id, c.id))
}

const setCharacter = (value: string) => run(() => campaignsApi.setCharacter(props.campaign.id, value ? Number(value) : null))
const regenerate = () => run(() => campaignsApi.regenerateInvite(props.campaign.id))

async function copy() {
  await navigator.clipboard?.writeText(link.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

onMounted(async () => {
  if (isGm.value || props.campaign.members.some((m) => m.isMe)) myCharacters.value = await characterStore.fetchCharacters()
})
</script>
