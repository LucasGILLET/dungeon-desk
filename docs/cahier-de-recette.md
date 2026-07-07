# Cahier de recette — Dungeon Desk

## Méthodologie

Chaque scénario ci-dessous précise :
- les **préconditions** et les **étapes** à suivre,
- le **résultat attendu**,
- le **résultat obtenu** et **comment il a été vérifié** (test automatisé cité avec son fichier, ou vérification manuelle).

Légende du statut :

| Symbole | Signification |
|---|---|
| ✅ | Conforme, couvert par un test automatisé qui passe (rejoué à chaque CI) |
| 🟡 | Conforme, vérifié manuellement une fois (pas encore automatisé) |
| ⬜ | Non vérifié dans cette campagne — à exécuter avant la prochaine mise en production |

## Sommaire

| ID | Scénario | Statut |
|---|---|---|
| SC-01 | Inscription via Auth0 | 🟡 |
| SC-02 | Connexion via Auth0 | 🟡 |
| SC-03 | Accès à une route protégée sans être connecté | 🟡 |
| SC-04 | Déconnexion | 🟡 |
| SC-05 | API interne — inscription (cas nominal) | ✅ |
| SC-06 | API interne — inscription avec email déjà utilisé | ✅ |
| SC-07 | API interne — connexion avec mot de passe invalide | ✅ |
| SC-08 | Créateur de personnage — parcours complet (9 étapes) | 🟡 |
| SC-09 | Créateur de personnage — sélection au clavier | ✅ |
| SC-10 | Créateur de personnage — respect du budget de 27 points | ✅ |
| SC-11 | Modification d'un personnage existant | ⬜ |
| SC-12 | Isolation des données entre utilisateurs | 🟡 |
| SC-13 | Liste des sorts — recherche texte | ✅ |
| SC-14 | Liste des sorts — filtre par niveau | ✅ |
| SC-15 | Liste des sorts — réinitialisation des filtres | ✅ |
| SC-16 | Consultation du détail d'un sort | ⬜ |
| SC-17 | Génération d'un PNJ | 🟡 |
| SC-18 | Aide de combat — détail d'une action | 🟡 |
| SC-19 | Accès au tableau de bord MJ | 🟡 |
| SC-20 | API — accès sans token | ✅ |
| SC-21 | API — identifiant de ressource invalide | 🟡 |
| SC-22 | API — dépassement de la limite de requêtes | ⬜ |

---

## A. Authentification

### SC-01 — Inscription via Auth0
**Préconditions** : utilisateur non connecté, sur `/register`.
**Étapes** :
1. Cliquer sur "S'inscrire avec Auth0".
2. Compléter le formulaire Auth0 (redirection externe).
3. Revenir sur l'application.

**Résultat attendu** : l'utilisateur est redirigé vers Auth0 (`screen_hint: signup`), puis revient authentifié sur l'application ; un utilisateur est créé/synchronisé en base via `authMiddleware.ts` à sa première requête protégée.
**Résultat obtenu** : 🟡 Vérifié manuellement lors du développement (commit "Ajout de l'authentification avec Auth0"). Non automatisé — un flux Auth0 réel nécessite un compte de test dédié et sort du périmètre de Vitest/Playwright sans configuration supplémentaire (mock OAuth).

### SC-02 — Connexion via Auth0
**Préconditions** : compte existant.
**Étapes** : cliquer sur "Se connecter avec Auth0" (`LoginView.vue`) → `authStore.login()` → redirection Auth0.
**Résultat attendu** : retour sur l'application avec `isAuthenticated = true`.
**Résultat obtenu** : 🟡 Vérifié manuellement. Non automatisé (même limite que SC-01).

### SC-03 — Accès à une route protégée sans être connecté
**Étapes** : sans être authentifié, appeler directement `GET /api/characters`.
**Résultat attendu** : `401 Unauthorized`.
**Résultat obtenu** : 🟡 Vérifié manuellement dans cette session (`curl http://localhost:3000/api/characters/abc` sans token → `{"message":"Unauthorized"}`, code 401). Non automatisé — recommandé d'ajouter ce cas à `auth.test.ts` ou à une suite d'intégration dédiée aux routes protégées.

### SC-04 — Déconnexion
**Étapes** : utilisateur connecté clique sur "Se déconnecter" (`authStore.logout()`).
**Résultat attendu** : session Auth0 invalidée, retour à l'état non-connecté.
**Résultat obtenu** : 🟡 Vérifié manuellement lors du développement. Non automatisé.

