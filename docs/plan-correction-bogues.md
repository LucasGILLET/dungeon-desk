# Plan de correction des bogues

> **Mise à jour du 2026-10-19** : bogues trouvés et corrigés pendant le
> développement de la version en préparation (section « Campagne
> d'octobre 2026 »), et état actualisé des points restés ouverts en juillet.

## Bogues identifiés et corrigés

### 1. Compteur de points de caractéristiques pouvant devenir négatif

- **Comment détecté** : en écrivant un test unitaire ciblé sur le budget de
  27 points (`StepAbilities.spec.ts`). Le test encodait le comportement
  attendu (le bouton "Augmenter" doit se désactiver si le coût du prochain
  palier dépasse les points restants) et a **échoué** à l'exécution avant
  correction (`expected undefined to be defined` sur l'attribut `disabled`).
- **Impact** : `increaseAbility()` (`StepAbilities.vue`) ne vérifiait que
  `remainingPoints.value > 0`, alors que passer de 13 à 14 ou de 14 à 15
  coûte 2 points d'un coup (pas 1). Avec 1 point restant, un clic
  supplémentaire faisait passer le compteur à -1 **et** le bouton "Suivant"
  restait activé (`disable-next="remainingPoints > 0"`, faux dès que
  négatif) : un personnage pouvait être créé hors des règles du point-buy
  D&D 5e, sans qu'aucun message n'avertisse le joueur.
- **Correctif** : `increaseAbility()` calcule désormais le coût marginal
  réel (`getAbilityPointCost(value + 1) - getAbilityPointCost(value)`) et
  refuse l'action si ce coût dépasse les points restants ; le `:disabled`
  du bouton applique la même règle (auparavant il ne vérifiait que
  `remainingPoints <= 0`, un bouton visuellement actif mais sans effet).
- **Commit** : `5c1cd3b` (`dungeon-desk-front`).
- **Vérification** : le test qui avait détecté le bug est resté dans la
  suite (`StepAbilities.spec.ts`, "never lets the total spent points
  exceed the 27-point budget") — il passe désormais et rejouera
  automatiquement à chaque CI si la régression revient. 49 tests frontend
  rejoués avec succès après correction.

### 2. Données de race/classe périmées après modification d'un personnage

- **Comment détecté** : lecture de code pendant la correction de sécurité
  du `PUT /characters/:id` (ajout de la validation Zod manquante,
  `characterController.ts`), pas par un test automatisé — **aucun test
  n'existait sur cette route avant le 2026-07-07**.
- **Impact** : `updateCharacter` dérivait les colonnes `race`/`class` de
  `req.body.race`/`req.body.class`, des champs que le frontend n'envoie
  jamais (`toCharacterCreateInput` n'envoie que `name`/`level`/`data`, voir
  [architecture-logicielle.md](./architecture-logicielle.md)). Résultat :
  modifier la race ou la classe d'un personnage existant via le créateur de
  personnage ne mettait **jamais** à jour ces colonnes en base — seul le
  JSON `data` restait à jour, créant une incohérence entre les colonnes et
  le contenu réel du personnage partout où le code lit `race`/`class`
  directement (listes, filtres SQL éventuels).
- **Correctif** : `race`/`class` sont désormais dérivés de
  `data.race.name`/`data.class.name`, exactement comme dans
  `createCharacter` (même logique, donc plus de divergence possible entre
  création et mise à jour).
- **Commit** : `524c851` (`dungeon-desk-back`).
- **Vérification** : ⬜ **non automatisée**. Aucun test d'intégration ne
  rejoue ce scénario bout en bout (`PUT` puis relecture des colonnes) —
  correction vérifiée uniquement par lecture de code. C'est le scénario
  SC-11 du [cahier de recette](./cahier-de-recette.md), marqué comme
  prioritaire pour la prochaine campagne de tests.

### 3. Isolation utilisateur incomplète (TOCTOU) sur `updateCharacter` et `deleteNpc`

- **Comment détecté** : relecture manuelle du code lors de l'audit de
  sécurité initial (pas par un test — aucun test multi-utilisateurs n'existe
  sur ces routes).
- **Impact** : les deux fonctions vérifiaient la propriété de la ressource
  avec un `findFirst({ where: { id, userId } })` séparé, puis exécutaient
  l'action (`update`/`delete`) en filtrant **seulement par `id`**, sans
  `userId`. Risque théorique de type "vérifier puis agir"
  (time-of-check-to-time-of-use) : dans un scénario concurrent, l'action
  finale ne réaffirmait pas l'appartenance. Aucune preuve que ce soit
  exploité en pratique, mais ce n'est pas une défense en profondeur
  correcte.
- **Correctif** : `updateCharacter` utilise `prisma.character.updateMany({
  where: { id, userId }, ... })` et `deleteNpc` utilise
  `prisma.npc.deleteMany({ where: { id, userId } })` — le filtre
  `userId` est maintenant appliqué **dans la requête qui modifie réellement
  la donnée**, pas seulement dans une vérification préalable.
- **Commit** : `524c851` (`dungeon-desk-back`).
- **Vérification** : 🟡 garantie par lecture de code (toutes les requêtes
  d'écriture Prisma sur `characters`/`npcs` filtrent maintenant par
  `userId` de façon uniforme) ; non couverte par un test automatisé
  multi-comptes. C'est le scénario SC-12 du cahier de recette.

## Campagne d'octobre 2026 (version en préparation)

Le passage des données de jeu en base et le nouveau modèle des personnages
ont été développés par itérations courtes, chacune testée par
l'utilisateur du projet avant la suivante. Les bogues ci-dessous ont été
trouvés de quatre façons, notées pour chacun : **test d'acceptation** par
l'utilisateur, **test automatisé** (écrit avant ou après le correctif),
**test E2E** rejoué, **mise en situation** (utiliser l'outil comme le
ferait un rédacteur).

| # | Bogue | Détecté par | Impact | Correctif | Vérification |
|---|---|---|---|---|---|
| 4 | Sous-races introuvables : le chargeur lisait un fichier français inexistant, le serveur renvoyait la page HTML | Test d'acceptation (« impossible de rouvrir mon personnage ») | Étape sous-race toujours sautée, réouverture d'un personnage impossible | `2fc86ae` (front) | Réouverture confirmée par l'utilisateur ; chargeur remplacé depuis par l'API |
| 5 | PV max du récapitulatif toujours calculés avec un d8 | Test d'acceptation (moine) | PV faux à la création | `21bffef` (front) | Valeur vérifiée par l'utilisateur ; calcul désormais fait par le moteur de règles du back (`characterRules.test.ts`) |
| 6 | Choix d'un historique qui changeait de nature au réimport des données (associés par position, pas par type) | Analyse du correctif du Sage | Un choix d'équipement pouvait devenir un choix de langue, en gardant son id référencé par des personnages | `d74581a` (back) | Seed relancé deux fois sur base vierge, ids stables |
| 7 | Liste de sorts vide sur la fiche d'un magicien | Test d'acceptation (capture d'écran) | Impossible d'ajouter un sort | `b48621e` (front) | Ajout de sort confirmé ; `SheetSpells.spec.ts` |
| 8 | Nom de sort français contenant du Markdown (« \*\*\*Dissipation de la magie.\*\*\* ») | Vérification visuelle d'une fiche de monstre | Nom affiché avec des astérisques | `bc92bfb` (back) | Recherche des autres noms concernés : aucun |
| 9 | Création d'un élément traduit depuis un autre impossible dans Directus (lien vers le parent marqué obligatoire) | Mise en situation (compte rédacteur) | Toute création imbriquée bloquée, sur toutes les collections | `0c9613e` (back) | Page complète créée dans Directus par le compte rédacteur |
| 10 | Remplissage automatique de Directus sans effet (résultat du script ignoré sans `return: $last`) | Mise en situation, puis test isolé du flow | Identifiants aléatoires au lieu d'un slug lisible | `0c9613e` (back) | Page créée : identifiant tiré du titre |
| 11 | Bouton « Générer » du générateur de PNJ inactif si cliqué avant le chargement des tables | Test E2E rejoué le 2026-10-19 | Un clic sans effet, sans message | `66817cc` (front) | Test E2E mis à jour (attend le bouton actif) et au vert |
| 12 | URL Auth0 écrite en dur (tenant de développement) | Audit avant mise en production | E-mail des nouveaux utilisateurs lu sur le mauvais tenant en production | `aa00909` (back) | Lecture de code ; variable présente en local et en CI |
| 13 | Page blanche au rechargement d'une campagne : motif `'/campagnes/:id(\d+)'` dont la barre oblique inverse disparaissait dans la chaîne | Test d'acceptation | Lien direct ou rechargement d'une campagne impossible | `ac15af6` (front) | `router.spec.ts` (résolution des adresses tapées directement), écrit avec le correctif |
| 14 | « Tueur de colosses » (option choisie) absent de la fiche : les sous-capacités étaient toujours masquées | Test d'acceptation (rôdeur niveau 3) | Capacités choisies invisibles (style de combat, ascendance draconique aussi) | `40903f5` (back), `ac15af6` (front) | Fiche recalculée sur le personnage réel : capacités présentes ; pas de test automatisé dédié |
| 15 | Blocs de la fiche collés (le `fieldset` de lecture seule perdait l'espacement) | Test d'acceptation (capture d'écran) | Mise en page | `ac15af6` (front) | Visuel |
| 16 | Aperçu des pages bloqué dans Directus (`ERR_BLOCKED_BY_CSP`) | Test d'acceptation (capture d'écran) | Bouton « Voir sur le site » inutilisable | `40903f5` (back) | En-tête vérifié ; cadre du front accepté, autre adresse refusée |

Ce que montre ce tableau :
- **Les tests d'acceptation de l'utilisateur ont trouvé la majorité des
  bogues visibles** (7 sur 13) : beaucoup tiennent à l'enchaînement réel
  des écrans (rechargement, données qui arrivent dans un ordre différent),
  que les tests unitaires, qui isolent un composant, ne voient pas.
- **Rejouer les tests E2E a payé immédiatement** (n° 11) alors qu'ils
  n'avaient pas tourné depuis juillet : c'est l'argument pour les mettre en
  CI.
- **Utiliser l'outil comme un rédacteur** a révélé deux bogues que personne
  n'aurait vus en restant administrateur (n° 9 et 10).

## Bugs identifiés, non corrigés

Pour rester traçable même sur ce qui n'a pas été traité :

- **Vulnérabilités de dépendances de production** (Express et ses
  dépendances, Vue, Vite) — voir [securite.md](./securite.md). Mise à jour
  à planifier comme un chantier à part.
- **Client des campagnes écrit à la main** au lieu du client Orval généré —
  pas un bogue, une divergence possible avec le contrat d'API.
- **Fenêtres de dialogue sans piège de focus ni fermeture par `Échap`** —
  voir [accessibilite.md](./accessibilite.md).

Points de juillet **résolus** depuis : URL Auth0 en dur (n° 12) ;
duplication des stores `character.ts` / `app.ts` (`app.ts` supprimé, les
personnages passent par un seul store et les campagnes par l'API).

## Processus de correction des bogues

Il n'y a **pas d'outil de ticketing formel** sur ce projet — le suivi de
tâches se fait sur un Trello personnel, pas un board partagé avec un
workflow de bug-tracking (colonnes priorité/sévérité, etc.). Le processus
réel, tel qu'appliqué dans cette session, est le suivant :

1. **Détection** : soit un test automatisé échoue (cas 1 ci-dessus — le cas
   le plus fiable, rejouable), soit une relecture manuelle de code révèle
   une incohérence pendant qu'on travaille sur une zone connexe (cas 2 et 3
   — dépend de l'attention portée au moment de la revue, moins
   systématique).
2. **Qualification de l'impact** : lecture du code appelant pour évaluer si
   le bug est exploitable/visible en usage normal (ex. cas 3 qualifié de
   "risque théorique" plutôt que de faille active, après vérification que
   Node/Express traite les requêtes de façon essentiellement séquentielle
   sur ce volume de trafic).
3. **Correctif ciblé** : un commit dédié par bug (pas mélangé avec d'autres
   changements), avec le "pourquoi" dans le message de commit, pas
   seulement le "quoi" — voir les 3 commits cités plus haut.
4. **Vérification** : quand un test peut encoder le bug (cas 1), il est
   écrit **avant** le correctif pour confirmer qu'il échoue, puis qu'il
   passe après — c'est la méthode la plus fiable, gardée dans la suite pour
   la suite du projet. Quand ce n'est pas fait (cas 2, 3), la limite est
   documentée explicitement plutôt que présentée comme testée.
5. **Priorisation** : en l'absence d'outil formel, la priorité a suivi les
   4 compétences éliminatoires de la certification (accessibilité et tests
   d'abord, sécurité ensuite) plutôt qu'une grille de sévérité
   business — un choix pragmatique pour cette session, pas nécessairement
   généralisable à un contexte d'équipe avec plusieurs parties prenantes.

**Ce qui a changé dans le processus en octobre** : chaque itération se
termine par un test d'acceptation de l'utilisateur, dont les retours
(souvent une capture d'écran) sont traités en lot ; un correctif
s'accompagne d'un test quand le bogue s'y prête (n° 13 : test du routeur
écrit avec le correctif). SC-12 (isolation entre utilisateurs) est
désormais couvert par des tests automatisés.

**Amélioration identifiée pour la suite** : exécuter les tests E2E en CI,
ajouter un test pour les capacités accordées par un choix (n° 14), et
automatiser les scénarios encore ⬜/🟡 du
[cahier de recette](./cahier-de-recette.md) (SC-11, SC-16, SC-22, parcours
connectés des campagnes).
