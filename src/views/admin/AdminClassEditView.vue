<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, onBeforeRouteLeave } from 'vue-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import AdminShell from '@/components/admin/AdminShell.vue';
import LocalizedField from '@/components/admin/LocalizedField.vue';
import { adminApi, ApiError, canEditContent, ENTITY_FIELDS, FIELD_LABELS, type AdminClass, type AdminFeature, type ClassUpdate, type Texts } from '@/api/admin';

const route = useRoute();
const index = computed(() => String(route.params.index));
const queryClient = useQueryClient();

const { data: me } = useQuery({ queryKey: ['admin', 'me'], queryFn: adminApi.me, staleTime: 5 * 60_000 });
const { data: cls, isLoading, error } = useQuery({
  queryKey: computed(() => ['admin', 'class', index.value]),
  queryFn: () => adminApi.getClass(index.value),
});

// Formulaire : copie modifiable de la classe, avec une entrée par langue
type FormTexts = { en: Record<string, string | null>; fr: Record<string, string | null> };
interface Form {
  hitDie: number;
  subclassLevel: number;
  translations: FormTexts;
  features: (Omit<AdminFeature, 'translations'> & { translations: FormTexts })[];
}
const form = ref<Form | null>(null);
const original = ref('');

const withLocales = (t: Texts): FormTexts => ({ en: { ...(t.en ?? {}) }, fr: { ...(t.fr ?? {}) } });
function load(data: AdminClass) {
  form.value = {
    hitDie: data.hitDie,
    subclassLevel: data.subclassLevel,
    translations: withLocales(data.translations),
    features: data.features.map((f) => ({ ...f, translations: withLocales(f.translations) })),
  };
  original.value = JSON.stringify(form.value);
}
watch(cls, (data) => data && load(data), { immediate: true });

const dirty = computed(() => !!form.value && JSON.stringify(form.value) !== original.value);
const canEdit = computed(() => canEditContent(me.value?.role));

// --- Filtre des capacités ---
const search = ref('');
const onlyTodo = ref(false);
const subclassNames = computed(() => Object.fromEntries((cls.value?.subclasses ?? []).map((s) => [s.index, s.translations.fr?.name ?? s.translations.en?.name ?? s.index])));
const needsTranslation = (t: Texts) => !t.fr?.name?.trim() || !t.fr?.description?.trim() || t.fr.description === t.en?.description;
const visibleFeatures = computed(() =>
  (form.value?.features ?? []).filter((f) => {
    const q = search.value.trim().toLowerCase();
    const matches = !q || [f.index, f.translations.en?.name, f.translations.fr?.name].some((v) => v?.toLowerCase().includes(q));
    return matches && (!onlyTodo.value || needsTranslation(f.translations));
  }),
);

// --- Enregistrement : seules les parties modifiées sont envoyées ---
const errors = ref<string[]>([]);
const saved = ref(false);

function changedLocales(current: Texts, before: Texts | undefined, entity: 'class' | 'classFeature'): Texts | null {
  const out: Texts = {};
  for (const [locale, values] of Object.entries(current)) {
    if (JSON.stringify(values) === JSON.stringify(before?.[locale] ?? {})) continue;
    const missing = ENTITY_FIELDS[entity].filter((f) => f.required && !values[f.field]?.trim());
    if (missing.length) {
      errors.value.push(`${locale.toUpperCase()} : ${missing.map((f) => FIELD_LABELS[f.field] ?? f.field).join(', ')} obligatoire`);
      continue;
    }
    out[locale] = values;
  }
  return Object.keys(out).length ? out : null;
}

function buildUpdate(): ClassUpdate | null {
  errors.value = [];
  const before = JSON.parse(original.value) as Form;
  const current = form.value!;
  const update: ClassUpdate = {};
  if (canEdit.value && current.hitDie !== before.hitDie) update.hitDie = current.hitDie;
  if (canEdit.value && current.subclassLevel !== before.subclassLevel) update.subclassLevel = current.subclassLevel;
  const classTexts = changedLocales(current.translations, before.translations, 'class');
  if (classTexts) update.translations = classTexts;
  const features = current.features
    .map((f, i) => ({ id: f.id, translations: changedLocales(f.translations, before.features[i]?.translations, 'classFeature') }))
    .filter((f): f is { id: number; translations: Texts } => !!f.translations);
  if (features.length) update.features = features;
  return errors.value.length ? null : update;
}

const mutation = useMutation({
  mutationFn: (update: ClassUpdate) => adminApi.saveClass(index.value, update),
  onSuccess: (data) => {
    queryClient.setQueryData(['admin', 'class', index.value], data);
    queryClient.invalidateQueries({ queryKey: ['admin', 'classes'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'translations'] });
    load(data);
    saved.value = true;
    setTimeout(() => (saved.value = false), 3000);
  },
  onError: (err) => {
    const body = err instanceof ApiError ? (err.body as { message?: string }) : null;
    errors.value = [body?.message ?? "L'enregistrement a échoué"];
  },
});

function save() {
  const update = buildUpdate();
  if (update) mutation.mutate(update);
}

