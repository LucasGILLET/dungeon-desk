<template>
  <div class="min-h-[calc(100vh-5rem)] bg-zinc-950 text-zinc-200">
    <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <router-link :to="backTo" class="text-sm text-zinc-400 hover:text-amber-300">← {{ editIndex ? 'Retour au monstre' : 'Bestiaire' }}</router-link>
      <h1 class="mt-2 font-serif text-4xl font-bold text-amber-300">{{ editIndex ? `Modifier ${form?.name || 'le monstre'}` : 'Nouveau monstre' }}</h1>
      <p class="mt-1 text-sm text-zinc-400">
        Monstre maison : visible seulement par vous, utilisable dans les rencontres de vos campagnes.
        <template v-if="copiedFrom"> Copie de « {{ copiedFrom }} » du SRD, à adapter.</template>
      </p>

      <p v-if="loadError" class="mt-6 text-red-300">{{ loadError }}</p>
      <p v-else-if="!form || !options" class="mt-6 text-zinc-400">Chargement…</p>

      <form v-else class="mt-6 grid gap-6" @submit.prevent="save">
        <!-- Identité -->
        <section class="ui-panel grid gap-4 sm:grid-cols-2">
          <label class="ui-label sm:col-span-2">Nom<input v-model="form.name" class="ui-input" required maxlength="120" /></label>
          <label class="ui-label">Taille
            <select v-model="form.size" class="ui-input"><option v-for="s in SIZES" :key="s" :value="s">{{ SIZE_LABELS[s] }}</option></select>
          </label>
          <label class="ui-label">Type
            <select v-model="form.type" class="ui-input"><option v-for="t in options.creatureTypes" :key="t.index" :value="t.index">{{ t.name }}</option></select>
          </label>
          <label class="ui-label">Alignement
            <select v-model="form.alignment" class="ui-input">
              <option :value="null">Sans alignement</option>
              <option v-for="a in options.alignments" :key="a.index" :value="a.index">{{ a.name }}</option>
            </select>
          </label>
          <label class="ui-label">Facteur de puissance
            <select v-model.number="form.challengeRating" class="ui-input">
              <option v-for="c in options.challengeRatings" :key="c.value" :value="c.value">{{ formatChallenge(c.value) }} ({{ c.xp.toLocaleString('fr-FR') }} XP)</option>
            </select>
          </label>
          <label class="ui-label sm:col-span-2">Description (Markdown simple : **gras**, *italique*)
            <textarea v-model="description" rows="3" class="ui-input"></textarea>
          </label>
        </section>

        <!-- Défense et déplacement -->
        <section class="ui-panel grid gap-4 sm:grid-cols-4">
          <label class="ui-label">Classe d'armure<input v-model.number="form.armorClass.value" type="number" min="0" max="40" class="ui-input" required /></label>
          <label class="ui-label sm:col-span-3">Précision (armure naturelle, cotte de mailles…)<input v-model="armorNote" class="ui-input" maxlength="200" /></label>
          <label class="ui-label">Dés de vie<input v-model.number="form.hitDice.count" type="number" min="1" max="100" class="ui-input" required /></label>
          <label class="ui-label">Dé
            <select v-model.number="form.hitDice.size" class="ui-input"><option v-for="d in [4, 6, 8, 10, 12, 20]" :key="d" :value="d">d{{ d }}</option></select>
          </label>
          <label class="ui-label">Bonus<input v-model.number="form.hitDice.bonus" type="number" class="ui-input" /></label>
          <label class="ui-label">Points de vie<input v-model.number="hitPoints" type="number" min="1" class="ui-input" :placeholder="`${averageHp} (moyenne)`" /></label>
          <label v-for="s in SPEEDS" :key="s.key" class="ui-label">{{ s.label }} (m)
            <input :value="meters(form.speeds[s.key])" type="number" min="0" step="1.5" class="ui-input" @input="setDistance(form.speeds, s.key, ($event.target as HTMLInputElement).value)" />
          </label>
        </section>

        <!-- Caractéristiques -->
        <section class="ui-panel">
          <div class="grid grid-cols-3 gap-3 sm:grid-cols-6">
            <label v-for="a in ABILITIES" :key="a.key" class="ui-label text-center">{{ a.label }}
              <input v-model.number="form.abilityScores[a.key]" type="number" min="1" max="30" class="ui-input text-center" required />
              <span class="text-xs text-zinc-500">{{ signed(abilityModifier(form.abilityScores[a.key])) }}</span>
            </label>
          </div>

          <div class="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <p class="mb-2 text-sm text-zinc-400">Jets de sauvegarde</p>
              <div v-for="(s, i) in form.savingThrows" :key="i" class="mb-2 flex gap-2">
                <select v-model="s.ability" class="ui-input flex-1"><option v-for="a in options.abilities" :key="a.index" :value="a.index">{{ a.name }}</option></select>
                <input v-model.number="s.bonus" type="number" class="ui-input w-20" aria-label="Bonus" />
                <button type="button" class="ui-btn-danger" @click="form.savingThrows.splice(i, 1)">✕</button>
              </div>
              <button type="button" class="text-xs text-zinc-400 underline hover:text-zinc-200" @click="addSave">+ Ajouter une sauvegarde</button>
            </div>
            <div>
              <p class="mb-2 text-sm text-zinc-400">Compétences</p>
              <div v-for="(s, i) in form.skills" :key="i" class="mb-2 flex gap-2">
                <select v-model="s.skill" class="ui-input flex-1"><option v-for="k in options.skills" :key="k.index" :value="k.index">{{ k.name }}</option></select>
                <input v-model.number="s.bonus" type="number" class="ui-input w-20" aria-label="Bonus" />
                <button type="button" class="ui-btn-danger" @click="form.skills.splice(i, 1)">✕</button>
              </div>
              <button type="button" class="text-xs text-zinc-400 underline hover:text-zinc-200" @click="addSkill">+ Ajouter une compétence</button>
            </div>
          </div>
          <p class="mt-2 text-xs text-zinc-500">Bonus de maîtrise au FP {{ formatChallenge(form.challengeRating) }} : {{ signed(proficiency) }} (proposé à l'ajout).</p>
        </section>

        <!-- Résistances, immunités, sens, langues -->
        <section class="ui-panel grid gap-4">
          <div v-for="g in DAMAGE_GROUPS" :key="g.key">
            <p class="mb-2 text-sm text-zinc-400">{{ g.label }}</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="t in options.damageTypes" :key="t.index" type="button"
                :class="['rounded-full border px-3 py-1 text-xs', form[g.key].includes(t.index) ? 'border-amber-500/50 bg-amber-500/15 text-amber-100' : 'border-white/10 text-zinc-400 hover:text-zinc-200']"
                :aria-pressed="form[g.key].includes(t.index)" @click="toggle(form[g.key], t.index)"
              >{{ t.name }}</button>
            </div>
          </div>
          <div>
            <p class="mb-2 text-sm text-zinc-400">Immunités d'état</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="c in options.conditions" :key="c.index" type="button"
                :class="['rounded-full border px-3 py-1 text-xs', form.conditionImmunities.includes(c.index) ? 'border-amber-500/50 bg-amber-500/15 text-amber-100' : 'border-white/10 text-zinc-400 hover:text-zinc-200']"
                :aria-pressed="form.conditionImmunities.includes(c.index)" @click="toggle(form.conditionImmunities, c.index)"
              >{{ c.name }}</button>
            </div>
          </div>
          <div class="grid gap-4 sm:grid-cols-4">
            <label v-for="s in SENSES" :key="s.key" class="ui-label">{{ s.label }} (m)
              <input :value="meters(form.senses[s.key])" type="number" min="0" step="1.5" class="ui-input" @input="setDistance(form.senses, s.key, ($event.target as HTMLInputElement).value)" />
            </label>
            <label class="ui-label">Perception passive<input v-model.number="passive" type="number" min="0" max="40" class="ui-input" :placeholder="String(10 + abilityModifier(form.abilityScores.wis))" /></label>
            <label class="ui-label sm:col-span-3">Langues<input v-model="languages" class="ui-input" maxlength="300" placeholder="commun, gobelin" /></label>
          </div>
        </section>

        <MonsterActionEditor v-model="form.traits" title="Capacités" empty="Aucune capacité spéciale (Amphibie, Résistance à la magie…)." :options="options" traits />
        <MonsterActionEditor v-model="form.actions" title="Actions" empty="Aucune action." :options="options" />
        <MonsterActionEditor v-model="form.bonusActions" title="Actions bonus" empty="Aucune action bonus." :options="options" />
        <MonsterActionEditor v-model="form.reactions" title="Réactions" empty="Aucune réaction." :options="options" />
        <MonsterActionEditor v-model="form.legendaryActions" title="Actions légendaires" empty="Aucune action légendaire." :options="options" legendary>
          <label v-if="form.legendaryActions.length" class="ui-label mb-2 w-48">Actions par round
            <input v-model.number="form.legendaryActionsPerRound" type="number" min="1" max="5" class="ui-input" placeholder="3" />
          </label>
        </MonsterActionEditor>

        <p v-if="saveError" class="rounded-2xl border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-300">{{ saveError }}</p>
        <div class="flex gap-3">
          <button type="submit" class="ui-btn-primary" :disabled="saving">{{ saving ? 'Enregistrement…' : editIndex ? 'Enregistrer' : 'Créer le monstre' }}</button>
          <router-link :to="backTo" class="ui-btn">Annuler</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MonsterActionEditor from '@/components/bestiary/MonsterActionEditor.vue'
import { emptyMonster, monstersApi, toMonsterInput, type MonsterInput, type MonsterOptions } from '@/api/monsters'
import { loadMonster } from '@/utils/dataLoader'
import { abilityModifier, formatChallenge, signed, SIZE_LABELS, SIZES } from '@/utils/monsterFormat'

const route = useRoute()
const router = useRouter()
const editIndex = route.params.index ? String(route.params.index) : null

const ABILITIES = [
  { key: 'str', label: 'FOR', index: 'str' }, { key: 'dex', label: 'DEX', index: 'dex' }, { key: 'con', label: 'CON', index: 'con' },
  { key: 'int', label: 'INT', index: 'int' }, { key: 'wis', label: 'SAG', index: 'wis' }, { key: 'cha', label: 'CHA', index: 'cha' },
] as const
const SPEEDS = [
  { key: 'walk', label: 'Marche' }, { key: 'fly', label: 'Vol' }, { key: 'swim', label: 'Nage' }, { key: 'climb', label: 'Escalade' }, { key: 'burrow', label: 'Creusement' },
] as const
const SENSES = [
  { key: 'darkvision', label: 'Vision dans le noir' }, { key: 'blindsight', label: 'Vision aveugle' }, { key: 'tremorsense', label: 'Perception des vibrations' }, { key: 'truesight', label: 'Vision véritable' },
] as const
const DAMAGE_GROUPS = [
  { key: 'damageVulnerabilities', label: 'Vulnérabilités' }, { key: 'damageResistances', label: 'Résistances' }, { key: 'damageImmunities', label: 'Immunités aux dégâts' },
] as const

const form = ref<MonsterInput | null>(null)
const options = ref<MonsterOptions | null>(null)
const loadError = ref<string | null>(null)
const saving = ref(false)
const saveError = ref<string | null>(null)
const copiedFrom = ref<string | null>(null)

const backTo = computed(() => (editIndex ? { name: 'homebrew-monster', params: { index: editIndex } } : { name: 'bestiary' }))

// Champs facultatifs : vides → null (valeurs dérivées par l'API)
const nullable = <K extends 'description' | 'languages' | 'hitPoints' | 'passivePerception'>(key: K) => computed({
  get: () => form.value?.[key] ?? '',
  set: (v) => { form.value![key] = (v === '' ? null : v) as MonsterInput[K] },
})
const description = nullable('description')
const languages = nullable('languages')
const hitPoints = nullable('hitPoints')
const passive = nullable('passivePerception')
const armorNote = computed({ get: () => form.value?.armorClass.note ?? '', set: (v: string) => { form.value!.armorClass.note = v || null } })

const averageHp = computed(() => {
  const d = form.value!.hitDice
  return Math.max(1, Math.floor(d.count * (d.size + 1) / 2) + (d.bonus || 0))
})
// Bonus de maîtrise d'après le FP (FP 0 à 4 : +2)
const proficiency = computed(() => 2 + Math.floor((Math.max(1, Math.ceil(form.value!.challengeRating)) - 1) / 4))

const meters = (ft: number | undefined) => (ft == null ? '' : Math.round(ft * 0.3 * 10) / 10)
function setDistance<T extends string>(target: Partial<Record<T, number>>, key: T, value: string) {
  if (value === '') delete target[key]
  else target[key] = Math.round(Number(value) / 0.3 / 5) * 5
}
function toggle(list: string[], index: string) {
  const i = list.indexOf(index)
  if (i >= 0) list.splice(i, 1)
  else list.push(index)
}
function addSave() {
  const free = ABILITIES.find((a) => !form.value!.savingThrows.some((s) => s.ability === a.index)) ?? ABILITIES[0]
  form.value!.savingThrows.push({ ability: free.index, bonus: abilityModifier(form.value!.abilityScores[free.key]) + proficiency.value })
}
function addSkill() {
  form.value!.skills.push({ skill: options.value!.skills[0]!.index, bonus: proficiency.value })
}

async function save() {
  saving.value = true
  saveError.value = null
  try {
    const input = form.value!
    if (!input.legendaryActions.length) input.legendaryActionsPerRound = null
    const { index } = editIndex ? await monstersApi.update(editIndex, input) : await monstersApi.create(input)
    router.push({ name: 'homebrew-monster', params: { index } })
  } catch (e) {
    saveError.value = `Enregistrement refusé : ${e instanceof Error ? e.message : String(e)}`
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    options.value = await monstersApi.options()
    if (editIndex) {
      form.value = toMonsterInput(await monstersApi.get(editIndex))
    } else if (route.query.from) {
      // Copier un monstre du SRD comme point de départ
      const source = await loadMonster(String(route.query.from))
      copiedFrom.value = source.name
      form.value = { ...toMonsterInput(source), name: `${source.name} (variante)` }
    } else {
      form.value = emptyMonster()
    }
  } catch (e) {
    loadError.value = `Impossible de charger le formulaire : ${e instanceof Error ? e.message : String(e)}`
  }
})
</script>
