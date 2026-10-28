<template>
  <div class="min-h-[calc(100vh-5rem)] bg-zinc-950 text-zinc-200">
    <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <button type="button" class="mb-4 flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-amber-300" @click="goBack">
        <span>←</span><span>Bestiaire</span>
      </button>

      <div v-if="loading" class="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8"><SkeletonText :lines="10" label="Chargement de la créature…" /></div>
      <p v-else-if="error" class="text-red-300">{{ error }}</p>

      <article v-else-if="monster" class="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_16px_50px_rgba(0,0,0,0.22)] sm:p-8">
        <header class="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0">
            <h1 class="text-4xl font-bold text-amber-300">{{ monster.name }}</h1>
            <p class="mt-1 italic text-zinc-400">{{ formatTypeLine(monster) }}</p>
            <!-- Monstre maison : modifier, supprimer ; monstre du SRD : en faire une copie à adapter -->
            <div v-if="homebrew" class="mt-3 flex flex-wrap items-center gap-2">
              <span class="rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-xs text-violet-200">Monstre maison</span>
              <router-link :to="{ name: 'homebrew-monster-edit', params: { index: monster.index } }" class="ui-btn">Modifier</router-link>
              <button type="button" class="ui-btn-danger" :disabled="deleting" @click="removeMonster">Supprimer</button>
            </div>
            <router-link v-else-if="authStore.isAuthenticated" :to="{ name: 'homebrew-monster-new', query: { from: monster.index } }" class="ui-btn mt-3 inline-block">
              Copier dans mes monstres
            </router-link>
            <p v-if="deleteError" class="mt-2 text-sm text-red-300">{{ deleteError }}</p>
          </div>
          <LoadingImage v-if="monster.imageUrl" :src="monster.imageUrl" :alt="monster.name" size-class="h-40 w-40" />
        </header>

        <hr class="my-5 border-red-400/30" />
        <dl class="space-y-1">
          <div><dt class="mr-1 inline font-semibold text-amber-100">Classe d'armure </dt><dd class="inline">{{ formatArmorClass(monster) }}</dd></div>
          <div><dt class="mr-1 inline font-semibold text-amber-100">Points de vie </dt><dd class="inline">{{ formatHitPoints(monster) }}</dd></div>
          <div><dt class="mr-1 inline font-semibold text-amber-100">Vitesse </dt><dd class="inline">{{ formatSpeeds(monster.speeds) }}</dd></div>
        </dl>

        <hr class="my-5 border-red-400/30" />
        <div class="grid grid-cols-3 gap-3 text-center sm:grid-cols-6">
          <div v-for="a in abilities" :key="a.key" class="rounded-2xl border border-white/10 bg-white/5 px-2 py-3">
            <p class="text-xs font-semibold uppercase tracking-wider text-zinc-400">{{ a.label }}</p>
            <p class="text-lg font-semibold text-zinc-100">{{ monster.abilityScores[a.key] }}</p>
            <p class="text-sm text-zinc-400">{{ signed(abilityModifier(monster.abilityScores[a.key])) }}</p>
          </div>
        </div>

        <hr class="my-5 border-red-400/30" />
        <dl class="space-y-1">
          <div v-for="line in detailLines" :key="line.label">
            <dt class="mr-1 inline font-semibold text-amber-100">{{ line.label }} </dt><dd class="inline">{{ line.value }}</dd>
          </div>
        </dl>

        <hr class="my-5 border-red-400/30" />
        <section v-if="monster.traits.length" class="space-y-3">
          <MonsterActionBlock v-for="(a, i) in monster.traits" :key="`trait-${i}`" :action="a" :homebrew="monster.source === 'HOMEBREW'" />
        </section>

        <section v-for="group in actionGroups" :key="group.title" class="mt-6">
          <h2 class="mb-3 border-b border-red-400/30 pb-1 text-2xl font-semibold text-amber-200">{{ group.title }}</h2>
          <p v-if="group.intro" class="mb-3 text-zinc-300">{{ group.intro }}</p>
          <div class="space-y-3">
            <MonsterActionBlock v-for="(a, i) in group.actions" :key="`${group.title}-${i}`" :action="a" :legendary="group.legendary" :homebrew="monster.source === 'HOMEBREW'" />
          </div>
        </section>

        <section v-if="monster.description" class="mt-6 border-t border-white/10 pt-5 text-zinc-300">
          <RichText :text="monster.description" />
        </section>

        <section v-if="monster.forms.length" class="mt-6 flex flex-wrap items-center gap-2 text-sm">
          <span class="text-zinc-400">Autres formes :</span>
          <router-link
            v-for="f in monster.forms"
            :key="f.index"
            :to="{ name: 'monster-view', params: { index: f.index } }"
            class="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-amber-200 hover:bg-amber-500/20"
          >{{ f.name }}</router-link>
        </section>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import SkeletonText from '@/components/skeleton/SkeletonText.vue'
