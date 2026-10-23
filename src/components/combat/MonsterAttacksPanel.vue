<template>
  <div class="mt-3 grid gap-2 rounded-xl border border-white/10 bg-black/30 p-3 text-sm">
    <!-- Attaques multiples sans jet propre : le texte dit quoi enchaîner -->
    <p v-for="m in multiattacks" :key="m.name" class="text-xs italic text-zinc-400"><strong class="not-italic text-zinc-300">{{ m.name }}.</strong> {{ m.description }}</p>
    <p v-if="!rows.length" class="text-xs text-zinc-500">Aucune attaque chiffrée pour ce monstre : voir son bloc de statistiques.</p>

    <div v-for="row in rows" :key="row.key" class="grid gap-1 border-t border-white/5 pt-2 first:border-t-0 first:pt-0">
      <div class="flex flex-wrap items-center gap-2">
        <span class="font-semibold text-zinc-100">{{ row.action.name }}</span>
        <span v-if="row.group !== 'Actions'" class="text-[10px] uppercase text-zinc-500">{{ row.group }}</span>
        <span v-if="row.action.save" class="rounded-full border border-sky-400/30 bg-sky-400/10 px-2 text-xs text-sky-200">DD {{ row.action.save.dc }} {{ row.action.save.ability.name }}</span>
        <button
          v-if="row.action.attack" type="button" class="rounded-lg bg-amber-900/60 px-2 py-0.5 text-xs font-semibold text-amber-100 hover:bg-amber-800"
          :aria-label="`Jet d'attaque : ${row.action.name}`" @click="attack(row.key, row.action.attack.bonus ?? 0)"
        >Toucher {{ signed(row.action.attack.bonus ?? 0) }}</button>
        <button
          v-if="row.action.damages.length" type="button" class="rounded-lg bg-red-900/60 px-2 py-0.5 text-xs font-semibold text-red-100 hover:bg-red-800"
          :aria-label="`Jet de dégâts : ${row.action.name}`" @click="damage(row.key, row.action)"
        >Dégâts {{ row.action.damages.map((d) => d.dice.replace(/\s+/g, '')).join(' + ') }}</button>
      </div>
      <p v-if="row.action.description" class="line-clamp-2 text-xs italic text-zinc-400">{{ row.action.description }}</p>

      <p v-if="attacks[row.key]" class="text-xs" :class="attacks[row.key]!.critical ? 'text-amber-300' : attacks[row.key]!.fumble ? 'text-red-400' : 'text-zinc-300'">
        Attaque : <strong>{{ attacks[row.key]!.total }}</strong> ({{ attacks[row.key]!.d20 }} {{ signed(attacks[row.key]!.bonus) }})
        <template v-if="attacks[row.key]!.critical"> — coup critique, dégâts doublés</template>
        <template v-else-if="attacks[row.key]!.fumble"> — échec critique</template>
      </p>
      <div v-if="damages[row.key]" class="flex flex-wrap items-center gap-2 text-xs text-zinc-300">
        <span>
          Dégâts : <strong class="text-red-200">{{ damages[row.key]!.total }}</strong>
          ({{ damages[row.key]!.parts.map((p) => `${p.total} ${p.type}`).join(' + ') }}<template v-if="damages[row.key]!.critical">, critique</template>)
        </span>
        <select class="rounded-lg border border-white/10 bg-zinc-950 px-1 py-0.5 text-xs" :aria-label="`Appliquer les dégâts de ${row.action.name} à`" value="" @change="apply(row.key, $event.target as HTMLSelectElement)">
          <option value="" disabled>Appliquer à…</option>
          <option v-for="t in targets" :key="t.position" :value="t.position">{{ t.name }}</option>
        </select>
        <span v-if="applied[row.key]" class="text-emerald-300">{{ applied[row.key] }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { combatActions, rollAttack, rollDamage, type AttackRoll, type DamageRoll } from '@/utils/attackRolls'
import type { ApiMonster, ApiMonsterAction } from '@/utils/dataLoader'
import { signed } from '@/utils/monsterFormat'

const props = defineProps<{ monster: ApiMonster; targets: { position: number; name: string }[] }>()
const emit = defineEmits<{ apply: [position: number, amount: number] }>()

const GROUPS = [
  ['Actions', 'actions'], ['Action bonus', 'bonusActions'], ['Réaction', 'reactions'], ['Légendaire', 'legendaryActions'], ['Repaire', 'lairActions'], ['Capacité', 'traits'],
] as const
const rows = computed(() => GROUPS.flatMap(([group, key]) =>
  combatActions(props.monster[key]).map((action, i) => ({ key: `${key}-${i}`, group, action }))))
// Attaques multiples sans jet propre : affichées en texte ; avec un jet (attaque
// saisie directement sur elles), elles sont déjà une ligne d'attaque
const multiattacks = computed(() => props.monster.actions
  .filter((a) => (a.multiattack.length || /attaques multiples/i.test(a.name)) && !combatActions([a]).length))

const attacks = reactive<Record<string, AttackRoll | undefined>>({})
const damages = reactive<Record<string, DamageRoll | undefined>>({})
const applied = reactive<Record<string, string | undefined>>({})

function attack(key: string, bonus: number) {
  attacks[key] = rollAttack(bonus)
  damages[key] = undefined
  applied[key] = undefined
}
// Après un coup critique, les dés de dégâts sont doublés
function damage(key: string, action: ApiMonsterAction) {
  damages[key] = rollDamage(action.damages, !!attacks[key]?.critical)
  applied[key] = undefined
}
function apply(key: string, select: HTMLSelectElement) {
  const position = Number(select.value)
  select.value = ''
  const roll = damages[key]
  if (!roll || Number.isNaN(position)) return
  emit('apply', position, roll.total)
  applied[key] = `${roll.total} dégâts à ${props.targets.find((t) => t.position === position)?.name ?? '?'}`
}
</script>
