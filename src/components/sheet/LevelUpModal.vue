<template>
  <div class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm overflow-y-auto" role="dialog" aria-modal="true" @click.self="emit('close')">
    <div class="max-w-4xl mx-auto my-8 rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl">
      <header class="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <h2 class="text-2xl font-bold font-serif text-white">
          {{ mode === 'level' ? `Niveau ${totalLevel + 1}` : mode === 'edit' ? 'Modifier mes choix' : 'Compléter le personnage' }}
        </h2>
        <button class="text-zinc-500 hover:text-white text-xl" aria-label="Fermer" @click="emit('close')">✕</button>
      </header>

      <div class="p-6 space-y-8">
        <!-- Classe -->
        <section v-if="mode === 'level'">
          <h3 class="section-title">Classe</h3>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="c in classOptions" :key="c.index" type="button" class="choice"
              :class="classIndex === c.index ? 'choice-on' : ''"
              @click="classIndex = c.index"
            >
              {{ c.name }}
              <span class="text-xs text-zinc-500 ml-1">{{ c.owned ? `${c.level} → ${c.level + 1}` : 'nouvelle classe' }}</span>
            </button>
          </div>
          <p v-if="isNewClass" class="text-xs text-zinc-500 mt-2">
            Multiclassage : les prérequis de caractéristiques des deux classes sont vérifiés.
          </p>
        </section>

        <!-- Points de vie -->
        <section v-if="mode === 'level' && classRule">
          <h3 class="section-title">Points de vie</h3>
          <div class="flex flex-wrap items-center gap-3">
            <button type="button" class="choice" :class="hpMode === 'average' ? 'choice-on' : ''" @click="hpMode = 'average'">
              Moyenne : {{ average }} {{ signed(conModifier) }}
            </button>
            <button type="button" class="choice" :class="hpMode === 'roll' ? 'choice-on' : ''" @click="roll">
              Lancer le d{{ classRule.hitDie }}
            </button>
            <label v-if="hpMode === 'roll'" class="flex items-center gap-2 text-sm">
              Résultat
              <input v-model.number="rollValue" type="number" min="1" :max="classRule.hitDie" class="input w-20" />
              {{ signed(conModifier) }}
            </label>
          </div>
          <p class="text-sm text-zinc-400 mt-2">PV gagnés : {{ Math.max(1, (hpMode === 'roll' ? rollValue || 1 : average) + conModifier) }}</p>
        </section>

        <!-- Sous-classe -->
        <section v-for="c in subclassTargets" :key="`sub-${c}`">
          <h3 class="section-title">{{ classLabel(c) }} : {{ subclassLabel(c) }}</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              v-for="s in subclassesOf[c] ?? []" :key="s.index" type="button" class="choice text-left"
              :class="subclassChoice[c] === s.index ? 'choice-on' : ''"
              @click="subclassChoice[c] = s.index"
            >
              <span class="font-bold font-serif">{{ s.name }}</span>
              <span class="block text-xs text-zinc-500 mt-1 line-clamp-3">{{ plainText(s.description) }}</span>
            </button>
          </div>
        </section>

        <!-- Amélioration de caractéristiques ou don -->
        <section v-for="t in asiTargets" :key="`asi-${t.key}`">
          <h3 class="section-title">Amélioration de caractéristiques ({{ classLabel(t.class) }} {{ t.level }})</h3>
          <div class="flex flex-wrap gap-2 mb-3">
            <button type="button" class="choice" :class="asi[t.key]!.mode === 'plus2' ? 'choice-on' : ''" @click="asi[t.key]!.mode = 'plus2'">+2 à une caractéristique</button>
            <button type="button" class="choice" :class="asi[t.key]!.mode === 'plus1' ? 'choice-on' : ''" @click="asi[t.key]!.mode = 'plus1'">+1 à deux caractéristiques</button>
            <button v-if="feats.length" type="button" class="choice" :class="asi[t.key]!.mode === 'feat' ? 'choice-on' : ''" @click="asi[t.key]!.mode = 'feat'">Un don</button>
          </div>
          <div v-if="asi[t.key]!.mode !== 'feat'" class="flex flex-wrap gap-2">
            <button
              v-for="a in ABILITIES" :key="a.index" type="button" class="choice"
              :class="asi[t.key]!.abilities.includes(a.index) ? 'choice-on' : ''"
              :disabled="abilityAtMax(a.index, t.key)"
              @click="toggleAbility(t.key, a.index)"
            >
              {{ a.short }} <span class="text-xs text-zinc-500">{{ score(a.index) }}</span>
            </button>
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              v-for="f in feats" :key="f.index" type="button" class="choice text-left"
              :class="asi[t.key]!.feat === f.index ? 'choice-on' : ''"
              @click="asi[t.key]!.feat = f.index"
            >
              <span class="font-bold font-serif">{{ f.name }}</span>
              <span v-if="f.prerequisites.length" class="text-xs text-zinc-500 ml-2">
                {{ f.prerequisites.map((p) => `${p.ability.name} ${p.minimumScore}`).join(' ou ') }}
              </span>
              <span class="block text-xs text-zinc-500 mt-1 line-clamp-3">{{ f.description }}</span>
            </button>
          </div>
        </section>

        <!-- Ce que le personnage gagne -->
        <section v-if="gains.features.length || gains.stats.length">
          <h3 class="section-title">Ce que vous gagnez</h3>
          <ul v-if="gains.stats.length" class="flex flex-wrap gap-2 mb-4">
            <li v-for="g in gains.stats" :key="g.label" class="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-sm">
              <span class="text-zinc-400">{{ g.label }}</span>
              <span class="ml-2 font-bold text-white">{{ g.value }}</span>
            </li>
          </ul>
          <div class="space-y-2">
            <details v-for="f in gains.features" :key="f.key" class="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-2" open>
              <summary class="cursor-pointer flex justify-between gap-3">
                <span class="font-serif font-bold text-zinc-100">{{ f.name }}</span>
                <span class="text-[10px] uppercase text-zinc-500 whitespace-nowrap">{{ f.source }}</span>
              </summary>
              <p class="mt-2 text-sm text-zinc-400 whitespace-pre-line leading-relaxed">{{ f.description }}</p>
            </details>
          </div>
        </section>

        <!-- Nouveaux choix -->
        <section v-if="preview">
          <h3 class="section-title">Choix</h3>
          <p v-if="mode === 'edit'" class="mb-3 text-xs text-zinc-500">Tous vos choix, niveau par niveau. Ceux qui ne sont plus possibles (ancienne sous-classe…) sont retirés.</p>
          <p v-if="!visibleChoices.length" class="text-sm text-zinc-500">{{ mode === 'edit' ? 'Aucun choix.' : 'Aucun nouveau choix.' }}</p>
          <ChoicesPanel
            v-else
            :choices="visibleChoices"
            :answers="answers"
            :known-languages="preview.sheet?.languages.map((l) => l.index) ?? []"
            @update:answers="setAnswers"
          />
        </section>
        <div v-else-if="loading" class="flex justify-center py-6">
          <div class="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
        </div>

        <p v-if="loadError" class="text-sm text-red-400">{{ loadError }}</p>
        <ul v-if="preview?.errors.length" class="text-sm text-red-400 list-disc pl-5">
          <li v-for="(e, i) in preview.errors" :key="i">{{ e.message }}</li>
        </ul>
      </div>

      <footer class="flex items-center justify-between gap-3 px-6 py-4 border-t border-zinc-800">
        <span class="text-sm text-zinc-500">
          <template v-if="preview?.sheet">PV max : {{ preview.sheet.maxHitPoints }} · Maîtrise {{ signed(preview.sheet.proficiencyBonus) }}</template>
        </span>
        <div class="flex gap-2">
          <button class="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm" @click="emit('close')">Annuler</button>
          <button class="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold disabled:opacity-40" :disabled="!canApply" @click="apply">
            {{ mode === 'level' ? 'Monter de niveau' : mode === 'edit' ? 'Enregistrer' : 'Valider' }}
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { plainText } from '@/utils/richText'
import ChoicesPanel from '@/components/choices/ChoicesPanel.vue'
import { previewCharacter } from '@/api/generated/endpoints'
import { useChoicePreview } from '@/composables/useChoicePreview'
import type { CharacterPreview, ChoiceAnswer, SavedCharacter } from '@/types/character'
import { loadApiClasses, loadFeats, type ApiClass, type ApiFeat } from '@/utils/dataLoader'
import { loadSubclassesForClass, type SubclassData } from '@/utils/subclasses'
import type { Input } from '@/utils/sheetActions'
import { feetToMeters } from '@/utils/spellFormat'

