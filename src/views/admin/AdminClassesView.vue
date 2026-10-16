<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import AdminShell from '@/components/admin/AdminShell.vue';
import { adminApi } from '@/api/admin';

const { data: classes, isLoading } = useQuery({ queryKey: ['admin', 'classes'], queryFn: adminApi.classes });
</script>

<template>
  <AdminShell title="Classes" subtitle="Édition des classes de l'édition 2014 et de leurs traductions">
    <div v-if="isLoading" class="text-zinc-500">Chargement…</div>
    <div v-else class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-zinc-900/80 text-zinc-400 text-left">
          <tr class="border-b border-zinc-800">
            <th class="px-4 py-3 font-medium">Classe</th>
            <th class="px-4 py-3 font-medium">Dé de vie</th>
            <th class="px-4 py-3 font-medium">Sous-classe au niveau</th>
            <th class="px-4 py-3 font-medium">Traductions</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cls in classes" :key="cls.index" class="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-800/30">
            <td class="px-4 py-3">
              <div class="text-zinc-100 font-medium">{{ cls.names.fr ?? cls.names.en }}</div>
              <div class="text-xs text-zinc-500">{{ cls.names.en }} · <span class="font-mono">{{ cls.index }}</span></div>
            </td>
            <td class="px-4 py-3 text-zinc-300">d{{ cls.hitDie }}</td>
            <td class="px-4 py-3 text-zinc-300">{{ cls.subclassLevel }}</td>
            <td class="px-4 py-3">
              <span v-if="cls.translationsTodo" class="px-2 py-0.5 rounded-full text-xs bg-amber-900/40 text-amber-300 border border-amber-800/50">
                {{ cls.translationsTodo }} à traduire
              </span>
              <span v-else class="px-2 py-0.5 rounded-full text-xs bg-emerald-900/30 text-emerald-300 border border-emerald-800/50">complètes</span>
            </td>
            <td class="px-4 py-3 text-right">
              <router-link :to="`/admin/classes/${cls.index}`" class="text-violet-300 hover:text-violet-200 font-medium">Modifier →</router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </AdminShell>
</template>
