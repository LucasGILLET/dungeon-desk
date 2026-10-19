# Présentation du prototype : le créateur de personnage

> **Mise à jour du 2026-10-19** (version en préparation) : le créateur lit
> désormais les règles dans la base par l'API, passe de 9 à 8 étapes (les
> maîtrises et choix spéciaux sont regroupés dans une étape « Choix »
> pilotée par le serveur), et débouche sur une fiche de personnage dédiée.

## Pourquoi ce prototype

Le créateur de personnage (`/character-creator`,
`src/components/CreateCharacterSteps/`) est la fonctionnalité la plus
complexe et la plus visible du site : c'est le seul écran qui combine à la
fois de l'ergonomie multi-étapes, des données métier riches (règles D&D
5e), une isolation de sécurité par utilisateur, et un vrai travail
d'accessibilité et de tests. C'est pour ça qu'il sert de fil rouge dans
plusieurs documents de ce dossier
([cahier-de-recette.md](./cahier-de-recette.md),
[accessibilite.md](./accessibilite.md),
[plan-correction-bogues.md](./plan-correction-bogues.md)) plutôt que d'être
traité une seule fois isolément.

## Parcours (8 étapes)

`[CAPTURE ÉCRAN : étape 1 - Race]`

1. **Race** — cartes illustrées, une par race du SRD (et des races maison).
2. **Sous-race** — étape sautée automatiquement si la race n'en propose pas.

`[CAPTURE ÉCRAN : étape 3 - Classe]`

3. **Classe** — martiales et magiques, avec un indicateur de difficulté
   (Facile/Moyen/Difficile) et les caractéristiques recommandées, lus en
   base.
4. **Historique** (background).

`[CAPTURE ÉCRAN : étape 5 - Caractéristiques, avec le compteur de points visible]`

5. **Caractéristiques** — achat de points (budget et coûts définis par
   l'édition en base, 27 points en 2014), avec répartition aléatoire et
   remise à zéro.
6. **Sous-classe** (si la classe l'impose dès le niveau 1).
7. **Choix** — tout ce que la race, la classe et l'historique demandent de
   choisir (compétences, langues, équipement de départ, style de combat,
   ascendance draconique, sorts…). La liste vient du serveur
   (`POST /api/characters/preview`), qui décrit chaque choix et recalcule la
   fiche à chaque réponse.

`[CAPTURE ÉCRAN : étape 8 - Résumé, avant sauvegarde]`

8. **Résumé** — nom du personnage, récapitulatif (PV, CA, maîtrises),
   sauvegarde.

Après la sauvegarde, le personnage s'ouvre sur sa **fiche**
(`/character/:id`) : jets, PV, repos, emplacements de sorts, inventaire,
montée de niveau et multiclassage. Détail dans
[manuel-utilisation.md](./manuel-utilisation.md).

## Choix d'ergonomie

- **Cartes sélectionnables plutôt que des listes déroulantes** pour les
  choix visuellement riches (race, classe, historique, sous-classe) : plus
  lisible pour un public débutant qui découvre les options, avec image et
  description visibles directement plutôt que cachées dans un menu.
- **Bouton "Suivant" désactivé tant que l'étape n'est pas valide**
  (`:disable-next="!selectedRace"` dans `StepRace.vue`, même principe sur
  les autres étapes) : empêche de progresser avec un choix incomplet,
  sans message d'erreur à lire — l'interface guide plutôt que de
  sanctionner après coup.
- **Les règles restent côté serveur** : l'étape « Choix » n'encode aucune
  règle de classe ou de race dans le front ; elle affiche ce que le serveur
  décrit (combien en prendre, parmi quoi). Ajouter une sous-classe ou une
  race maison dans Directus la fait apparaître dans le créateur sans
  modifier le code.
- **Onboarding interactif optionnel** (`useTutorial.ts`) : guide pas-à-pas
  proposé à la première visite, désactivable, réactivable étape par étape.
  Pensé pour un public débutant à D&D (l'objectif affiché du projet), pas
  seulement débutant en informatique.
- **Navigation clavier** (ajoutée le 2026-07-07, voir
  [accessibilite.md](./accessibilite.md)) : les cartes sont atteignables au
  `Tab` et activables au clavier (`Entrée`/`Espace`), avec un indicateur de
  focus visible.

`[CAPTURE ÉCRAN : focus clavier visible sur une carte de race, aria-pressed]`

## Sécurité du prototype

- L'aperçu (`POST /api/characters/preview`) est public mais n'enregistre
  rien ; toute sauvegarde passe par une route authentifiée (`protect`,
  `authMiddleware.ts`) : impossible de créer un personnage sans être
  connecté.
- Les données envoyées sont validées côté serveur en deux temps : forme
  (Zod, `CharacterInputSchema`, `src/characters/input.ts`), puis règles
  (`analyse()`, `src/characters/rules.ts` : contenu existant dans
  l'édition, choix autorisés, sorts de la liste de classe…) avant tout
  accès en écriture à la base.
- Un personnage n'est visible/modifiable que par son propriétaire —
  toutes les requêtes Prisma filtrent par `userId` issu du token vérifié,
  jamais d'un identifiant fourni par le client. Seule exception, en lecture
  seule : le MJ d'une campagne peut consulter la fiche des personnages de
  ses joueurs (détail dans [securite.md](./securite.md)).

## Ce que ce prototype illustre pour les compétences attendues

| Compétence | Élément concret dans ce prototype |
|---|---|
| C2.2.1 (ergonomie, sécurité) | Cartes + validation progressive + auth obligatoire + isolation par `userId` |
| C2.2.2 (tests anti-régression) | `StepRace.spec.ts`, `StepAbilities.spec.ts`, `characterRules.test.ts` (moteur de règles), `CharacterSheet.spec.ts` (fiche et montée de niveau) — dont un bug réel détecté et corrigé (budget de points, voir [plan-correction-bogues.md](./plan-correction-bogues.md)) |
| C2.2.3 (évolutivité, sécurisation, accessibilité) | Règles en base et moteur côté serveur (voir [architecture-logicielle.md](./architecture-logicielle.md)), validation Zod + règles, navigation clavier |
| C2.3.1 (cahier de recette) | Scénarios SC-08 à SC-12 et SC-23 à SC-25 du cahier de recette |

## Limite à assumer

Le parcours complet (8 étapes puis sauvegarde) n'est pas rejoué par un test
de bout en bout : les étapes sont testées séparément (`StepRace`,
`StepAbilities`), le moteur de règles et la fiche aussi, mais aucun test
ne parcourt tout le créateur jusqu'à l'enregistrement. C'est le scénario
SC-08 du [cahier de recette](./cahier-de-recette.md), vérifié
manuellement.
