<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  icon: string;
  category: 'initiative' | 'action' | 'bonus' | 'movement' | 'reaction' | 'other';
}>();

const colorClasses = computed(() => {
  const base = "border-l-4 transition-all duration-200 active:scale-95 hover:brightness-110 shadow-lg border border-y-zinc-800 border-r-zinc-800";
  
  switch (props.category) {
    case 'initiative': return `${base} bg-zinc-900 border-l-yellow-600 text-yellow-500`;
    case 'action': return `${base} bg-zinc-900 border-l-emerald-600 text-emerald-500`;
    case 'bonus': return `${base} bg-zinc-900 border-l-amber-600 text-amber-500`;
    case 'movement': return `${base} bg-zinc-900 border-l-sky-600 text-sky-500`;
    case 'reaction': return `${base} bg-zinc-900 border-l-violet-600 text-violet-500`;
    case 'other': return `${base} bg-zinc-900 border-l-zinc-500 text-zinc-400`;
    default: return `${base} bg-zinc-900 border-l-zinc-600 text-zinc-400`;
  }
});
</script>

<template>
  <button 
    class="flex flex-col p-4 rounded-xl min-h-[100px] text-left relative overflow-hidden group"
    :class="colorClasses"
  >
    <div class="z-10 bg-zinc-950/50 rounded-lg p-2 w-fit mb-3 backdrop-blur-sm border border-white/5">
      <span class="text-2xl">{{ icon }}</span>
    </div>
    
    <span class="z-10 font-serif font-bold text-sm md:text-base uppercase tracking-wider leading-tight">
      {{ title }}
    </span>
    
    <!-- Décoration de fond -->
    <div class="absolute right-[-10px] bottom-[-20px] text-zinc-800/20 text-8xl rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-500">
      {{ icon }}
    </div>
  </button>
</template>
