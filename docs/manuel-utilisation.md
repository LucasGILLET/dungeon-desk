# Manuel d'utilisation

Guide des fonctionnalités réelles de Dungeon Desk, organisé par route
(`src/router/index.ts`). Les noms de route entre parenthèses permettent de
retrouver le composant correspondant dans le code.

## Page d'accueil (`/`, `home`)

Point d'entrée avec accès direct aux fonctionnalités principales : Créer un
Personnage, Aide de Combat, Générateur de PNJ, Tableau de Bord MJ (liens
vérifiés présents par le test E2E `e2e/vue.spec.ts`).

## Inscription et connexion (`/register`, `/login`)

L'authentification se fait **exclusivement via Auth0** (redirection externe) :
1. Cliquer sur "S'inscrire avec Auth0" (`/register`) ou "Se connecter avec
   Auth0" (`/login`).
2. Compléter le formulaire sur la page Auth0.
3. Retour automatique sur l'application, connecté.

À la première connexion, un compte local est créé automatiquement en base
(synchronisation par e-mail, voir `authMiddleware.ts`) — aucune inscription
manuelle séparée n'est nécessaire côté application.

## Créateur de personnage (`/character-creator`, `character-creator`)

Parcours en **9 étapes**, navigation "Précédent"/"Suivant" en bas de page
(le bouton "Suivant" reste désactivé tant que l'étape n'est pas complétée) :

1. **Race** — sélection parmi les races du SRD (cartes illustrées,
   navigables au clavier).
2. **Sous-race** — si la race choisie en propose (sinon l'étape est passée
   automatiquement).
3. **Classe** — classes martiales et magiques, triées par difficulté.
4. **Historique** (background) — détermine 2 compétences maîtrisées de base.
5. **Caractéristiques** — répartition de **27 points** entre les 6
   caractéristiques (Force, Dextérité, Constitution, Intelligence, Sagesse,
   Charisme) via les boutons +/-. Le coût augmente au-delà de 13
   (13→14 et 14→15 coûtent chacun 2 points, pas 1). Un bouton "Aléatoire"
   répartit automatiquement les points, un bouton "Réinitialiser" remet tout
   à 8.
6. **Sous-classe** — uniquement si la classe choisie impose un choix dès le
   niveau 1 (ex. Clerc, Sorcier) ; sinon l'étape est passée.
7. **Maîtrises** — compétences, langues et outils supplémentaires selon la
   race/classe/historique choisis.
8. **Choix spéciaux** — spécificités de certaines classes/races (style de
   combat, ennemi juré, ascendance draconique...).
9. **Résumé** — nom du personnage (champ obligatoire), récapitulatif complet,
   sauvegarde.

Un onboarding interactif (guides pas-à-pas) est proposé à la première
visite ; il peut être réactivé étape par étape via le bouton d'aide (icône
"?") en haut de chaque étape.

### Modifier un personnage existant
Accessible depuis `/character/:id` (lien "Voir"/"Modifier" sur la fiche
personnage, `ProfileView.vue`) — réutilise le même composant
`CharacterCreator` en mode édition plutôt qu'un formulaire séparé.

## Profil (`/profile`, `profile`)

Liste des personnages et PNJ créés par l'utilisateur connecté, avec accès
rapide pour en créer de nouveaux ou consulter/modifier les existants.

## Liste des sorts (`/sorts`, `sorts-list`)

Recherche par nom, filtres combinables par niveau, école de magie et classe.
Les filtres actifs sont conservés dans l'URL (paramètres de requête) et
restaurés à la navigation retour/avant du navigateur. Pagination (24 sorts
par page). Bouton "Réinitialiser" pour effacer tous les filtres d'un coup.

## Détail d'un sort (`/sort/:index`, `sort-view`)

Accessible en cliquant sur une carte depuis la liste des sorts.

## Générateur de PNJ (`/npc-generator`, `npc-generator`)

Génère un personnage non-joueur avec profession et traits de personnalité
en un clic ("Générer").

## Aide de combat (`/combat-cheat-sheet`, `combat-cheat-sheet`)

Fiche mémo des règles de combat (actions, bonus, mouvement, réactions...).
Cliquer sur une carte d'action affiche son détail ; "Retour" referme le
détail.

## Tableau de bord MJ (`/gm-dashboard`, `gm-dashboard`)

Zone dédiée au maître du jeu (fonctionnalités en cours de construction —
l'historique des commits indique une "Mise à jour de la page GM dashboard
(vide)" en février 2026). Un bouton permet de revenir à l'accueil.

## Documentation intégrée (`/documentation`, `documentation`)

Pages d'aide sur les races, classes, historiques et le combat, consultables
directement dans l'application (sommaire de navigation intégré).

## Lanceur de dés

Accessible depuis n'importe quelle page via le bouton flottant (icône dé) ou
le raccourci clavier `Ctrl+Maj+R`. Permet de lancer des formules de dés
classiques (ex. `2d6+3`).
