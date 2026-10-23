<template>
  <div class="min-h-[calc(100vh-5rem)] bg-zinc-950 text-zinc-200">
    <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <router-link :to="{ name: 'campaign', params: { id: campaignId }, query: { tab: 'encounters' } }" class="text-sm text-zinc-400 hover:text-amber-300">← Rencontres de la campagne</router-link>

      <p v-if="loadError" class="mt-6 text-red-300">{{ loadError }}</p>
      <div v-else-if="!combat" class="mt-6"><SkeletonText :lines="2" label="Chargement du combat…" /><SkeletonCards class="mt-6" :count="4" columns="grid-cols-1" compact /></div>

      <template v-else>
        <!-- En-tête : nom, round, tours -->
        <header class="mt-3 flex flex-wrap items-end justify-between gap-4 border-b border-zinc-800 pb-5">
          <div class="min-w-0">
            <input
              :value="combat.name" class="w-full bg-transparent font-serif text-3xl font-bold text-white outline-none sm:text-4xl" aria-label="Nom du combat" maxlength="200"
              @change="change({ ...combat, name: ($event.target as HTMLInputElement).value.trim() || combat.name })"
            />
            <p class="mt-1 text-sm text-zinc-400">
              <span class="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 font-semibold text-amber-200">Round {{ combat.round }}</span>
              <span v-if="current" class="ml-2">Tour de <strong class="text-zinc-100">{{ current.name }}</strong></span>
              <span v-if="combat.finished" class="ml-2 text-emerald-300">· Combat terminé</span>
              <span class="ml-3 text-xs" :class="saveError ? 'text-red-400' : 'text-zinc-500'">{{ saveStatus }}</span>
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button class="ui-btn" :disabled="!combat.combatants.length" @click="change(nextTurn(combat, -1))">← Tour précédent</button>
            <button class="ui-btn-primary" :disabled="!combat.combatants.length" @click="change(nextTurn(combat))">Tour suivant →</button>
          </div>
        </header>
        <p v-if="saveError" class="mt-3 rounded-xl border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-300">Enregistrement refusé : {{ saveError }}</p>

        <!-- Initiative et réglages -->
        <div class="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span class="text-zinc-500">Initiative :</span>
          <button class="ui-btn" @click="change(rollInitiative(combat, 'creatures'))">Lancer pour les créatures</button>
          <button class="ui-btn" @click="change(rollInitiative(combat, 'missing'))">Lancer pour ceux qui n'en ont pas</button>
          <button class="ui-btn" @click="change(sortByInitiative(combat))">Trier</button>
          <span class="mx-2 hidden h-6 w-px bg-zinc-800 sm:block"></span>
          <button class="ui-btn" @click="change({ ...combat, finished: !combat.finished })">{{ combat.finished ? 'Reprendre le combat' : 'Terminer le combat' }}</button>
          <button class="ui-btn-danger" @click="removeCombat">Supprimer</button>
        </div>

        <!-- Ordre d'initiative -->
        <section class="mt-6 grid gap-3">
          <p v-if="!combat.combatants.length" class="text-sm text-zinc-500">Aucun combattant : ajoutez-en ci-dessous.</p>
          <article
            v-for="(c, i) in combat.combatants" :key="`${i}-${c.name}`"
            :class="['rounded-2xl border p-4 transition', i === combat.turn ? 'border-amber-500/60 bg-amber-500/[0.07] shadow-[0_0_0_1px_rgba(245,158,11,0.25)]' : 'border-white/10 bg-white/[0.03]', isOut(c) ? 'opacity-50' : '']"
            :aria-current="i === combat.turn ? 'step' : undefined"
          >
            <div class="flex flex-wrap items-start gap-4">
              <label class="w-16 text-center text-[10px] uppercase tracking-widest text-zinc-500">Init.
                <input
                  :value="c.initiative ?? ''" type="number" class="ui-input mt-1 text-center text-lg font-bold" :aria-label="`Initiative de ${c.name}`"
                  @change="setInitiative(i, ($event.target as HTMLInputElement).value)"
                />
              </label>

              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <input
                    :value="c.name" class="min-w-0 bg-transparent text-lg font-semibold text-zinc-100 outline-none" :aria-label="`Nom de ${c.name}`" maxlength="120"
                    @change="change(patchCombatant(combat, i, { name: ($event.target as HTMLInputElement).value.trim() || c.name }))"
                  />
                  <span :class="['rounded-full border px-2 text-[10px] uppercase', KIND_CLASSES[c.kind]]">{{ KIND_LABELS[c.kind] }}</span>
                  <router-link v-if="c.character" :to="`/character/${c.character.id}`" target="_blank" class="text-xs text-sky-300 hover:underline">fiche</router-link>
                  <router-link
                    v-else-if="c.monster" target="_blank" class="text-xs text-sky-300 hover:underline"
                    :to="{ name: c.monster.homebrew ? 'homebrew-monster' : 'monster-view', params: { index: c.monster.index } }"
                  >bloc de statistiques</router-link>
                  <button
                    v-if="c.monster && details[c.monster.index]" type="button" class="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 text-xs text-amber-200 hover:bg-amber-500/20"
                    :aria-expanded="!!openAttacks[i]" @click="openAttacks[i] = !openAttacks[i]"
                  >Attaques {{ openAttacks[i] ? '▴' : '▾' }}</button>
                  <span v-if="isOut(c)" class="text-xs text-red-300">hors de combat</span>
                </div>
                <!-- États -->
                <div class="mt-2 flex flex-wrap items-center gap-1">
                  <button
                    v-for="k in c.conditions" :key="k" type="button" class="rounded-full border border-violet-400/30 bg-violet-400/10 px-2 py-0.5 text-xs text-violet-200 hover:line-through"
                    :title="`Retirer l'état ${conditionName(k)}`" @click="change(toggleCondition(combat, i, k))"
                  >{{ conditionName(k) }} ✕</button>
                  <select class="rounded-full border border-white/10 bg-zinc-950 px-2 py-0.5 text-xs text-zinc-400" :aria-label="`Ajouter un état à ${c.name}`" value="" @change="addCondition(i, $event.target as HTMLSelectElement)">
                    <option value="" disabled>+ état</option>
                    <option v-for="k in conditions.filter((x) => !c.conditions.includes(x.index))" :key="k.index" :value="k.index">{{ k.name }}</option>
                  </select>
                </div>
                <!-- Attaques du monstre : jets d'attaque et de dégâts, à appliquer à une cible -->
                <MonsterAttacksPanel
                  v-if="openAttacks[i] && c.monster && details[c.monster.index]" :monster="details[c.monster.index]!"
                  :targets="combat.combatants.map((x, position) => ({ position, name: x.name }))"
                  @apply="(position, amount) => change(damage(combat!, position, amount))"
                />
                <input
                  :value="c.note ?? ''" class="mt-2 w-full bg-transparent text-xs text-zinc-400 outline-none placeholder:text-zinc-600" placeholder="Note (concentration, cible…)" maxlength="500"
                  :aria-label="`Note sur ${c.name}`" @change="change(patchCombatant(combat, i, { note: ($event.target as HTMLInputElement).value || null }))"
                />
              </div>

              <div class="text-center">
                <p class="text-[10px] uppercase tracking-widest text-zinc-500">CA</p>
                <input :value="c.armorClass ?? ''" type="number" min="0" class="ui-input mt-1 w-16 text-center" :aria-label="`CA de ${c.name}`" @change="setNumber(i, 'armorClass', ($event.target as HTMLInputElement).value)" />
              </div>

              <!-- Points de vie -->
              <div class="w-56">
                <p class="flex justify-between text-[10px] uppercase tracking-widest text-zinc-500">
                  <span>Points de vie</span><span v-if="c.tempHitPoints" class="text-sky-300">+{{ c.tempHitPoints }} temp.</span>
                </p>
                <div class="mt-1 flex items-center gap-1">
                  <input :value="c.hitPoints ?? ''" type="number" min="0" class="ui-input w-16 text-center font-bold" :aria-label="`PV de ${c.name}`" @change="setNumber(i, 'hitPoints', ($event.target as HTMLInputElement).value)" />
                  <span class="text-zinc-500">/</span>
                  <input :value="c.maxHitPoints ?? ''" type="number" min="1" class="ui-input w-16 text-center" :aria-label="`PV max de ${c.name}`" @change="setNumber(i, 'maxHitPoints', ($event.target as HTMLInputElement).value)" />
                </div>
                <div v-if="c.maxHitPoints" class="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                  <div class="h-full rounded-full transition-all" :class="hpColor(c)" :style="{ width: `${Math.min(100, ((c.hitPoints ?? 0) / c.maxHitPoints) * 100)}%` }"></div>
                </div>
                <div class="mt-2 flex gap-1">
                  <input v-model.number="amounts[i]" type="number" min="1" class="ui-input w-16 text-center" placeholder="…" :aria-label="`Montant pour ${c.name}`" />
                  <button class="rounded-lg bg-red-900/60 px-2 text-xs font-semibold text-red-100 hover:bg-red-800" @click="applyAmount(i, 'damage')">Dégâts</button>
                  <button class="rounded-lg bg-emerald-900/60 px-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-800" @click="applyAmount(i, 'heal')">Soins</button>
                  <button class="rounded-lg bg-sky-900/60 px-2 text-xs font-semibold text-sky-100 hover:bg-sky-800" title="PV temporaires" @click="applyAmount(i, 'temp')">Temp.</button>
                </div>
              </div>

              <!-- Ordre, visibilité, retrait -->
              <div class="flex flex-col items-center gap-1">
                <button class="text-zinc-500 hover:text-white disabled:opacity-20" :disabled="i === 0" :aria-label="`Monter ${c.name}`" @click="change(move(combat, i, -1))">▲</button>
                <button
                  class="text-xs" :class="c.hidden ? 'text-zinc-600' : 'text-zinc-300'" :title="c.hidden ? 'Masqué aux joueurs' : 'Visible par les joueurs'"
                  :aria-label="c.hidden ? `Révéler ${c.name} aux joueurs` : `Masquer ${c.name} aux joueurs`" @click="change(patchCombatant(combat, i, { hidden: !c.hidden }))"
                >{{ c.hidden ? 'masqué' : 'visible' }}</button>
                <button class="text-zinc-500 hover:text-white disabled:opacity-20" :disabled="i === combat.combatants.length - 1" :aria-label="`Descendre ${c.name}`" @click="change(move(combat, i, 1))">▼</button>
                <button class="mt-1 text-xs text-zinc-600 hover:text-red-400" :aria-label="`Retirer ${c.name}`" @click="removeAt(i)">✕</button>
              </div>
            </div>
          </article>
        </section>

        <div class="mt-6 grid gap-6 lg:grid-cols-2">
          <!-- Ajout -->
          <section class="ui-panel">
            <h2 class="mb-3 font-serif text-xl font-bold text-amber-200">Ajouter des combattants</h2>
            <div class="relative flex gap-2">
              <input v-model="search" type="search" class="ui-input flex-1" placeholder="Monstre du bestiaire…" aria-label="Rechercher un monstre à ajouter" />
              <input v-model.number="addCount" type="number" min="1" max="20" class="ui-input w-16 text-center" aria-label="Nombre" />
              <ul v-if="matches.length" class="absolute top-full z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-white/10 bg-zinc-900 shadow-xl">
                <li v-for="m in matches" :key="m.index">
                  <button type="button" class="flex w-full justify-between px-3 py-2 text-left text-sm hover:bg-white/10" @click="addMonster(m)">
                    <span>{{ m.name }}<span v-if="m.source === 'HOMEBREW'" class="ml-2 text-xs text-violet-300">maison</span></span>
                    <span class="text-zinc-500">FP {{ formatChallenge(m.challengeRating) }} · CA {{ m.armorClass }} · {{ m.hitPoints }} PV</span>
                  </button>
                </li>
              </ul>
            </div>
            <form class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5" @submit.prevent="addOther">
              <input v-model="other.name" class="ui-input col-span-2" placeholder="PNJ, créature…" aria-label="Nom du combattant libre" maxlength="120" />
              <input v-model.number="other.armorClass" type="number" min="0" class="ui-input" placeholder="CA" aria-label="CA" />
              <input v-model.number="other.maxHitPoints" type="number" min="1" class="ui-input" placeholder="PV" aria-label="PV" />
              <button class="ui-btn" :disabled="!other.name.trim()">Ajouter</button>
            </form>
          </section>

          <!-- Vue des joueurs -->
          <section class="ui-panel">
            <h2 class="mb-2 font-serif text-xl font-bold text-amber-200">Vue des joueurs</h2>
            <p class="mb-3 text-xs text-zinc-400">
              Un lien en lecture seule, à afficher sur un écran ou à envoyer : ordre d'initiative, tour en cours, PV des personnages.
              Les créatures n'y montrent que leur état (« en sang »…), les créatures masquées n'y apparaissent pas.
            </p>
            <template v-if="combat.shareCode">
              <div class="flex gap-2">
                <input :value="combatViewUrl(combat.shareCode)" readonly class="ui-input font-mono text-xs" aria-label="Lien de la vue des joueurs" @focus="($event.target as HTMLInputElement).select()" />
                <button type="button" class="ui-btn shrink-0" @click="copyLink">{{ copied ? 'Copié' : 'Copier' }}</button>
              </div>
              <div class="mt-3 flex gap-3 text-xs">
                <a :href="combatViewUrl(combat.shareCode)" target="_blank" class="text-sky-300 hover:underline">Ouvrir</a>
                <button type="button" class="text-zinc-400 underline hover:text-zinc-200" @click="share(true)">Nouveau lien</button>
                <button type="button" class="text-zinc-400 underline hover:text-zinc-200" @click="share(false)">Ne plus partager</button>
              </div>
            </template>
            <button v-else type="button" class="ui-btn" @click="share(true)">Partager avec les joueurs</button>
          </section>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import SkeletonCards from '@/components/skeleton/SkeletonCards.vue'
