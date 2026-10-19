# Manuel d'utilisation

Guide des fonctionnalités réelles de Dungeon Desk, organisé par route
(`src/router/index.ts`). Les noms de route entre parenthèses permettent de
retrouver le composant correspondant dans le code.

> **Mise à jour du 2026-10-19** (version en préparation) : fiche de
> personnage, bestiaire, objets magiques, règles du SRD, campagnes et
> profil ajoutés ; créateur et documentation mis à jour.

## Page d'accueil (`/`, `home`)

Point d'entrée avec accès direct aux fonctionnalités principales : Créer un
Personnage, Aide de Combat, Générateur de PNJ, Tableau de Bord MJ (liens
vérifiés présents par le test E2E `e2e/vue.spec.ts`). Le menu du haut
regroupe les outils en trois familles : Apprendre DnD (documentation,
règles), Outils joueur, Outils MJ.

## Inscription et connexion (`/register`, `/login`)

L'authentification se fait **exclusivement via Auth0** (redirection externe) :
1. Cliquer sur "Connexion" ou "Rejoignez l'Aventure" (menu), ou sur les
   pages `/login` / `/register`.
2. Compléter le formulaire sur la page Auth0.
3. Retour automatique sur l'application, connecté — sur la page d'où l'on
   venait quand la connexion a été demandée par une page (invitation à une
   campagne, profil).

À la première connexion, un compte local est créé automatiquement en base
(synchronisation par e-mail, voir `authMiddleware.ts`) — aucune inscription
manuelle séparée n'est nécessaire côté application.

## Créateur de personnage (`/character-creator`, `character-creator`)

Parcours en **8 étapes**, navigation "Précédent"/"Suivant" en bas de page
(le bouton "Suivant" reste désactivé tant que l'étape n'est pas complétée) :

1. **Race** — sélection parmi les races (cartes illustrées, navigables au
   clavier).
2. **Sous-race** — si la race choisie en propose (sinon l'étape est passée
   automatiquement).
3. **Classe** — avec indicateur de difficulté et caractéristiques
   recommandées.
4. **Historique** (background).
5. **Caractéristiques** — achat de **27 points** entre les 6
   caractéristiques via les boutons +/-. Le coût augmente au-delà de 13
   (13→14 et 14→15 coûtent chacun 2 points). Un bouton "Aléatoire"
   répartit automatiquement les points, un bouton "Réinitialiser" remet tout
   à 8.
6. **Sous-classe** — uniquement si la classe choisie impose un choix dès le
   niveau 1 (ex. Clerc, Occultiste) ; sinon l'étape est passée.
7. **Choix** — tout ce qu'il reste à choisir selon la race, la classe et
   l'historique : compétences, langues, équipement de départ, style de
   combat, ascendance draconique, sorts… Chaque choix indique combien
   d'options prendre et ce que chacune apporte.
8. **Résumé** — nom du personnage (champ obligatoire), récapitulatif
   (points de vie, classe d'armure, maîtrises), sauvegarde.

Un onboarding interactif (guides pas-à-pas) est proposé à la première
visite ; il peut être réactivé étape par étape via le bouton d'aide (icône
"?") en haut de chaque étape.

### Modifier la création (`/character/:id/edit`, `character-edit`)
Depuis la fiche, « Modifier la création » rouvre le même créateur en mode
édition (race, classe, caractéristiques…).

## Fiche de personnage (`/character/:id`, `character-sheet`)

Ouverte depuis le profil ou après la sauvegarde d'un nouveau personnage.
Toute modification est enregistrée automatiquement (indicateur en haut à
droite).

- **Caractéristiques, sauvegardes, compétences** (avec maîtrise et
  expertise), perception passive, CA (avec le détail du calcul), initiative,
  vitesse.
- **Points de vie** : dégâts, soins, PV temporaires, jets contre la mort ;
  **dés de vie** à dépenser ; **repos court et repos long**, qui rendent ce
  qu'ils doivent rendre.
- **Ressources** des capacités (ki, rage, inspiration bardique…) à cocher,
  **emplacements de sorts** (multiclassage compris) et magie de pacte.
- **Capacités et traits** : ceux de la classe et de la race, et ceux
  obtenus par un choix (style de combat, « Tueur de colosses »…).
- **Sorts** connus et préparés, ajoutés depuis la liste de la classe.
- **Inventaire** : objets du catalogue ou objets libres, quantité, équipé,
  harmonisé, argent.
- **Monter de niveau** : choix de la classe (multiclassage possible si les
  caractéristiques le permettent), PV (moyenne ou jet), sous-classe,
  amélioration de caractéristique ou don, et liste de ce que le niveau
  apporte. « Compléter » reprend les choix laissés en attente.

Ouverte par le MJ d'une campagne (personnage d'un de ses joueurs), la fiche
est en **lecture seule** : bandeau bleu, aucun bouton actif.

## Profil (`/profile`, `profile`)

Trois onglets (l'onglet est conservé dans l'adresse, `?tab=npcs`) :
- **Personnages** — triés par dernière modification, avec les campagnes où
  ils jouent ; clic pour ouvrir la fiche, 🗑️ pour supprimer (confirmation).