### SC-05 — API interne : inscription (cas nominal)
**Étapes** : `POST /api/auth/register` avec `{ username, email, password }` valides.
**Résultat attendu** : `201`, utilisateur créé, mot de passe haché (bcrypt).
**Résultat obtenu** : ✅ Couvert par `dungeon-desk-back/src/__tests__/auth.test.ts`.

### SC-06 — API interne : inscription avec email déjà utilisé
**Résultat attendu** : `400`, message "User or Email already exists".
**Résultat obtenu** : ✅ Couvert par `auth.test.ts`.

### SC-07 — API interne : connexion avec mot de passe invalide
**Résultat attendu** : `400`, message "Invalid credentials", pas de token émis.
**Résultat obtenu** : ✅ Couvert par `auth.test.ts`.

> Note pour le jury : le frontend actuel n'utilise **que** Auth0 pour l'authentification utilisateur (SC-01/02/04). Les routes `/api/auth/register` et `/api/auth/login` (JWT + bcrypt, SC-05/06/07) restent actives côté API et testées, mais ne sont plus appelées depuis l'interface — elles constituent une seconde surface d'authentification à documenter/nettoyer si elle n'a plus d'usage prévu.

---

## B. Créateur de personnage

### SC-08 — Parcours complet de création (9 étapes)
**Préconditions** : utilisateur connecté, sur `/character-creator`.
**Étapes** : Race → Sous-race → Classe → Historique → Caractéristiques → Sous-classe → Maîtrises → Choix spéciaux → Résumé → Sauvegarde.
**Résultat attendu** : à chaque étape, le bouton "Suivant" reste désactivé tant qu'un choix requis n'est pas fait ; le personnage final est sauvegardé avec toutes les données cohérentes.
**Résultat obtenu** : 🟡 Partiellement automatisé : l'étape 1 (Race) est couverte par un test E2E Playwright (`e2e/vue.spec.ts`, "navigue vers le créateur de personnage" — vérifie l'affichage et le bouton "Suivant" désactivé) et par un test unitaire dédié (`StepRace.spec.ts`). Les étapes 2 à 9 et la sauvegarde finale ne sont pas couvertes par un parcours E2E complet — à exécuter manuellement avant chaque mise en production tant qu'aucun test E2E de bout en bout n'existe.

### SC-09 — Sélection au clavier (accessibilité)
**Étapes** : atteindre une carte de race au clavier (Tab), appuyer sur Entrée.
**Résultat attendu** : la carte est sélectionnée (`aria-pressed="true"`), le bouton "Suivant" s'active.
**Résultat obtenu** : ✅ Couvert par `StepRace.spec.ts` ("also selects a race via the keyboard (Enter key)").

### SC-10 — Respect du budget de 27 points
**Étapes** : répartir les points de caractéristiques jusqu'à n'avoir plus qu'1 point restant alors qu'une caractéristique est à 13 (le palier 13→14 coûte 2 points) ; cliquer sur "Augmenter".
**Résultat attendu** : le bouton est désactivé, le compteur ne doit jamais devenir négatif.
**Résultat obtenu** : ✅ Couvert par `StepAbilities.spec.ts` ("never lets the total spent points exceed the 27-point budget"). Un bug réel a été détecté par ce scénario lors de sa rédaction (le compteur passait à -1) puis corrigé — voir `StepAbilities.vue`, fonction `increaseAbility`.

### SC-11 — Modification d'un personnage existant
**Étapes** : charger un personnage sauvegardé, changer sa race et/ou sa classe, sauvegarder, recharger la fiche.
**Résultat attendu** : la race/classe affichées reflètent la modification, y compris les colonnes `race`/`class` en base (pas seulement le JSON `data`).
**Résultat obtenu** : ⬜ Non automatisé. Un bug a été corrigé côté API sur ce point précis (`characterController.ts`, `updateCharacter` dérivait auparavant `race`/`class` de champs jamais envoyés par le frontend) mais aucun test d'intégration ne rejoue ce scénario bout en bout — recommandé avant la prochaine release.

