<template>
  <div class="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-zinc-950 text-zinc-200">
    <div class="pointer-events-none fixed inset-0">
      <div class="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-red-900/20 blur-[128px]"></div>
      <div class="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-amber-900/10 blur-[128px]"></div>
    </div>

    <div class="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="font-serif text-4xl font-bold text-red-50 sm:text-5xl">Tableau de bord MJ</h1>
          <p class="mt-2 text-zinc-400">Vos campagnes, et celles où vous jouez.</p>
        </div>
        <button v-if="authStore.isAuthenticated && !creating" type="button" class="ui-btn-primary" @click="creating = true">+ Nouvelle campagne</button>
      </header>

      <section v-if="!authStore.isAuthenticated" class="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
        <p class="text-lg text-zinc-200">Connectez-vous pour créer et retrouver vos campagnes.</p>
        <button type="button" class="ui-btn-primary mt-5" @click="authStore.login()">Se connecter</button>
      </section>

      <template v-else>
        <form v-if="creating" class="mb-8 grid gap-4 rounded-3xl border border-red-900/40 bg-zinc-900/80 p-6" @submit.prevent="create">
          <h2 class="font-serif text-2xl font-bold text-amber-100">Nouvelle campagne</h2>
          <label class="ui-label">
            <span>Nom</span>
            <input v-model="form.name" required maxlength="200" class="ui-input" placeholder="La mine perdue de Phandelver" />
          </label>
          <label class="ui-label">
            <span>Thème</span>
            <input v-model="form.theme" maxlength="500" class="ui-input" placeholder="Exploration, horreur gothique…" />
          </label>
          <label class="ui-label">
            <span>Présentation (Markdown, visible des joueurs)</span>
            <textarea v-model="form.description" rows="4" class="ui-input"></textarea>
          </label>
          <p v-if="formError" class="text-sm text-red-300">{{ formError }}</p>
          <div class="flex gap-2">
            <button type="submit" class="ui-btn-primary" :disabled="saving || !form.name.trim()">Créer</button>
            <button type="button" class="ui-btn" @click="creating = false">Annuler</button>
          </div>
        </form>

        <p v-if="loading" class="text-zinc-400">Chargement des campagnes…</p>
        <p v-else-if="error" class="text-red-300">{{ error }}</p>

        <template v-else>
          <section v-for="group in groups" :key="group.title" class="mb-10">
            <h2 class="mb-4 font-serif text-2xl font-bold text-amber-200">{{ group.title }}</h2>
            <p v-if="!group.campaigns.length" class="text-sm text-zinc-500">{{ group.empty }}</p>
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <router-link
                v-for="c in group.campaigns"
                :key="c.id"
                :to="{ name: 'campaign', params: { id: c.id } }"
                class="group rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:border-red-500/40"
              >
                <div class="flex items-start justify-between gap-3">
                  <h3 class="text-xl font-semibold text-amber-100 group-hover:text-white">{{ c.name }}</h3>
                  <span class="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-zinc-300">{{ CAMPAIGN_STATUS_LABELS[c.status] }}</span>
                </div>
                <p v-if="c.theme" class="mt-1 text-sm text-zinc-400">{{ c.theme }}</p>
                <p class="mt-4 text-xs text-zinc-500">
                  <template v-if="c.role === 'PLAYER'">MJ : {{ c.gm }} · </template>
                  {{ c.memberCount }} joueur{{ c.memberCount > 1 ? 's' : '' }} · {{ c.sessionCount }} séance{{ c.sessionCount > 1 ? 's' : '' }}
                </p>
              </router-link>
            </div>
          </section>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { CAMPAIGN_STATUS_LABELS, campaignsApi, type CampaignSummary } from '@/api/campaigns'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const campaigns = ref<CampaignSummary[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const creating = ref(false)
const saving = ref(false)
const formError = ref<string | null>(null)
const form = reactive({ name: '', theme: '', description: '' })

const groups = computed(() => [
  { title: 'Mes campagnes', empty: "Vous n'avez pas encore créé de campagne.", campaigns: campaigns.value.filter((c) => c.role === 'GM') },
  { title: 'Campagnes où je joue', empty: "Rejoignez une campagne avec le lien d'invitation de votre MJ.", campaigns: campaigns.value.filter((c) => c.role === 'PLAYER') },
])

async function load() {
  if (!authStore.isAuthenticated) return
  loading.value = true
  error.value = null
  try {
    campaigns.value = await campaignsApi.list()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Impossible de charger les campagnes.'
  } finally {
    loading.value = false
  }
}

async function create() {
  saving.value = true
  formError.value = null
  try {
    const { id } = await campaignsApi.create({ name: form.name.trim(), theme: form.theme.trim() || null, description: form.description || null })
    router.push({ name: 'campaign', params: { id } })
  } catch (e) {
    formError.value = e instanceof Error ? e.message : 'Création impossible.'
  } finally {
    saving.value = false
  }
}

onMounted(load)
watch(() => authStore.isAuthenticated, load)
</script>
