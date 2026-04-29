<template>
  <nav
    class="rounded-xl border border-zinc-200/70 bg-white/80 p-3 backdrop-blur-sm shadow-sm dark:border-white/10 dark:bg-zinc-900/70"
    aria-label="Table des matieres"
  >
    <p v-if="title" class="mb-2 text-[9px] uppercase tracking-[0.28em] text-zinc-500 dark:text-zinc-400">
      {{ title }}
    </p>

    <ul ref="listRef" v-if="items.length" class="max-h-52 space-y-0.5 overflow-y-auto pr-1">
      <li v-for="item in items" :key="item.id">
        <a
          :ref="(el) => setLinkRef(item.id, el)"
          :href="`#${item.id}`"
          :class="[
            'group relative flex items-start gap-1.5 rounded-md px-1.5 py-1 text-xs transition-all duration-200',
            item.level === 3 ? 'ml-3 text-[11px]' : '',
            activeId === item.id
              ? 'bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200'
              : 'text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-zinc-100'
          ]"
          @click.prevent="scrollToHeading(item.id)"
        >
          <span
            :class="[
              'mt-1 h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-200',
              activeId === item.id
                ? 'bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.16)] dark:bg-amber-300'
                : 'bg-zinc-400/70 dark:bg-zinc-500'
            ]"
          ></span>
          <span class="line-clamp-1">{{ item.text }}</span>
        </a>
      </li>
    </ul>

    <p v-else class="text-xs text-zinc-500 dark:text-zinc-400">
      Aucun titre detecte.
    </p>
  </nav>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch, type ComponentPublicInstance } from 'vue'

type TocItem = {
  id: string
  text: string
  level: 2 | 3
  element: HTMLHeadingElement
}

const props = withDefaults(
  defineProps<{
    targetSelector: string
    headingSelector?: string
    title?: string
    observeKey?: string | number | boolean
    scrollOffset?: number
  }>(),
  {
    headingSelector: 'h2, h3',
    title: 'Dans cette page',
    observeKey: undefined,
    scrollOffset: 88
  }
)

const items = ref<TocItem[]>([])
const activeId = ref<string>('')
const listRef = ref<HTMLElement | null>(null)
const linkRefs = new Map<string, HTMLElement>()

let intersectionObserver: IntersectionObserver | null = null
let mutationObserver: MutationObserver | null = null
let rebuildRaf = 0

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function resolveRoot() {
  return document.querySelector(props.targetSelector) as HTMLElement | null
}

function ensureHeadingIds(headings: HTMLHeadingElement[]) {
  const usedIds = new Set<string>()

  for (const heading of headings) {
    if (heading.id) {
      usedIds.add(heading.id)
      continue
    }

    const base = slugify(heading.textContent?.trim() || 'section') || 'section'
    let candidate = base
    let count = 1

    while (usedIds.has(candidate) || document.getElementById(candidate)) {
      candidate = `${base}-${count++}`
    }

    heading.id = candidate
    usedIds.add(candidate)
  }
}

function findActiveByScroll(itemsToCheck: TocItem[]) {
  const threshold = window.scrollY + props.scrollOffset + 24
  let current: TocItem | null = null

  for (const item of itemsToCheck) {
    if (item.element.offsetTop <= threshold) {
      current = item
    } else {
      break
    }
  }

  return current?.id || itemsToCheck[0]?.id || ''
}

function initIntersectionObserver() {
  if (intersectionObserver) {
    intersectionObserver.disconnect()
  }

  intersectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

      if (visible.length) {
        activeId.value = (visible[0].target as HTMLElement).id
        return
      }

      activeId.value = findActiveByScroll(items.value)
    },
    {
      root: null,
      rootMargin: '-20% 0px -65% 0px',
      threshold: [0, 1]
    }
  )

  for (const item of items.value) {
    intersectionObserver.observe(item.element)
  }
}

function rebuildToc() {
  const root = resolveRoot()
  if (!root) {
    items.value = []
    activeId.value = ''
    return
  }

  const headings = Array.from(
    root.querySelectorAll<HTMLHeadingElement>(props.headingSelector)
  ).filter((heading) => ['H2', 'H3'].includes(heading.tagName))

  ensureHeadingIds(headings)

  items.value = headings.map((heading) => ({
    id: heading.id,
    text: (heading.textContent || '').trim(),
    level: heading.tagName === 'H3' ? 3 : 2,
    element: heading
  }))

  activeId.value = findActiveByScroll(items.value)
  initIntersectionObserver()
}

function scheduleRebuild() {
  cancelAnimationFrame(rebuildRaf)
  rebuildRaf = requestAnimationFrame(() => {
    rebuildToc()
  })
}

function scrollToHeading(id: string) {
  const target = document.getElementById(id)
  if (!target) {
    return
  }

  const top = target.getBoundingClientRect().top + window.scrollY - props.scrollOffset
  window.scrollTo({ top, behavior: 'smooth' })

  history.replaceState(null, '', `#${id}`)
  activeId.value = id
}

function setLinkRef(id: string, el: Element | ComponentPublicInstance | null) {
  if (el instanceof HTMLElement) {
    linkRefs.set(id, el)
    return
  }

  linkRefs.delete(id)
}

function initMutationObserver() {
  if (mutationObserver) {
    mutationObserver.disconnect()
  }

  const root = resolveRoot()
  if (!root) {
    return
  }

  mutationObserver = new MutationObserver(() => {
    scheduleRebuild()
  })

  mutationObserver.observe(root, {
    childList: true,
    subtree: true,
    characterData: true
  })
}

onMounted(async () => {
  await nextTick()
  rebuildToc()
  initMutationObserver()

  window.addEventListener('hashchange', scheduleRebuild)
})

watch(
  () => props.observeKey,
  async () => {
    await nextTick()
    rebuildToc()
    initMutationObserver()
  }
)

watch(activeId, async (id) => {
  if (!id) {
    return
  }

  await nextTick()
  const container = listRef.value
  const target = linkRefs.get(id)

  if (!container || !target) {
    return
  }

  const targetTop = target.offsetTop
  const targetBottom = targetTop + target.offsetHeight
  const viewTop = container.scrollTop
  const viewBottom = viewTop + container.clientHeight

  const isAbove = targetTop < viewTop + 8
  const isBelow = targetBottom > viewBottom - 8

  if (isAbove || isBelow) {
    container.scrollTo({
      top: Math.max(0, targetTop - container.clientHeight / 2 + target.offsetHeight / 2),
      behavior: 'smooth'
    })
  }
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rebuildRaf)
  window.removeEventListener('hashchange', scheduleRebuild)
  intersectionObserver?.disconnect()
  mutationObserver?.disconnect()
})
</script>
