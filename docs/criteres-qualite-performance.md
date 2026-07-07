# Critères de qualité et de performance

Comme pour le cahier de recette, ce document distingue ce qui est **mesuré
automatiquement**, ce qui est **vérifié manuellement**, et ce qui **n'est pas
mesuré du tout** — pour ne pas donner une image plus rassurante que la réalité.

## Tests automatisés

| Dépôt | Framework | Fichiers de test | Nombre de tests | Vérifié |
|---|---|---|---|---|
| `dungeon-desk-front` | Vitest + @vue/test-utils | 9 | 49 | ✅ rejoué le 2026-07-07, tous passent |
| `dungeon-desk-front` (E2E) | Playwright | `e2e/vue.spec.ts` | 5 scénarios | 🟡 non rejoué dans cette session |
| `dungeon-desk-back` | Vitest + Supertest | 1 (`auth.test.ts`) | 6 | ✅ rejoué le 2026-07-07, tous passent |

### Ce qui N'EST PAS mesuré
- **Aucun rapport de couverture de code** n'est configuré (`vitest.config.ts` ne
  déclare pas de `coverage.provider` sur les deux dépôts) — pas de `@vitest/coverage-v8`
  installé, pas de seuil minimum imposé. Le pourcentage de code réellement
  exécuté par les tests est donc **inconnu**, seulement estimable par lecture.
- À titre indicatif (comptage manuel, pas un outil) : sur le frontend, les tests
  couvrent le store `character`, 2 des 9 étapes du créateur de personnage
  (`StepRace`, `StepAbilities`), le mapping API↔modèle, et le filtrage de la
  liste des sorts — mais aucune des 7 autres étapes du créateur, aucune vue
  (`HomeView`, `NPCGenerator`, `CombatCheatSheetView`...) n'a de test dédié.
- Côté backend, seules les routes `/api/auth/*` sont testées ; les routes
  `/api/characters/*` et `/api/npcs/*` n'ont aucun test automatisé malgré les
  corrections de sécurité apportées le 2026-07-07 (voir [securite.md](./securite.md)).

## Analyse statique / linting

**Aucun linter n'est installé** sur les deux dépôts (vérifié : aucune
dépendance `eslint*` dans les deux `package.json`). Décision assumée le
2026-07-07 lors de la mise en place de la CI (voir
[protocole-cicd.md](./protocole-cicd.md)) : plutôt que d'installer ESLint et
risquer de découvrir des dizaines de violations préexistantes non budgétées
dans le temps disponible, la porte qualité repose sur :
- **Le type-check strict TypeScript** (`vue-tsc --build` côté front,
  `tsc --noEmit` côté back), qui bloque déjà le déploiement en cas d'erreur.
- **Les tests unitaires**, qui bloquent également le déploiement.

C'est une garantie de compilation et de non-régression fonctionnelle, pas une
garantie de style ou de bonnes pratiques (imports inutilisés, variables
mortes, complexité excessive... ne sont pas détectés).

## Dépendances / vulnérabilités connues

`npm install` dans `dungeon-desk-back` (2026-07-07) a révélé **21
vulnérabilités** via `npm audit` (1 critique, 11 hautes, 8 modérées, 1 basse) —
non détectées par l'audit initial du projet, qui s'était limité à inspecter
les numéros de version dans `package.json` sans lancer l'outil.

Analyse (voir détail dans [securite.md](./securite.md)) :
- La majorité concernent des dépendances de **développement uniquement**
  (`vite`, `vitest`, `rollup`, `esbuild`... tirées transitivement par Vitest) —
  non présentes dans l'image Docker de production.
- Deux sont potentiellement pertinentes en production : `express-rate-limit`
  (contournement possible de la limite par IP sur réseau dual-stack) et
  `path-to-regexp` (ReDoS via le routing Express). **Non corrigées** à ce
  jour — décision reportée avec l'utilisateur du projet.

## Performance

- **Instrumentation en place côté backend** : métriques Prometheus exposées
  sur `/metrics` (`src/utils/monitoring.ts`), histogramme
  `http_request_duration_seconds` par méthode/route/code de statut, alimenté
  par le middleware `response-time` dans `app.ts`. C'est une vraie mesure de
  performance en production, pas un test de charge.
- **Aucun test de charge** (k6, Artillery...) n'a été réalisé.
- **Aucun budget de performance frontend** (Lighthouse CI, bundle size limit)
  n'est configuré dans le pipeline. Le build Vite (`npm run build-only`) ne
  fait l'objet d'aucune vérification automatique de taille de bundle.

## Synthèse

| Axe | Statut |
|---|---|
| Tests fonctionnels (CI) | ✅ En place, bloquants, mais couverture partielle et non mesurée en % |
| Type-check (CI) | ✅ En place, bloquant, sur les deux dépôts |
| Lint / style de code | ⬜ Absent (décision assumée, pas un oubli) |
| Sécurité des dépendances | 🟡 Auditée (`npm audit`), partiellement corrigée |
| Performance | 🟡 Instrumentée en production (Prometheus), non testée en charge |
