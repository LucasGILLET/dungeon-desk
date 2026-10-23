<template>
  <div ref="root" class="relative">
    <!-- Menu déroulant d'actions secondaires : flèches pour naviguer, Échap ou clic à l'extérieur pour fermer -->
    <button
      ref="toggle" type="button" class="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
      aria-haspopup="menu" :aria-expanded="open" :aria-controls="menuId" @click="open ? close() : show()" @keydown.down.prevent="show"
    >
      {{ label }} <span aria-hidden="true">{{ open ? '▴' : '▾' }}</span>
    </button>
    <div
      v-if="open" :id="menuId" ref="menu" role="menu" :aria-label="label"
      class="absolute right-0 z-40 mt-2 w-64 rounded-xl border border-zinc-700 bg-zinc-900 p-1 shadow-2xl"
      @keydown.down.prevent="move(1)" @keydown.up.prevent="move(-1)" @keydown.esc.prevent="close(true)" @keydown.tab="close()"
      @click="onClick"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from 'vue'

defineProps<{ label: string }>()

const menuId = `actions-menu-${Math.random().toString(36).slice(2, 9)}`
const open = ref(false)
const root = ref<HTMLElement | null>(null)
const toggle = ref<HTMLButtonElement | null>(null)
const menu = ref<HTMLElement | null>(null)

const items = () => [...(menu.value?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled]):not([aria-disabled="true"])') ?? [])]

async function show() {
  open.value = true
  await nextTick()
  items()[0]?.focus()
  document.addEventListener('mousedown', onOutside)
}
function close(refocus = false) {
  open.value = false
  document.removeEventListener('mousedown', onOutside)
  if (refocus) toggle.value?.focus()
}
function move(step: 1 | -1) {
  const list = items()
  if (!list.length) return
  const i = list.indexOf(document.activeElement as HTMLElement)
  list[(i + step + list.length) % list.length]!.focus()
}
// Un choix ferme le menu
function onClick(event: MouseEvent) {
  if ((event.target as HTMLElement).closest('[role="menuitem"]')) close()
}
function onOutside(event: MouseEvent) {
  if (!root.value?.contains(event.target as Node)) close()
}
onBeforeUnmount(() => document.removeEventListener('mousedown', onOutside))
</script>
