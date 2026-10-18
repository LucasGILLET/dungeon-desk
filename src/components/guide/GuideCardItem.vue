<template>
  <article
    class="rounded-2xl border bg-white/3 p-5 text-sm leading-relaxed text-zinc-300 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
    :class="accent.card"
  >
    <p v-if="card.eyebrow" class="mb-2 text-[10px] uppercase tracking-[0.3em] text-zinc-500">{{ card.eyebrow }}</p>
    <h3 class="font-serif text-lg font-bold text-white">
      <span v-if="card.icon" class="mr-1">{{ card.icon }}</span>{{ card.title }}
    </h3>
    <MarkdownText v-if="card.summary" :text="card.summary" class="mt-3" />

    <div
      v-for="(list, i) in card.lists"
      :key="i"
      :class="list.label ? 'mt-3 rounded-xl border border-white/5 bg-black/20 p-4 text-xs' : 'mt-4 text-xs text-zinc-400'"
    >
      <span v-if="list.label" class="mb-2 block text-[10px] uppercase tracking-[0.25em] text-zinc-400">{{ list.label }}</span>
      <ul class="space-y-2">
        <li v-for="item in list.items" :key="item" class="flex gap-2">
          <span class="mt-[0.35rem] h-1.5 w-1.5 shrink-0 rounded-full" :class="accent.dot"></span>
          <MarkdownText :text="item" inline />
        </li>
      </ul>
    </div>

    <div v-if="card.advice" class="mt-4 rounded-xl border border-white/5 bg-black/20 p-4 text-xs leading-relaxed text-zinc-300">
      <span class="mb-2 block text-[10px] uppercase tracking-[0.25em] text-zinc-400">À retenir</span>
      <MarkdownText :text="card.advice" inline />
    </div>

    <router-link
      v-if="card.rule"
      :to="{ name: 'rules', query: { section: card.rule.index } }"
      class="mt-4 inline-block text-xs text-sky-300 hover:text-sky-200 hover:underline"
    >Règle : {{ card.rule.name }} →</router-link>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MarkdownText from '@/components/MarkdownText.vue'
import type { ApiGuideCard } from '@/utils/dataLoader'
import { accentClasses } from '@/utils/guideAccent'

const props = defineProps<{ card: ApiGuideCard }>()
const accent = computed(() => accentClasses(props.card.accent))
</script>
