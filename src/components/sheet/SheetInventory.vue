<template>
  <section class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
      <h2 class="text-sm font-bold uppercase tracking-widest text-amber-500 font-serif">Inventaire</h2>
      <!-- Argent -->
      <div class="flex flex-wrap gap-2">
        <label v-for="c in CURRENCIES" :key="c.code" class="flex items-center gap-1 text-xs text-zinc-400">
          <input
            type="number" min="0" class="input w-20 text-right"
            :value="input.currencies?.[c.code] ?? 0"
            @change="(e) => emit('update', setCurrency(input, c.code, Number((e.target as HTMLInputElement).value)))"
          />
          {{ c.label }}
        </label>
      </div>
    </div>

    <!-- Ajout -->
    <form class="flex flex-col sm:flex-row gap-2 mb-4" @submit.prevent="add">
      <input
        v-model="query" list="equipment-catalog" class="input flex-1"
        placeholder="Ajouter un objet, un objet magique ou un objet libre (butin…)"
        aria-label="Objet à ajouter"
      />
      <datalist id="equipment-catalog">
        <option v-for="e in catalog" :key="e.index" :value="e.name"></option>
        <option v-for="m in magicCatalog" :key="`magic-${m.index}`" :value="m.name">Objet magique · {{ RARITY_LABELS[m.rarity] }}</option>
      </datalist>
      <input v-model.number="quantity" type="number" min="1" class="input w-20" aria-label="Quantité" />
      <button type="submit" class="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold disabled:opacity-40" :disabled="!query.trim()">
        Ajouter
      </button>
    </form>

    <p v-if="!(input.items ?? []).length" class="text-sm text-zinc-500">Inventaire vide.</p>
    <table v-else class="w-full text-sm">
      <thead>
        <tr class="text-[10px] uppercase tracking-widest text-zinc-500 text-left">
          <th class="py-2 font-bold">Objet</th>
          <th class="py-2 font-bold text-center w-32">Quantité</th>
          <th class="py-2 font-bold text-center w-20">Équipé</th>
          <th class="py-2 font-bold text-center w-24" :title="`${attunedCount} / 3`">Harmonisé</th>
          <th class="w-10"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, i) in input.items" :key="i" class="border-t border-zinc-800/70">
          <td class="py-2">
            <button type="button" class="text-left text-zinc-200 hover:text-amber-300 hover:underline" :title="`Voir la fiche de ${itemName(item)}`" @click="open = item">{{ itemName(item) }}</button>
            <span v-if="details(item)" class="ml-2 text-xs text-zinc-500">{{ details(item) }}</span>
            <span v-if="item.magicItem" :class="['ml-2 rounded-full border px-2 text-[10px] uppercase', RARITY_CLASSES[magicByIndex.get(item.magicItem)?.rarity ?? 'VARIES']]">magique</span>
            <span v-else-if="!item.equipment" class="ml-2 text-[10px] uppercase text-zinc-600">libre</span>
          </td>
          <td class="py-2">
            <div class="flex items-center justify-center gap-2">
              <button class="qty" @click="emit('update', updateItem(input, i, { quantity: (item.quantity ?? 1) - 1 }))" aria-label="Retirer un">−</button>
              <span class="w-6 text-center">{{ item.quantity ?? 1 }}</span>
              <button class="qty" @click="emit('update', updateItem(input, i, { quantity: (item.quantity ?? 1) + 1 }))" aria-label="Ajouter un">+</button>
            </div>
          </td>
          <td class="py-2 text-center">
            <input type="checkbox" class="accent-amber-500" :checked="!!item.equipped" @change="emit('update', updateItem(input, i, { equipped: !item.equipped }))" />
          </td>
          <td class="py-2 text-center">
            <input
              type="checkbox" class="accent-violet-500" :checked="!!item.attuned"
              :disabled="!item.attuned && attunedCount >= 3"
              @change="emit('update', updateItem(input, i, { attuned: !item.attuned }))"
            />
          </td>
          <td class="py-2 text-right">
            <button class="text-zinc-600 hover:text-red-400" title="Retirer de l'inventaire" @click="emit('update', removeItem(input, i))">✕</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p class="mt-3 text-xs text-zinc-500">Poids porté : {{ totalWeight }} kg</p>
    <ItemDetailModal v-if="open" :item="open" :name="itemName(open)" @close="open = null" />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ItemDetailModal from '@/components/sheet/ItemDetailModal.vue'
