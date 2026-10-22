import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      // Premier test d'un fichier : chargement à froid de vues lourdes (fiche,
      // routeur), plus de 5 s quand toute la suite tourne en parallèle
      testTimeout: 15000,
    },
  }),
)
