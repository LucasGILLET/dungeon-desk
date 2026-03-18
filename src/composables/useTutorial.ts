import { ref, computed, onMounted } from 'vue'

export interface TutorialStep {
  title: string
  text: string
  targetElement?: string // Optional: could be used for auto-scrolling eventually
}

export const GLOBAL_DISABLE_KEY = 'dungeon-desk-tutorials-disabled'

export function disableTutorials() {
  localStorage.setItem(GLOBAL_DISABLE_KEY, 'true')
}

export function enableTutorials() {
  localStorage.setItem(GLOBAL_DISABLE_KEY, 'false')
}

export function isTutorialsDisabled() {
  return localStorage.getItem(GLOBAL_DISABLE_KEY) === 'true'
}

export function useTutorial(tutorialId: string, steps: TutorialStep[], options: { autoStart?: boolean } = { autoStart: true }) {
  const isVisible = ref(false)
  const currentStepIndex = ref(0)
  const hasFinished = ref(false)

  const currentStep = computed(() => steps[currentStepIndex.value] || { title: '', text: '' })
  const totalSteps = computed(() => steps.length)
  const isLastStep = computed(() => currentStepIndex.value === steps.length - 1)
  const isFirstStep = computed(() => currentStepIndex.value === 0)

  // Local storage key based on ID
  const storageKey = `dungeon-desk-tutorial-${tutorialId}`

  function start() {
    isVisible.value = true
    currentStepIndex.value = 0
  }

  function stop() {
    isVisible.value = false
  }

  function next() {
    if (currentStepIndex.value < steps.length - 1) {
      currentStepIndex.value++
    } else {
      finish()
    }
  }

  function prev() {
    if (currentStepIndex.value > 0) {
      currentStepIndex.value--
    }
  }

  function finish() {
    stop()
    hasFinished.value = true
    localStorage.setItem(storageKey, 'true')
  }

  function isStep(index: number) {
    return isVisible.value && currentStepIndex.value === index
  }

  // Auto-start check
  onMounted(() => {
    if (!options.autoStart) return
    const disabled = isTutorialsDisabled()
    const stored = localStorage.getItem(storageKey)
    if (!stored && !disabled) {
      start()
    }
  })

  return {
    isVisible,
    currentStepIndex,
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    start,
    stop,
    next,
    prev,
    isStep
  }
}
