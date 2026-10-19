# Mesures de sécurité

Reprise de l'audit initial (2026-07-07), mise à jour le **2026-10-19** pour
la version en préparation (branche `feat/srd-database`). Pour chaque point :
l'état, ce qui a été corrigé et quand, et ce qui reste ouvert.

## Authentification

**Auth0 seul** (OAuth2 / OIDC) : le front redirige vers Auth0
(`loginWithRedirect`, `stores/auth.ts`), l'API vérifie le jeton à chaque
requête protégée (`authMiddleware.ts`, fonction `protect`, bibliothèque
`express-oauth2-jwt-bearer` : signature, émetteur et audience).

- **Corrigé le 2026-10-19** : l'ancienne authentification locale (routes
  `/api/auth/register` et `/api/auth/login`, JWT signé par l'API, mots de
  passe hachés par bcrypt) a été **supprimée**. Elle n'était plus appelée
  par le front, et les jetons qu'elle émettait étaient de toute façon
  refusés par `protect` ; elle restait pourtant ouverte et permettait de
  créer des comptes. Vérifié après suppression : routes protégées → 401
  sans jeton ou avec un jeton invalide, anciennes routes → 404.
- **Corrigé le 2026-10-19** : `authMiddleware.ts` contenait une URL Auth0
  en dur (tenant de développement, `…/userinfo`). Elle est désormais tirée
  de `AUTH0_ISSUER`, comme la vérification des jetons.
- Les mots de passe ne sont plus gérés par l'application : ils restent chez
  Auth0. La colonne `password` de `User` subsiste en base, vide (à retirer
  par une migration).

## Autorisation et isolation des données par utilisateur

Toutes les requêtes Prisma sur les personnages, les PNJ et les campagnes
filtrent par `userId` issu du token vérifié (`req.user.id`), jamais d'un
paramètre client. Une ressource d'un autre utilisateur répond **404**, sans
révéler qu'elle existe (testé : `characters.test.ts`, « should return 404
for a character of another user »).

**Campagnes (ajoutées en octobre 2026)** :
- le MJ (propriétaire) modifie tout ; un joueur invité lit la campagne
  **sans** les notes du MJ, les PNJ, les rencontres ni les quêtes non
  révélées — filtrage fait par l'API, pas par l'interface ; un utilisateur
  extérieur reçoit 404, un joueur qui tente une modification 403 (testé :
  `campaigns.test.ts`) ;
- l'invitation se fait par un code aléatoire (9 octets,
  `crypto.randomBytes`), que le MJ peut régénérer pour invalider l'ancien
  lien ; le MJ ne peut pas rejoindre sa propre campagne, et un joueur ne
  peut y rattacher que **ses** personnages ;
- le MJ peut **lire** la fiche des personnages de ses joueurs
  (`GET /api/characters/:id`, `access: "GAME_MASTER"`) mais pas la
  modifier : `PUT` et `DELETE` restent réservés au propriétaire (vérifié de
  bout en bout le 2026-10-19 : le MJ obtient 404 sur `PUT`).

**Corrigé le 2026-07-07** (commit `524c851`) : `updateCharacter` et
`deleteNpc` refiltrent par `userId` dans la requête qui modifie la donnée
(`updateMany`/`deleteMany`), plus seulement dans une vérification préalable.

## Validation des entrées

