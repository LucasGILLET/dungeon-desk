<template><template v-for="(s, i) in segments" :key="i"><KeywordTooltip v-if="s.entry" :entry="s.entry">{{ s.text }}</KeywordTooltip><template v-else>{{ s.text }}</template></template></template>

<script setup lang="ts">
// Texte en ligne dont les mots-clés des règles ouvrent une infobulle
import { computed } from 'vue'
import KeywordTooltip from '@/components/KeywordTooltip.vue'
import { useGlossary } from '@/composables/useGlossary'

const props = defineProps<{ text: string }>()
const { split } = useGlossary()
const segments = computed(() => split(props.text))
</script>
