<template>
  <div class="min-h-[calc(100vh-5rem)] bg-zinc-950 text-zinc-200 font-sans pt-20 pb-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <!-- En-tête -->
      <div class="flex flex-col md:flex-row justify-between items-center mb-10 border-b border-zinc-800 pb-6">
        <div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200 bg-clip-text text-transparent font-serif mb-2">
            Sanctuaire du Gardien
          </h1>
          <p class="text-zinc-400">Vos personnages, vos PNJ, vos monstres et vos campagnes</p>
        </div>
        <div v-if="authStore.isAuthenticated" class="flex items-center gap-4 mt-4 md:mt-0">
          <div class="text-right mr-4 hidden md:block">
            <div class="text-white font-bold">{{ authStore.user?.nickname || authStore.user?.name }}</div>
            <div class="text-xs text-zinc-500">{{ authStore.user?.email }}</div>
          </div>
          <button @click="authStore.logout()" class="bg-red-900/20 hover:bg-red-900/40 text-red-400 px-4 py-2 rounded-lg border border-red-900/50 transition-colors text-sm">
            Se déconnecter
          </button>
        </div>
      </div>

      <section v-if="!authStore.isAuthenticated" class="mx-auto max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900/50 p-10 text-center">
        <div class="mb-4 text-5xl opacity-40">🛡️</div>
        <p class="text-lg text-zinc-200">Connectez-vous pour retrouver vos personnages, vos PNJ et vos campagnes.</p>
        <button type="button" class="ui-btn-primary mt-6" @click="authStore.login({ appState: { target: route.fullPath } })">Se connecter</button>
      </section>

      <!-- Contenu Principal -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-4 gap-8">

        <!-- Navigation -->
        <div class="lg:col-span-1 space-y-4">
          <div class="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
            <h3 class="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Bibliothèque</h3>
            <nav class="space-y-2" aria-label="Sections du profil">
              <button
                v-for="t in TABS"
                :key="t.key"
                type="button"
                class="w-full text-left px-3 py-2 rounded-lg font-medium flex items-center justify-between transition-colors"
                :class="tab === t.key ? t.active : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'"
                :aria-current="tab === t.key ? 'page' : undefined"
                @click="selectTab(t.key)"
              >
                <span>{{ t.label }}</span>
                <span class="text-xs px-2 py-0.5 rounded-full" :class="tab === t.key ? t.badge : 'bg-zinc-700'">{{ counts[t.key] }}</span>
              </button>
            </nav>
          </div>

          <div class="rounded-xl p-6 border" :class="cta.panel">
            <h3 class="font-serif font-bold mb-2" :class="cta.title">{{ cta.heading }}</h3>
            <p class="text-sm text-zinc-400 mb-4">{{ cta.text }}</p>
            <router-link :to="cta.to" class="block text-center text-white py-2 rounded-lg text-sm font-bold shadow-lg transition-all" :class="cta.button">
              {{ cta.label }}
            </router-link>
          </div>
        </div>

        <!-- Liste principale -->
        <div class="lg:col-span-3">
          <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 class="text-xl font-bold text-white flex items-center gap-2">
              <span>{{ TAB_HEADINGS[tab].icon }}</span> {{ TAB_HEADINGS[tab].title }}
            </h2>
            <input
              v-if="tab !== 'campaigns' && counts[tab] > 3"
              v-model="search"
              type="search"
              class="ui-input sm:w-64"
              :placeholder="tab === 'npcs' ? 'Nom, métier…' : tab === 'monsters' ? 'Nom, type…' : 'Nom, race, classe…'"
              aria-label="Rechercher"
            />
          </div>
          <p v-if="actionError" class="mb-4 rounded-lg border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-300">{{ actionError }}</p>

          <!-- PERSONNAGES -->
          <template v-if="tab === 'characters'">
            <SkeletonCards v-if="characterStore.loading && !characterStore.characters.length" columns="grid-cols-1 md:grid-cols-2 xl:grid-cols-3" :count="3" />
            <EmptyState v-else-if="!characterStore.characters.length" icon="🛡️" text="Aucun héros n'a encore répondu à l'appel" to="/character-creator" label="Créer un personnage" />
            <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <article
                v-for="char in filteredCharacters"
                :key="char.id"
                class="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg overflow-hidden group transition-all hover:shadow-xl hover:shadow-black/50 flex flex-col"
              >
                <div class="h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 opacity-70 group-hover:opacity-100 transition-opacity"></div>
                <router-link :to="`/character/${char.id}`" class="p-5 flex-grow">
                  <div class="flex justify-between items-start mb-2 gap-2">
                    <div class="min-w-0">
                      <h3 class="font-bold text-lg text-white group-hover:text-amber-400 transition-colors truncate">{{ char.name }}</h3>
                      <div class="text-xs text-zinc-500">Modifié le {{ formatDate(char.updatedAt) }}</div>
                    </div>
                    <span class="shrink-0 text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">Niv. {{ char.level }}</span>
                  </div>
                  <dl class="space-y-1 my-3 text-sm">
                    <div class="flex items-center justify-between gap-3">
                      <dt class="text-zinc-500">Race</dt>
                      <dd class="text-zinc-300 text-right">{{ char.names.subrace || char.names.race || char.race }}</dd>
                    </div>
                    <div class="flex items-center justify-between gap-3">
                      <dt class="text-zinc-500">Classe</dt>
                      <dd class="text-zinc-300 text-right">{{ classLine(char) }}</dd>
                    </div>
                  </dl>
                  <div v-if="campaignsOf(char.id).length" class="flex flex-wrap gap-1.5">
                    <span v-for="c in campaignsOf(char.id)" :key="c.id" class="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs text-red-200">🎲 {{ c.name }}</span>
                  </div>
                </router-link>
                <div class="bg-zinc-950/50 p-3 border-t border-zinc-800 flex justify-between items-center">
                  <router-link :to="`/character/${char.id}`" class="text-xs font-medium text-zinc-400 hover:text-white transition-colors">Ouvrir la fiche →</router-link>
                  <button type="button" class="text-zinc-600 hover:text-red-500 p-1 transition-colors" :aria-label="`Supprimer ${char.name}`" @click="removeCharacter(char)">🗑️</button>
                </div>
              </article>
              <p v-if="!filteredCharacters.length" class="text-sm text-zinc-500">Aucun personnage ne correspond à « {{ search }} ».</p>
            </div>
          </template>

          <!-- PNJ -->
          <template v-else-if="tab === 'npcs'">
            <SkeletonCards v-if="npcStore.loading && !npcStore.npcs.length" columns="grid-cols-1 md:grid-cols-2 xl:grid-cols-3" :count="3" />
            <EmptyState v-else-if="!npcStore.npcs.length" icon="📜" text="Votre codex PNJ est vide" to="/npc-generator" label="Créer un PNJ" />
            <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <article
                v-for="npc in filteredNpcs"
                :key="npc.id"
                class="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg overflow-hidden group transition-all hover:shadow-xl hover:shadow-black/50 flex flex-col"
              >
                <div class="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-70 group-hover:opacity-100 transition-opacity"></div>
                <button type="button" class="p-5 flex-grow text-left" @click="openedNpc = npc">
                  <div class="flex justify-between items-start mb-2 gap-2">
                    <div class="min-w-0">
                      <h3 class="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors truncate">{{ npc.name }}</h3>
                      <div class="text-xs text-zinc-500">Créé le {{ formatDate(npc.createdAt) }}</div>
                    </div>
                    <span class="shrink-0 text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">{{ npc.names?.race ?? npc.race }}</span>
                  </div>
                  <dl class="space-y-1 my-3 text-sm">
                    <div class="flex items-center justify-between gap-3">
                      <dt class="text-zinc-500">Classe</dt>
                      <dd class="text-zinc-300">{{ npc.names?.class || 'Roturier' }}</dd>
                    </div>
                    <div class="flex items-center justify-between gap-3">
                      <dt class="text-zinc-500">Métier</dt>
                      <dd class="text-zinc-300 truncate text-right" :title="npc.profession">{{ npc.profession || '—' }}</dd>
                    </div>
                  </dl>
                  <p v-if="npc.notes" class="line-clamp-2 text-xs italic text-zinc-400">{{ npc.notes }}</p>
                </button>
                <div class="bg-zinc-950/50 p-3 border-t border-zinc-800 flex justify-between items-center">
                  <button type="button" class="text-xs font-medium text-zinc-400 hover:text-white transition-colors" @click="openedNpc = npc">Voir le détail →</button>
                  <button type="button" class="text-zinc-600 hover:text-red-500 p-1 transition-colors" :aria-label="`Supprimer ${npc.name}`" @click="removeNpc(npc.id)">🗑️</button>
                </div>
              </article>
              <p v-if="!filteredNpcs.length" class="text-sm text-zinc-500">Aucun PNJ ne correspond à « {{ search }} ».</p>
            </div>
          </template>

          <!-- MONSTRES MAISON -->
          <template v-else-if="tab === 'monsters'">
            <SkeletonCards v-if="monstersLoading && !monsters.length" columns="grid-cols-1 md:grid-cols-2 xl:grid-cols-3" :count="3" />
            <EmptyState v-else-if="!monsters.length" icon="🐉" text="Vous n'avez pas encore créé de monstre" :to="{ name: 'homebrew-monster-new' }" label="Créer un monstre" />
            <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <article
                v-for="m in filteredMonsters"
                :key="m.index"
                class="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg overflow-hidden group transition-all hover:shadow-xl hover:shadow-black/50 flex flex-col"
              >
                <div class="h-2 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 opacity-70 group-hover:opacity-100 transition-opacity"></div>
                <router-link :to="{ name: 'homebrew-monster', params: { index: m.index } }" class="p-5 flex-grow">
                  <div class="flex justify-between items-start mb-2 gap-2">
                    <div class="min-w-0">
                      <h3 class="font-bold text-lg text-white group-hover:text-violet-300 transition-colors truncate">{{ m.name }}</h3>
                      <div class="text-xs text-zinc-500">{{ formatTypeLine(m) }}</div>
                    </div>
                    <span class="shrink-0 text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">FP {{ formatChallenge(m.challengeRating) }}</span>
                  </div>
                  <div class="mt-3 flex flex-wrap gap-2 text-xs text-zinc-300">
                    <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1">CA {{ m.armorClass }}</span>
                    <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1">PV {{ m.hitPoints }}</span>
                    <span v-if="m.legendary" class="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-amber-200">Légendaire</span>
                  </div>
                </router-link>
                <div class="bg-zinc-950/50 p-3 border-t border-zinc-800 flex justify-between items-center">
                  <router-link :to="{ name: 'homebrew-monster-edit', params: { index: m.index } }" class="text-xs font-medium text-zinc-400 hover:text-white transition-colors">Modifier →</router-link>
                  <button type="button" class="text-zinc-600 hover:text-red-500 p-1 transition-colors" :aria-label="`Supprimer ${m.name}`" @click="removeMonster(m)">🗑️</button>
                </div>
              </article>
              <p v-if="!filteredMonsters.length" class="text-sm text-zinc-500">Aucun monstre ne correspond à « {{ search }} ».</p>
            </div>
          </template>

          <!-- CAMPAGNES -->
          <template v-else>
            <SkeletonCards v-if="campaignsLoading && !campaigns.length" columns="grid-cols-1 md:grid-cols-2 xl:grid-cols-3" :count="3" />
            <EmptyState
              v-else-if="!campaigns.length"
              icon="🎲"
              text="Vous ne menez ni ne jouez encore aucune campagne"
              :to="{ name: 'gm-dashboard' }"
              label="Créer une campagne"
            />
            <div v-else class="space-y-8">
              <section v-for="group in campaignGroups" :key="group.title">
                <h3 class="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-500">{{ group.title }}</h3>
                <p v-if="!group.items.length" class="text-sm text-zinc-500">{{ group.empty }}</p>
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <router-link
                    v-for="c in group.items"
                    :key="c.id"
                    :to="{ name: 'campaign', params: { id: c.id } }"
                    class="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg overflow-hidden group transition-all hover:shadow-xl hover:shadow-black/50"
                  >
                    <div class="h-2 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 opacity-70 group-hover:opacity-100 transition-opacity"></div>
                    <div class="p-5">
                      <div class="flex items-start justify-between gap-2">
                        <h4 class="font-bold text-lg text-white group-hover:text-red-300 transition-colors">{{ c.name }}</h4>
                        <span class="shrink-0 text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">{{ CAMPAIGN_STATUS_LABELS[c.status] }}</span>
                      </div>
                      <p v-if="c.theme" class="mt-1 text-sm text-zinc-400">{{ c.theme }}</p>
                      <p class="mt-3 text-xs text-zinc-500">
                        <template v-if="c.role === 'PLAYER'">MJ : {{ c.gm }}<template v-if="c.myCharacter"> · avec {{ c.myCharacter.name }}</template> · </template>
                        {{ c.memberCount }} joueur{{ c.memberCount > 1 ? 's' : '' }} · {{ c.sessionCount }} séance{{ c.sessionCount > 1 ? 's' : '' }}
                      </p>
                    </div>
                  </router-link>
                </div>
              </section>
            </div>
          </template>
        </div>
      </div>
    </div>

    <NpcDetailModal v-if="openedNpc" :npc="openedNpc" @close="openedNpc = null" @delete="removeNpc" />
  </div>
