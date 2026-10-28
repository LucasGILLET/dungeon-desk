// Après un déploiement, un onglet resté ouvert connaît encore les anciens noms
// des fichiers de chaque page (« SortsListView-a1b2.js »), qui n'existent plus :
// la navigation échouerait sans rien afficher. On recharge alors le site sur la
// page demandée, une seule fois par minute pour ne pas boucler si le problème
// est ailleurs (réseau coupé…).
import type { Router } from 'vue-router'

const RELOAD_KEY = 'dungeon-desk:stale-build-reload'
const STALE_CHUNK = /dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS/i

export const isStaleChunkError = (error: unknown) => error instanceof Error && STALE_CHUNK.test(error.message)

export function reloadOnce(url: string): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0)
    if (Date.now() - last < 60_000) return false
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
  } catch { /* stockage indisponible : on recharge quand même */ }
  window.location.assign(url)
  return true
}

export function reloadOnStaleBuild(router: Router) {
  router.onError((error, to) => {
    if (isStaleChunkError(error)) reloadOnce(to.fullPath)
  })
  // Préchargement d'un fichier disparu (signalé par Vite)
  window.addEventListener('vite:preloadError', (event) => {
    if (reloadOnce(window.location.href)) event.preventDefault()
  })
}