// edit : revenir sur les choix déjà faits (améliorations, dons, sous-classes, options)
const props = defineProps<{ mode: 'level' | 'complete' | 'edit'; input: Input; saved: SavedCharacter }>()
const emit = defineEmits<{ close: []; apply: [input: Input] }>()

const ABILITIES = [
  { index: 'str', short: 'FOR' }, { index: 'dex', short: 'DEX' }, { index: 'con', short: 'CON' },
  { index: 'int', short: 'INT' }, { index: 'wis', short: 'SAG' }, { index: 'cha', short: 'CHA' },
]
const SUBCLASS_LABELS: Record<string, string> = {
  cleric: 'domaine divin', sorcerer: 'origine magique', warlock: 'patron', wizard: 'tradition arcanique', fighter: 'archétype martial',
  rogue: 'archétype de roublard', barbarian: 'voie primitive', bard: 'collège bardique', druid: 'cercle druidique',
  monk: 'tradition monastique', paladin: 'serment sacré', ranger: 'archétype de rôdeur',
}

const allClasses = ref<ApiClass[]>([])
const feats = ref<ApiFeat[]>([])
const subclassesOf = reactive<Record<string, SubclassData[]>>({})
const classIndex = ref(props.input.classes[0]?.class ?? '')
const hpMode = ref<'average' | 'roll'>('average')
const rollValue = ref<number>(1)
const subclassChoice = reactive<Record<string, string>>({})
const asi = reactive<Record<string, { mode: 'plus2' | 'plus1' | 'feat'; abilities: string[]; feat: string | null }>>({})

