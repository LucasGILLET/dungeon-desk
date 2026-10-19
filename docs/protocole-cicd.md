# Protocole d'intégration et de déploiement continu

> **Mise à jour du 2026-10-19** (version en préparation) : nombres de tests,
> secrets et migrations mis à jour. Les pipelines eux-mêmes n'ont pas changé.

## Vue d'ensemble

Le projet est réparti sur deux dépôts Git indépendants, chacun avec son propre
pipeline GitHub Actions :

| Dépôt | Workflow | Cible | Déclencheur |
|---|---|---|---|
| `dungeon-desk-front` | `.github/workflows/azure-static-web-apps-icy-rock-0d5406403.yml` | Azure Static Web Apps | `push` sur `main` **et** `pull_request` |
| `dungeon-desk-back` | `.github/workflows/deploy.yml` | Google Cloud Run | `push` sur `main` **uniquement** |

## Frontend — Azure Static Web Apps

### Déclenchement
`push` sur `main` ou `pull_request` (opened/synchronize/reopened/closed) vers `main`.

### Jobs
1. **`quality_checks`** (ajouté le 2026-07-07, commit `d042556`) :
   - `actions/checkout@v4`, Node 22, `npm ci`
   - `npm run type-check` (`vue-tsc --build`)
   - `npm run test:unit -- --run` (Vitest, 93 tests au 2026-10-19)
2. **`build_and_deploy_job`** : `needs: quality_checks` — ne se déclenche que si le job précédent réussit. Utilise `Azure/static-web-apps-deploy@v1` (`app_location: /`, `output_location: dist`), qui build et déploie en une seule action (build interne via Oryx, pas `npm run build` explicite).
3. **`close_pull_request_job`** : ferme l'environnement de prévisualisation Azure quand une PR est fermée.

### Secrets et variables requis
`AZURE_STATIC_WEB_APPS_API_TOKEN_ICY_ROCK_0D5406403`, `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, `VITE_AUTH0_AUDIENCE`, `VITE_API_URL` (utilisées dans le code via `import.meta.env`, vérifié par recherche dans `src/`).

### Limite connue
Pas de linting (aucun ESLint installé — décision assumée le 2026-07-07 : le type-check + les tests unitaires servent de porte qualité en attendant, pour ne pas bloquer le déploiement sur des dizaines de violations préexistantes jamais corrigées).

## Backend — Google Cloud Run

### Déclenchement
`push` sur `main` **seulement** — contrairement au front, il n'y a **pas** de vérification automatique sur les pull requests avant fusion. C'est une vraie limite : rien n'empêche de fusionner du code cassé, seul le déploiement après fusion sera bloqué.

### Étapes (job unique `deploy`)
1. Checkout, Node 20, `npm ci`
2. `npm test` (Vitest, 55 tests au 2026-10-19, 7 fichiers)
3. `npx tsc --noEmit` (ajouté le 2026-07-07, commit `2c295e9`)
4. `npx prisma migrate deploy` (contre la base Neon de production ; migrations dans `prisma/schema/migrations/`)
5. Authentification GCP (`google-github-actions/auth@v2`, clé de service `GCP_SA_KEY`)
6. Build et push de l'image Docker vers Artifact Registry (`europe-west9-docker.pkg.dev/dungeon-desk-486622/dungeon-desk-repo/dungeon-desk-back:${{ github.sha }}`)
7. Déploiement sur Cloud Run (service `dungeon-desk-back`, région `europe-west9`)

### Pourquoi l'étape 3 a été ajoutée
Avant cette correction, une erreur de type TypeScript n'était détectée qu'à l'étape 6 (le `Dockerfile` lance `npm run build`, c'est-à-dire `tsc`), donc **après** les migrations de base de données à l'étape 4. Un code qui ne compile pas aurait pu modifier le schéma de production avant que le déploiement échoue. `tsc --noEmit` juste après les tests ferme cette fenêtre.

### Secrets requis
`DATABASE_URL`, `GCP_SA_KEY`, `FRONTEND_URL`, `AUTH0_AUDIENCE`, `AUTH0_ISSUER`. (`JWT_SECRET` n'est plus transmis depuis la suppression de l'authentification locale, le 2026-10-19 ; le secret GitHub peut être supprimé.)

### Ce que le pipeline ne fait pas (encore)
- **Le seed des données de jeu** (`npx prisma db seed`) n'est pas lancé par la CI : sur une base vierge ou après une mise à jour des données du SRD, il faut l'exécuter à part. Comment l'intégrer (étape de CI ou commande ponctuelle) est à décider lors de la mise en production de cette version.
- **Directus** n'est pas déployé par la CI ; son déploiement (Cloud Run) est à mettre en place.
- **Les tests E2E** (Playwright) ne sont pas exécutés : ils supposent un front et une API démarrés.

### Point d'attention pour la mise en production de cette version
La fusion de la branche `feat/srd-database` dans `main` appliquera dix nouvelles migrations, dont `20261017100000_character_model`, qui **supprime les personnages existants** (l'ancien format JSON n'est pas converti). Elle est irréversible : à faire en connaissance de cause, après sauvegarde de la base.

### Port d'écoute
`src/server.ts` utilise `process.env.PORT || 3000`. Cloud Run injecte automatiquement `PORT=8080`, ce qui correspond à l'`EXPOSE 8080` du `Dockerfile` — aucune configuration supplémentaire nécessaire, mais c'est une variable implicite à connaître si le service ne démarre pas comme attendu.

## Anecdote Netlify/DNS — itération sur le pipeline de déploiement front

Le 2026-04-11, une série de commits (`15037e3`, `63a7873`, `4591b46`, `49a3ce5`) a introduit un fichier `netlify.toml` pour déployer temporairement sur Netlify "en attendant le DNS" (message du premier commit). Le pipeline GitHub Actions vers Azure Static Web Apps existait déjà depuis le 2026-02-27 (`c55921d`), mais le DNS du domaine `dungeon-desk.com` n'était probablement pas encore configuré vers Azure à ce moment.

En juillet 2026, une vérification factuelle a confirmé que **Azure est la cible réelle** :
- `www.dungeon-desk.com` résout vers `icy-rock-0d5406403.2.azurestaticapps.net` (vérifié par `nslookup`).
- Les 5 derniers runs du workflow Azure (tous en succès, dernier le 2026-05-19) correspondent exactement aux 5 derniers commits du dépôt à cette date (mêmes horodatages).
- Aucun commit lié à `netlify.toml` après le 2026-04-11 : la tentative a été abandonnée dès que le DNS Azure a été opérationnel.

`netlify.toml` a été supprimé le 2026-07-07 (commit `d042556`) comme reliquat inutilisé. Cette anecdote illustre une itération réelle et documentée sur le choix d'infrastructure, pas une improvisation : le premier essai (Netlify) a été remplacé par la solution cible (Azure) dès que possible, et le nettoyage a suivi une fois confirmé par des preuves techniques (DNS + historique des runs) plutôt que par supposition.