import SkeletonText from '@/components/skeleton/SkeletonText.vue'
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { campaignsApi, combatViewUrl, type Combat, type Combatant, type CombatantKind } from '@/api/campaigns'
import MonsterAttacksPanel from '@/components/combat/MonsterAttacksPanel.vue'
import { monstersApi } from '@/api/monsters'
import { loadConditions, loadMonster, loadMonsters, type ApiMonster, type ApiMonsterSummary } from '@/utils/dataLoader'
import { abilityModifier, formatChallenge } from '@/utils/monsterFormat'
import {
  addCombatants, damage, heal, isOut, move, nextTurn, patchCombatant, removeCombatant, rollInitiative, setTempHp, sortByInitiative, toggleCondition,
} from '@/utils/combatActions'

const route = useRoute()
const router = useRouter()
const campaignId = Number(route.params.id)
const combatId = Number(route.params.combatId)

const KIND_LABELS: Record<CombatantKind, string> = { CHARACTER: 'PJ', MONSTER: 'monstre', OTHER: 'autre' }
const KIND_CLASSES: Record<CombatantKind, string> = {
  CHARACTER: 'border-sky-400/30 text-sky-200', MONSTER: 'border-red-400/30 text-red-200', OTHER: 'border-zinc-500/30 text-zinc-300',
}

