<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import ActionCard from '@/components/combat/ActionCard.vue';
import CombatSectionDetail from '@/components/combat/CombatSectionDetail.vue';
import { loadGuide, type ApiGuidePage, type ApiGuideSection } from '@/utils/dataLoader';
import { accentClasses } from '@/utils/guideAccent';

// Contenu : guide "combat-cheat-sheet" de l'API. Chaque tuile est une section
// (action, movement, bonus, other, reaction) ; la mise en page reste ici.
type Category = 'action' | 'movement' | 'bonus' | 'other' | 'reaction';

const guide = ref<ApiGuidePage | null>(null);
const error = ref<string | null>(null);
// Section ouverte, et section de détail ouverte depuis une de ses cartes
const selectedCategory = ref<Category | null>(null);
const selectedDetail = ref<string | null>(null);

const section = (index: string | null) => guide.value?.sections.find((s) => s.index === index) ?? null;
const tile = (category: Category) => ({ title: section(category)?.title ?? '', icon: section(category)?.icon ?? '' });
const opened = computed<ApiGuideSection | null>(() => section(selectedDetail.value) ?? section(selectedCategory.value));
const openedColor = computed(() => accentClasses(opened.value?.accent).text);

const openCategory = (category: Category) => {
  selectedCategory.value = category;
  selectedDetail.value = null;
};
const back = () => {
  if (selectedDetail.value) selectedDetail.value = null;
  else selectedCategory.value = null;
};

onMounted(async () => {
  try {
    guide.value = await loadGuide('combat-cheat-sheet');
  } catch {
    error.value = "Impossible de charger l'aide-mémoire.";
  }
});
</script>

<template>
  <div class="min-h-[calc(100dvh-5rem)] bg-zinc-950 text-zinc-200 font-sans selection:bg-yellow-500/30 overflow-hidden flex flex-col">

    <!-- En-tête Global -->
    <header class="shrink-0 p-4 text-center pt-6 md:py-10">
      <h1 class="text-3xl md:text-5xl font-serif text-yellow-500 font-bold mb-1 drop-shadow-md">{{ guide?.heading ?? 'Combat' }}</h1>
      <p class="text-zinc-400 font-light text-xs md:text-base uppercase tracking-widest">{{ guide?.eyebrow ?? 'Aide-mémoire' }}</p>
    </header>

    <p v-if="error" class="text-center text-red-300">{{ error }}</p>

    <!-- GRILLE PRINCIPALE -->
    <main v-else-if="guide" class="flex-1 w-full mx-auto p-3 flex flex-col gap-4 min-h-0 pb-6 max-w-md md:max-w-5xl md:grid md:grid-cols-2 md:grid-rows-[auto_3fr_1fr] md:gap-x-6 md:gap-y-2 md:p-6 md:pb-8 md:items-stretch">

      <!-- HEADER LIGNE 1 : PENDANT TON TOUR -->
      <div class="shrink-0 flex items-center gap-2 px-1 md:col-span-2">
         <span class="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Pendant ton tour</span>
         <div class="h-px bg-zinc-800 flex-1"></div>
      </div>

      <!-- Ligne 1 : ACTION PRINCIPALE -->
      <section class="flex flex-col flex-[0.9] min-h-0 md:h-full">
        <ActionCard v-bind="tile('action')" category="action" class="flex-1 w-full !min-h-0 !p-3" @click="openCategory('action')" />
      </section>

      <!-- Ligne 2 : GRILLE SECONDAIRE -->
      <section class="flex flex-col flex-[1.4] min-h-0 md:h-full">
        <div class="grid grid-cols-2 gap-3 h-full md:grid-cols-1 md:grid-rows-2 md:gap-3">
          <ActionCard v-bind="tile('movement')" category="movement" class="h-full w-full !min-h-0 !p-3" @click="openCategory('movement')" />

          <!-- Colonne avec Bonus et Autre empilés -->
          <div class="flex flex-col gap-3 h-full md:flex-row md:gap-3">
            <ActionCard v-bind="tile('bonus')" category="bonus" class="flex-1 !min-h-0 !p-3" @click="openCategory('bonus')" />
            <ActionCard v-bind="tile('other')" category="other" class="flex-1 !min-h-0 !p-3" @click="openCategory('other')" />
          </div>
        </div>
      </section>

      <!-- Ligne 3: HORS TOUR -->
      <section class="flex flex-col flex-1 min-h-0 opacity-80 hover:opacity-100 transition-opacity md:col-span-2 md:h-full">
        <div class="shrink-0 flex items-center gap-2 mb-1 px-1 pt-6 md:pt-0">
          <span class="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">Hors de ton tour</span>
          <div class="h-px bg-zinc-800 flex-1"></div>
        </div>
        <ActionCard v-bind="tile('reaction')" category="reaction" class="flex-1 w-full !min-h-0 !p-3" @click="openCategory('reaction')" />
      </section>

    </main>

    <!-- MODAL DE DETAILS (PLEIN ECRAN) -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-full opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-full opacity-0"
    >
      <div v-if="opened" class="fixed inset-0 z-[100] bg-zinc-900 overflow-y-auto flex flex-col">
        <div class="sticky top-0 z-[100] bg-zinc-900/95 backdrop-blur-md p-4 flex justify-between items-center border-b border-zinc-800">
          <button @click="back" class="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors flex-shrink-0">
            <span class="text-xl">←</span>
            <span class="font-bold text-sm uppercase tracking-wider">Retour</span>
          </button>
          <h2 class="font-serif font-bold text-lg" :class="openedColor">{{ opened.subtitle ?? opened.title }}</h2>
          <div class="w-8"></div> <!-- Spacer pour centrer -->
        </div>

        <div class="p-5 pb-20 max-w-lg mx-auto w-full space-y-6">
          <Transition
            mode="out-in"
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="translate-y-8 opacity-0"
            enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="translate-y-0 opacity-100"
            leave-to-class="-translate-y-8 opacity-0"
          >
            <div :key="opened.index">
              <h3 v-if="selectedDetail && opened.title" class="mb-4 text-center font-serif text-xl font-bold text-zinc-100">{{ opened.title }}</h3>
              <CombatSectionDetail :section="opened" @open="selectedDetail = $event" />
            </div>
          </Transition>
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
/* Transition pour masquer le scroll du body quand la modale est ouverte */
.overflow-hidden {
  overflow: hidden;
}
</style>
