<template>
  <section v-if="casters.length || granted.length" class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-8">
    <h2 class="text-sm font-bold uppercase tracking-widest text-amber-500 font-serif">Sorts</h2>

    <!-- Sorts accordés sans être choisis : trait racial, sous-classe, choix -->
    <div v-for="g in granted" :key="g.source" class="space-y-2">
      <div class="border-b border-zinc-800 pb-2">
        <h3 class="text-lg font-bold font-serif text-white">{{ g.source }}</h3>
        <p class="text-xs text-zinc-500">
          <template v-if="g.saveDC != null">DD {{ g.saveDC }} · attaque {{ signed(g.attackBonus!) }} · </template>
          {{ KIND_LABELS[g.kind] }}
        </p>
      </div>
      <ul class="flex flex-wrap gap-2">
        <li v-for="s in g.spells" :key="s.index" class="flex items-center gap-2 px-3 py-1 rounded-full border border-violet-700/60 bg-violet-950/30 text-sm text-zinc-100">
          <router-link :to="`/sort/${s.index}`" class="hover:underline">{{ s.name }}</router-link>
          <span class="text-xs text-zinc-400">{{ spellNote(s) }}</span>
        </li>
      </ul>
    </div>

    <div v-for="c in casters" :key="c.index" class="space-y-3">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-zinc-800 pb-2">
        <div>
          <h3 class="text-lg font-bold font-serif text-white">{{ c.name }}</h3>
          <p class="text-xs text-zinc-500">
            <template v-if="c.dc">DD {{ c.dc.saveDC }} · attaque {{ signed(c.dc.attackBonus) }} · </template>
            {{ c.preparer ? 'prépare ses sorts' : 'sorts connus' }}<template v-if="c.maxLevel"> · jusqu'au niveau {{ c.maxLevel }}</template>
          </p>
        </div>
        <div class="flex flex-wrap gap-2 text-xs">
          <span v-if="c.cantripLimit" class="counter" :class="c.cantrips > c.cantripLimit ? 'counter-over' : ''">Sorts mineurs {{ c.cantrips }} / {{ c.cantripLimit }}</span>
          <span v-if="c.knownLimit != null" class="counter" :class="c.known > c.knownLimit ? 'counter-over' : ''">Sorts connus {{ c.known }} / {{ c.knownLimit }}</span>
          <span v-if="c.preparer" class="counter" :class="c.prepared > c.preparedLimit ? 'counter-over' : ''">Préparés {{ c.prepared }} / {{ c.preparedLimit }}</span>
        </div>
      </div>

      <p v-if="!c.casting" class="text-sm text-zinc-500">Les sorts arrivent au niveau {{ c.startLevel }} de la classe.</p>
      <template v-else>
        <p v-if="!c.spells.length" class="text-sm text-zinc-500">Aucun sort pour l'instant.</p>
        <div v-for="group in c.groups" :key="group.level">
          <div class="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">{{ group.level === 0 ? 'Sorts mineurs' : `Niveau ${group.level}` }}</div>
          <ul class="flex flex-wrap gap-2">
            <li v-for="s in group.spells" :key="s.index" class="flex items-center gap-2 pl-3 pr-1 py-1 rounded-full border text-sm"
                :class="s.prepared || group.level === 0 || !c.preparer ? 'border-violet-700/60 bg-violet-950/30 text-zinc-100' : 'border-zinc-700 text-zinc-400'">
              <label v-if="c.preparer && group.level > 0" class="flex items-center gap-1 cursor-pointer" :title="s.prepared ? 'Préparé' : 'Non préparé'">
                <input type="checkbox" class="accent-violet-500" :checked="s.prepared" @change="emit('update', togglePrepared(input, c.index, s.index))" />
              </label>
              <router-link :to="`/sort/${s.index}`" class="hover:underline">{{ s.name }}</router-link>
              <button class="w-5 h-5 rounded-full text-zinc-500 hover:text-red-400" :aria-label="`Retirer ${s.name}`" @click="emit('update', removeSpell(input, c.index, s.index))">✕</button>
            </li>
          </ul>
        </div>

        <!-- Ajout -->
        <div>
          <button v-if="adding !== c.index" class="text-sm text-amber-500 hover:text-amber-400 underline" @click="adding = c.index; query = ''">
            + Ajouter un sort
          </button>
          <div v-else class="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 space-y-3">
            <div class="flex gap-2">
              <input v-model="query" class="input flex-1" placeholder="Rechercher un sort de la liste de la classe" aria-label="Rechercher un sort" />
              <button class="text-sm text-zinc-400 hover:text-white" @click="adding = null">Fermer</button>
            </div>
            <div class="max-h-72 overflow-y-auto space-y-3">
              <div v-for="group in candidates(c)" :key="group.level">
                <div class="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">{{ group.level === 0 ? 'Sorts mineurs' : `Niveau ${group.level}` }}</div>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="s in group.spells" :key="s.index" type="button"
                    class="px-3 py-1 rounded-full border border-zinc-700 text-sm text-zinc-300 hover:border-violet-500 hover:text-white"
                    :title="s.school"
                    @click="emit('update', addSpell(input, c.index, s.index, c.preparer && s.level > 0 && c.index !== 'wizard'))"
                  >
                    {{ s.name }}
                  </button>
                </div>
              </div>
              <p v-if="!candidates(c).length" class="text-sm text-zinc-500">Aucun sort ne correspond.</p>
            </div>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
// Sorts connus (ou du grimoire) et préparés, par classe d'incantation. Les
// limites viennent de la table de classe ; le back refuse un sort hors liste
// ou d'un niveau pas encore lançable.
import { computed, ref, watch } from 'vue'
import type { CharacterSheetValues, GrantedSpell } from '@/types/character'
import { loadApiSpells, type ApiClass, type ApiSpell } from '@/utils/dataLoader'
import { addSpell, removeSpell, togglePrepared, type Input } from '@/utils/sheetActions'

