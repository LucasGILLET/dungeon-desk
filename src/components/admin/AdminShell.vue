<script setup lang="ts">
import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { adminApi, canOpenBackOffice } from '@/api/admin';

defineProps<{ title: string; subtitle?: string }>();

const ROLE_LABELS: Record<string, string> = { TRANSLATOR: 'Traducteur', EDITOR: 'Éditeur', ADMIN: 'Administrateur' };

const { data: me, isLoading, isError } = useQuery({ queryKey: ['admin', 'me'], queryFn: adminApi.me, staleTime: 5 * 60_000 });
const allowed = computed(() => canOpenBackOffice(me.value?.role));

const tabs = [
  { to: '/admin/classes', label: 'Classes' },
  { to: '/admin/traductions', label: 'Traductions à faire' },
];
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-zinc-950 text-zinc-200 font-sans pt-20 pb-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <header class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6 mb-8">
        <div>
          <p class="text-xs font-bold uppercase tracking-wider text-violet-400 mb-2">Back-office · Données de jeu</p>
          <h1 class="text-3xl font-bold bg-linear-to-r from-violet-200 via-violet-400 to-violet-200 bg-clip-text text-transparent font-serif">
            {{ title }}
          </h1>
          <p v-if="subtitle" class="text-zinc-400 mt-1">{{ subtitle }}</p>
        </div>
        <div class="flex items-center gap-3">
          <nav class="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            <router-link
              v-for="tab in tabs"
              :key="tab.to"
              :to="tab.to"
              class="px-3 py-1.5 rounded-md text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
              active-class="bg-violet-900/40 text-violet-200"
            >
              {{ tab.label }}
            </router-link>
          </nav>
          <span v-if="me && allowed" class="text-xs px-2 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">
            {{ ROLE_LABELS[me.role] }}
          </span>
        </div>
      </header>

      <div v-if="isLoading" class="text-zinc-500">Chargement…</div>
      <div v-else-if="isError || !allowed" class="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
        <h2 class="text-xl font-serif text-zinc-100 mb-2">Accès réservé</h2>
        <p class="text-zinc-400">Le back-office est réservé aux traducteurs, éditeurs et administrateurs.</p>
      </div>
      <slot v-else :role="me!.role" />
    </div>
  </div>
</template>