import { loadEquipmentCatalog, loadMagicItems, type ApiEquipment, type ApiMagicItemSummary } from '@/utils/dataLoader'
import { RARITY_CLASSES, RARITY_LABELS } from '@/utils/monsterFormat'
import { addItem, removeItem, setCurrency, updateItem, type Input } from '@/utils/sheetActions'

const props = defineProps<{ input: Input }>()
const emit = defineEmits<{ update: [input: Input] }>()

const CURRENCIES = [
  { code: 'PP', label: 'pp' }, { code: 'GP', label: 'po' }, { code: 'EP', label: 'pe' }, { code: 'SP', label: 'pa' }, { code: 'CP', label: 'pc' },
] as const

const catalog = ref<ApiEquipment[]>([])
const magicCatalog = ref<ApiMagicItemSummary[]>([])
const query = ref('')
const quantity = ref(1)
onMounted(async () => {
  ;[catalog.value, magicCatalog.value] = await Promise.all([loadEquipmentCatalog(), loadMagicItems()])
})

type Item = NonNullable<Input['items']>[number]
const open = ref<Item | null>(null)
const byIndex = computed(() => new Map(catalog.value.map((e) => [e.index, e])))
const magicByIndex = computed(() => new Map(magicCatalog.value.map((m) => [m.index, m])))
const itemName = (item: Item) =>
  item.name || byIndex.value.get(item.equipment ?? '')?.name || magicByIndex.value.get(item.magicItem ?? '')?.name || item.equipment || item.magicItem || '?'
const details = (item: Item) => {
  const m = magicByIndex.value.get(item.magicItem ?? '')
  if (m) return [RARITY_LABELS[m.rarity], m.requiresAttunement ? 'lien' : null].filter(Boolean).join(' · ')
  const e = byIndex.value.get(item.equipment ?? '')
  if (!e) return ''
  return [e.damage, e.armorClass != null ? `CA ${e.armorClass}` : null].filter(Boolean).join(' · ')
}
const attunedCount = computed(() => (props.input.items ?? []).filter((i) => i.attuned).length)
// 1 livre = 0,45 kg
const totalWeight = computed(() => {
  const lb = (props.input.items ?? []).reduce((sum, i) => sum + (byIndex.value.get(i.equipment ?? '')?.weightLb ?? 0) * (i.quantity ?? 1), 0)
  return (Math.round(lb * 0.45 * 10) / 10).toString().replace('.', ',')
})

// Nom du catalogue → objet du catalogue, puis objet magique ; sinon objet libre
function add() {
  const name = query.value.trim()
  if (!name) return
  const same = (n: string) => n.toLowerCase() === name.toLowerCase()
  const match = catalog.value.find((e) => same(e.name))
  const magic = match ? undefined : magicCatalog.value.find((m) => same(m.name))
  const count = quantity.value || 1
  emit('update', addItem(props.input, match ? { equipment: match.index, quantity: count } : magic ? { magicItem: magic.index, quantity: count } : { name, quantity: count }))
  query.value = ''
  quantity.value = 1
}
</script>

<style scoped>
@reference "../../index.css";
.input { @apply rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1 text-zinc-100 outline-none focus:border-amber-500; }
.qty { @apply w-6 h-6 rounded border border-zinc-700 text-zinc-300 hover:bg-zinc-800; }
</style>
