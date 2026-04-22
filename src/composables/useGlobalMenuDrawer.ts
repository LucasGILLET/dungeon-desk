import { computed, ref } from 'vue'

const isOpen = ref(false)

function openGlobalMenuDrawer() {
  isOpen.value = true
}

function closeGlobalMenuDrawer() {
  isOpen.value = false
}

function toggleGlobalMenuDrawer() {
  isOpen.value = !isOpen.value
}

function useGlobalMenuDrawer() {
  return {
    isOpen: computed(() => isOpen.value),
    openGlobalMenuDrawer,
    closeGlobalMenuDrawer,
    toggleGlobalMenuDrawer,
  }
}

export {
  useGlobalMenuDrawer,
  openGlobalMenuDrawer,
  closeGlobalMenuDrawer,
  toggleGlobalMenuDrawer,
}