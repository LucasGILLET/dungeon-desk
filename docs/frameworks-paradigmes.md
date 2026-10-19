# Frameworks et paradigmes de développement

Pour chaque choix technique : pourquoi (pas juste le nom), et un exemple
réel tiré du code — pas une description générique de la techno.

> **Mise à jour du 2026-10-19** (version en préparation) : stores, exemples
> de validation et nouveaux outils (Directus, rendu Markdown) mis à jour.

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
validation (`increaseAbility`), sans duplication. Les composables
(`useCampaignItemForm.ts`) poussent la même idée plus loin : le
formulaire d'une séance, d'une quête, d'un PNJ ou d'une rencontre partage
la même logique d'ouverture, d'enregistrement et de suppression.

### Pinia — gestion d'état global
**Pourquoi** : partager l'état d'authentification et les personnages entre
des vues qui n'ont pas de lien parent/enfant direct (`ProfileView.vue`,
`CharacterCreator.vue`, `App.vue`).
**3 stores réels** (`src/stores/`, tous en syntaxe "setup store" —
`defineStore('nom', () => {...})`, la forme Composition API de Pinia plutôt
que la forme "options") :

| Store | Rôle |
|---|---|
| `auth.ts` | Wrapper autour d'`@auth0/auth0-vue` (`useAuth0`) |
| `character.ts` | Personnages : liste, lecture, création, mise à jour, suppression |
| `npc.ts` | PNJ : liste, sauvegarde depuis le générateur, notes, suppression |

Le store `app.ts` de la 1.0.0 (qui doublait `character.ts` et contenait des
campagnes non branchées) a été supprimé : les campagnes passent par l'API
(`src/api/campaigns.ts`).

### Vite
**Pourquoi** : rechargement à chaud quasi instantané en développement
(important sur un projet avec autant de composants visuels à itérer), et
build de production optimisé (`npm run build-only`) sans configuration
webpack manuelle. Les pages sont chargées à la demande
(`component: () => import(...)` dans le routeur) : le fichier JavaScript
principal est passé de 1,76 Mo à 0,95 Mo le 2026-10-19.

### TypeScript (mode strict)
**Pourquoi** : le modèle de données d'un personnage D&D est complexe
(race + sous-race + classes + sous-classes + choix, chacun avec sa propre
forme) ; le typage attrape à la compilation des erreurs qui seraient sinon
découvertes à l'exécution.
**Exemple réel** : `vue-tsc --build` fait partie de la porte qualité CI
(voir [protocole-cicd.md](./protocole-cicd.md)) — le déploiement échoue si
un type est incorrect, pas seulement les tests.

### Tailwind CSS
**Pourquoi** : cohérence visuelle rapide sur un grand nombre de composants
(palette `zinc`/`amber` réutilisée partout) sans maintenir de fichiers CSS
séparés par composant. Les couleurs d'accent des pages de documentation
sont rangées dans une table (`utils/guideAccent.ts`) écrite en classes
complètes, pour que Tailwind les détecte.

### Markdown : marked + DOMPurify
**Pourquoi** : les règles du SRD et les pages de documentation sont
rédigées en Markdown (dans Directus) ; `marked` les transforme en HTML et
**DOMPurify** retire tout ce qui pourrait exécuter du code avant
l'affichage (`v-html`) — un rédacteur ne peut pas injecter de script.
**Exemple réel** (`src/utils/markdown.ts`) :
```ts
export function renderMarkdown(text, options = {}) {
  if (!text) return ''
  const html = options.inline ? marked.parseInline(text, { async: false }) : marked.parse(text, { async: false })
  return DOMPurify.sanitize(html)
}
```
Testé par `guides.spec.ts` (une balise `<script>` et un attribut
`onerror` sont bien retirés).

## Backend

### Express — architecture en couches (proche du MVC)
**Pourquoi** : séparer "qui a le droit d'appeler cette route"
(middleware), "la donnée envoyée est-elle valide" (Zod), et "que fait-on
avec" (controllers) permet de modifier une couche sans toucher aux autres.
**Exemple réel** (`src/routes/characterRoutes.ts`) :
```ts
router.post('/preview', previewCharacter);            // aperçu public (créateur)
router.use(protect);                                  // middleware : authentification
router.put('/:id', validateIdParam, updateCharacter);  // validateIdParam (middleware) -> updateCharacter (controller)
```
Il n'y a pas de "modèle" au sens strict du MVC classique — Prisma Client
tient ce rôle. La logique métier la plus lourde (règles de construction
d'un personnage) est isolée dans `src/characters/rules.ts`, une fonction
pure `analyse(input, contexte)` qui ne touche pas la base : le contrôleur
charge le contexte (données de l'édition), appelle `analyse`, puis
enregistre.

### Prisma — ORM typé
**Pourquoi** : le client Prisma est généré depuis le schéma
(`prisma/schema/*.prisma`, un fichier par domaine), donc
`prisma.character.findFirst({ where: { id, userId } })` est vérifié à la
compilation contre le schéma réel — une faute de frappe sur un nom de
colonne est une erreur TypeScript, pas un bug découvert en production.
**Exemple réel** : les contraintes que Prisma ne sait pas exprimer
(« exactement une cible renseignée », bornes des caractéristiques) sont
écrites en SQL `CHECK` dans les migrations, et documentées dans
`docs/modelisation/conventions.md` du back.

### Zod — validation de schéma
**Pourquoi** : valider la forme des données **avant** qu'elles n'atteignent
Prisma, avec des messages d'erreur structurés renvoyés au client (chemin
et message de chaque problème), plutôt que de laisser une erreur de
contrainte SQL remonter telle quelle.
**Exemple réel** (`src/characters/input.ts`) :
```ts
export const CharacterInputSchema = z.object({
  edition: index.default('2014'),
  name: z.string().trim().min(1).max(100),
  race: index,
  // Dans l'ordre de prise : la première est la classe de départ
  classes: z.array(z.object({
    class: index,
    subclass: index.nullish(),
    levels: z.array(LevelSchema).min(1).max(20),
  })).min(1).max(20),
  // ...
});
```
Le même schéma sert à la création, à la mise à jour et à l'aperçu : Zod
vérifie la forme, puis le moteur de règles vérifie que le contenu existe et
respecte les règles (un sort hors de la liste de classe est refusé avec son
chemin, `spells[2].spell`).

### Directus — back-office sans code
**Pourquoi** : permettre de corriger les données de jeu, de traduire et
d'écrire des pages de documentation **sans développeur**, directement sur
la base. Directus lit le schéma existant : pas de second modèle à
maintenir.
**Exemple réel** : la configuration (menus, libellés français, formulaires,
rôles « éditeur », « traducteur », « rédacteur de la documentation ») est
un script versionné (`npm run directus:config`) plutôt que des réglages
faits à la main dans l'interface — reproductible sur une nouvelle instance.

## Contrat entre les deux mondes

Le frontend ne définit **pas de type d'API à la main** pour les routes
couvertes par Orval : il génère le client TypeScript (`src/api/generated/`)
depuis la spec OpenAPI exposée par le backend (`swagger-jsdoc`, voir
[architecture-logicielle.md](./architecture-logicielle.md)). C'est le point
de couture entre les deux paradigmes (Composition API + Vue Query côté
front, Express + Prisma côté back) : un changement côté backend, documenté
dans les annotations Swagger de la route, se répercute dans les types du
frontend après régénération (`npm run generate:api`). Exception à résorber :
le client des campagnes (`src/api/campaigns.ts`), écrit à la main.
