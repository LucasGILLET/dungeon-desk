# Frameworks et paradigmes de développement

Pour chaque choix technique : pourquoi (pas juste le nom), et un exemple
réel tiré du code — pas une description générique de la techno.

## Frontend

### Vue 3 — Composition API, `<script setup>`
**Pourquoi** : la logique d'un composant complexe comme
`StepAbilities.vue` (répartition de points, bonus raciaux, choix
demi-elfe) mélange plusieurs préoccupations ; la Composition API permet de
grouper le code par fonctionnalité plutôt que par type d'option (data,
methods, computed...), et `<script setup>` évite le boilerplate `export
default { setup() { return {...} } }`.
**Exemple réel** : tout le projet utilise exclusivement `<script setup
lang="ts">` — aucun composant en Options API. `StepAbilities.vue` illustre
bien l'intérêt : un `computed` (`remainingPoints`) recalculé à chaque
changement, consommé à la fois dans le template et dans la logique de
validation (`increaseAbility`), sans duplication.

### Pinia — gestion d'état global
**Pourquoi** : partager l'état d'authentification et les personnages entre
des vues qui n'ont pas de lien parent/enfant direct (`ProfileView.vue`,
`CharacterCreator.vue`, `App.vue`).
**4 stores réels** (`src/stores/`, tous en syntaxe "setup store" —
`defineStore('nom', () => {...})`, la forme Composition API de Pinia plutôt
que la forme "options") :

| Store | Rôle |
|---|---|
| `auth.ts` | Wrapper autour d'`@auth0/auth0-vue` (`useAuth0`) |
| `character.ts` | Lecture des personnages (`fetchCharacters`, `fetchCharacter`) |
| `app.ts` | État applicatif plus large (personnages en écriture, campagnes, quêtes, PNJ) |
| `npc.ts` | Gestion des PNJ |

**Limite assumée** : `character.ts` et `app.ts` se chevauchent
partiellement sur les personnages (voir
[architecture-logicielle.md](./architecture-logicielle.md)) — pas un choix
d'architecture voulu, une dette à corriger.

### Vite
**Pourquoi** : rechargement à chaud quasi instantané en développement
(important sur un projet avec autant de composants visuels à itérer), et
build de production optimisé (`npm run build-only`) sans configuration
webpack manuelle.

### TypeScript (mode strict)
**Pourquoi** : le modèle de données d'un personnage D&D est complexe
(race + sous-race + classe + sous-classe + choix spéciaux, chacun avec sa
propre forme) ; le typage attrape à la compilation des erreurs qui
seraient sinon découvertes à l'exécution (ex. `translateRaceName(race.name)`
échouerait silencieusement sur un `undefined`).
**Exemple réel** : `vue-tsc --build` fait partie de la porte qualité CI
(voir [protocole-cicd.md](./protocole-cicd.md)) — le déploiement échoue si
un type est incorrect, pas seulement les tests.

### Tailwind CSS
**Pourquoi** : cohérence visuelle rapide sur un grand nombre de composants
(palette `zinc`/`amber` réutilisée partout) sans maintenir de fichiers CSS
séparés par composant.

## Backend

### Express — architecture en couches (proche du MVC)
**Pourquoi** : séparer "qui a le droit d'appeler cette route"
(middleware), "la donnée envoyée est-elle valide" (validators), et "que
fait-on avec" (controllers) permet de modifier une couche sans toucher aux
autres — par exemple, ajouter la validation Zod sur `PUT /characters/:id`
le 2026-07-07 n'a rien changé côté routes ni côté middleware
d'authentification.
**Exemple réel** (`src/routes/characterRoutes.ts`) :
```ts
router.use(protect);                                  // middleware : authentification
router.put('/:id', validateIdParam, updateCharacter);  // validateIdParam (middleware) -> updateCharacter (controller, qui applique lui-même le schéma Zod)
```
Il n'y a pas de "modèle" au sens strict du MVC classique — Prisma Client
tient ce rôle (accès direct dans les contrôleurs, pas de couche
repository/DAO séparée). C'est un choix pragmatique pour la taille du
projet (3 modèles), pas un vrai pattern Repository.

### Prisma — ORM typé
**Pourquoi** : le client Prisma est généré depuis `prisma/schema.prisma`,
donc `prisma.character.findFirst({ where: { userId } })` est vérifié à la
compilation contre le schéma réel — une faute de frappe sur un nom de
colonne est une erreur TypeScript, pas un bug découvert en production.
**Exemple réel** : la correction de sécurité du 2026-07-07 (`updateMany`
avec `userId` dans le `where`, voir [securite.md](./securite.md)) a été
possible sans changer le schéma — Prisma expose directement les opérations
"safe" (`updateMany`/`deleteMany` avec filtre composé) sans SQL manuel.

### Zod — validation de schéma
**Pourquoi** : valider la forme des données **avant** qu'elles n'atteignent
Prisma, avec des messages d'erreur structurés renvoyés au client
(`result.error.format()`), plutôt que de laisser une erreur de contrainte
SQL remonter telle quelle.
**Exemple réel** (`src/validators/characterValidator.ts`) :
```ts
export const createCharacterSchema = z.object({
  name: z.string().min(1),
  level: z.number().int().min(1).max(20),
  data: CharacterDataSchema,
});

// Le frontend envoie toujours le personnage complet lors d'une mise à jour,
// donc le même schéma s'applique.
export const updateCharacterSchema = createCharacterSchema;
```
Réutiliser le schéma de création pour la mise à jour (plutôt que de le
dupliquer) garantit que les deux routes acceptent exactement les mêmes
données — une des corrections du 2026-07-07 (`PUT /characters/:id` n'avait
aucune validation avant).

## Contrat entre les deux mondes

Le frontend ne définit **aucun type d'API à la main** : Orval génère le
client TypeScript (`src/api/generated/`) depuis la spec OpenAPI exposée par
le backend (`swagger-jsdoc`, voir
[architecture-logicielle.md](./architecture-logicielle.md)). C'est le point
de couture entre les deux paradigmes (Composition API + Vue Query côté
front, Express + Prisma côté back) : un changement de schéma Zod côté
backend, documenté dans les annotations Swagger de la route, se répercute
dans les types du frontend après régénération (`npm run generate:api`).
