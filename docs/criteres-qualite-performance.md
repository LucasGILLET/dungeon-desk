# Critères de qualité et de performance

Comme pour le cahier de recette, ce document distingue ce qui est **mesuré
automatiquement**, ce qui est **vérifié manuellement**, et ce qui **n'est pas
mesuré du tout** — pour ne pas donner une image plus rassurante que la réalité.

> **Mise à jour du 2026-10-19** (version en préparation).

## Tests automatisés

| Dépôt | Framework | Fichiers de test | Nombre de tests | Vérifié |
|---|---|---|---|---|
| `dungeon-desk-front` | Vitest + @vue/test-utils | 20 | 93 | ✅ rejoué le 2026-10-19, tous passent |
| `dungeon-desk-front` (E2E) | Playwright | `e2e/vue.spec.ts` | 5 scénarios | 🟡 rejoués le 2026-10-19 en local (Chrome), tous passent ; pas exécutés par la CI |
| `dungeon-desk-back` | Vitest + Supertest | 7 | 55 | ✅ rejoué le 2026-10-19, tous passent |

Ce qui est couvert (par fichier) :
- **Back** : moteur de règles des personnages (`characterRules.test.ts` :
  personnage complet, choix en attente, multiclassage, niveaux, sorts,
  améliorations de caractéristiques…), routes des personnages et des PNJ
  (validation, isolation entre utilisateurs), campagnes (visibilité pour un
  joueur, 404/403, invitation, difficulté des rencontres), données SRD
  (classes, races, sorts, guides, règles), import des monstres (analyse des
  blocs de statistiques).
- **Front** : étapes Race et Caractéristiques du créateur, fiche de
  personnage (montée de niveau, ressources, sauvegarde), sorts de la fiche,
  profil, campagne (onglets selon le rôle), documentation (pages publiées,
  brouillons), aide-mémoire de combat, routeur (adresses rechargées
  directement), mise en forme des monstres et rendu Markdown nettoyé,
  générateur de PNJ, lanceur de dés.

### Ce qui N'EST PAS mesuré
- **Aucun rapport de couverture de code** n'est configuré (`vitest.config.ts`
  ne déclare pas de `coverage.provider` sur les deux dépôts) — pas de seuil
  minimum imposé. Le pourcentage de code réellement exécuté par les tests
  est donc **inconnu**, seulement estimable par lecture.
- **Pas de test de bout en bout du créateur complet** (8 étapes puis
  sauvegarde) ni des parcours connectés (Auth0) : campagnes à deux comptes,
  sauvegarde d'un personnage — vérifiés manuellement (voir le
  [cahier de recette](./cahier-de-recette.md)).
- **Les tests E2E ne tournent pas en CI** : ils supposent un front et une
  API démarrés ; ils ont été rejoués en local le 2026-10-19 (ce qui a
  révélé un bogue, voir [plan-correction-bogues.md](./plan-correction-bogues.md)).
- **Back-office Directus** : sa configuration n'a pas de test automatisé ;
  elle a été vérifiée en l'utilisant avec un compte rédacteur.

## Analyse statique / linting

**Aucun linter n'est installé** sur les deux dépôts (aucune dépendance
`eslint*`). La porte qualité repose sur :
- **Le type-check strict TypeScript** (`vue-tsc --build` côté front,
  `tsc --noEmit` côté back), qui bloque le déploiement en cas d'erreur.
- **Les tests unitaires**, qui bloquent également le déploiement.

**Audit ponctuel du 2026-10-19** : une passe manuelle du compilateur avec
`--noUnusedLocals` (variables et imports inutilisés) a relevé 12 cas dans
le front, corrigés, et aucun dans le back ; une recherche des exports
jamais importés a fait supprimer 4 fonctions mortes. Cette vérification
n'est pas dans la CI : sans linter, le code mort peut revenir.

## Dépendances / vulnérabilités connues

`npm audit --omit=dev` le 2026-10-19 : 12 vulnérabilités dans les
dépendances de production du back (1 critique, `proxy-addr`, via Express),
7 dans celles du front (`vue`, `vite`…). Toutes corrigées le jour même par
des mises à jour correctives ou mineures (Express 4.22.3,
`express-rate-limit` 8.7.0, Vue 3.5.43, Vite 7.3.6, DOMPurify 3.4.16…),
sans version majeure : **0 vulnérabilité en production** dans les deux
dépôts. Restent des vulnérabilités dans les outils de développement
(`prisma`, `nodemon`…), qui ne sont pas déployés. Détail dans
[securite.md](./securite.md).

Trois dépendances inutilisées ont été retirées du front le 2026-10-19
(`express-oauth2-jwt-bearer`, `three`, `@types/three`), et deux du back avec
l'authentification locale (`bcryptjs`, `jsonwebtoken`).

## Performance

- **Instrumentation côté backend** : métriques Prometheus exposées sur
  `/metrics` (`src/utils/monitoring.ts`), histogramme
  `http_request_duration_seconds` par méthode/route/code de statut,
  alimenté par le middleware `response-time`. C'est une vraie mesure de
  performance en production, pas un test de charge.
- **Réponses compressées** (`compression`) et **mises en cache** côté
  navigateur pour les données de jeu (`Cache-Control: max-age=3600` ; une
  minute pour les pages de documentation). Le front ne recharge pas deux
  fois la même ressource dans une session (cache des requêtes dans
  `dataLoader.ts`).
- **Pages chargées à la demande** (routeur) : le fichier JavaScript
  principal est passé de **1,76 Mo à 0,95 Mo** (de 557 à 272 Ko
  compressés) le 2026-10-19, mesuré sur `npm run build`. Il reste au-dessus
  du seuil d'avertissement de Vite (500 Ko), à cause des bibliothèques
  chargées sur toutes les pages (Auth0, particules de l'accueil, dés 3D).
- **Seed** de la base (données du SRD) : environ 75 secondes sur une base
  vierge, mesuré le 2026-10-19.
- **Aucun test de charge** (k6, Artillery...) n'a été réalisé.
- **Aucun budget de performance frontend** (Lighthouse CI, limite de taille
  de bundle) n'est configuré dans le pipeline. Les images de classes
  (environ 550 Ko chacune) n'ont pas été optimisées.

## Synthèse

| Axe | Statut |
|---|---|
| Tests fonctionnels (CI) | ✅ En place, bloquants (148 tests), couverture non mesurée en % |
| Tests E2E | 🟡 5 scénarios, rejoués en local, pas en CI |
| Type-check (CI) | ✅ En place, bloquant, sur les deux dépôts |
| Lint / style de code | ⬜ Absent ; audit ponctuel du code mort le 2026-10-19 |
| Sécurité des dépendances | ✅ Production : 0 vulnérabilité (2026-10-19) ; 🟡 outils de développement à mettre à jour |
| Performance | 🟡 Instrumentée (Prometheus), bundle réduit de moitié, non testée en charge |