const sheet = computed(() => props.saved.sheet!)
const totalLevel = computed(() => props.input.classes.reduce((sum, c) => sum + c.levels.length, 0))
const signed = (n: number) => (n >= 0 ? `+${n}` : `${n}`)
const score = (ability: string) => sheet.value.abilityScores[ability]?.total ?? 10
const conModifier = computed(() => sheet.value.abilityScores.con?.modifier ?? 0)
const classLabel = (index: string) => allClasses.value.find((c) => c.index === index)?.name ?? index
const subclassLabel = (index: string) => SUBCLASS_LABELS[index] ?? 'sous-classe'

const owned = (index: string) => props.input.classes.find((c) => c.class === index)
const classOptions = computed(() => allClasses.value.map((c) => ({ index: c.index, name: c.name, owned: !!owned(c.index), level: owned(c.index)?.levels.length ?? 0 }))
  .sort((a, b) => Number(b.owned) - Number(a.owned)))
const classRule = computed(() => allClasses.value.find((c) => c.index === classIndex.value))
const isNewClass = computed(() => !owned(classIndex.value))
const newClassLevel = computed(() => (owned(classIndex.value)?.levels.length ?? 0) + 1)
const average = computed(() => (classRule.value ? classRule.value.hitDie / 2 + 1 : 0))

// Le niveau de classe donne-t-il une amélioration de caractéristiques ?
const grantsAsi = (cls: ApiClass | undefined, level: number) => {
  const here = cls?.table.levels.find((l) => l.level === level)?.abilityScoreImprovements ?? 0
  const before = cls?.table.levels.find((l) => l.level === level - 1)?.abilityScoreImprovements ?? 0
  return here > before
}

