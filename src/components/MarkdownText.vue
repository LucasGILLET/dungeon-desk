<template>
  <span v-if="inline" class="markdown" v-html="html"></span>
  <div v-else class="markdown" v-html="html"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { renderMarkdown } from '@/utils/markdown'

const props = defineProps<{ text: string | null | undefined; inline?: boolean }>()
const html = computed(() => renderMarkdown(props.text, { inline: props.inline }))
</script>

<style scoped>
.markdown :deep(p) { margin: 0.75rem 0; line-height: 1.7; }
.markdown :deep(p:first-child) { margin-top: 0; }
.markdown :deep(p:last-child) { margin-bottom: 0; }
.markdown :deep(strong) { color: #fafafa; font-weight: 600; }
.markdown :deep(em) { color: #e4e4e7; }
.markdown :deep(h1), .markdown :deep(h2) { margin: 2rem 0 0.75rem; font-family: var(--font-serif, serif); font-size: 1.6rem; font-weight: 700; color: #fde68a; }
.markdown :deep(h3), .markdown :deep(h4) { margin: 1.5rem 0 0.5rem; font-size: 1.2rem; font-weight: 600; color: #fcd34d; }
.markdown :deep(h5), .markdown :deep(h6) { margin: 1.25rem 0 0.5rem; font-size: 1rem; font-weight: 600; color: #fbbf24; }
.markdown :deep(ul), .markdown :deep(ol) { margin: 0.75rem 0; padding-left: 1.5rem; }
.markdown :deep(ul) { list-style: disc; }
.markdown :deep(ol) { list-style: decimal; }
.markdown :deep(li) { margin: 0.35rem 0; }
.markdown :deep(table) { display: block; overflow-x: auto; margin: 1rem 0; border-collapse: collapse; font-size: 0.875rem; }
.markdown :deep(th), .markdown :deep(td) { border: 1px solid rgb(255 255 255 / 0.1); padding: 0.4rem 0.75rem; text-align: left; vertical-align: top; }
.markdown :deep(th) { background: rgb(255 255 255 / 0.05); color: #d4d4d8; }
.markdown :deep(a) { color: #7dd3fc; text-decoration: underline; }
.markdown :deep(blockquote) { margin: 1rem 0; border-left: 3px solid rgb(245 158 11 / 0.4); padding-left: 1rem; color: #a1a1aa; }
</style>
