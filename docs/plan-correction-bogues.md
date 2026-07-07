# Plan de correction des bogues

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

## Bugs identifiés, non corrigés (hors périmètre de cette session)

Pour rester traçable même sur ce qui n'a pas été traité :

- **URL Auth0 en dur** dans `authMiddleware.ts` (au lieu de
  `process.env.AUTH0_ISSUER`) — repéré, non corrigé (voir
  [securite.md](./securite.md)).
- **Duplication des stores `character.ts`/`app.ts`** côté frontend — voir
  [architecture-logicielle.md](./architecture-logicielle.md). Pas un bug au
  sens strict (rien n'est cassé), mais une source probable de bugs futurs
  si les deux stores continuent à diverger.
- **2 vulnérabilités de dépendances pertinentes en production**
  (`express-rate-limit`, `path-to-regexp`) — voir
  [criteres-qualite-performance.md](./criteres-qualite-performance.md).

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

**Amélioration identifiée pour la suite** : les cas 2 et 3 montrent que les
bugs trouvés par relecture manuelle, sans test, restent le point faible du
processus — la prochaine étape logique est d'ajouter les tests
d'intégration listés comme ⬜/🟡 dans le
[cahier de recette](./cahier-de-recette.md) (SC-11, SC-12, SC-16, SC-22)
pour transformer ces vérifications ponctuelles en garde-fous permanents.