// Améliorations à choisir : celle du nouveau niveau, ou celles laissées en attente
const asiTargets = computed(() => {
  if (props.mode === 'level') {
    return grantsAsi(classRule.value, newClassLevel.value) ? [{ key: `${classIndex.value}:${newClassLevel.value}`, class: classIndex.value, level: newClassLevel.value }] : []
  }
  if (props.mode === 'edit') {
    // Tous les niveaux atteints qui donnent une amélioration, choisie ou non
    return props.input.classes.flatMap((c) => {
      const cls = allClasses.value.find((k) => k.index === c.class)
      return c.levels.filter((l) => grantsAsi(cls, l.level)).map((l) => ({ key: `${c.class}:${l.level}`, class: c.class, level: l.level }))
    })
  }
  return sheet.value.pending.abilityScoreImprovements.map((p) => ({ key: `${p.class}:${p.level}`, class: p.class, level: p.level }))
})
// Sous-classes à choisir : atteinte du niveau de sous-classe, ou en attente
const subclassTargets = computed(() => {
  if (props.mode === 'level') {
    const cls = classRule.value
    const current = owned(classIndex.value)?.subclass
    return cls && !current && newClassLevel.value >= cls.subclassLevel ? [classIndex.value] : []
  }
  if (props.mode === 'edit') {
    // Sous-classes déjà atteintes : modifiables
    return props.input.classes.filter((c) => {
      const cls = allClasses.value.find((k) => k.index === c.class)
      return cls && c.levels.length >= cls.subclassLevel
    }).map((c) => c.class)
  }
  return sheet.value.pending.subclasses
})

// Mode edit : chaque amélioration et sous-classe préremplie avec le choix actuel
const levelOf = (classIndex: string, level: number) => props.input.classes.find((c) => c.class === classIndex)?.levels.find((l) => l.level === level)
watch(asiTargets, (targets) => {
  for (const t of targets) {
    if (asi[t.key]) continue
    const current = props.mode === 'edit' ? levelOf(t.class, t.level) : undefined
    const increases = current?.abilityIncreases ?? []
    asi[t.key] = current?.feat
      ? { mode: 'feat', abilities: [], feat: current.feat }
      : increases.length
        ? { mode: increases.length === 1 && increases[0]!.bonus === 2 ? 'plus2' : 'plus1', abilities: increases.flatMap((x) => (x.ability ? [x.ability] : [])), feat: null }
        : { mode: 'plus2', abilities: [], feat: null }
  }
}, { immediate: true })
watch(subclassTargets, async (targets) => {
  for (const c of targets) {
    if (props.mode === 'edit' && !subclassChoice[c]) {
      const current = owned(c)?.subclass
      if (current) subclassChoice[c] = current
    }
    subclassesOf[c] ??= await loadSubclassesForClass(c)
  }
}, { immediate: true })

function toggleAbility(key: string, ability: string) {
  const state = asi[key]!
  const max = state.mode === 'plus2' ? 1 : 2
  state.abilities = state.abilities.includes(ability)
    ? state.abilities.filter((a) => a !== ability)
    : [...state.abilities, ability].slice(-max)
}
const ownIncrease = (key: string, ability: string) => {
  if (props.mode !== 'edit') return 0
  const [c, l] = key.split(':')
  return levelOf(c!, Number(l))?.abilityIncreases?.find((x) => x.ability === ability)?.bonus ?? 0
}
const abilityAtMax = (ability: string, key: string) =>
  !asi[key]?.abilities.includes(ability) && score(ability) - ownIncrease(key, ability) + (asi[key]?.mode === 'plus2' ? 2 : 1) > 20

function roll() {
  hpMode.value = 'roll'
  rollValue.value = 1 + Math.floor(Math.random() * (classRule.value?.hitDie ?? 6))
}

// --- Ce que le personnage gagne ------------------------------------------------------------

// Sous-classe d'une classe après la montée de niveau (choisie ici, ou déjà là)
const subclassAfter = (c: string) => subclassChoice[c] || owned(c)?.subclass || null
// "Déplacement sans armure (pieds)" : affiché en mètres
const columnValue = (label: string, value: unknown) =>
  /\(pieds\)/.test(label) && typeof value === 'number' ? `${feetToMeters(value).replace(/ mètres?$/, ' m')}` : String(value)

