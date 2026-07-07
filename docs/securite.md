# Mesures de sécurité

Reprise de l'audit initial (2026-07-07), avec pour chaque point l'état
d'origine, ce qui a été ajouté/corrigé le même jour, et ce qui reste ouvert.

## Authentification

**Système hybride** : JWT interne (`bcryptjs` + `jsonwebtoken`,
`authController.ts`) et Auth0 (OAuth2, `authMiddleware.ts`, fonction `protect`).

- Le frontend n'utilise **que Auth0** en pratique (`authStore.login()` appelle
  `loginWithRedirect` d'`@auth0/auth0-vue` — vérifié dans `LoginView.vue`,
  `RegisterView.vue`, `stores/auth.ts`). Les routes `/api/auth/register` et
  `/api/auth/login` (JWT) restent actives côté API et testées
  (`auth.test.ts`, 6 tests) mais ne sont plus appelées par l'interface —
  documenté dans le [cahier de recette](./cahier-de-recette.md).
- **Non corrigé** : `authMiddleware.ts` contient une URL Auth0 en dur
  (`https://dev-mvx3b7ah7u0lggj0.us.auth0.com/userinfo`) au lieu d'utiliser
  `process.env.AUTH0_ISSUER`. Repéré en lisant le code, laissé tel quel
  (changement de comportement risqué sans certitude sur le format attendu,
  hors périmètre validé).

## Hachage des mots de passe

`bcrypt.genSalt(10)` + `bcrypt.hash()` (`authController.ts:33-34`), uniquement
pour le flux JWT interne. Auth0 gère ses propres mots de passe (le champ
`password` local est stocké vide pour les comptes Auth0,
`authMiddleware.ts:73`).

## Autorisation et isolation des données par utilisateur

Toutes les requêtes Prisma sur `characters` et `npcs` filtrent par `userId`
issu du token vérifié (`req.user.id`), jamais d'un paramètre client.

**Corrigé le 2026-07-07** (commit `524c851`) : `updateCharacter` et
`deleteNpc` vérifiaient la propriété avec un `findFirst` séparé, puis
exécutaient l'action (`update`/`delete`) sans refiltrer par `userId` — un
TOCTOU mineur (risque théorique, pas une faille exploitée). Les deux
utilisent maintenant `updateMany`/`deleteMany` avec `userId` directement
dans la clause `where` de l'action elle-même.

## Validation des entrées (Zod)

| Route | Avant | Après le 2026-07-07 |
|---|---|---|
| `POST /api/auth/register`, `/login` | ✅ Zod | inchangé |
| `POST /api/characters` | ✅ Zod | inchangé |
| `PUT /api/characters/:id` | ❌ aucune validation | ✅ `updateCharacterSchema` (= `createCharacterSchema`, le frontend envoie toujours l'objet complet) |
| `POST /api/npcs` | ❌ `if (!name \|\| !race \|\| !data)` | ✅ `createNpcSchema` (`src/validators/npcValidator.ts`) |
| `:id` de route (`characters/:id`, `npcs/:id`) | ❌ `Number(id)` pouvait donner `NaN` | ✅ middleware `validateIdParam` (regex `^\d+$`), 400 sinon |

**Bug corrigé au passage** : `updateCharacter` dérivait les colonnes
`race`/`class` de `req.body.race`/`req.body.class`, des champs que le
frontend n'envoie jamais (`toCharacterCreateInput` n'envoie que
`name`/`level`/`data`). Modifier la race ou la classe d'un personnage
existant ne mettait donc jamais à jour ces colonnes. Corrigé pour dériver
`race`/`class` de `data.race.name`/`data.class.name`, comme à la création.

## Gestion des secrets

Vérifié par `git ls-files` : `.env` **n'est pas** versionné (bien listé dans
`.gitignore`). Seul `.env.example` est commité, avec des valeurs de
développement local cohérentes avec `docker-compose.yml` (`admin`/`password123`),
pas de secret réel. Les vrais secrets (Neon, JWT, Auth0, clé de service GCP)
sont stockés dans les secrets GitHub Actions et injectés au déploiement — voir
[protocole-cicd.md](./protocole-cicd.md).

## CORS

`cors({ origin: process.env.FRONTEND_URL, credentials: true })` — une seule
origine autorisée, configurée par variable d'environnement (pas de wildcard).

## Rate limiting

`express-rate-limit` : 50 requêtes / 15 minutes par IP, appliqué globalement
(`app.use(limiter)` avant les routes). Limite connue : pas de limite plus
stricte spécifique sur `/api/auth/login` (un brute-force sur les mots de
passe reste soumis à la même limite générale que le reste de l'API, pas à
une limite dédiée plus agressive).

## En-têtes de sécurité HTTP

**Ajouté le 2026-07-07** (commit `524c851`) : `helmet()` — X-Frame-Options,
X-Content-Type-Options, Strict-Transport-Security, etc. Vérifiés présents
via `curl -sI` sur un serveur local démarré pendant la session. La
Content-Security-Policy est **désactivée** volontairement
(`{ contentSecurityPolicy: false }`) car elle bloquait les scripts/styles
inline de Swagger UI (`/api-docs`) — vérifié : `/api-docs` répond 200 avec
CSP désactivée, non testé avec CSP activée.

## Journalisation

Winston (structuré, format JSON en production pour Google Cloud Logging) +
Morgan pour les requêtes HTTP. **Corrigé le 2026-07-07** : tous les
`console.error` bruts (contrôleurs `character`/`npc`/`auth`, middleware
d'authentification, health check) remplacés par `logger.error()` avec
seulement le message d'erreur (`error.message`), pas l'objet complet — pour
éviter de fuiter des stack traces ou des détails de requête dans des logs
non structurés.

## Dépendances

`npm audit` (déclenché en installant `helmet`) a révélé 21 vulnérabilités
connues, dont 1 critique et 11 hautes — non détectées par l'audit initial
qui n'avait inspecté que les numéros de version. Analyse : la majorité
(`vite`, `vitest`, `rollup`, `esbuild`, `postcss`...) sont des dépendances de
**développement** tirées transitivement par Vitest, non présentes dans
l'image Docker de production. Deux concernent potentiellement la production :

- `express-rate-limit` (haute) — les adresses IPv4-mappées-IPv6 peuvent
  contourner la limite par IP sur un serveur dual-stack.
- `path-to-regexp` (haute) — ReDoS via le système de routage d'Express.

**Non corrigées** à ce jour (décision reportée avec l'utilisateur — une mise
à jour de dépendance n'est pas anodine et n'était pas dans le périmètre
validé de cette session). Voir
[criteres-qualite-performance.md](./criteres-qualite-performance.md) pour le
détail complet.

## Synthèse

| Mesure | Statut |
|---|---|
| Authentification (Auth0 + JWT) | ✅ En place |
| Hachage des mots de passe | ✅ bcrypt, salt 10 |
| Isolation des données par utilisateur | ✅ Corrigé (defense in depth) |
| Validation des entrées (Zod) | ✅ Complétée sur toutes les routes d'écriture |
| Validation des paramètres d'URL | ✅ Ajoutée |
| Secrets | ✅ Correct (jamais commités) |
| CORS | ✅ Restreint à une origine |
| Rate limiting | ✅ En place (limite générale, pas de limite dédiée sur `/login`) |
| En-têtes de sécurité HTTP | ✅ Ajoutés (helmet, CSP désactivée) |
| Journalisation | ✅ Structurée, sans fuite d'objets bruts |
| Dépendances à jour | 🟡 Auditées, 2 vulnérabilités production non corrigées |
| URL Auth0 en dur | ⬜ Repérée, non corrigée |