const props = defineProps<{ input: Input; sheet: CharacterSheetValues; classes: ApiClass[] }>()
const emit = defineEmits<{ update: [input: Input] }>()

const spells = ref<ApiSpell[]>([])
const adding = ref<string | null>(null)
const query = ref('')
const signed = (n: number) => (n >= 0 ? `+${n}` : `${n}`)

// Les classes du personnage arrivent après le premier affichage de la fiche :
// la liste des sorts se charge dès qu'une classe d'incantation est connue
watch(() => props.classes.some((c) => c.spellcasting), async (hasCaster) => {
  if (hasCaster && !spells.value.length) spells.value = await loadApiSpells()
}, { immediate: true })

const byIndex = computed(() => new Map(spells.value.map((s) => [s.index, s])))

const casters = computed(() => props.input.classes.flatMap((entry) => {
  const cls = props.classes.find((c) => c.index === entry.class)
  if (!cls?.spellcasting) return []
  const level = entry.levels.length
  const row = cls.table.levels.find((l) => l.level === level)
  const maxLevel = (row?.spellSlots ?? []).reduce((max, n, i) => (n > 0 ? i + 1 : max), 0)
  const knownLimit = row?.spellsKnown ?? null
  const preparer = knownLimit == null
  const dc = props.sheet.spellcasting?.find((s) => s.class === cls.index) ?? null
  const mod = props.sheet.abilityScores[cls.spellcasting.ability.index]?.modifier ?? 0
  // Préparation : modificateur + niveau (moitié du niveau pour le paladin), au moins 1
  const preparedLimit = Math.max(1, mod + (cls.index === 'paladin' ? Math.floor(level / 2) : level))
  const own = (props.input.spells ?? [])
    .filter((s): s is { spell: string; class: string; prepared?: boolean } => !!s.spell && s.class === cls.index)
    .map((s) => {
    const spell = byIndex.value.get(s.spell)
    return { index: s.spell, name: spell?.name ?? s.spell, level: spell?.level ?? 0, prepared: !!s.prepared }
  })
  const levels = [...new Set(own.map((s) => s.level))].sort((a, b) => a - b)
  return [{
    index: cls.index,
    name: cls.name,
    startLevel: cls.spellcasting.startLevel,
    casting: level >= cls.spellcasting.startLevel,
    maxLevel,
    dc,
    preparer,
    cantripLimit: row?.cantripsKnown ?? 0,
    knownLimit,
    preparedLimit,
    cantrips: own.filter((s) => s.level === 0).length,
    known: own.filter((s) => s.level > 0).length,
    prepared: own.filter((s) => s.level > 0 && s.prepared).length,
    spells: own,
    groups: levels.map((l) => ({ level: l, spells: own.filter((s) => s.level === l).sort((a, b) => a.name.localeCompare(b.name)) })),
  }]
}))

type Caster = (typeof casters.value)[number]

// Sorts accordés, regroupés par origine (« Ascendance infernale »)
const granted = computed(() => {
  const groups = new Map<string, Pick<GrantedSpell, 'source' | 'kind' | 'saveDC' | 'attackBonus'> & { spells: GrantedSpell[] }>()
  for (const s of props.sheet.grantedSpells ?? []) {
    const group = groups.get(s.source) ?? { source: s.source, kind: s.kind, saveDC: s.saveDC, attackBonus: s.attackBonus, spells: [] }
    group.spells.push(s)
    groups.set(s.source, group)
  }
  return [...groups.values()]
})
const grantedIndexes = computed(() => new Set((props.sheet.grantedSpells ?? []).map((s) => s.index)))
const KIND_LABELS: Record<GrantedSpell['kind'], string> = {
  SUBCLASS: 'toujours préparés, hors limite',
  TRAIT: 'accordés par un trait racial',
  FEATURE: 'accordés par une capacité',
  CHOICE: 'sorts choisis',
}
// « Sort mineur », « niv. 1, lancé au niv. 2 · 1 / repos long », « niv. 1 · à volonté »
function spellNote(s: GrantedSpell) {
  const level = s.level === 0 ? 'sort mineur' : `niv. ${s.level}${s.castAtLevel && s.castAtLevel !== s.level ? `, lancé au niv. ${s.castAtLevel}` : ''}`
  return [level, s.atWill && s.level > 0 && 'à volonté', s.oncePerLongRest && '1 / repos long'].filter(Boolean).join(' · ')
}

// Sorts de la liste de la classe, d'un niveau lançable, pas encore choisis
function candidates(c: Caster) {
  const owned = new Set([...c.spells.map((s) => s.index), ...grantedIndexes.value])
  const q = query.value.trim().toLowerCase()
  const list = spells.value.filter((s) =>
    s.classes.some((k) => k.index === c.index)
    && !owned.has(s.index)
    && (s.level === 0 ? c.cantripLimit > 0 : s.level <= c.maxLevel)
    && (!q || s.name.toLowerCase().includes(q)))
  const levels = [...new Set(list.map((s) => s.level))].sort((a, b) => a - b)
  return levels.map((level) => ({
    level,
    spells: list.filter((s) => s.level === level).map((s) => ({ index: s.index, name: s.name, level: s.level, school: s.school.name })),
  }))
}
</script>

<style scoped>
@reference "../../index.css";
.input { @apply rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1 text-zinc-100 outline-none focus:border-amber-500; }
.counter { @apply px-2.5 py-1 rounded-full border border-zinc-700 bg-zinc-900 text-zinc-300; }
.counter-over { @apply border-red-700 text-red-300; }
</style>
