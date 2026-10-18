// Couleurs d'accent des guides (enum GuideAccent de l'API) → classes Tailwind.
// Écrites en entier pour que Tailwind les détecte.
export type GuideAccent =
  | 'NEUTRAL' | 'SLATE' | 'ZINC' | 'RED' | 'ORANGE' | 'AMBER' | 'YELLOW' | 'EMERALD'
  | 'TEAL' | 'CYAN' | 'SKY' | 'BLUE' | 'VIOLET' | 'FUCHSIA' | 'ROSE'

interface AccentClasses {
  card: string // dégradé et bordure d'une carte
  text: string // titre coloré
  dot: string // puce
  edge: string // bordure gauche (tuiles de l'aide-mémoire)
}

const ACCENTS: Record<GuideAccent, AccentClasses> = {
  NEUTRAL: { card: 'bg-linear-to-br from-white/10 via-zinc-500/10 to-transparent border-white/10', text: 'text-zinc-100', dot: 'bg-zinc-300/70', edge: 'border-l-zinc-400' },
  SLATE: { card: 'bg-linear-to-br from-slate-400/20 via-zinc-500/10 to-transparent border-slate-500/30', text: 'text-slate-300', dot: 'bg-slate-300/70', edge: 'border-l-slate-500' },
  ZINC: { card: 'bg-linear-to-br from-zinc-400/20 via-slate-500/10 to-transparent border-zinc-500/30', text: 'text-zinc-400', dot: 'bg-zinc-300/70', edge: 'border-l-zinc-500' },
  RED: { card: 'bg-linear-to-br from-red-500/20 via-orange-500/10 to-transparent border-red-500/30', text: 'text-red-400', dot: 'bg-red-300/70', edge: 'border-l-red-600' },
  ORANGE: { card: 'bg-linear-to-br from-orange-400/20 via-amber-500/10 to-transparent border-orange-500/30', text: 'text-orange-400', dot: 'bg-orange-300/70', edge: 'border-l-orange-600' },
  AMBER: { card: 'bg-linear-to-br from-amber-400/20 via-yellow-500/10 to-transparent border-amber-500/30', text: 'text-amber-500', dot: 'bg-amber-300/70', edge: 'border-l-amber-600' },
  YELLOW: { card: 'bg-linear-to-br from-yellow-400/20 via-amber-500/10 to-transparent border-yellow-500/30', text: 'text-yellow-500', dot: 'bg-yellow-300/70', edge: 'border-l-yellow-600' },
  EMERALD: { card: 'bg-linear-to-br from-emerald-400/20 via-teal-500/10 to-transparent border-emerald-500/30', text: 'text-emerald-500', dot: 'bg-emerald-300/70', edge: 'border-l-emerald-600' },
  TEAL: { card: 'bg-linear-to-br from-teal-400/20 via-cyan-500/10 to-transparent border-teal-500/30', text: 'text-teal-400', dot: 'bg-teal-300/70', edge: 'border-l-teal-600' },
  CYAN: { card: 'bg-linear-to-br from-cyan-400/20 via-sky-500/10 to-transparent border-cyan-500/30', text: 'text-cyan-400', dot: 'bg-cyan-300/70', edge: 'border-l-cyan-600' },
  SKY: { card: 'bg-linear-to-br from-sky-400/20 via-cyan-500/10 to-transparent border-sky-500/30', text: 'text-sky-500', dot: 'bg-sky-300/70', edge: 'border-l-sky-600' },
  BLUE: { card: 'bg-linear-to-br from-blue-400/20 via-sky-500/10 to-transparent border-blue-500/30', text: 'text-blue-400', dot: 'bg-blue-300/70', edge: 'border-l-blue-600' },
  VIOLET: { card: 'bg-linear-to-br from-violet-400/20 via-fuchsia-500/10 to-transparent border-violet-500/30', text: 'text-violet-500', dot: 'bg-violet-300/70', edge: 'border-l-violet-600' },
  FUCHSIA: { card: 'bg-linear-to-br from-fuchsia-400/20 via-pink-500/10 to-transparent border-fuchsia-500/30', text: 'text-fuchsia-400', dot: 'bg-fuchsia-300/70', edge: 'border-l-fuchsia-600' },
  ROSE: { card: 'bg-linear-to-br from-rose-400/20 via-pink-500/10 to-transparent border-rose-500/30', text: 'text-rose-400', dot: 'bg-rose-300/70', edge: 'border-l-rose-600' },
}

export function accentClasses(accent: GuideAccent | null | undefined, fallback: GuideAccent = 'NEUTRAL'): AccentClasses {
  return ACCENTS[accent ?? fallback] ?? ACCENTS[fallback]
}
