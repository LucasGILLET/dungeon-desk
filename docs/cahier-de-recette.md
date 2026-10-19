# Cahier de recette — Dungeon Desk

> **Mise à jour du 2026-10-19** — version en préparation (branche
> `feat/srd-database`). Les scénarios de juillet sont conservés avec leur
> statut actualisé ; les scénarios SC-05 à SC-07 sont retirés avec la
> fonctionnalité qu'ils testaient ; SC-23 à SC-37 couvrent les nouveautés
> (fiche de personnage, bestiaire, règles, documentation, campagnes,
> back-office).

## Méthodologie

Chaque scénario ci-dessous précise :
- les **préconditions** et les **étapes** à suivre,
- le **résultat attendu**,
- le **résultat obtenu** et **comment il a été vérifié** (test automatisé cité avec son fichier, ou vérification manuelle).

Légende du statut :

| Symbole | Signification |
|---|---|
| ✅ | Conforme, couvert par un test automatisé qui passe (rejoué à chaque CI) |
| 🟡 | Conforme, vérifié manuellement (pas encore automatisé, ou automatisé hors CI) |
| ⬜ | Non vérifié — à exécuter avant la prochaine mise en production |
| ➖ | Retiré (fonctionnalité supprimée) |

## Sommaire

| ID | Scénario | Statut |
|---|---|---|
| SC-01 | Inscription via Auth0 | 🟡 |
| SC-02 | Connexion via Auth0 | 🟡 |
| SC-03 | Accès à une route protégée sans être connecté | 🟡 |
| SC-04 | Déconnexion | 🟡 |
| SC-05 | API interne — inscription (cas nominal) | ➖ |
| SC-06 | API interne — inscription avec email déjà utilisé | ➖ |
| SC-07 | API interne — connexion avec mot de passe invalide | ➖ |
| SC-08 | Créateur de personnage — parcours complet (8 étapes) | 🟡 |
| SC-09 | Créateur de personnage — sélection au clavier | ✅ |
| SC-10 | Créateur de personnage — respect du budget de 27 points | ✅ |
| SC-11 | Modification d'un personnage existant | 🟡 |
| SC-12 | Isolation des données entre utilisateurs | ✅ |
| SC-13 | Liste des sorts — recherche texte | ✅ |
| SC-14 | Liste des sorts — filtre par niveau | ✅ |
| SC-15 | Liste des sorts — réinitialisation des filtres | ✅ |
| SC-16 | Consultation du détail d'un sort | ⬜ |
| SC-17 | Génération d'un PNJ | ✅ |
| SC-18 | Aide de combat — détail d'une action | ✅ |
| SC-19 | Tableau de bord MJ sans être connecté | 🟡 |
| SC-20 | API — accès sans token | 🟡 |
| SC-21 | API — identifiant de ressource invalide | 🟡 |
| SC-22 | API — dépassement de la limite de requêtes | ⬜ |
| SC-23 | Fiche — montée de niveau (sous-classe, amélioration) | ✅ |
| SC-24 | Fiche — ressources, dégâts et sauvegarde automatique | ✅ |
| SC-25 | Fiche — capacités obtenues par un choix | 🟡 |
| SC-26 | Règles — multiclassage sans les caractéristiques requises | ✅ |
| SC-27 | Bestiaire — recherche, filtres et fiche | 🟡 |
| SC-28 | Objets magiques — variantes et tableaux | 🟡 |
| SC-29 | Règles du SRD — navigation et texte nettoyé | 🟡 |
| SC-30 | Documentation — pages publiées et aperçu d'un brouillon | ✅ |
| SC-31 | Campagne — ce que voit un joueur | ✅ |
| SC-32 | Campagne — invitation et adhésion | 🟡 |
| SC-33 | Campagne — rechargement de la page | ✅ |
| SC-34 | Campagne — le MJ consulte la fiche d'un joueur | 🟡 |
| SC-35 | Campagne — difficulté d'une rencontre | ✅ |
| SC-36 | Back-office — rédaction d'une page par un rédacteur | 🟡 |
| SC-37 | Données — migrations et seed sur une base vierge | 🟡 |

---

## A. Authentification

### SC-01 — Inscription via Auth0
**Préconditions** : utilisateur non connecté.
**Étapes** :
1. Cliquer sur "Rejoignez l'Aventure" (menu) ou aller sur `/register`.
2. Compléter le formulaire Auth0 (redirection externe).
3. Revenir sur l'application.

