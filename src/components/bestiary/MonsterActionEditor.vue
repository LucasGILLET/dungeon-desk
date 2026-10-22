<template>
  <section class="ui-panel">
    <div class="mb-3 flex items-center justify-between gap-3">
      <h2 class="font-serif text-xl font-bold text-amber-200">{{ title }}</h2>
      <button type="button" class="ui-btn" @click="add">+ Ajouter</button>
    </div>
    <slot />
    <p v-if="!modelValue.length" class="text-sm text-zinc-500">{{ empty }}</p>

    <div v-for="(a, i) in modelValue" :key="i" class="mt-3 grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
      <div class="flex gap-2">
        <label class="ui-label flex-1">Nom<input v-model="a.name" class="ui-input" required maxlength="120" /></label>
        <label v-if="legendary" class="ui-label w-28">Coût
          <select v-model.number="a.legendaryCost" class="ui-input"><option :value="null">1</option><option :value="2">2</option><option :value="3">3</option></select>
        </label>
        <button type="button" class="ui-btn-danger self-end" :aria-label="`Retirer ${a.name || 'cette ligne'}`" @click="modelValue.splice(i, 1)">Retirer</button>
      </div>
      <label class="ui-label">Description<textarea v-model="a.description" rows="2" class="ui-input" maxlength="5000"></textarea></label>

      <div v-if="!traits" class="grid gap-3 sm:grid-cols-4">
        <label class="ui-label sm:col-span-2">Attaque
          <select :value="a.attack?.type ?? ''" class="ui-input" @change="setAttack(a, ($event.target as HTMLSelectElement).value)">
            <option value="">Pas de jet d'attaque</option>
            <option v-for="(label, type) in ATTACK_LABELS" :key="type" :value="type">{{ label }}</option>
          </select>
        </label>
        <template v-if="a.attack">
          <label class="ui-label">Bonus au toucher<input v-model.number="a.attack.bonus" type="number" class="ui-input" /></label>
          <label v-if="isMelee(a.attack.type)" class="ui-label">Allonge (m)
            <input :value="meters(a.attack.reachFt)" type="number" step="any" min="0" class="ui-input" @input="a.attack.reachFt = feet(($event.target as HTMLInputElement).value)" />
          </label>
          <label v-else class="ui-label">Portée (m)
            <input :value="meters(a.attack.rangeFt?.normal)" type="number" step="any" min="0" class="ui-input" @input="setRange(a, ($event.target as HTMLInputElement).value)" />
          </label>
        </template>
      </div>

      <div v-if="!traits" class="grid gap-3 sm:grid-cols-4">
        <label class="ui-label sm:col-span-2">Jet de sauvegarde
          <select :value="a.save?.ability ?? ''" class="ui-input" @change="setSave(a, ($event.target as HTMLSelectElement).value)">
            <option value="">Aucun</option>
            <option v-for="ab in options.abilities" :key="ab.index" :value="ab.index">{{ ab.name }}</option>
          </select>
        </label>
        <label v-if="a.save" class="ui-label">DD<input v-model.number="a.save.dc" type="number" min="1" max="40" class="ui-input" /></label>
      </div>

      <div v-if="!traits" class="grid gap-2">
        <p class="text-sm text-zinc-400">Dégâts</p>
        <div v-for="(d, j) in a.damages" :key="j" class="flex gap-2">
          <input v-model="d.dice" class="ui-input w-32 font-mono" placeholder="2d6+3" aria-label="Dés de dégâts" />
          <select v-model="d.damageType" class="ui-input flex-1" aria-label="Type de dégâts">
            <option v-for="t in options.damageTypes" :key="t.index" :value="t.index">{{ t.name }}</option>
          </select>
          <button type="button" class="ui-btn-danger" @click="a.damages.splice(j, 1)">✕</button>
        </div>
        <button type="button" class="justify-self-start text-xs text-zinc-400 underline hover:text-zinc-200" @click="a.damages.push({ dice: '1d6', damageType: options.damageTypes[0]?.index ?? 'slashing' })">+ Ajouter des dégâts</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MonsterActionInput, MonsterAttackType, MonsterOptions } from '@/api/monsters'

const props = defineProps<{
  modelValue: MonsterActionInput[]
  title: string
  empty: string
  options: MonsterOptions
  // Capacités spéciales : pas d'attaque ni de dégâts structurés
  traits?: boolean
  legendary?: boolean
}>()

const ATTACK_LABELS: Record<MonsterAttackType, string> = {
  MELEE_WEAPON: 'Arme de corps à corps',
  RANGED_WEAPON: 'Arme à distance',
  MELEE_OR_RANGED_WEAPON: 'Arme de corps à corps ou à distance',
  MELEE_SPELL: 'Sort de corps à corps',
  RANGED_SPELL: 'Sort à distance',
}
const isMelee = (type: MonsterAttackType) => type === 'MELEE_WEAPON' || type === 'MELEE_SPELL' || type === 'MELEE_OR_RANGED_WEAPON'

// Saisie en mètres, enregistrement en pieds (format du SRD), par pas de 5 pieds
const meters = (ft: number | null | undefined) => (ft == null ? '' : Math.round(ft * 0.3 * 10) / 10)
const feet = (m: string) => (m === '' ? null : Math.round(Number(m) / 0.3 / 5) * 5)

function add() {
  props.modelValue.push({ name: '', description: '', attack: null, save: null, damages: [], legendaryCost: null })
}
function setAttack(a: MonsterActionInput, type: string) {
  a.attack = type ? { type: type as MonsterAttackType, bonus: a.attack?.bonus ?? 4, reachFt: isMelee(type as MonsterAttackType) ? a.attack?.reachFt ?? 5 : null, rangeFt: isMelee(type as MonsterAttackType) ? null : a.attack?.rangeFt ?? { normal: 80, long: 320 } } : null
}
function setRange(a: MonsterActionInput, m: string) {
  const normal = feet(m)
  a.attack!.rangeFt = normal == null ? null : { normal, long: a.attack!.rangeFt?.long ?? normal * 4 }
}
function setSave(a: MonsterActionInput, ability: string) {
  a.save = ability ? { ability, dc: a.save?.dc ?? 12 } : null
}
</script>
