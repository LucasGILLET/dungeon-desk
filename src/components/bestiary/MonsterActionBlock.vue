<template>
  <div>
    <p class="leading-relaxed">
      <span class="font-semibold italic text-amber-100">{{ title }}.</span>
      {{ ' ' }}<span class="whitespace-pre-line">{{ description }}</span>
    </p>
    <!-- Incantation : sorts cliquables, regroupés par niveau ou par usage -->
    <div v-if="action.spellcasting" class="mt-2 space-y-1 pl-4 text-sm">
      <p v-for="group in spellGroups" :key="group.label">
        <span class="text-zinc-400">{{ group.label }} : </span>
        <template v-for="(s, i) in group.spells" :key="s.index">
          <router-link :to="{ name: 'sort-view', params: { index: s.index } }" class="italic text-sky-300 hover:text-sky-200 hover:underline">{{ s.name.toLowerCase() }}</router-link><span v-if="i < group.spells.length - 1">, </span>
        </template>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ApiMonsterAction } from '@/utils/dataLoader'
import { actionTitle, formatUsage } from '@/utils/monsterFormat'

const props = defineProps<{ action: ApiMonsterAction; legendary?: boolean }>()

// Incantation : la liste de sorts du texte est remplacée par la liste structurée (liens vers les sorts)
const description = computed(() =>
  props.action.spellcasting && spellGroups.value.length ? props.action.description.split(/\n\s*\n/)[0] : props.action.description)

const title = computed(() => {
  const base = actionTitle(props.action)
  // Coût indiqué dans le nom ("coûte 2 actions") en général ; sinon ajouté
  const cost = props.legendary && (props.action.legendaryCost ?? 1) > 1 && !/\(/.test(props.action.name) ? ` (coûte ${props.action.legendaryCost} actions)` : ''
  return base + cost
})

const spellGroups = computed(() => {
  const sc = props.action.spellcasting
  if (!sc) return []
  const groups = new Map<string, { label: string; order: number; spells: typeof sc.spells }>()
  for (const spell of sc.spells) {
    const usage = formatUsage(spell.usage)
    const [label, order] = usage
      ? [usage, spell.usage?.type === 'at_will' ? -1 : 100 - (spell.usage?.type === 'per_day' ? spell.usage.times : 0)]
      : spell.level === 0
        ? ['Sorts mineurs (à volonté)', 0]
        : [`Niveau ${spell.level}${sc.slots?.[spell.level] ? ` (${sc.slots[spell.level]} emplacement${sc.slots[spell.level]! > 1 ? 's' : ''})` : ''}`, spell.level]
    const group = groups.get(label) ?? { label, order, spells: [] }
    group.spells.push(spell)
    groups.set(label, group)
  }
  return [...groups.values()].sort((a, b) => a.order - b.order)
})
</script>