**Résultat attendu** : l'utilisateur est redirigé vers Auth0 (`screen_hint: signup`), puis revient authentifié sur l'application ; un utilisateur est créé/synchronisé en base via `authMiddleware.ts` à sa première requête protégée.
**Résultat obtenu** : 🟡 Vérifié manuellement lors du développement. Non automatisé — un flux Auth0 réel nécessite un compte de test dédié et sort du périmètre de Vitest/Playwright sans configuration supplémentaire (mock OAuth).

### SC-02 — Connexion via Auth0
**Préconditions** : compte existant.
**Étapes** : cliquer sur "Connexion" → `authStore.login()` → redirection Auth0.
**Résultat attendu** : retour sur l'application avec `isAuthenticated = true`.
**Résultat obtenu** : 🟡 Vérifié manuellement, en dernier par l'utilisateur du projet le 2026-10-19 lors de ses tests des campagnes. Non automatisé (même limite que SC-01).

### SC-03 — Accès à une route protégée sans être connecté
**Étapes** : sans être authentifié, appeler directement `GET /api/characters` (et `GET /api/campaigns`).
**Résultat attendu** : `401 Unauthorized`.
**Résultat obtenu** : 🟡 Vérifié le 2026-10-19 (`curl` sur l'API locale : 401 sans jeton et avec un jeton invalide, sur les personnages et les campagnes). Les tests automatisés remplacent le middleware d'authentification par un faux : ils ne couvrent pas ce cas.

### SC-04 — Déconnexion
**Étapes** : utilisateur connecté clique sur "Se déconnecter" (`authStore.logout()`).
**Résultat attendu** : session Auth0 invalidée, retour à l'état non-connecté.
**Résultat obtenu** : 🟡 Vérifié manuellement lors du développement. Non automatisé.

### SC-05 à SC-07 — API interne (inscription, email déjà utilisé, mot de passe invalide)
**Résultat obtenu** : ➖ **Retirés le 2026-10-19** avec les routes `/api/auth/register` et `/api/auth/login`, qui n'étaient plus appelées par le front (seconde surface d'authentification signalée en juillet). Vérifié après suppression : ces routes répondent 404. Voir [securite.md](./securite.md).

---

## B. Créateur de personnage

### SC-08 — Parcours complet de création (8 étapes)
**Préconditions** : utilisateur connecté, sur `/character-creator`.
**Étapes** : Race → Sous-race → Classe → Historique → Caractéristiques → Sous-classe → Choix → Résumé → Sauvegarde.
**Résultat attendu** : à chaque étape, le bouton "Suivant" reste désactivé tant qu'un choix requis n'est pas fait ; l'étape « Choix » liste ce que la race, la classe et l'historique demandent ; le personnage est sauvegardé et s'ouvre sur sa fiche.
**Résultat obtenu** : 🟡 Parcours exécuté manuellement en octobre par l'utilisateur du projet (moine, magicien, rôdeur), ce qui a révélé plusieurs bogues corrigés depuis (voir [plan-correction-bogues.md](./plan-correction-bogues.md)). L'étape 1 est couverte par un test E2E (`e2e/vue.spec.ts`, rejoué en local le 2026-10-19) et par `StepRace.spec.ts`. Pas de parcours E2E complet jusqu'à la sauvegarde.

### SC-09 — Sélection au clavier (accessibilité)
**Étapes** : atteindre une carte de race au clavier (Tab), appuyer sur Entrée.
**Résultat attendu** : la carte est sélectionnée (`aria-pressed="true"`), le bouton "Suivant" s'active.
**Résultat obtenu** : ✅ Couvert par `StepRace.spec.ts` ("also selects a race via the keyboard (Enter key)").

### SC-10 — Respect du budget de 27 points
**Étapes** : répartir les points de caractéristiques jusqu'à n'avoir plus qu'1 point restant alors qu'une caractéristique est à 13 (le palier 13→14 coûte 2 points) ; cliquer sur "Augmenter".
**Résultat attendu** : le bouton est désactivé, le compteur ne doit jamais devenir négatif.
**Résultat obtenu** : ✅ Couvert par `StepAbilities.spec.ts` ("never lets the total spent points exceed the 27-point budget"). Le budget et les coûts viennent désormais de l'édition en base ; le serveur vérifie aussi la méthode de génération (`characterRules.test.ts`, "should check ability score generation methods").

