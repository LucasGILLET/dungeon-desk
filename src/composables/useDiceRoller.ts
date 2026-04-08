import { computed, ref } from 'vue'

export interface DiceRollBreakdown {
  sign: 1 | -1
  count: number
  sides: number
  rolls: number[]
  subtotal: number
}

export interface ParsedDiceExpression {
  originalExpression: string
  normalizedExpression: string
  totalModifier: number
  parts: DiceRollBreakdown[]
}

export interface DiceRollResult extends ParsedDiceExpression {
  total: number
  createdAt: number
  id: string
}

const isOpen = ref(false)
const expression = ref('d20')
const selectedPreset = ref<number | null>(20)
const history = ref<DiceRollResult[]>([])
const lastResult = ref<DiceRollResult | null>(null)
const errorMessage = ref<string | null>(null)

const historyLimit = 8

function randomDie(sides: number, randomFn: () => number = Math.random) {
  return Math.floor(randomFn() * sides) + 1
}

function normalizeExpression(rawExpression: string) {
  return rawExpression.trim().toLowerCase().replace(/\s+/g, '')
}

function buildNormalizedExpression(parts: DiceRollBreakdown[], totalModifier: number) {
  const tokens: string[] = []

  parts.forEach((part) => {
    const prefix = part.sign === -1 ? '-' : tokens.length > 0 ? '+' : ''
    const countPart = part.count === 1 ? '' : String(part.count)
    tokens.push(`${prefix}${countPart}d${part.sides}`)
  })

  if (totalModifier !== 0 || tokens.length === 0) {
    const prefix = totalModifier < 0 ? '-' : tokens.length > 0 ? '+' : ''
    tokens.push(`${prefix}${Math.abs(totalModifier)}`)
  }

  return tokens.join('')
}

export function parseDiceExpression(rawExpression: string): ParsedDiceExpression {
  const originalExpression = rawExpression.trim()

  if (!originalExpression) {
    throw new Error('Entre une formule de dé.')
  }

  const normalized = normalizeExpression(originalExpression)
  const tokenMatches = normalized.match(/[+-]?(?:\d*d\d+|\d+)/g)

  if (!tokenMatches || tokenMatches.join('') !== normalized) {
    throw new Error('Formule invalide. Utilise par exemple 2d6+3.')
  }

  const parts: DiceRollBreakdown[] = []
  let totalModifier = 0

  for (const token of tokenMatches) {
    const sign: 1 | -1 = token.startsWith('-') ? -1 : 1
    const bareToken = token.replace(/^[+-]/, '')

    if (bareToken.includes('d')) {
      const [countPart, sidesPart] = bareToken.split('d')
      const count = countPart ? Number(countPart) : 1
      const sides = Number(sidesPart)

      if (!Number.isInteger(count) || count <= 0 || !Number.isInteger(sides) || sides <= 0) {
        throw new Error('Formule invalide. Vérifie le nombre de dés et le nombre de faces.')
      }

      parts.push({
        sign,
        count,
        sides,
        rolls: [],
        subtotal: 0,
      })
      continue
    }

    const modifier = Number(bareToken)
    if (!Number.isInteger(modifier)) {
      throw new Error('Formule invalide. Utilise uniquement des nombres entiers.')
    }

    totalModifier += sign * modifier
  }

  return {
    originalExpression,
    normalizedExpression: buildNormalizedExpression(parts, totalModifier),
    totalModifier,
    parts,
  }
}

export function rollDiceExpression(rawExpression: string, randomFn: () => number = Math.random): DiceRollResult {
  const parsed = parseDiceExpression(rawExpression)
  let total = parsed.totalModifier

  const rolledParts = parsed.parts.map((part) => {
    const rolls = Array.from({ length: part.count }, () => randomDie(part.sides, randomFn))
    const subtotal = rolls.reduce((sum, roll) => sum + roll, 0) * part.sign

    total += subtotal

    return {
      ...part,
      rolls,
      subtotal,
    }
  })

  return {
    ...parsed,
    parts: rolledParts,
    total,
    createdAt: Date.now(),
    id: crypto.randomUUID(),
  }
}

function recordRoll(result: DiceRollResult) {
  lastResult.value = result
  history.value = [result, ...history.value].slice(0, historyLimit)
  errorMessage.value = null
}

function rollCurrentExpression(randomFn?: () => number) {
  try {
    const result = rollDiceExpression(expression.value, randomFn)
    recordRoll(result)
    return result
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Formule invalide.'
    throw error
  }
}

function rollPreset(sides: number, randomFn?: () => number) {
  selectedPreset.value = sides
  expression.value = `d${sides}`
  return rollCurrentExpression(randomFn)
}

function rollCustomExpression(randomFn?: () => number) {
  selectedPreset.value = null
  return rollCurrentExpression(randomFn)
}

function openDiceRoller(autoRoll = true) {
  const wasOpen = isOpen.value
  isOpen.value = true

  // Trigger a real random roll when opening from a closed state.
  if (!wasOpen && autoRoll) {
    try {
      rollCurrentExpression()
    } catch {
      // Keep the panel open even if the current expression is invalid.
    }
  }
}

function closeDiceRoller() {
  isOpen.value = false
}

function toggleDiceRoller() {
  isOpen.value = !isOpen.value
}

function setDiceExpression(nextExpression: string) {
  expression.value = nextExpression
  selectedPreset.value = null
}

function clearDiceHistory() {
  history.value = []
}

function useDiceRoller() {
  return {
    isOpen: computed(() => isOpen.value),
    expression,
    selectedPreset: computed(() => selectedPreset.value),
    history: computed(() => history.value),
    lastResult: computed(() => lastResult.value),
    errorMessage: computed(() => errorMessage.value),
    openDiceRoller,
    closeDiceRoller,
    toggleDiceRoller,
    setDiceExpression,
    clearDiceHistory,
    rollPreset,
    rollCustomExpression,
  }
}

export {
  useDiceRoller,
  openDiceRoller,
  closeDiceRoller,
  toggleDiceRoller,
  setDiceExpression,
  clearDiceHistory,
  rollPreset,
  rollCustomExpression,
  rollCurrentExpression,
}