const gains = computed(() => {
  const features: { key: string; name: string; description: string; source: string }[] = []
  const stats: { label: string; value: string }[] = []

  // Capacités du nouveau niveau ; avec une sous-classe choisie maintenant, aussi
  // celles des niveaux déjà atteints
  const targets = props.mode === 'level' && classRule.value
    ? [{ cls: classRule.value, from: newClassLevel.value, to: newClassLevel.value }]
    : []
  for (const c of subclassTargets.value) {
    if (props.mode === 'edit' && subclassChoice[c] === owned(c)?.subclass) continue
    const cls = allClasses.value.find((k) => k.index === c)
    const level = props.mode === 'level' && c === classIndex.value ? newClassLevel.value : owned(c)?.levels.length ?? 0
    if (cls) targets.push({ cls, from: 1, to: level })
  }
  const seen = new Set<string>()
  for (const { cls, from, to } of targets) {
    const sub = subclassAfter(cls.index)
    for (const f of cls.features) {
      if (f.parent || f.level < from || f.level > to || seen.has(f.index)) continue
      // Capacités de classe : seulement au nouveau niveau ; de sous-classe : celle choisie
      if (!f.subclass && (props.mode !== 'level' || cls.index !== classIndex.value || f.level !== newClassLevel.value)) continue
      if (f.subclass && f.subclass !== sub) continue
      seen.add(f.index)
      const subclassName = f.subclass ? cls.subclasses.find((s) => s.index === f.subclass)?.name : null
      features.push({ key: f.index, name: f.name, description: f.description, source: `${subclassName ?? cls.name} ${f.level}` })
    }
    const spells = cls.subclasses.find((s) => s.index === sub)?.spells.filter((sp) => sp.requiredClassLevel >= from && sp.requiredClassLevel <= to) ?? []
    if (spells.length) stats.push({ label: 'Sorts toujours préparés', value: spells.map((sp) => sp.name).join(', ') })
  }

  // Colonnes de la table de classe qui changent (points de ki, rages, attaque sournoise…)
  if (props.mode === 'level' && classRule.value) {
    const table = classRule.value.table
    const now = table.levels.find((l) => l.level === newClassLevel.value)?.values ?? {}
    const before = table.levels.find((l) => l.level === newClassLevel.value - 1)?.values ?? {}
    for (const col of table.columns) {
      const value = now[col.key]
      if (value == null || value === 0 || value === false || value === before[col.key]) continue
      stats.push({ label: col.label.replace(/ \(pieds\)$/, ''), value: before[col.key] != null && before[col.key] !== 0 ? `${columnValue(col.label, before[col.key])} → ${columnValue(col.label, value)}` : columnValue(col.label, value) })
    }
  }

  // Valeurs calculées par le back, avant et après
  const after = preview.value?.sheet
  if (after) {
    const now = sheet.value
    if (after.maxHitPoints !== now.maxHitPoints) stats.unshift({ label: 'PV max', value: `${now.maxHitPoints} → ${after.maxHitPoints}` })
    if (after.proficiencyBonus !== now.proficiencyBonus) stats.push({ label: 'Bonus de maîtrise', value: `${signed(now.proficiencyBonus)} → ${signed(after.proficiencyBonus)}` })
    const slots = after.spellSlots ?? []
    slots.forEach((count, i) => {
      const before = now.spellSlots?.[i] ?? 0
      if (count !== before) stats.push({ label: `Emplacements de niveau ${i + 1}`, value: before ? `${before} → ${count}` : `${count}` })
    })
    if (after.pactSlots && JSON.stringify(after.pactSlots) !== JSON.stringify(now.pactSlots ?? null)) {
      stats.push({ label: 'Emplacements de pacte', value: `${after.pactSlots.count} de niveau ${after.pactSlots.level}` })
    }
    const known = new Set(now.proficiencies.map((p) => p.index))
    const newProfs = after.proficiencies.filter((p) => !known.has(p.index)).map((p) => p.name)
    if (newProfs.length) stats.push({ label: 'Nouvelles maîtrises', value: newProfs.join(', ') })
    const languages = new Set(now.languages.map((l) => l.index))
    const newLanguages = after.languages.filter((l) => !languages.has(l.index)).map((l) => l.name)
    if (newLanguages.length) stats.push({ label: 'Nouvelles langues', value: newLanguages.join(', ') })
  }
  return { features, stats }
})