### SC-11 — Modification d'un personnage existant
**Étapes** : ouvrir un personnage, le modifier (dégâts, objet, montée de niveau, ou « Modifier la création »), recharger la fiche.
**Résultat attendu** : les modifications sont enregistrées et retrouvées après rechargement.
**Résultat obtenu** : 🟡 La sauvegarde automatique depuis la fiche est testée (`CharacterSheet.spec.ts`, "saves damage automatically, in the exchange format") et le serveur refuse un personnage mal formé sans écrire en base (`characters.test.ts`). La relecture après rechargement a été vérifiée manuellement (montées de niveau du rôdeur, octobre 2026). Le bogue de juillet sur les colonnes `race`/`class` n'a plus d'objet : le personnage n'est plus stocké en JSON.

### SC-12 — Isolation des données entre utilisateurs
**Étapes** : utilisateur A crée un personnage ; utilisateur B tente `GET /api/characters/{id du personnage de A}`, puis de le supprimer.
**Résultat attendu** : `404 Not Found` (aucune fuite d'information sur l'existence de la ressource), aucune suppression.
**Résultat obtenu** : ✅ Couvert par `characters.test.ts` ("should return 404 for a character of another user", "should only delete the characters of the user") et `npcs.test.ts` ("only deletes the NPCs of the user").

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
**Résultat attendu** : navigation vers `/sort/:index`, affichage des détails complets (école, niveau, description, classes).
**Résultat obtenu** : ⬜ Non automatisé (`SortView.vue` n'a aucun test dédié) — à exécuter manuellement.

---

## D. Autres fonctionnalités

### SC-17 — Génération d'un PNJ
**Étapes** : aller sur `/npc-generator`, attendre que "Générer" soit actif, cliquer.
**Résultat attendu** : un PNJ est généré avec profession et personnalité affichées.
**Résultat obtenu** : ✅ La génération (nom selon la race, tirage pondéré, profil physique) est couverte par `npcGenerator.spec.ts`. Le test E2E (`e2e/vue.spec.ts`) a été rejoué le 2026-10-19 en local : il a révélé que le bouton ne faisait rien si on cliquait avant le chargement des tables (corrigé, voir [plan-correction-bogues.md](./plan-correction-bogues.md)).

### SC-18 — Aide de combat, détail d'une action
**Étapes** : sur `/combat-cheat-sheet`, ouvrir la tuile Action, puis « Attaquer », puis revenir.
**Résultat attendu** : le détail s'affiche, la séquence d'attaque s'ouvre depuis sa carte, "Retour" referme.
**Résultat obtenu** : ✅ Couvert par `guides.spec.ts` ("shows the tiles from the guide and opens a detail section from a card") ; test E2E rejoué en local le 2026-10-19.

### SC-19 — Tableau de bord MJ sans être connecté
**Étapes** : aller sur `/gm-dashboard` sans être connecté.
**Résultat attendu** : la page invite à se connecter (bouton "Se connecter").
**Résultat obtenu** : 🟡 Couvert par le test E2E (`e2e/vue.spec.ts`, réécrit le 2026-10-19 : la page « en construction » a été remplacée par le tableau de bord des campagnes) ; rejoué en local, pas en CI.

---

## E. Sécurité et robustesse de l'API

### SC-20 — Accès sans token
**Étapes** : `GET /api/characters` sans en-tête `Authorization`.
**Résultat attendu** : `401 Unauthorized`.
**Résultat obtenu** : 🟡 Vérifié le 2026-10-19 (voir SC-03, même vérification).

### SC-21 — Identifiant de ressource invalide
**Étapes** : `GET /api/characters/abc` (id non numérique) avec un token valide.
**Résultat attendu** : `400 Invalid id parameter` (middleware `validateIdParam`).
**Résultat obtenu** : 🟡 Le middleware est en place et son code vérifié ; non rejoué avec un token Auth0 valide (sans token, la requête s'arrête à `401` avant la validation, ce qui est l'ordre attendu).

### SC-22 — Dépassement de la limite de requêtes
**Étapes** : envoyer plus de 1000 requêtes en 15 minutes depuis la même IP.
**Résultat attendu** : `429` avec le message "Trop de requêtes, veuillez réessayer plus tard."
**Résultat obtenu** : ⬜ Non vérifié. Protection en place dans `app.ts` (`express-rate-limit`, fenêtre 15 min, max 1000/IP depuis que le créateur interroge l'API à chaque étape).

---

## F. Fiche de personnage et règles

### SC-23 — Montée de niveau
**Étapes** : sur la fiche d'un personnage de niveau 2, « Monter de niveau » jusqu'au niveau 4.
**Résultat attendu** : la fenêtre liste ce que le niveau apporte, propose les PV moyens, demande la sous-classe au niveau 3 et une amélioration de caractéristique ou un don au niveau 4.
**Résultat obtenu** : ✅ Couvert par `CharacterSheet.spec.ts` ("levels up with the average hit points and asks for the subclass at level 3", "asks for an ability score improvement or a feat at level 4", "shows what the new level brings, even without a choice to make").

### SC-24 — Ressources, dégâts et sauvegarde automatique
**Étapes** : dépenser une utilisation de capacité, infliger des dégâts.
**Résultat attendu** : les compteurs changent et sont enregistrés sans action supplémentaire.
**Résultat obtenu** : ✅ Couvert par `CharacterSheet.spec.ts` ("spends a limited use and saves it", "saves damage automatically, in the exchange format").

### SC-25 — Capacités obtenues par un choix
**Étapes** : rôdeur de niveau 3 ayant choisi « Tueur de colosses » (Proie du chasseur) et un style de combat ; ouvrir sa fiche.
**Résultat attendu** : les deux capacités choisies figurent dans la liste des capacités.
**Résultat obtenu** : 🟡 Bogue signalé par l'utilisateur le 2026-10-19, corrigé le jour même ; fiche recalculée sur le personnage réel (les deux capacités sont renvoyées par l'API). Pas de test automatisé dédié.

### SC-26 — Multiclassage sans les caractéristiques requises
**Étapes** : envoyer un personnage qui prend un niveau dans une seconde classe sans les valeurs minimales.
**Résultat attendu** : refus, avec le chemin de l'erreur.
**Résultat obtenu** : ✅ Couvert par `characterRules.test.ts` ("should refuse a multiclass without the ability scores", "should multiclass when the requirements are met").

---

## G. Consultation des données de jeu

### SC-27 — Bestiaire
**Étapes** : sur `/bestiary`, chercher « liche », filtrer par type ; ouvrir la fiche.
**Résultat attendu** : la liste se filtre ; la fiche affiche le bloc de statistiques complet, l'incantation avec des liens vers les sorts.
**Résultat obtenu** : 🟡 Vérifié dans un navigateur le 2026-10-19 (liche, vampire et ses formes). La mise en forme (CA, PV, vitesses en mètres, alignements, résistances) est couverte par `monsterFormat.spec.ts`, et l'analyse des blocs de statistiques au seed par `monsterImport.test.ts`.

### SC-28 — Objets magiques
**Étapes** : ouvrir « Arme, +1, +2 ou +3 », puis « Submersible de Kwalish ».
**Résultat attendu** : variantes listées avec leur rareté ; tableau affiché en tableau.
**Résultat obtenu** : 🟡 Vérifié dans un navigateur le 2026-10-19. Le découpage des tableaux est couvert par `monsterFormat.spec.ts` (`parseRichText`). Certaines lignes de tableau sont mal découpées dans la source française du SRD (lacune de traduction, pas du rendu).

### SC-29 — Règles du SRD
**Étapes** : sur `/rules`, ouvrir « Taux de change standard », puis section suivante.
**Résultat attendu** : texte et tableau affichés, navigation précédent / suivant ; aucun script exécuté depuis le texte.
**Résultat obtenu** : 🟡 Navigation vérifiée dans un navigateur le 2026-10-19. Le nettoyage du HTML (script et `onerror` retirés) est couvert par `guides.spec.ts` (✅).

### SC-30 — Documentation : pages publiées et brouillon
**Étapes** : ouvrir `/documentation` ; ouvrir une page non publiée par son lien (`?section=…`).
**Résultat attendu** : le menu ne liste que les pages publiées (sans l'aide-mémoire de combat) ; la page non publiée s'ouvre avec un bandeau « Brouillon ».
**Résultat obtenu** : ✅ Couvert par `documentation.spec.ts`.

---

## H. Campagnes

### SC-31 — Ce que voit un joueur
**Étapes** : un joueur membre ouvre la campagne.
**Résultat attendu** : onglets Présentation, Séances, Quêtes seulement ; résumés de séance sans les notes du MJ ; seules les quêtes révélées ; pas de lien d'invitation.
**Résultat obtenu** : ✅ Couvert côté API par `campaigns.test.ts` ("hides GM notes, invite code, NPCs and encounters from a player", "returns 404 to a user outside the campaign and 403 to a player who edits it") et côté interface par `campaign.spec.ts`.

### SC-32 — Invitation et adhésion
**Étapes** : le MJ copie le lien d'invitation ; un second compte l'ouvre sans être connecté, se connecte, choisit un personnage, rejoint ; le MJ régénère le lien.
**Résultat attendu** : retour sur la page d'invitation après connexion, adhésion avec un personnage du joueur seulement, ancien lien invalide après régénération.
**Résultat obtenu** : 🟡 Règles couvertes par `campaigns.test.ts` ("joins with an invitation using one of the user's own characters", "refuses that the game master joins their own campaign") ; parcours complet de l'API vérifié de bout en bout sur la base locale le 2026-10-19 (création, invitation, adhésion, lien régénéré, départ, suppression). **Parcours dans l'interface à deux comptes Auth0 : ⬜ à exécuter.**

### SC-33 — Rechargement d'une page de campagne
**Étapes** : sur `/campaigns/5`, recharger la page (ou coller l'adresse).
**Résultat attendu** : la campagne s'affiche (les anciennes adresses en français redirigent).
**Résultat obtenu** : ✅ Couvert par `router.spec.ts`, écrit avec le correctif d'un bogue signalé par l'utilisateur (page blanche au rechargement).

### SC-34 — Le MJ consulte la fiche d'un joueur
**Étapes** : le MJ clique sur le personnage d'un joueur dans la présentation.
**Résultat attendu** : la fiche s'ouvre en lecture seule ; toute modification est refusée par l'API.
**Résultat obtenu** : 🟡 Vérifié de bout en bout sur l'API le 2026-10-19 (lecture : `access: "GAME_MASTER"` ; modification : 404). Affichage en lecture seule vérifié par l'utilisateur ; pas de test automatisé de l'interface.

### SC-35 — Difficulté d'une rencontre
**Étapes** : ajouter 4 gobelins à une rencontre d'une campagne dont le joueur a un personnage de niveau 6.
**Résultat attendu** : XP 200, multiplicateur ×2,5 (un seul personnage), XP ajustée 500, difficulté « facile » (seuils du Guide du maître 2014).
**Résultat obtenu** : ✅ Règles couvertes par `campaigns.test.ts` ("applies the multiplier for the number of monsters and the party size") ; ce cas précis a été vérifié sur la base locale le 2026-10-19.

---

## I. Back-office et données

### SC-36 — Rédaction d'une page par un rédacteur
**Étapes** : avec un compte « Rédacteur de la documentation » dans Directus, créer une page, une partie et une carte, puis la voir dans l'application.
**Résultat attendu** : aucun champ technique à remplir, l'identifiant de la page est tiré du titre, la page apparaît dans le menu de la documentation.
**Résultat obtenu** : 🟡 Exécuté le 2026-10-19 avec un compte de test : deux bogues trouvés et corrigés en cours de route (voir [plan-correction-bogues.md](./plan-correction-bogues.md)), puis page « L'économie » créée et affichée. Pas de test automatisé de Directus.

### SC-37 — Migrations et seed sur une base vierge
**Étapes** : sur une base vide, `npx prisma migrate deploy` puis `npx prisma db seed`, deux fois.
**Résultat attendu** : toutes les migrations s'appliquent, aucune différence entre le schéma et les migrations, le seed importe les données de jeu, et le second passage ne crée pas de doublon.
**Résultat obtenu** : 🟡 Exécuté le 2026-10-19 : 15 migrations appliquées, aucune dérive (`prisma migrate diff --exit-code`), seed en 76 s, second passage identique. Pas encore dans la CI.

---

## Synthèse pour le jury

- **15 scénarios (✅)** sont couverts par des tests automatisés qui s'exécutent à chaque CI (148 tests au total), rejoués avec succès le 2026-10-19.
- **17 scénarios (🟡)** ont été vérifiés manuellement, ou par des tests qui ne tournent pas en CI (E2E), mais ne sont pas encore automatisés en CI.
- **2 scénarios (⬜)** restent à exécuter avant la prochaine mise en production (SC-16, SC-22), ainsi que le **parcours à deux comptes de SC-32**.
- **3 scénarios (➖)** sont retirés avec l'authentification locale.

Priorités avant la mise en production de cette version : SC-32 dans
l'interface (deux comptes), SC-08 de bout en bout, puis SC-16 et SC-22.