const combat = ref<Combat | null>(null)
const loadError = ref<string | null>(null)
const conditions = ref<{ index: string; name: string }[]>([])
const bestiary = ref<ApiMonsterSummary[]>([])
const amounts = reactive<Record<number, number | undefined>>({})
const search = ref('')
const addCount = ref(1)
const other = reactive({ name: '', armorClass: null as number | null, maxHitPoints: null as number | null })
const copied = ref(false)
// Fiches des monstres du combat (une par monstre, pas par combattant) et panneaux d'attaques ouverts
const details = reactive<Record<string, ApiMonster>>({})
const openAttacks = reactive<Record<number, boolean>>({})

async function loadDetail(monster: { index: string; homebrew: boolean }) {
  if (details[monster.index]) return details[monster.index]
  const detail = monster.homebrew ? await monstersApi.get(monster.index) : await loadMonster(monster.index)
  details[monster.index] = detail
  return detail
}

const current = computed(() => combat.value?.combatants[combat.value.turn] ?? null)
const conditionName = (index: string) => conditions.value.find((c) => c.index === index)?.name ?? index
const hpColor = (c: Combatant) => {
  const ratio = (c.hitPoints ?? 0) / (c.maxHitPoints || 1)
  return ratio > 0.5 ? 'bg-emerald-500' : ratio > 0 ? 'bg-amber-500' : 'bg-red-600'
}

