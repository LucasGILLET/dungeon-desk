<template>
  <div class="space-y-4">
    <div v-if="section.body" class="rounded-2xl border border-white/10 bg-zinc-800/60 p-4 text-center text-zinc-200">
      <MarkdownText :text="section.body" />
    </div>

    <template v-for="card in section.cards" :key="card.index">
      <!-- Carte qui ouvre une section de détail (Attaquer → séquence d'attaque) -->
      <button
        v-if="card.detail"
        type="button"
        class="group relative w-full overflow-hidden rounded-2xl border border-l-4 border-zinc-700 bg-zinc-800 p-4 text-left transition hover:brightness-110"
        :class="accent.edge"
        @click="$emit('open', card.detail)"
      >
        <div class="flex items-center justify-between">
          <h3 class="flex items-center gap-2 text-lg font-bold" :class="accent.text">
            <span v-if="card.icon">{{ card.icon }}</span>{{ card.title }}
          </h3>
          <span class="text-zinc-400 group-hover:text-white">➔</span>
        </div>
        <MarkdownText v-if="card.summary" :text="card.summary" class="mt-1 text-sm text-zinc-400" />
      </button>

      <div v-else class="rounded-2xl border border-zinc-700/70 bg-zinc-800/50 p-4" :class="cardAccent(card)">
        <p v-if="card.eyebrow" class="mb-1 text-xs italic text-zinc-400">{{ card.eyebrow }}</p>
        <h3 class="flex items-center gap-2 font-bold text-zinc-100">
          <span v-if="card.icon" :class="/^\d+$/.test(card.icon) ? STEP_CLASSES : ''">{{ card.icon }}</span>
          {{ card.title }}
        </h3>
        <MarkdownText v-if="card.summary" :text="card.summary" class="mt-2 text-sm text-zinc-300" />
        <ul v-for="(list, i) in card.lists" :key="i" class="mt-2 space-y-2 text-sm text-zinc-300">
          <li v-for="item in list.items" :key="item"><MarkdownText :text="item" inline /></li>
        </ul>
        <p v-if="card.advice" class="mt-2 rounded-lg bg-black/30 px-3 py-2 text-center text-sm font-semibold text-zinc-200">
          <MarkdownText :text="card.advice" inline />
        </p>
        <router-link
          v-if="card.rule"
          :to="{ name: 'rules', query: { section: card.rule.index } }"
          class="mt-2 inline-block text-xs text-sky-300 hover:underline"
        >Règle : {{ card.rule.name }} →</router-link>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MarkdownText from '@/components/MarkdownText.vue'
import type { ApiGuideCard, ApiGuideSection } from '@/utils/dataLoader'
import { accentClasses } from '@/utils/guideAccent'

const props = defineProps<{ section: ApiGuideSection }>()
defineEmits<{ (e: 'open', section: string): void }>()

const accent = computed(() => accentClasses(props.section.accent))
// Étapes numérotées (séquence d'attaque) : icône "1", "2"
const STEP_CLASSES = 'flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-sm text-white'
// Cartes avec leur propre couleur (critique, échec) : bordure gauche colorée
const cardAccent = (card: ApiGuideCard) => (card.accent ? ['border-l-4', accentClasses(card.accent).edge] : [])
</script>
