import { ref } from 'vue'

// Fenêtre de recherche globale : loupe de la navigation, Ctrl+K
const isOpen = ref(false)

export const openGlobalSearch = () => (isOpen.value = true)
export const closeGlobalSearch = () => (isOpen.value = false)
export const useGlobalSearch = () => ({ isOpen })