// --- Enregistrement automatique (comme la fiche de personnage) -------------------------

const saving = ref(false)
const pending = ref(false)
const saveError = ref<string | null>(null)
let timer: ReturnType<typeof setTimeout> | undefined
const saveStatus = computed(() => (saveError.value ? 'Non enregistré' : saving.value || pending.value ? 'Enregistrement…' : 'Enregistré'))

function change(next: Combat) {
  combat.value = next
  saveError.value = null
  pending.value = true
  clearTimeout(timer)
  timer = setTimeout(save, 500)
}

async function save() {
  if (!combat.value) return
  const sent = combat.value
  saving.value = true
  try {
    const saved = await campaignsApi.saveCombat(campaignId, sent)
    // Pas de changement entre-temps : l'état enregistré fait foi
    if (combat.value === sent) {
      combat.value = saved
      pending.value = false
    }
  } catch (e) {
    saveError.value = e instanceof Error ? e.message : String(e)
  } finally {
    saving.value = false
  }
}

// --- Actions ----------------------------------------------------------------------------

function setInitiative(i: number, value: string) {
  change(patchCombatant(combat.value!, i, { initiative: value === '' ? null : Number(value) }))
}
function setNumber(i: number, key: 'armorClass' | 'hitPoints' | 'maxHitPoints', value: string) {
  const n = value === '' ? null : Math.max(key === 'maxHitPoints' ? 1 : 0, Math.floor(Number(value)))
  change(patchCombatant(combat.value!, i, { [key]: n }))
}
function applyAmount(i: number, kind: 'damage' | 'heal' | 'temp') {
  const amount = amounts[i]
  if (!amount || amount <= 0) return
  change(kind === 'damage' ? damage(combat.value!, i, amount) : kind === 'heal' ? heal(combat.value!, i, amount) : setTempHp(combat.value!, i, amount))
  amounts[i] = undefined
}
function addCondition(i: number, select: HTMLSelectElement) {
  const value = select.value
  select.value = ''
  if (value) change(toggleCondition(combat.value!, i, value))
}
function removeAt(i: number) {
  if (window.confirm(`Retirer ${combat.value!.combatants[i]!.name} du combat ?`)) change(removeCombatant(combat.value!, i))
}

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const matches = computed(() => {
  const query = normalize(search.value.trim())
  return query.length < 2 ? [] : bestiary.value.filter((m) => normalize(m.name).includes(query)).slice(0, 12)
})