- **PNJ** — clic pour le détail (caractéristiques, personnalité, histoire)
  et les **notes du MJ**, modifiables.
- **Campagnes** — celles que l'on mène et celles où l'on joue.

Une recherche apparaît à partir de 4 personnages ou PNJ. Sans être
connecté, la page invite à se connecter.

## Liste des sorts (`/sorts`, `sorts-list`)

Recherche par nom, filtres combinables par niveau, école de magie et classe.
Les filtres actifs sont conservés dans l'URL (paramètres de requête) et
restaurés à la navigation retour/avant du navigateur. Pagination (24 sorts
par page). Bouton "Réinitialiser" pour effacer tous les filtres d'un coup.

## Détail d'un sort (`/sort/:index`, `sort-view`)

Accessible en cliquant sur une carte depuis la liste des sorts, ou sur un
sort dans la fiche d'un monstre.

## Bestiaire (`/bestiary`, `bestiary` ; `/bestiary/:index`, `monster-view`)

334 créatures du SRD. Recherche, filtres par type, taille, plage de facteur
de puissance et créatures légendaires, tri par nom ou par FP ; filtres
conservés dans l'adresse. La fiche affiche le bloc de statistiques complet
(distances en mètres), les actions, l'incantation avec un lien vers chaque
sort, et les autres formes des métamorphes.

## Objets magiques (`/magic-items`, `magic-items` ; `/magic-items/:index`, `magic-item-view`)

362 objets. Filtres par rareté, catégorie et lien (harmonisation) ; les
variantes (« Arme, +1 ») sont regroupées sous leur objet générique. La
fiche affiche la description, les tableaux éventuels et les variantes.

## Règles du SRD (`/rules`, `rules`)

Texte des règles de base (SRD 5.1), en 6 chapitres et 33 sections :
sommaire à gauche, section affichée, boutons précédent / suivant. L'adresse
d'une section se partage (`/rules?section=cover`).

## Générateur de PNJ (`/npc-generator`, `npc-generator`)

Génère un personnage non-joueur (nom selon la race, profession, physique,
personnalité, histoire) en un clic ("Générer", actif une fois les tables
chargées). Race, classe et genre peuvent être imposés. "Sauvegarder"
l'ajoute au profil (connexion nécessaire).

## Aide de combat (`/combat-cheat-sheet`, `combat-cheat-sheet`)

Fiche mémo du tour de combat : action, mouvement, action bonus, autre,
réaction. Cliquer sur une tuile affiche son détail ; « Attaquer » ouvre la
séquence d'attaque ; les liens « Règle : … » mènent à la section des règles
correspondante ; "Retour" referme le détail.

## Tableau de bord MJ (`/gm-dashboard`, `gm-dashboard`)

Liste des campagnes que l'on mène et de celles où l'on joue, et création
d'une campagne (nom, thème, présentation). Sans être connecté, la page
invite à se connecter.

## Campagne (`/campaigns/:id`, `campaign`)

- **Présentation** : texte de la campagne, joueurs et leurs personnages.
  Le MJ copie le **lien d'invitation** (ou en génère un nouveau, l'ancien
  cessant de fonctionner) et peut retirer un joueur ; un joueur choisit le
  personnage qu'il joue ou quitte la campagne.
- **Séances** : journal (date, titre, résumé visible des joueurs, notes du
  MJ privées).
- **Quêtes** : statut, difficulté, récompense, donneur de quête ; une quête
  n'est visible des joueurs que si le MJ la révèle.
- **PNJ** (MJ seulement) : PNJ enregistrés rattachés à la campagne, avec
  rôle et lieu.
- **Rencontres** (MJ seulement) : monstres du bestiaire, difficulté
  calculée d'après le niveau des personnages (facile à mortelle) et XP.

## Rejoindre une campagne (`/campaigns/join/:code`, `join-campaign`)

Lien reçu du MJ. Après connexion, choisir le personnage que l'on y joue
(ou plus tard), puis « Rejoindre ». Le MJ pourra consulter la fiche de ce
personnage, sans la modifier.

## Documentation intégrée (`/documentation`, `documentation`)

Pages d'aide pour débutants (choix de classe, choix de race…) et lien vers
les règles du SRD, avec un sommaire de navigation. Les pages sont rédigées
dans Directus : une nouvelle page publiée apparaît dans le menu sans
modification du site.

## Lanceur de dés

Accessible depuis n'importe quelle page via le bouton flottant (icône dé) ou
le raccourci clavier `Ctrl+Maj+R`. Permet de lancer des formules de dés
classiques (ex. `2d6+3`).

## Back-office (Directus, pour les éditeurs)

Hors de l'application elle-même : Directus permet aux personnes ayant un
compte (rôles éditeur des données de jeu, traducteur, rédacteur de la
documentation) de corriger les données de jeu et d'écrire les pages de
documentation. Mode d'emploi de la configuration : `README.md` du dépôt
`dungeon-desk-back`.