| Entrée | Validation |
|---|---|
| Personnages (`POST`, `PUT`, `POST /preview`) | Zod (`CharacterInputSchema`) pour la forme, puis moteur de règles (`analyse()`) : contenu existant dans l'édition, choix autorisés, multiclassage, sorts de la liste de classe ; erreurs renvoyées avec leur chemin |
| PNJ | Zod (`npcInputSchema`) + existence de la race, classe, alignement dans l'édition |
| Campagnes, séances, quêtes, PNJ de campagne, rencontres | Zod (`campaignValidator.ts`) + appartenance (PNJ du MJ, séance de la campagne, monstres de l'édition) |
| `:id` de route | middleware `validateIdParam`, 400 si non entier positif |
| Colonnes JSONB (vitesses, sens, usages…) | schémas Zod partagés (`src/srd/jsonb.ts`) au seed |

## Contenu rédigé et affichage HTML

Les règles et les pages de documentation sont du Markdown édité dans
Directus, affiché avec `v-html`. Le HTML produit par `marked` passe
toujours par **DOMPurify** (`utils/markdown.ts`) : un `<script>` ou un
attribut `onerror` est retiré (testé : `guides.spec.ts`). DOMPurify a été
mis à jour le 2026-10-19 (3.2.6 → 3.4.16) après l'audit des dépendances,
qui signalait des contournements connus dans les versions ≤ 3.4.15.

Les autres textes longs (descriptions d'objets magiques) sont rendus sans
`v-html`, par un découpage en paragraphes et tableaux (`RichText.vue`).

## Back-office (Directus)

- Rôles au moindre privilège : le **rédacteur de la documentation** ne
  modifie que les pages de documentation et ne fait que lire les classes,
  races et règles ; le **traducteur** ne modifie que les traductions ;
  l'**éditeur** des données de jeu ne supprime que des traductions et des
  liaisons. Rôles définis par script (`src/directus/roles.ts`), pas à la
  main.
- Secrets (clé de chiffrement, compte administrateur, jeton d'API, licence)
  dans `.env.directus`, non versionné ; seul `.env.directus.example` est
  commité, sans valeur réelle.
- La politique de sécurité de contenu de Directus n'autorise l'affichage
  dans son cadre d'aperçu que du front (`frame-src 'self'` + l'adresse du
  front), vérifié le 2026-10-19 (une autre adresse reste bloquée).

## Gestion des secrets

`.env` et `.env.directus` **ne sont pas** versionnés (`.gitignore`). Seuls
`.env.example` (back et front) et `.env.directus.example` sont commités,
avec des valeurs de développement local, pas de secret réel (vérifié par
recherche dans l'historique Git le 2026-10-19). Les vrais secrets (Neon,
Auth0, clé de service GCP, jeton Azure) sont stockés dans les secrets
GitHub Actions et injectés au déploiement — voir
[protocole-cicd.md](./protocole-cicd.md). `JWT_SECRET` n'est plus utilisé
depuis la suppression de l'authentification locale.

## CORS

`cors({ origin: process.env.FRONTEND_URL, credentials: true })` — une seule
origine autorisée, configurée par variable d'environnement (pas de wildcard).

## Rate limiting

`express-rate-limit` : **1000 requêtes / 15 minutes par IP**, appliqué
globalement. La limite a été relevée (50 en juillet) parce que le créateur
de personnage interroge l'API à chaque réponse pour recalculer l'aperçu ;
la limite plus stricte dédiée à `/api/auth` a disparu avec ces routes. La
protection contre le bourrage d'identifiants relève désormais d'Auth0.

## En-têtes de sécurité HTTP

`helmet()` sur l'API (X-Content-Type-Options, Strict-Transport-Security,
X-Frame-Options…), ajouté le 2026-07-07. La Content-Security-Policy de
l'API reste **désactivée** (`contentSecurityPolicy: false`) car elle
bloquait les scripts/styles inline de Swagger UI (`/api-docs`).

## Journalisation

Winston (structuré, format JSON en production pour Google Cloud Logging) +
Morgan pour les requêtes HTTP. Les erreurs sont journalisées par leur
message (`error.message`), pas l'objet complet, pour ne pas fuiter de
traces ou de détails de requête.

## Dépendances

`npm audit --omit=dev` (dépendances de production seulement), le
2026-10-19 :

| Dépôt | Vulnérabilités | Dont |
|---|---|---|
| `dungeon-desk-back` | 12 (1 critique, 7 hautes, 4 modérées) | `proxy-addr` (critique), `express-rate-limit`, `path-to-regexp`, `compression`, `body-parser`, `qs` — presque toutes tirées par Express |
| `dungeon-desk-front` | 7 (6 hautes, 1 basse) | `vue`, `vite`, `postcss`, `nanoid` |

Corrigé : `dompurify` (voir plus haut). **Non corrigé** : le reste demande
de mettre à jour Express, Vue et Vite (versions majeures ou mineures avec
changements), à planifier comme un chantier à part, tests à l'appui, plutôt
qu'au détour d'une mise en production. Les vulnérabilités `express-rate-limit`
et `path-to-regexp` relevées en juillet sont toujours ouvertes.

## Synthèse

| Mesure | Statut |
|---|---|
| Authentification (Auth0) | ✅ En place, authentification locale supprimée |
| Isolation des données par utilisateur | ✅ Personnages, PNJ, campagnes ; testée |
| Accès du MJ aux fiches de ses joueurs | ✅ Lecture seule, vérifié de bout en bout |
| Validation des entrées (Zod + règles) | ✅ Sur toutes les routes d'écriture |
| Validation des paramètres d'URL | ✅ |
| Contenu rédigé (Markdown) | ✅ Nettoyé par DOMPurify, testé |
| Back-office (Directus) | ✅ Rôles au moindre privilège, secrets hors dépôt |
| Secrets | ✅ Jamais commités |
| CORS | ✅ Restreint à une origine |
| Rate limiting | ✅ Limite générale (1000 / 15 min) |
| En-têtes de sécurité HTTP | ✅ helmet (CSP de l'API désactivée) |
| Journalisation | ✅ Structurée, sans fuite d'objets bruts |
| Dépendances à jour | 🟡 Auditées le 2026-10-19 ; DOMPurify corrigé, Express / Vue / Vite à mettre à jour |
| URL Auth0 en dur | ✅ Corrigée le 2026-10-19 |
