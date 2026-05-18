<template>
  <div class="sort-view min-h-[calc(100vh-5rem)] bg-zinc-950 text-zinc-200 font-sans selection:bg-amber-500/30 overflow-hidden relative">

    <div v-if="loading">Chargement du sort…</div>
    <div v-else-if="error">Erreur: {{ error }}</div>
    <div v-else-if="!spell">Sort non trouvé.</div>

    <article v-else>
      <button @click="goBack" class="ml-4 mb-4 text-sm text-zinc-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer">
        <span class="leading-none">←</span>
        <span class="leading-none">Retour</span>
      </button>

      <div class="px-6 py-8 max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_16px_50px_rgba(0,0,0,0.22)] mx-4 my-4">
      <!-- Titre -->
      <h1 class="text-amber-300 text-4xl font-bold mb-1">{{ spell.name }}</h1>
      
      <!-- Niveau et École -->
      <p class="text-zinc-400 mb-6">Niveau {{ spell.level }} — {{ spell.school?.name || '' }}</p>

      <!-- Caractéristiques -->
      <div class="space-y-2 mb-6">
        <p v-if="spell.casting_time"><strong>Temps d'incantation :</strong> {{ spell.casting_time }}</p>
        <p v-if="spell.range"><strong>Portée :</strong> {{ spell.range }}</p>
        <p v-if="spell.components && spell.components.length"><strong>Composantes :</strong> {{ spell.components.join(', ') }} <span v-if="spell.material">— {{ spell.material }}</span></p>
        <p v-if="spell.duration"><strong>Durée :</strong> {{ spell.duration }} <span v-if="spell.concentration">(Concentration)</span></p>
      </div>

      <!-- Description -->
      <section v-if="spell.desc && spell.desc.length" class="mb-6 italic">
        <div v-for="(d, i) in spell.desc" :key="i" class="mb-2">{{ d }}</div>
      </section>

      <!-- Aux niveaux supérieurs -->
      <section v-if="spell.higher_level && spell.higher_level.length" class="mb-6">
        <h3 class="text-lg font-semibold mb-2 text-amber-200">Aux niveaux supérieurs</h3>
        <div v-for="(h, i) in spell.higher_level" :key="i" class="mb-2">{{ h }}</div>
      </section>

      <!-- Classes -->
      <section v-if="spell.classes && spell.classes.length" class="flex flex-wrap gap-2">
        <span v-for="c in spell.classes" :key="c.index" class="inline-block bg-amber-500/20 border border-amber-500 text-amber-300 px-3 py-1 rounded-full text-sm font-medium">{{ c.name }}</span>
      </section>

</div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const index = String(route.params.index || '')

const loading = ref(true)
const error = ref<string | null>(null)
const spell = ref<any | null>(null)

onMounted(async () => {
  try {
    const res = await fetch('/data/fr/5e-SRD-Spells.json')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const list = await res.json()
    spell.value = list.find((s: any) => s.index === index || s.name?.toLowerCase().replace(/\s+/g, '-') === index)
  } catch (e: any) {
    error.value = e.message || String(e)
  } finally {
    loading.value = false
  }
})

const goBack = () => {
  router.back()
}

</script>

<style scoped>
    .sort-view { max-width: 760px; margin: auto; padding: 2rem 0rem; }
    .sort-view h1 { margin-bottom: 0.25rem; }
    .meta { color: #666; margin-bottom: 1rem; }
    pre { background: #f7f7f7; padding: 0.5rem; overflow:auto }
</style>
