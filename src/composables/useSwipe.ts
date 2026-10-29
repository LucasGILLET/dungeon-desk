// Glissement horizontal du doigt (écran tactile) : -1 vers la gauche, 1 vers la droite.
// Ignoré quand il part d'un champ de saisie ou d'une zone qui défile elle-même à
// l'horizontale (tableau large), et quand le geste est surtout vertical (défilement).
const MIN_DISTANCE = 60
const MAX_DURATION = 800

function scrollsHorizontally(target: EventTarget | null, root: HTMLElement): boolean {
  for (let el = target as HTMLElement | null; el && el !== root; el = el.parentElement) {
    if (el.matches('input, textarea, select, [contenteditable="true"]')) return true
    if (el.scrollWidth > el.clientWidth && /auto|scroll/.test(getComputedStyle(el).overflowX)) return true
  }
  return false
}

export function useSwipe(onSwipe: (direction: -1 | 1) => void) {
  let start: { x: number; y: number; time: number } | null = null

  function onTouchStart(event: TouchEvent) {
    const touch = event.touches[0]
    start = event.touches.length === 1 && touch && !scrollsHorizontally(event.target, event.currentTarget as HTMLElement)
      ? { x: touch.clientX, y: touch.clientY, time: Date.now() }
      : null
  }

  function onTouchEnd(event: TouchEvent) {
    const touch = event.changedTouches[0]
    if (!start || !touch) return
    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y
    const quick = Date.now() - start.time <= MAX_DURATION
    start = null
    // Texte sélectionné au doigt : ce n'était pas un glissement
    if (!quick || Math.abs(dx) < MIN_DISTANCE || Math.abs(dx) < 2 * Math.abs(dy) || window.getSelection()?.toString()) return
    onSwipe(dx < 0 ? -1 : 1)
  }

  return { onTouchStart, onTouchEnd, onTouchCancel: () => (start = null) }
}
