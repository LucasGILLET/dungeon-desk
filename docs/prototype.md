# Présentation du prototype : le créateur de personnage

## Pourquoi ce prototype

Le créateur de personnage (`/character-creator`,
`src/components/CreateCharacterSteps/`) est la fonctionnalité la plus
complexe et la plus visible du site : c'est le seul écran qui combine à la
fois de l'ergonomie multi-étapes, des données métier riches (règles D&D
5e), une isolation de sécurité par utilisateur, et — après cette campagne —
un vrai travail d'accessibilité et de tests. C'est pour ça qu'il sert de fil
rouge dans plusieurs documents de ce dossier
([cahier-de-recette.md](./cahier-de-recette.md),
[accessibilite.md](./accessibilite.md),
[plan-correction-bogues.md](./plan-correction-bogues.md)) plutôt que d'être
traité une seule fois isolément.

## Parcours (9 étapes)

`[CAPTURE ÉCRAN : étape 1 - Race]`

1. **Race** — cartes illustrées, une par race du SRD.
2. **Sous-race** — étape sautée automatiquement si la race n'en propose pas.

`[CAPTURE ÉCRAN : étape 3 - Classe]`

3. **Classe** — martiales et magiques, triées par difficulté pour un
   débutant (indicateur Facile/Moyen/Difficile visible sur chaque carte).
4. **Historique** (background).

`[CAPTURE ÉCRAN : étape 5 - Caractéristiques, avec le compteur de points visible]`

5. **Caractéristiques** — répartition de 27 points (système de point-buy
   D&D 5e), avec calcul du coût en temps réel.
6. **Sous-classe** (si applicable).
7. **Maîtrises**.
8. **Choix spéciaux**.

`[CAPTURE ÉCRAN : étape 9 - Résumé, avant sauvegarde]`

9. **Résumé** — nom du personnage, sauvegarde.

Détail complet de chaque étape dans
[manuel-utilisation.md](./manuel-utilisation.md).

## Choix d'ergonomie

- **Cartes sélectionnables plutôt que des listes déroulantes** pour les
  choix visuellement riches (race, classe, historique, sous-classe) : plus
  lisible pour un public débutant qui découvre les options, avec image et
  description visibles directement plutôt que cachées dans un menu.
- **Bouton "Suivant" désactivé tant que l'étape n'est pas valide**
  (`:disable-next="!selectedRace"` dans `StepRace.vue`, même principe sur
  les 8 autres étapes) : empêche de progresser avec un choix incomplet,
  sans message d'erreur à lire — l'interface guide plutôt que de
  sanctionner après coup.
- **Onboarding interactif optionnel** (`useTutorial.ts`) : guide pas-à-pas
  proposé à la première visite, désactivable, réactivable étape par étape.
  Pensé pour un public débutant à D&D (l'objectif affiché du projet), pas
  seulement débutant en informatique.
- **Navigation clavier** (ajoutée le 2026-07-07, voir
  [accessibilite.md](./accessibilite.md)) : les cartes sont atteignables au
  `Tab` et activables au clavier (`Entrée`/`Espace`), avec un indicateur de
  focus visible — avant cette correction, la fonctionnalité phare du site
  était tout simplement impossible à utiliser sans souris.

`[CAPTURE ÉCRAN : focus clavier visible sur une carte de race, aria-pressed]`

## Sécurité du prototype

- Toute sauvegarde passe par une route authentifiée (`protect`,
  `authMiddleware.ts`) : impossible de créer un personnage sans être
  connecté.
- Les données envoyées sont validées côté serveur avec Zod
  (`createCharacterSchema`/`updateCharacterSchema`,
  `src/validators/characterValidator.ts`) avant tout accès base de données.
- Un personnage n'est visible/modifiable que par son propriétaire —
  toutes les requêtes Prisma filtrent par `userId` issu du token vérifié,
  jamais d'un identifiant fourni par le client (détail dans
  [securite.md](./securite.md)).

## Ce que ce prototype illustre pour les compétences attendues

| Compétence | Élément concret dans ce prototype |
|---|---|
| C2.2.1 (ergonomie, sécurité) | Cartes + validation progressive + auth obligatoire + isolation par `userId` |
| C2.2.2 (tests anti-régression) | `StepRace.spec.ts`, `StepAbilities.spec.ts` — dont un bug réel détecté et corrigé (budget de points, voir [plan-correction-bogues.md](./plan-correction-bogues.md)) |
| C2.2.3 (évolutivité, sécurisation, accessibilité) | Store/validators découplés (voir [architecture-logicielle.md](./architecture-logicielle.md)), Zod, navigation clavier ajoutée |
| C2.3.1 (cahier de recette) | 5 scénarios du cahier de recette (SC-08 à SC-12) portent directement sur ce prototype |

## Limite à assumer

Le chemin de sauvegarde réel de ce prototype passe par le store
`stores/app.ts` (`useAppStore`), pas par `stores/character.ts` malgré son
nom plus évident — voir la section "Limites connues" de
[architecture-logicielle.md](./architecture-logicielle.md). Ce n'est pas
un défaut fonctionnel (les deux stores appellent la même API), mais une
duplication à clarifier.