// Personnage après la montée de niveau (ou les compléments), avec les réponses
function build(answers: ChoiceAnswer[]): Input {
  const next: Input = JSON.parse(JSON.stringify(props.input))
  if (props.mode === 'level' && classRule.value) {
    let entry = next.classes.find((c) => c.class === classIndex.value)
    if (!entry) {
      entry = { class: classIndex.value, subclass: null, hitDiceUsed: 0, levels: [] }
      next.classes.push(entry)
    }
    entry.levels.push({
      level: newClassLevel.value,
      characterLevel: totalLevel.value + 1,
      hitPointRoll: hpMode.value === 'roll' ? Math.min(Math.max(rollValue.value || 1, 1), classRule.value.hitDie) : null,
      abilityIncreases: [],
    })
  }
  for (const c of subclassTargets.value) {
    const entry = next.classes.find((k) => k.class === c)
    if (entry && subclassChoice[c]) entry.subclass = subclassChoice[c]
  }
  for (const t of asiTargets.value) {
    const level = next.classes.find((c) => c.class === t.class)?.levels.find((l) => l.level === t.level)
    const state = asi[t.key]
    if (!level || !state) continue
    level.feat = state.mode === 'feat' ? state.feat : null
    level.abilityIncreases = state.mode === 'feat' ? [] : state.abilities.map((ability) => ({ ability, bonus: state.mode === 'plus2' ? 2 : 1 }))
  }
  next.choices = answers
  return next
}

const { preview, answers, loading, loadError, refresh, setAnswers } = useChoicePreview(
  async (current) => (await previewCharacter(build(current), { lang: 'fr' })).data as unknown as CharacterPreview,
  props.input.choices ?? [],
)

// Choix déjà complets avant d'ouvrir la fenêtre : masqués
const initialCounts = new Map<number, number>()
for (const a of props.input.choices ?? []) initialCounts.set(a.choiceId, (initialCounts.get(a.choiceId) ?? 0) + 1)
const visibleChoices = computed(() => (preview.value?.choices ?? []).filter((c) => props.mode === 'edit' || (initialCounts.get(c.id) ?? 0) < c.choose))

const asiComplete = computed(() => asiTargets.value.every((t) => {
  const s = asi[t.key]
  return s && (s.mode === 'feat' ? !!s.feat : s.abilities.length === (s.mode === 'plus2' ? 1 : 2))
}))
const canApply = computed(() => !!preview.value && !loading.value && !preview.value.errors.length
  && visibleChoices.value.every((c) => answers.value.filter((a) => a.choiceId === c.id).length >= c.choose)
  && asiComplete.value
  && subclassTargets.value.every((c) => !!subclassChoice[c]))

// Le formulaire change le personnage : nouvel aperçu (choix de la nouvelle classe, du nouveau niveau…)
let timer: ReturnType<typeof setTimeout> | undefined
watch([classIndex, hpMode, rollValue, () => ({ ...subclassChoice }), () => JSON.stringify(asi)], () => {
  clearTimeout(timer)
  timer = setTimeout(refresh, 250)
}, { deep: true })

function apply() {
  if (canApply.value) emit('apply', build(answers.value))
}

onMounted(async () => {
  ;[allClasses.value, feats.value] = await Promise.all([loadApiClasses(), loadFeats()])
  refresh()
})
</script>

<style scoped>
@reference "../../index.css";
.section-title { @apply text-sm font-bold uppercase tracking-widest text-amber-500 mb-3 font-serif; }
.choice { @apply px-4 py-2 rounded-lg border-2 border-zinc-800 bg-zinc-900/40 text-zinc-300 text-sm transition-colors hover:border-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed; }
.choice-on { @apply border-amber-500 bg-zinc-900 text-white; }
.input { @apply rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1 text-zinc-100 outline-none focus:border-amber-500; }
</style>
