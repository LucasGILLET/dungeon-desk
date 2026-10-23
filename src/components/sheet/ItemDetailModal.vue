<template>
  <div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" :aria-label="title" @click.self="emit('close')">
    <div class="my-8 w-full max-w-xl rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl">
      <header class="flex items-start justify-between gap-4 border-b border-zinc-800 px-6 py-4">
        <div>
          <h2 class="font-serif text-2xl font-bold text-white">{{ title }}</h2>
          <p v-if="subtitle" class="mt-1 text-sm italic text-zinc-400">{{ subtitle }}</p>
        </div>
        <button ref="closeButton" class="text-xl text-zinc-500 hover:text-white" aria-label="Fermer" @click="emit('close')">✕</button>
      </header>

      <div class="space-y-4 px-6 py-5 text-sm text-zinc-300">
        <SkeletonText v-if="loading" :title="false" :lines="5" label="Chargement de la fiche de l'objet…" />
        <p v-else-if="error" class="text-red-300">{{ error }}</p>

        <!-- Objet magique (le cas échéant posé sur un objet de base, décrit ensuite) -->
        <template v-else-if="magicItem || equipment">
          <template v-if="magicItem">
            <p class="flex flex-wrap gap-2 text-xs">
              <span :class="['rounded-full border px-3 py-1', RARITY_CLASSES[magicItem.rarity]]">{{ RARITY_LABELS[magicItem.rarity] }}</span>
              <span class="rounded-full border border-white/10 px-3 py-1">{{ magicItem.category.name }}</span>
              <span v-if="magicItem.requiresAttunement" class="rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-violet-200">Nécessite un lien</span>
            </p>
            <RichText :text="magicItem.description" />
            <router-link :to="`/magic-items/${magicItem.index}`" class="inline-block text-sky-300 hover:underline" @click="emit('close')">Voir la page de l'objet</router-link>
          </template>

          <!-- Objet du catalogue -->
          <template v-if="equipment">
            <h3 v-if="magicItem" class="border-t border-zinc-800 pt-4 text-xs font-bold uppercase tracking-widest text-amber-500">Objet de base : {{ equipment.name }}</h3>
            <dl class="grid grid-cols-2 gap-x-4 gap-y-2">
              <template v-for="row in equipmentRows" :key="row.label">
                <dt class="text-xs uppercase tracking-widest text-zinc-500">{{ row.label }}</dt>
                <dd class="text-zinc-100">{{ row.value }}</dd>
              </template>
            </dl>
            <section v-if="equipment.weapon?.properties.length" class="space-y-2">
              <h3 class="text-xs font-bold uppercase tracking-widest text-amber-500">Propriétés</h3>
              <div v-for="p in equipment.weapon.properties" :key="p.index">
                <p class="font-semibold text-zinc-100">{{ p.name }}</p>
                <RichText :text="p.description" class="text-zinc-400" />
              </div>
            </section>
            <RichText v-if="equipment.description" :text="equipment.description" />
          </template>
        </template>

        <!-- Objet libre -->
        <template v-else>
          <RichText v-if="item.description" :text="item.description" />
          <p v-else class="text-zinc-500">Objet libre, sans description.</p>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SkeletonText from '@/components/skeleton/SkeletonText.vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import RichText from '@/components/RichText.vue'
import { loadEquipment, loadMagicItem, type ApiEquipmentDetail, type ApiMagicItem } from '@/utils/dataLoader'
import { RARITY_CLASSES, RARITY_LABELS } from '@/utils/monsterFormat'
import { feetToMeters } from '@/utils/spellFormat'
import type { Input } from '@/utils/sheetActions'

type Item = NonNullable<Input['items']>[number]
const props = defineProps<{ item: Item; name: string }>()
const emit = defineEmits<{ close: [] }>()

const equipment = ref<ApiEquipmentDetail | null>(null)
const magicItem = ref<ApiMagicItem | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)

const title = computed(() => props.name)
const subtitle = computed(() => {
  if (magicItem.value) return magicItem.value.subtitle
  const e = equipment.value
  if (!e) return null
  // Nom personnalisé d'un objet du catalogue : on rappelle l'objet d'origine
  return [props.item.name && props.item.name !== e.name ? e.name : null, e.categories.map((c) => c.name).join(', ')].filter(Boolean).join(' · ') || null
})

const CURRENCY = { CP: 'pc', SP: 'pa', EP: 'pe', GP: 'po', PP: 'pp' } as Record<string, string>
const ARMOR = { LIGHT: 'Légère', MEDIUM: 'Intermédiaire', HEAVY: 'Lourde', SHIELD: 'Bouclier' }
const kg = (lb: number) => `${String(Math.round(lb * 0.45 * 10) / 10).replace('.', ',')} kg`

const equipmentRows = computed(() => {
  const e = equipment.value!
  const rows: { label: string; value: string }[] = []
  const w = e.weapon
  if (w) {
    rows.push({ label: 'Type', value: `Arme ${w.category === 'SIMPLE' ? 'courante' : 'de guerre'} ${w.range === 'MELEE' ? 'de corps à corps' : 'à distance'}` })
    if (w.damage) rows.push({ label: 'Dégâts', value: `${w.damage}${w.damageType ? ` ${w.damageType.name.toLowerCase()}` : ''}` })
    if (w.versatileDamage) rows.push({ label: 'À deux mains', value: w.versatileDamage })
    if (w.normalRangeFt) rows.push({ label: 'Portée', value: `${feetToMeters(w.normalRangeFt)}${w.longRangeFt ? ` / ${feetToMeters(w.longRangeFt)}` : ''}` })
  }
  const a = e.armor
  if (a) {
    rows.push({ label: 'Armure', value: ARMOR[a.category] })
    rows.push({
      label: 'Classe d\'armure',
      value: a.category === 'SHIELD' ? `+${a.baseArmorClass}` : `${a.baseArmorClass}${a.addsDexModifier ? ` + DEX${a.maxDexModifier != null ? ` (max ${a.maxDexModifier})` : ''}` : ''}`,
    })
    if (a.strengthMinimum) rows.push({ label: 'Force requise', value: String(a.strengthMinimum) })
    if (a.stealthDisadvantage) rows.push({ label: 'Discrétion', value: 'Désavantage' })
  }
  if (e.cost) rows.push({ label: 'Prix', value: `${e.cost.amount} ${CURRENCY[e.cost.currency] ?? e.cost.currency}` })
  if (e.weightLb) rows.push({ label: 'Poids', value: kg(e.weightLb) })
  return rows
})

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

onMounted(async () => {
  window.addEventListener('keydown', onKey)
  closeButton.value?.focus()
  if (!props.item.equipment && !props.item.magicItem) return
  loading.value = true
  try {
    // Les deux pour un objet magique posé sur un objet de base
    const [base, magic] = await Promise.all([
      props.item.equipment ? loadEquipment(props.item.equipment) : null,
      props.item.magicItem ? loadMagicItem(props.item.magicItem) : null,
    ])
    equipment.value = base
    magicItem.value = magic
  } catch {
    error.value = 'Impossible de charger la fiche de cet objet.'
  } finally {
    loading.value = false
  }
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>