// Monstre du bestiaire : sa fiche donne le bonus d'initiative (DEX)
async function addMonster(m: ApiMonsterSummary) {
  const detail = await loadDetail({ index: m.index, homebrew: m.source === 'HOMEBREW' })
  change(addCombatants(combat.value!, {
    kind: 'MONSTER', character: null, monster: { index: m.index, name: m.name, homebrew: m.source === 'HOMEBREW' }, name: m.name,
    initiative: null, initiativeBonus: abilityModifier(detail.abilityScores.dex), armorClass: m.armorClass, maxHitPoints: m.hitPoints, hitPoints: m.hitPoints,
    tempHitPoints: 0, conditions: [], note: null, hidden: false,
  }, Math.max(1, Math.min(20, addCount.value || 1))))
  search.value = ''
  addCount.value = 1
}
function addOther() {
  if (!other.name.trim()) return
  change(addCombatants(combat.value!, {
    kind: 'OTHER', character: null, monster: null, name: other.name.trim(), initiative: null, initiativeBonus: 0,
    armorClass: other.armorClass || null, maxHitPoints: other.maxHitPoints || null, hitPoints: other.maxHitPoints || null,
    tempHitPoints: 0, conditions: [], note: null, hidden: false,
  }))
  Object.assign(other, { name: '', armorClass: null, maxHitPoints: null })
}

async function share(on: boolean) {
  const { shareCode } = await campaignsApi.shareCombat(campaignId, combatId, on)
  combat.value = { ...combat.value!, shareCode }
}
async function copyLink() {
  await navigator.clipboard?.writeText(combatViewUrl(combat.value!.shareCode!))
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}
async function removeCombat() {
  if (!window.confirm('Supprimer définitivement ce combat ?')) return
  await campaignsApi.removeCombat(campaignId, combatId)
  router.push({ name: 'campaign', params: { id: campaignId }, query: { tab: 'encounters' } })
}

onMounted(async () => {
  try {
    const [loaded, conditionRows] = await Promise.all([campaignsApi.combat(campaignId, combatId), loadConditions()])
    combat.value = loaded
    conditions.value = conditionRows
    const monsters = new Map(loaded.combatants.flatMap((c) => (c.monster ? [[c.monster.index, c.monster]] : [])))
    const [mine, srd] = await Promise.all([
      monstersApi.list().catch(() => []),
      loadMonsters(),
      ...[...monsters.values()].map((m) => loadDetail(m).catch(() => null)),
    ])
    bestiary.value = [...mine, ...srd]
  } catch (e) {
    loadError.value = `Impossible de charger le combat : ${e instanceof Error ? e.message : String(e)}`
  }
})
// Relecture toutes les 10 s et au retour sur l'onglet : PV changés sur les fiches
// des joueurs. Jamais pendant un enregistrement ni une saisie en cours.
const editing = () => {
  const el = document.activeElement
  return !!el && ['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName)
}
async function refreshFromServer() {
  if (!combat.value || pending.value || saving.value || editing() || document.hidden) return
  try {
    const fresh = await campaignsApi.combat(campaignId, combatId)
    if (!pending.value && !saving.value && !editing()) combat.value = fresh
  } catch {
    // Réseau indisponible : nouvel essai au prochain passage
  }
}
const refreshTimer = setInterval(refreshFromServer, 10000)
const onVisible = () => { if (!document.hidden) refreshFromServer() }
document.addEventListener('visibilitychange', onVisible)

// Un enregistrement en attente part avant de quitter la page
onBeforeUnmount(() => {
  clearInterval(refreshTimer)
  document.removeEventListener('visibilitychange', onVisible)
  if (pending.value) {
    clearTimeout(timer)
    save()
  }
})
</script>