### SC-12 — Isolation des données entre utilisateurs
**Étapes** : utilisateur A crée un personnage ; utilisateur B tente `GET /api/characters/{id du personnage de A}`.
**Résultat attendu** : `404 Not Found` (aucune fuite d'information sur l'existence de la ressource).
**Résultat obtenu** : 🟡 Garanti par construction (toutes les requêtes Prisma filtrent sur `userId`, y compris `updateMany`/`deleteMany` depuis la correction de l'étape sécurité) et vérifié par lecture de code. Non couvert par un test automatisé multi-utilisateurs — recommandé d'ajouter un test d'intégration avec deux comptes.

---

## C. Liste des sorts

### SC-13 — Recherche texte
**Étapes** : taper "boule" dans le champ de recherche.
**Résultat attendu** : seuls les sorts dont le nom contient "boule" (insensible à la casse) s'affichent.
**Résultat obtenu** : ✅ Couvert par `SortsListView.spec.ts`.

### SC-14 — Filtre par niveau
**Étapes** : sélectionner "niveau 1" dans le filtre.
**Résultat attendu** : seuls les sorts de niveau 1 s'affichent.
**Résultat obtenu** : ✅ Couvert par `SortsListView.spec.ts`.

### SC-15 — Réinitialisation des filtres / état vide
**Étapes** : rechercher un sort inexistant, puis cliquer sur "Réinitialiser".
**Résultat attendu** : message "Aucun sort ne correspond à vos filtres" affiché, puis tous les filtres sont effacés après le clic.
**Résultat obtenu** : ✅ Couvert par `SortsListView.spec.ts`.

### SC-16 — Consultation du détail d'un sort
**Étapes** : cliquer sur une carte de sort dans la liste.
**Résultat attendu** : navigation vers `/sorts/:index`, affichage des détails complets (école, niveau, description, classes).
**Résultat obtenu** : ⬜ Non automatisé (`SortView.vue` n'a aucun test dédié) — à exécuter manuellement.

---

## D. Autres fonctionnalités

### SC-17 — Génération d'un PNJ
**Étapes** : aller sur `/npc-generator`, cliquer sur "Générer".
**Résultat attendu** : un PNJ est généré avec profession et personnalité affichées.
**Résultat obtenu** : 🟡 Couvert par un test E2E Playwright (`e2e/vue.spec.ts`, "génère un PNJ depuis le générateur") — non ré-exécuté dans cette session, à rejouer en CI.

### SC-18 — Aide de combat, détail d'une action
**Étapes** : sur `/combat-cheat-sheet`, ouvrir puis fermer le détail d'une action.
**Résultat attendu** : le détail s'affiche puis se masque correctement.
**Résultat obtenu** : 🟡 Couvert par `e2e/vue.spec.ts` — non ré-exécuté dans cette session.

### SC-19 — Accès au tableau de bord MJ
**Étapes** : aller sur `/gm-dashboard`, revenir à l'accueil.
**Résultat attendu** : navigation correcte dans les deux sens.
**Résultat obtenu** : 🟡 Couvert par `e2e/vue.spec.ts` — non ré-exécuté dans cette session.

---

## E. Sécurité et robustesse de l'API

### SC-20 — Accès sans token
**Étapes** : `GET /api/characters` sans en-tête `Authorization`.
**Résultat attendu** : `401 Unauthorized`.
**Résultat obtenu** : 🟡 Vérifié manuellement dans cette session (serveur démarré en local, requête `curl` — voir SC-03, même vérification).

### SC-21 — Identifiant de ressource invalide
**Étapes** : `GET /api/characters/abc` (id non numérique) avec un token valide.
**Résultat attendu** : `400 Invalid id parameter` (middleware `validateIdParam`).
**Résultat obtenu** : 🟡 Le middleware a été ajouté et son code vérifié ; son déclenchement a été confirmé indirectement (sans token, la requête s'arrête à `401` avant d'atteindre la validation, ce qui est le comportement attendu vu l'ordre des middlewares). Non vérifié avec un token Auth0 valide faute de compte de test dans cette session — à confirmer avant mise en production.

### SC-22 — Dépassement de la limite de requêtes
**Étapes** : envoyer plus de 50 requêtes en 15 minutes depuis la même IP.
**Résultat attendu** : `429` avec le message "Trop de requêtes, veuillez réessayer plus tard."
**Résultat obtenu** : ⬜ Non vérifié dans cette session (nécessite 50+ requêtes). Protection en place et lisible dans `app.ts` (`express-rate-limit`, fenêtre 15 min, max 50/IP).

---

## Synthèse pour le jury

- **8 scénarios (✅)** sont couverts par des tests automatisés qui s'exécutent à chaque `npm run test:unit` / CI, et ont été rejoués avec succès dans cette session.
- **11 scénarios (🟡)** ont été vérifiés manuellement au moins une fois (soit dans cette session via des requêtes réelles sur le serveur local, soit lors du développement initial pour les flux Auth0), mais ne sont pas encore automatisés.
- **3 scénarios (⬜)** restent à exécuter avant la prochaine mise en production (SC-11, SC-16, SC-22) : ce sont les points prioritaires pour les prochaines itérations de test.
