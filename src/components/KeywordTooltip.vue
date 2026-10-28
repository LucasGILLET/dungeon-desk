<template>
  <button
    ref="trigger"
    type="button"
    class="keyword"
    :aria-expanded="open"
    :aria-describedby="open ? id : undefined"
    @mouseenter="show"
    @mouseleave="hide"
    @focus="show"
    @blur="hide"
    @click.stop="toggle"
    @keydown.esc="close"
  ><slot /></button>
  <Teleport to="body">
    <div
      v-if="open"
      :id="id"
      ref="card"
      role="tooltip"
      class="keyword-card"
      :style="position"
    >
      <div class="mb-1 flex items-baseline justify-between gap-3">
        <span class="font-serif text-base font-bold text-amber-200">{{ entry.title }}</span>
        <span class="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{{ entry.category }}</span>
      </div>
      <p v-for="(p, i) in paragraphs" :key="i" class="mt-1.5 first:mt-0">{{ p }}</p>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId } from 'vue'
import type { GlossaryEntry } from '@/utils/glossary'
import { plainText } from '@/utils/richText'

const props = defineProps<{ entry: GlossaryEntry }>()

const id = useId()
const trigger = ref<HTMLElement | null>(null)
const card = ref<HTMLElement | null>(null)
const open = ref(false)
// Ouverte d'un clic (toucher sur mobile) : reste affichée sans survol
const pinned = ref(false)
const position = ref<Record<string, string>>({})
const paragraphs = computed(() => props.entry.text.split(/\n+/).map((l) => plainText(l.replace(/^[-•]\s*/, '• '))).filter(Boolean))

const WIDTH = 300
const GAP = 8

async function place() {
  const rect = trigger.value?.getBoundingClientRect()
  if (!rect) return
  const width = Math.min(WIDTH, window.innerWidth - 2 * GAP)
  const left = Math.min(Math.max(GAP, rect.left + rect.width / 2 - width / 2), window.innerWidth - width - GAP)
  position.value = { width: `${width}px`, left: `${left}px`, top: `${rect.bottom + GAP}px` }
  await nextTick()
  // Au-dessus du mot quand la place manque en dessous
  const height = card.value?.offsetHeight ?? 0
  if (rect.bottom + GAP + height > window.innerHeight && rect.top - GAP - height > 0) {
    position.value = { ...position.value, top: `${rect.top - GAP - height}px` }
  }
}

function listen(on: boolean) {
  const method = on ? 'addEventListener' : 'removeEventListener'
  document[method]('click', close)
  window[method]('scroll', close, true)
  window[method]('resize', close)
}

function show() {
  if (open.value) return
  open.value = true
  listen(true)
  place()
}
function hide() {
  if (!pinned.value) close()
}
function close() {
  if (!open.value) return
  open.value = false
  pinned.value = false
  listen(false)
}
function toggle() {
  if (pinned.value) return close()
  pinned.value = true
  show()
}

onBeforeUnmount(() => listen(false))
</script>

<style scoped>
.keyword {
  display: inline;
  padding: 0;
  font: inherit;
  color: rgb(253 230 138); /* amber-200 */
  text-decoration: underline dotted rgb(245 158 11 / 0.6);
  text-underline-offset: 3px;
  cursor: help;
}
.keyword:hover,
.keyword[aria-expanded='true'] {
  color: rgb(254 243 199); /* amber-100 */
}
.keyword:focus-visible {
  outline: 2px solid rgb(245 158 11 / 0.6);
  outline-offset: 2px;
  border-radius: 2px;
}
.keyword-card {
  position: fixed;
  z-index: 70;
  border-radius: 14px;
  border: 1px solid rgb(245 158 11 / 0.35);
  background: linear-gradient(180deg, rgb(39 39 42 / 0.98), rgb(9 9 11 / 0.98));
  box-shadow: 0 12px 32px rgb(0 0 0 / 0.55), inset 0 1px 0 rgb(255 255 255 / 0.04);
  padding: 12px 14px;
  font-size: 13px;
  line-height: 1.5;
  color: rgb(212 212 216); /* zinc-300 */
  pointer-events: none;
}
</style>