onBeforeRouteLeave(() => !dirty.value || window.confirm('Des modifications ne sont pas enregistrées. Quitter quand même ?'));

const inputClass = 'w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 focus:ring-2 focus:ring-violet-500 outline-none disabled:opacity-50';
</script>

<template>
  <AdminShell :title="cls ? (cls.translations.fr?.name ?? cls.translations.en?.name ?? cls.index) : 'Classe'" subtitle="Champs de la classe, traductions et capacités">
    <div v-if="isLoading" class="text-zinc-500">Chargement…</div>
    <div v-else-if="error" class="text-red-400">Classe introuvable.</div>
    <div v-else-if="form" class="space-y-8">
      <!-- Barre d'enregistrement -->
      <div class="sticky top-20 z-10 flex items-center justify-between gap-4 bg-zinc-900/95 backdrop-blur border border-zinc-800 rounded-xl px-4 py-3">
        <router-link to="/admin/classes" class="text-sm text-zinc-400 hover:text-zinc-200">← Toutes les classes</router-link>
        <div class="flex items-center gap-3">
          <span v-if="saved" class="text-sm text-emerald-400" data-test="saved">Enregistré</span>
          <span v-else-if="dirty" class="text-sm text-amber-300">Modifications non enregistrées</span>
          <button
            type="button"
            :disabled="!dirty || mutation.isPending.value"
            class="bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:hover:translate-y-0 text-white font-bold py-2 px-5 rounded-lg shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            data-test="save"
            @click="save"
          >
            {{ mutation.isPending.value ? 'Enregistrement…' : 'Enregistrer' }}
          </button>
        </div>
      </div>
      <ul v-if="errors.length" class="bg-red-950/40 border border-red-900/60 text-red-300 rounded-xl px-4 py-3 text-sm space-y-1" data-test="errors">
        <li v-for="e in errors" :key="e">{{ e }}</li>
      </ul>

      <!-- Général -->
      <section class="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
        <h2 class="text-lg font-serif text-zinc-100">Général</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label class="block">
            <span class="block text-xs font-medium text-zinc-400 mb-1">Identifiant</span>
            <input :value="cls!.index" readonly :class="inputClass" class="font-mono" />
          </label>
          <label class="block">
            <span class="block text-xs font-medium text-zinc-400 mb-1">Dé de vie</span>
            <select v-model.number="form.hitDie" :disabled="!canEdit" :class="inputClass" data-test="hitDie">
              <option v-for="d in [6, 8, 10, 12]" :key="d" :value="d">d{{ d }}</option>
            </select>
          </label>
          <label class="block">
            <span class="block text-xs font-medium text-zinc-400 mb-1">Niveau de choix de la sous-classe</span>
            <input v-model.number="form.subclassLevel" type="number" min="1" max="20" :disabled="!canEdit" :class="inputClass" />
          </label>
        </div>
        <p v-if="!canEdit" class="text-xs text-zinc-500">En tant que traducteur, vous ne pouvez modifier que les textes.</p>
        <LocalizedField v-model:en="form.translations.en.name" v-model:fr="form.translations.fr.name" label="Nom" required />
        <LocalizedField v-model:en="form.translations.en.subclassLabel" v-model:fr="form.translations.fr.subclassLabel" label="Nom générique des sous-classes" required />
        <LocalizedField v-model:en="form.translations.en.description" v-model:fr="form.translations.fr.description" label="Description" multiline />
      </section>

      <!-- Capacités -->
      <section class="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h2 class="text-lg font-serif text-zinc-100">Capacités <span class="text-sm text-zinc-500">({{ form.features.length }})</span></h2>
          <div class="flex items-center gap-3">
            <input v-model="search" placeholder="Rechercher une capacité…" :class="inputClass" class="md:w-64" />
            <label class="flex items-center gap-2 text-sm text-zinc-400 whitespace-nowrap">
              <input v-model="onlyTodo" type="checkbox" class="accent-violet-500" /> À traduire
            </label>
          </div>
        </div>
        <div v-for="feature in visibleFeatures" :key="feature.id" class="border border-zinc-800 rounded-lg p-4 space-y-3" data-test="feature">
          <div class="flex flex-wrap items-center gap-2 text-xs">
            <span class="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">Niveau {{ feature.level }}</span>
            <span v-if="feature.subclass" class="px-2 py-0.5 rounded-full bg-violet-900/30 border border-violet-800/50 text-violet-300">{{ subclassNames[feature.subclass] }}</span>
            <span class="font-mono text-zinc-500">{{ feature.index }}</span>
          </div>
          <LocalizedField v-model:en="feature.translations.en.name" v-model:fr="feature.translations.fr.name" label="Nom" required />
          <LocalizedField v-model:en="feature.translations.en.description" v-model:fr="feature.translations.fr.description" label="Description" multiline required />
        </div>
        <p v-if="!visibleFeatures.length" class="text-sm text-zinc-500">Aucune capacité ne correspond.</p>
      </section>
    </div>
  </AdminShell>
</template>