</template>

<script setup lang="ts">
import SkeletonCards from '@/components/skeleton/SkeletonCards.vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter, type RouteLocationRaw } from 'vue-router'
import NpcDetailModal from '@/components/profile/NpcDetailModal.vue'
import EmptyState from '@/components/profile/ProfileEmptyState.vue'
import { CAMPAIGN_STATUS_LABELS, campaignsApi, type CampaignSummary } from '@/api/campaigns'
import { deleteRefusal, monstersApi } from '@/api/monsters'
import type { ApiMonsterSummary } from '@/utils/dataLoader'
import { formatChallenge, formatTypeLine } from '@/utils/monsterFormat'
import { useAuthStore } from '@/stores/auth'
import { useCharacterStore } from '@/stores/character'
import { useNpcStore } from '@/stores/npc'
import type { CharacterSummary } from '@/types/character'

type Tab = 'characters' | 'npcs' | 'monsters' | 'campaigns'

const TABS: { key: Tab; label: string; active: string; badge: string }[] = [
  { key: 'characters', label: 'Personnages (PJ)', active: 'bg-amber-900/30 text-amber-400 border border-amber-900/50', badge: 'bg-amber-900/50 text-amber-200' },
  { key: 'npcs', label: 'PNJ', active: 'bg-emerald-900/30 text-emerald-400 border border-emerald-900/50', badge: 'bg-emerald-900/50 text-emerald-200' },
  { key: 'monsters', label: 'Monstres', active: 'bg-violet-900/30 text-violet-300 border border-violet-900/50', badge: 'bg-violet-900/50 text-violet-200' },
  { key: 'campaigns', label: 'Campagnes', active: 'bg-red-900/30 text-red-300 border border-red-900/50', badge: 'bg-red-900/50 text-red-200' },
]
const TAB_HEADINGS: Record<Tab, { icon: string; title: string }> = {
  characters: { icon: '⚔️', title: 'Vos personnages (PJ)' },
  npcs: { icon: '🎭', title: 'Vos personnages non-joueurs' },
  monsters: { icon: '🐉', title: 'Vos monstres' },
  campaigns: { icon: '🎲', title: 'Vos campagnes' },
}
// Encart d'appel à l'action, selon l'onglet
const CTAS: Record<Tab, { heading: string; text: string; label: string; to: RouteLocationRaw; panel: string; title: string; button: string }> = {
  characters: {
    heading: 'Un nouveau héros ?', text: 'Forgez votre destin de A à Z avec notre créateur complet.', label: 'Créer un personnage', to: '/character-creator',
    panel: 'bg-gradient-to-br from-amber-900/20 to-orange-900/20 border-amber-900/30', title: 'text-amber-400', button: 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/20',
  },
  npcs: {
    heading: "Besoin d'un nouveau PNJ ?", text: 'Le générateur est prêt à invoquer une nouvelle âme pour votre histoire.', label: 'Aller au générateur', to: '/npc-generator',
    panel: 'bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border-emerald-900/30', title: 'text-emerald-400', button: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20',
  },
  monsters: {
    heading: 'Une créature à vous ?', text: 'Saisissez son bloc de statistiques, ou partez de la copie d\'un monstre du bestiaire.', label: 'Créer un monstre',
    to: { name: 'homebrew-monster-new' },
    panel: 'bg-gradient-to-br from-violet-900/20 to-fuchsia-900/20 border-violet-900/30', title: 'text-violet-300', button: 'bg-violet-700 hover:bg-violet-600 shadow-violet-900/20',
  },
  campaigns: {
    heading: 'Mener une campagne ?', text: 'Préparez vos séances, vos quêtes et vos rencontres, et invitez vos joueurs.', label: 'Tableau de bord MJ', to: { name: 'gm-dashboard' },
    panel: 'bg-gradient-to-br from-red-900/20 to-rose-900/20 border-red-900/30', title: 'text-red-300', button: 'bg-red-700 hover:bg-red-600 shadow-red-900/20',
  },
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const npcStore = useNpcStore()
const characterStore = useCharacterStore()

const campaigns = ref<CampaignSummary[]>([])
// Monstres maison : visibles par leur seul auteur
const monsters = ref<ApiMonsterSummary[]>([])
const monstersLoading = ref(false)
const campaignsLoading = ref(false)
const openedNpc = ref<any | null>(null)
const search = ref('')
const actionError = ref<string | null>(null)

// Onglet dans l'URL (?tab=npcs) : retour depuis une fiche, lien partagé
const tab = computed<Tab>(() => (TABS.some((t) => t.key === route.query.tab) ? (route.query.tab as Tab) : 'characters'))
function selectTab(key: Tab) {
  search.value = ''
  router.replace({ query: { ...route.query, tab: key === 'characters' ? undefined : key } })
}
const cta = computed(() => CTAS[tab.value])
const counts = computed<Record<Tab, number>>(() => ({
  characters: characterStore.characters.length,
  npcs: npcStore.npcs.length,
  monsters: monsters.value.length,
  campaigns: campaigns.value.length,
}))

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const matches = (...values: (string | null | undefined)[]) => {
  const query = normalize(search.value.trim())
  return !query || values.some((v) => v && normalize(v).includes(query))
}

const classLine = (c: CharacterSummary) => c.names.classes
  .map((cl) => `${cl.class}${cl.subclass ? ` (${cl.subclass})` : ''}`).join(' / ') || c.classes[0]?.class
// Plus récemment modifiés en premier
const filteredCharacters = computed(() => [...characterStore.characters]
  .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
  .filter((c) => matches(c.name, c.names.race, c.names.subrace, classLine(c))))
const filteredNpcs = computed(() => npcStore.npcs.filter((n: any) => matches(n.name, n.profession, n.names?.race, n.names?.class)))

const filteredMonsters = computed(() => monsters.value.filter((m) => matches(m.name, m.type.name)))

const campaignsOf = (characterId: number) => campaigns.value.filter((c) => c.myCharacter?.id === characterId)
const campaignGroups = computed(() => [
  { title: 'Que je mène', empty: "Vous n'avez pas encore créé de campagne.", items: campaigns.value.filter((c) => c.role === 'GM') },
  { title: 'Où je joue', empty: "Rejoignez une campagne avec le lien d'invitation de votre MJ.", items: campaigns.value.filter((c) => c.role === 'PLAYER') },
])

const formatDate = (iso: string | undefined) => (iso ? new Date(iso).toLocaleDateString('fr-FR') : '—')

async function removeCharacter(char: CharacterSummary) {
  const playing = campaignsOf(char.id)
  const warning = playing.length ? `\nIl quittera aussi ${playing.length > 1 ? 'les campagnes' : 'la campagne'} ${playing.map((c) => `« ${c.name} »`).join(', ')}.` : ''
  if (!window.confirm(`Supprimer définitivement ${char.name} ?${warning}`)) return
  actionError.value = null
  try {
    await characterStore.deleteCharacter(char.id)
    if (playing.length) campaigns.value = await campaignsApi.list()
  } catch {
    actionError.value = `Impossible de supprimer ${char.name}.`
  }
}

async function removeMonster(m: ApiMonsterSummary) {
  if (!window.confirm(`Supprimer définitivement « ${m.name} » ?`)) return
  actionError.value = null
  try {
    await monstersApi.remove(m.index)
    monsters.value = monsters.value.filter((x) => x.index !== m.index)
  } catch (e) {
    actionError.value = deleteRefusal(e, m.name) ?? `Impossible de supprimer « ${m.name} ».`
  }
}

async function removeNpc(id: number) {
  if (!window.confirm('Supprimer définitivement ce PNJ ? Il sera aussi retiré de vos campagnes.')) return
  await npcStore.deleteNpc(id)
  openedNpc.value = null
}

async function load() {
  if (!authStore.isAuthenticated) return
  campaignsLoading.value = true
  monstersLoading.value = true
  await Promise.all([
    monstersApi.list().then((list) => (monsters.value = list)).catch((e) => console.error(e)).finally(() => (monstersLoading.value = false)),
    npcStore.fetchNpcs().catch((e) => console.error(e)),
    characterStore.fetchCharacters().catch((e) => console.error(e)),
    campaignsApi.list().then((list) => (campaigns.value = list)).catch((e) => console.error(e)),
  ])
  campaignsLoading.value = false
}

onMounted(load)
watch(() => authStore.isAuthenticated, load)

</script>
