<template>
  <div class="space-y-3">
    <template v-for="(block, i) in blocks" :key="i">
      <p v-if="block.type === 'paragraph'" class="leading-relaxed"><RichInline :text="block.text" /></p>
      <div v-else class="overflow-x-auto rounded-2xl border border-white/10">
        <table class="w-full text-left text-sm">
          <caption v-if="block.caption" class="px-4 py-2 text-left font-semibold text-amber-200"><RichInline :text="block.caption" /></caption>
          <thead class="bg-white/5 text-xs uppercase tracking-wider text-zinc-400">
            <tr><th v-for="(h, j) in block.header" :key="j" class="px-4 py-2 font-semibold"><RichInline :text="h" /></th></tr>
          </thead>
          <tbody>
            <tr v-for="(row, j) in block.rows" :key="j" class="border-t border-white/5">
              <td v-for="(cell, k) in row" :key="k" class="px-4 py-2 align-top"><RichInline :text="cell" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue'
import KeywordText from '@/components/KeywordText.vue'
import { parseInline, parseRichText } from '@/utils/richText'

const props = defineProps<{ text: string | null | undefined }>()
const blocks = computed(() => parseRichText(props.text))

// Gras et italique en ligne, rendus en éléments (pas de v-html), mots-clés des règles en infobulle
const RichInline = defineComponent({
  props: { text: { type: String, required: true } },
  setup: (p) => () =>
    parseInline(p.text).map((s) => {
      const text = h(KeywordText, { text: s.text })
      if (!s.strong && !s.em) return text
      const inner = s.em ? h('em', [text]) : text
      return s.strong ? h('strong', { class: 'font-semibold text-zinc-100' }, [inner]) : inner
    }),
})
</script>
