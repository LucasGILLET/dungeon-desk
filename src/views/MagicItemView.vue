<template>
  <div class="min-h-[calc(100vh-5rem)] bg-zinc-950 text-zinc-200">
    <div class="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <button type="button" class="mb-4 flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-amber-300" @click="goBack">
        <span>←</span><span>Objets magiques</span>
      </button>

      <p v-if="loading" class="text-zinc-400">Chargement de l'objet…</p>
      <p v-else-if="error" class="text-red-300">{{ error }}</p>

      <article v-else-if="item" class="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_16px_50px_rgba(0,0,0,0.22)] sm:p-8">
        <header class="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0">
            <h1 class="text-4xl font-bold text-amber-300">{{ item.name }}</h1>
            <p class="mt-1 italic text-zinc-400">{{ item.subtitle }}</p>
            <div class="mt-4 flex flex-wrap gap-2 text-xs">
              <span :class="['rounded-full border px-3 py-1', RARITY_CLASSES[item.rarity]]">{{ RARITY_LABELS[item.rarity] }}</span>
              <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-zinc-300">{{ item.category.name }}</span>
              <span v-if="item.requiresAttunement" class="rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-3 py-1 text-fuchsia-200">Nécessite un lien</span>
            </div>
          </div>
          <LoadingImage v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" size-class="h-32 w-32" />
        </header>

        <section class="mt-6 text-zinc-300">
          <RichText :text="item.description" />
        </section>

        <section v-if="item.variants.length" class="mt-6 border-t border-white/10 pt-5">
          <h2 class="mb-3 text-lg font-semibold text-amber-200">Variantes</h2>
          <div class="flex flex-wrap gap-2">
            <router-link
              v-for="v in item.variants"
              :key="v.index"
              :to="{ name: 'magic-item-view', params: { index: v.index } }"
              :class="['rounded-full border px-3 py-1 text-sm hover:brightness-125', RARITY_CLASSES[v.rarity]]"
            >{{ v.name }} · {{ RARITY_LABELS[v.rarity].toLowerCase() }}</router-link>
          </div>
        </section>

        <p v-if="item.variantOf" class="mt-6 border-t border-white/10 pt-5 text-sm text-zinc-400">
          Variante de
          <router-link :to="{ name: 'magic-item-view', params: { index: item.variantOf.index } }" class="text-amber-200 hover:underline">{{ item.variantOf.name }}</router-link>
        </p>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LoadingImage from '@/components/LoadingImage.vue'
import RichText from '@/components/RichText.vue'
import { loadMagicItem, type ApiMagicItem } from '@/utils/dataLoader'
import { RARITY_CLASSES, RARITY_LABELS } from '@/utils/monsterFormat'

const route = useRoute()
const router = useRouter()
const item = ref<ApiMagicItem | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

function goBack() {
  if (window.history.state?.back) router.back()
  else router.push({ name: 'magic-items' })
}

// Rechargé quand on passe d'une variante à l'autre (même vue, autre index)
watch(() => route.params.index, async (index) => {
  if (!index) return
  loading.value = true
  error.value = null
  try {
    item.value = await loadMagicItem(String(index))
  } catch {
    item.value = null
    error.value = 'Objet introuvable.'
  } finally {
    loading.value = false
  }
}, { immediate: true })
</script>
