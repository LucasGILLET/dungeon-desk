<template>
  <section class="panel">
    <h2 class="panel-title">À ton tour</h2>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div v-for="col in columns" :key="col.key">
        <h3 class="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">{{ col.label }}</h3>
        <ul class="flex flex-wrap gap-1.5">
          <li v-for="o in col.options" :key="`${o.source}-${o.index}`">
            <router-link v-if="o.source === 'SPELL'" :to="`/sort/${o.index}`" :class="[chip, 'border-violet-700/60 bg-violet-950/30 text-zinc-100 hover:border-violet-500']" :title="o.spellLevel ? `Sort de niveau ${o.spellLevel}` : 'Sort mineur'">
              {{ o.name }}
            </router-link>
            <span v-else :class="[chip, o.source === 'RULE' ? 'border-zinc-700 text-zinc-200' : 'border-amber-700/50 bg-amber-950/20 text-amber-100']" :title="o.detail">{{ o.name }}</span>
          </li>
        </ul>
        <p v-if="col.key === 'ACTION'" class="mt-2 text-xs text-zinc-500">Aussi : {{ BASIC_ACTIONS }}</p>
        <p v-if="!col.options.length" class="text-xs text-zinc-600">Aucune pour l'instant.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Ce que le personnage peut faire pendant son tour : actions de base, attaques,
// capacités, traits et sorts (calculés par le back), rangés par coût.
import { computed } from 'vue'
import type { CharacterSheetValues, TurnOption } from '@/types/character'
import type { Input } from '@/utils/sheetActions'

const props = defineProps<{ sheet: CharacterSheetValues; input: Input }>()

const BASIC_ACTIONS = 'Foncer, Se désengager, Esquiver, Aider, Se cacher, Se tenir prêt, Chercher, Utiliser un objet'
const chip = 'inline-block rounded-full border px-2.5 py-0.5 text-sm'

type Option = Pick<TurnOption, 'index' | 'name' | 'spellLevel'> & { source: TurnOption['source'] | 'RULE'; detail?: string }
const rule = (index: string, name: string, detail?: string): Option => ({ source: 'RULE', index, name, spellLevel: null, detail })

// Armes équipées, et deux armes légères de corps à corps pour l'attaque à deux armes
const weapons = computed(() => (props.sheet.attacks ?? []).filter((a) => a.kind === 'WEAPON' && a.equipped))
const lightWeapons = computed(() => weapons.value
  .filter((a) => a.properties.includes('Légère') && a.properties.every((p) => p !== 'Munitions'))
  .reduce((count, a) => count + Math.max(1, props.input.items?.find((i) => i.equipment === a.index.split('|')[0] && i.equipped)?.quantity ?? 1), 0))

const columns = computed(() => {
  const of = (activation: TurnOption['activation']): Option[] => (props.sheet.turnOptions ?? []).filter((o) => o.activation === activation)
  const attack = weapons.value.length ? rule('attack', 'Attaquer', weapons.value.map((a) => a.name).join(', ')) : rule('attack', 'Attaquer')
  return [
    { key: 'ACTION', label: 'Actions', options: [attack, ...of('ACTION')] },
    { key: 'BONUS_ACTION', label: 'Actions bonus', options: [...(lightWeapons.value >= 2 ? [rule('two-weapon', 'Attaque à deux armes', 'Avec l\'autre arme légère, sans modificateur aux dégâts')] : []), ...of('BONUS_ACTION')] },
    { key: 'REACTION', label: 'Réactions', options: [rule('opportunity', "Attaque d'opportunité", 'Quand une créature hostile sort de votre allonge'), ...of('REACTION')] },
  ]
})
</script>

<style scoped>
@reference "../../index.css";
.panel { @apply rounded-xl border border-zinc-800 bg-zinc-900/50 p-5; }
.panel-title { @apply text-sm font-bold uppercase tracking-widest text-amber-500 mb-3 font-serif; }
</style>
