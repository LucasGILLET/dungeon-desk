<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import AdminShell from '@/components/admin/AdminShell.vue';
import LocalizedField from '@/components/admin/LocalizedField.vue';
import { adminApi, ApiError, ENTITY_FIELDS, FIELD_LABELS, type TodoItem } from '@/api/admin';

const LOCALE = 'fr';
const queryClient = useQueryClient();
const { data, isLoading } = useQuery({ queryKey: ['admin', 'translations', LOCALE], queryFn: () => adminApi.translationsTodo(LOCALE) });

// Brouillons : une copie modifiable par texte, préremplie avec la traduction existante
const key = (item: TodoItem) => `${item.entity}:${item.id}`;
const drafts = reactive<Record<string, Record<string, string | null>>>({});
function draft(item: TodoItem): Record<string, string | null> {
  return (drafts[key(item)] ??= Object.fromEntries(ENTITY_FIELDS[item.entity].map(({ field }) => [field, item.translation?.[field] ?? null])));
}
watch(data, (list) => list?.items.forEach(draft), { immediate: true });

const classFilter = ref('');
const statusFilter = ref<'' | 'missing' | 'identical'>('');
const classes = computed(() => [...new Set((data.value?.items ?? []).map((i) => i.classIndex))].sort());
const items = computed(() =>
  (data.value?.items ?? []).filter((i) => (!classFilter.value || i.classIndex === classFilter.value) && (!statusFilter.value || i.status === statusFilter.value)),
);

const errors = reactive<Record<string, string>>({});
const mutation = useMutation({
  mutationFn: (item: TodoItem) => adminApi.saveTranslation(item.entity, item.id, LOCALE, draft(item)),
  onSuccess: (_result, item) => {
    delete errors[key(item)];
    // Le texte traduit disparaît de la liste
    queryClient.setQueryData(['admin', 'translations', LOCALE], (old: typeof data.value) =>
      old && { ...old, todo: old.todo - 1, items: old.items.filter((i) => key(i) !== key(item)) },
    );
    queryClient.invalidateQueries({ queryKey: ['admin', 'classes'] });
  },
  onError: (err, item) => {
    errors[key(item)] = err instanceof ApiError && err.status === 400 ? 'Des champs obligatoires sont vides.' : "L'enregistrement a échoué.";
  },
});

function save(item: TodoItem) {
  const missing = ENTITY_FIELDS[item.entity].filter((f) => f.required && !draft(item)[f.field]?.trim());
  if (missing.length) {
    errors[key(item)] = `${missing.map((f) => FIELD_LABELS[f.field] ?? f.field).join(', ')} : obligatoire`;
    return;
  }
  mutation.mutate(item);
}

const title = (item: TodoItem) => item.reference.name ?? item.reference.title ?? item.reference.label ?? item.reference.description?.slice(0, 60);
const selectClass = 'bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 focus:ring-2 focus:ring-violet-500 outline-none';
</script>

<template>
  <AdminShell title="Traductions à faire" subtitle="Textes du domaine des classes absents en français ou recopiés de l'anglais">
    <div v-if="isLoading" class="text-zinc-500">Chargement…</div>
    <div v-else-if="data" class="space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="text-sm text-zinc-400">
          <span class="text-2xl font-bold text-zinc-100" data-test="todo-count">{{ data.todo }}</span> textes à traduire sur {{ data.total }}
        </div>
        <div class="flex gap-3">
          <select v-model="classFilter" :class="selectClass" data-test="class-filter">
            <option value="">Toutes les classes</option>
            <option v-for="c in classes" :key="c" :value="c">{{ c }}</option>
          </select>
          <select v-model="statusFilter" :class="selectClass">
            <option value="">Tous les cas</option>
            <option value="missing">Absents en français</option>
            <option value="identical">Recopiés de l'anglais</option>
          </select>
        </div>
      </div>

      <p v-if="!items.length" class="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-emerald-300">Tout est traduit.</p>

      <article v-for="item in items" :key="key(item)" class="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4" data-test="todo-item">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex flex-wrap items-center gap-2 text-xs">
            <span class="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono">{{ item.classIndex }}</span>
            <span class="text-zinc-400">{{ item.context }}</span>
            <span class="text-zinc-200 font-medium">{{ title(item) }}</span>
          </div>
          <span class="text-xs px-2 py-0.5 rounded bg-amber-900/40 text-amber-300 border border-amber-800/50">
            {{ item.status === 'missing' ? 'absent en français' : "recopié de l'anglais" }}
          </span>
        </div>
        <LocalizedField
          v-for="{ field, multiline, required } in ENTITY_FIELDS[item.entity]"
          :key="field"
          :en="item.reference[field]"
          v-model:fr="draft(item)[field]"
          :label="FIELD_LABELS[field] ?? field"
          :multiline="multiline"
          :required="required"
          readonly-reference
        />
        <div class="flex items-center justify-end gap-3">
          <span v-if="errors[key(item)]" class="text-sm text-red-400">{{ errors[key(item)] }}</span>
          <button
            type="button"
            class="bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold py-1.5 px-4 rounded-lg transition-colors"
            data-test="save-translation"
            @click="save(item)"
          >
            Enregistrer
          </button>
        </div>
      </article>
    </div>
  </AdminShell>
</template>
