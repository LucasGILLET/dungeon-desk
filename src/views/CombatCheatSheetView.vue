<script setup lang="ts">
import { ref } from 'vue';
import ActionCard from '@/components/combat/ActionCard.vue';
import ActionDetail from '@/components/combat/details/ActionDetail.vue';
import MovementDetail from '@/components/combat/details/MovementDetail.vue';
import BonusDetail from '@/components/combat/details/BonusDetail.vue';
import OtherDetail from '@/components/combat/details/OtherDetail.vue';
import ReactionDetail from '@/components/combat/details/ReactionDetail.vue';

// Types et State
type Category = 'action' | 'movement' | 'bonus' | 'other' | 'reaction' | null;
const selectedCategory = ref<Category>(null);
const selectedSubCategory = ref<'attack' | null>(null);

// Fonctions
const openCategory = (cat: Category) => {
  selectedCategory.value = cat;
  selectedSubCategory.value = null; // Reset sub-category on open
};

const openSubCategory = (sub: 'attack') => {
  selectedSubCategory.value = sub;
};
</script>

<template>
  <div class="h-[100dvh] bg-zinc-950 text-zinc-200 font-sans selection:bg-yellow-500/30 overflow-hidden flex flex-col">
    
    <!-- En-tête Global -->
    <header class="shrink-0 p-4 text-center pt-6 md:py-10">
      <h1 class="text-3xl md:text-5xl font-serif text-yellow-500 font-bold mb-1 drop-shadow-md">Combat</h1>
      <p class="text-zinc-400 font-light text-xs md:text-base uppercase tracking-widest">Aide-mémoire</p>
    </header>

    <!-- GRILLE PRINCIPALE -->
    <main class="flex-1 w-full mx-auto p-3 flex flex-col gap-4 min-h-0 pb-6 max-w-md md:max-w-5xl md:grid md:grid-cols-2 md:grid-rows-[auto_3fr_1fr] md:gap-x-6 md:gap-y-2 md:p-6 md:pb-8 md:items-stretch">
      
      <!-- HEADER LIGNE 1 : PENDANT TON TOUR -->
      <div class="shrink-0 flex items-center gap-2 px-1 md:col-span-2">
         <span class="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Pendant ton tour</span>
         <div class="h-px bg-zinc-800 flex-1"></div>
      </div>

      <!-- Ligne 1 : ACTION PRINCIPALE -->
      <section class="flex flex-col flex-[0.9] min-h-0 md:h-full">
        <ActionCard 
          title="Action" 
          icon="⚔️" 
          category="action"
          class="flex-1 w-full !min-h-0 !p-3"
          @click="openCategory('action')"
        />
      </section>

      <!-- Ligne 2 : GRILLE SECONDAIRE -->
      <section class="flex flex-col flex-[1.4] min-h-0 md:h-full">
        <div class="grid grid-cols-2 gap-3 h-full md:grid-cols-1 md:grid-rows-2 md:gap-3">
          <!-- Mouvement -->
          <ActionCard 
            title="Mouv." 
            icon="🦶" 
            category="movement"
            class="h-full w-full !min-h-0 !p-3"
            @click="openCategory('movement')"
          />
          
          <!-- Colonne avec Bonus et Autre empilés -->
          <div class="flex flex-col gap-3 h-full md:flex-row md:gap-3">
            <ActionCard 
              title="Bonus" 
              icon="⚡" 
              category="bonus"
              class="flex-1 !min-h-0 !p-3"
              @click="openCategory('bonus')"
            />
            <ActionCard 
              title="Autre" 
              icon="💬" 
              category="other"
              class="flex-1 !min-h-0 !p-3"
              @click="openCategory('other')"
            />
          </div>
        </div>
      </section>

      <!-- Ligne 3: HORS TOUR -->
      <section class="flex flex-col flex-1 min-h-0 opacity-80 hover:opacity-100 transition-opacity md:col-span-2 md:h-full">
        <div class="shrink-0 flex items-center gap-2 mb-1 px-1 pt-6 md:pt-0">
          <span class="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">Hors de ton tour</span>
          <div class="h-px bg-zinc-800 flex-1"></div>
        </div>
        <ActionCard 
          title="Réaction" 
          icon="💥" 
          category="reaction"
          class="flex-1 w-full !min-h-0 !p-3"
          @click="openCategory('reaction')"
        />
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
      <div 
        v-if="selectedCategory" 
        class="fixed inset-0 z-50 bg-zinc-900 overflow-y-auto flex flex-col"
      >
        <!-- Bouton Fermer -->
        <div class="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur-md p-4 flex justify-between items-center border-b border-zinc-800">
          <button 
            @click="selectedSubCategory ? (selectedSubCategory = null) : (selectedCategory = null)"
            class="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <span class="text-xl">←</span>
            <span class="font-bold text-sm uppercase tracking-wider">
              Retour
            </span>
          </button>
          
          <h2 class="font-serif font-bold text-lg" :class="{
             'text-emerald-500': selectedCategory === 'action',
             'text-sky-500': selectedCategory === 'movement',
             'text-amber-500': selectedCategory === 'bonus',
             'text-zinc-400': selectedCategory === 'other',
             'text-violet-500': selectedCategory === 'reaction',
          }">
            {{ 
              selectedSubCategory === 'attack' ? 'Détail Attaque' :
              selectedCategory === 'action' ? 'Action Principale' :
              selectedCategory === 'movement' ? 'Déplacement' :
              selectedCategory === 'bonus' ? 'Action Bonus' :
              selectedCategory === 'other' ? 'Interaction' :
              'Réaction'
            }}
          </h2>
          
          <div class="w-8"></div> <!-- Spacer pour centrer -->
        </div>

        <!-- CONTENU DU DETAIL -->
        <div class="p-5 pb-20 max-w-lg mx-auto w-full space-y-6">

          <!-- DETAIL: ACTION -->
          <ActionDetail 
            v-if="selectedCategory === 'action'" 
            :sub-category="selectedSubCategory"
            @open-sub-category="openSubCategory"
          />

          <!-- DETAIL: MOUVEMENT -->
          <MovementDetail v-if="selectedCategory === 'movement'" />

          <!-- DETAIL: BONUS -->
          <BonusDetail v-if="selectedCategory === 'bonus'" />

          <!-- DETAIL: AUTRE -->
          <OtherDetail v-if="selectedCategory === 'other'" />

           <!-- DETAIL: REACTION -->
          <ReactionDetail v-if="selectedCategory === 'reaction'" />

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