import { computed, ref, watch } from 'vue'
import { summarize, usePageMeta } from '@/utils/pageMeta'
import { useRoute, useRouter } from 'vue-router'
import MonsterActionBlock from '@/components/bestiary/MonsterActionBlock.vue'
import LoadingImage from '@/components/LoadingImage.vue'
import RichText from '@/components/RichText.vue'
import { deleteRefusal, monstersApi } from '@/api/monsters'
import { useAuthStore } from '@/stores/auth'
import { loadMonster, type ApiMonster } from '@/utils/dataLoader'
import {
  abilityModifier, formatArmorClass, formatChallenge, formatChallengeLine, formatDamageModifiers, formatHitPoints, formatSenses, formatSpeeds, formatTypeLine, meters, signed,
} from '@/utils/monsterFormat'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
// /my-monsters/:index : monstre maison de l'utilisateur, sinon bestiaire du SRD
const homebrew = computed(() => route.name === 'homebrew-monster')
const monster = ref<ApiMonster | null>(null)
usePageMeta(() => monster.value && {
  title: monster.value.name,
  description: summarize(`${formatTypeLine(monster.value)}, FP ${formatChallenge(monster.value.challengeRating)}. ${monster.value.description ?? ''}`),
  image: monster.value.imageUrl,
  noindex: homebrew.value,
})
const deleting = ref(false)
const deleteError = ref<string | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const abilities = [
  { key: 'str', label: 'For' }, { key: 'dex', label: 'Dex' }, { key: 'con', label: 'Con' },
  { key: 'int', label: 'Int' }, { key: 'wis', label: 'Sag' }, { key: 'cha', label: 'Cha' },
] as const

// Lignes facultatives du bloc de statistiques, dans l'ordre du Manuel des monstres
const detailLines = computed(() => {
  const m = monster.value
  if (!m) return []
  const bonuses = (list: { name: string; bonus: number }[]) => list.map((x) => `${x.name} ${signed(x.bonus)}`).join(', ')
  const languages = [m.languages.text, !m.languages.text?.includes('télépathie') && m.languages.telepathyFt ? `télépathie à ${meters(m.languages.telepathyFt)}` : null]
  return [
    { label: 'Jets de sauvegarde', value: bonuses(m.savingThrows) },
    { label: 'Compétences', value: bonuses(m.skills) },
    { label: 'Vulnérabilités aux dégâts', value: formatDamageModifiers(m.damageVulnerabilities) },
    { label: 'Résistances aux dégâts', value: formatDamageModifiers(m.damageResistances) },
    { label: 'Immunités aux dégâts', value: formatDamageModifiers(m.damageImmunities) },
    { label: "Immunités contre l'état", value: m.conditionImmunities.map((c) => c.name.toLowerCase()).join(', ') },
    { label: 'Sens', value: formatSenses(m) },
    { label: 'Langues', value: languages.filter(Boolean).join(', ') || '—' },
    { label: 'Puissance', value: formatChallengeLine(m) },
    { label: 'Bonus de maîtrise', value: signed(m.proficiencyBonus) },
  ].filter((line) => line.value)
})

const actionGroups = computed(() => {
  const m = monster.value
  if (!m) return []
  const legendaryIntro = m.legendaryActionsPerRound
    ? `Cette créature peut effectuer ${m.legendaryActionsPerRound} ${m.legendaryActionsPerRound > 1 ? 'actions légendaires, choisies' : 'action légendaire, choisie'} parmi les options ci-dessous. Une seule action légendaire peut être utilisée à la fois, et seulement à la fin du tour d'une autre créature. Elle récupère les actions légendaires dépensées au début de son tour.`
    : null
  return [
    { title: 'Actions', actions: m.actions, intro: null, legendary: false },
    { title: 'Actions bonus', actions: m.bonusActions, intro: null, legendary: false },
    { title: 'Réactions', actions: m.reactions, intro: null, legendary: false },
    { title: 'Actions légendaires', actions: m.legendaryActions, intro: legendaryIntro, legendary: true },
    { title: 'Actions de repaire', actions: m.lairActions, intro: null, legendary: false },
  ].filter((g) => g.actions.length)
})

async function removeMonster() {
  if (!monster.value || !window.confirm(`Supprimer définitivement « ${monster.value.name} » ?`)) return
  deleting.value = true
  deleteError.value = null
  try {
    await monstersApi.remove(monster.value.index)
    router.push({ name: 'bestiary', query: { source: 'mine' } })
  } catch (e) {
    deleteError.value = deleteRefusal(e, monster.value.name) ?? 'Suppression impossible.'
  } finally {
    deleting.value = false
  }
}

function goBack() {
  if (window.history.state?.back) router.back()
  else router.push({ name: 'bestiary' })
}

// Rechargé quand on passe d'une forme à l'autre (même vue, autre index)
watch(() => route.params.index, async (index) => {
  if (!index) return
  loading.value = true
  error.value = null
  try {
    monster.value = homebrew.value ? await monstersApi.get(String(index)) : await loadMonster(String(index))
  } catch {
    monster.value = null
    error.value = 'Créature introuvable.'
  } finally {
    loading.value = false
  }
}, { immediate: true })
</script>
