<template>
  <div class="relative flex min-h-[calc(100vh-5rem)] items-center justify-center bg-zinc-950 px-4 py-10 text-zinc-200">
    <section class="ui-panel w-full max-w-lg">
      <h1 class="font-serif text-3xl font-bold text-amber-100">Rejoindre une campagne</h1>

      <template v-if="!authStore.isAuthenticated">
        <p class="mt-4 text-zinc-300">Connectez-vous pour rejoindre la campagne de votre MJ.</p>
        <button type="button" class="ui-btn-primary mt-5" @click="login">Se connecter</button>
      </template>

      <p v-else-if="error" class="mt-4 text-red-300">{{ error }}</p>
      <p v-else-if="!invite" class="mt-4 text-zinc-400">Chargement de l'invitation…</p>

      <template v-else>
        <div class="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
          <p class="text-xl font-semibold text-zinc-100">{{ invite.name }}</p>
          <p v-if="invite.theme" class="text-sm text-zinc-400">{{ invite.theme }}</p>
          <p class="mt-2 text-xs text-zinc-500">MJ : {{ invite.gm }} · {{ invite.memberCount }} joueur{{ invite.memberCount > 1 ? 's' : '' }}</p>
        </div>

        <p v-if="invite.isGm" class="mt-4 text-sm text-zinc-300">C'est votre campagne : partagez ce lien avec vos joueurs.</p>
        <form v-else class="mt-5 grid gap-4" @submit.prevent="join">
          <p v-if="invite.alreadyMember" class="text-sm text-sky-200">Vous faites déjà partie de cette campagne : vous pouvez changer de personnage.</p>
          <label class="ui-label">
            Personnage que vous y jouez
            <select v-model="characterId" class="ui-input">
              <option :value="null">Je le choisirai plus tard</option>
              <option v-for="c in characters" :key="c.id" :value="c.id">{{ c.name }} (niveau {{ c.level }})</option>
            </select>
          </label>
          <p class="text-xs text-zinc-500">Le MJ pourra consulter la fiche de ce personnage, sans pouvoir la modifier.</p>
          <p v-if="joinError" class="text-sm text-red-300">{{ joinError }}</p>
          <button type="submit" class="ui-btn-primary" :disabled="busy">{{ invite.alreadyMember ? 'Enregistrer' : 'Rejoindre la campagne' }}</button>
        </form>
        <router-link v-if="invite.isGm || invite.alreadyMember" :to="{ name: 'campaign', params: { id: invite.campaignId } }" class="mt-4 inline-block text-sm text-sky-300 hover:underline">
          Ouvrir la campagne →
        </router-link>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CampaignApiError, campaignsApi, type CampaignInvite } from '@/api/campaigns'
import { useAuthStore } from '@/stores/auth'
import { useCharacterStore } from '@/stores/character'
import type { CharacterSummary } from '@/types/character'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const characterStore = useCharacterStore()
const code = String(route.params.code)

const invite = ref<CampaignInvite | null>(null)
const characters = ref<CharacterSummary[]>([])
const characterId = ref<number | null>(null)
const error = ref<string | null>(null)
const joinError = ref<string | null>(null)
const busy = ref(false)

// Retour sur cette page après la connexion
const login = () => authStore.login({ appState: { target: route.fullPath } })

async function load() {
  if (!authStore.isAuthenticated) return
  try {
    const [found, mine] = await Promise.all([campaignsApi.invite(code), characterStore.fetchCharacters()])
    invite.value = found
    characters.value = mine
  } catch (e) {
    error.value = e instanceof CampaignApiError && e.status === 404
      ? "Ce lien d'invitation n'est plus valable. Demandez-en un nouveau à votre MJ."
      : "Impossible de charger l'invitation."
  }
}

async function join() {
  busy.value = true
  joinError.value = null
  try {
    const { campaignId } = await campaignsApi.join(code, characterId.value)
    router.push({ name: 'campaign', params: { id: campaignId } })
  } catch (e) {
    joinError.value = e instanceof Error ? e.message : 'Impossible de rejoindre la campagne.'
  } finally {
    busy.value = false
  }
}

onMounted(load)
watch(() => authStore.isAuthenticated, load)
</script>
