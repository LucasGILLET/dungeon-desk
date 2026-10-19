# Actions d'accessibilité

> **Mise à jour du 2026-10-19** : section sur les pages ajoutées depuis la
> 1.0.0. L'audit de juillet (créateur de personnage) reste valable.

Périmètre de cette campagne : le créateur de personnage
(`src/components/CreateCharacterSteps/`), identifié comme le point le plus
urgent lors de l'audit initial (aucune action d'accessibilité n'avait été
faite avant le 2026-07-07). Les autres pages n'ont pas été auditées dans
cette campagne — voir la section "Hors périmètre" en fin de document.

## Constat initial (avant correction)

- `index.html` : `<html lang="">` — attribut vide.
- Cartes de sélection (race, sous-race, classe, sous-classe, historique,
  compétences, choix spéciaux) : `<div @click="...">` sans `role`, sans
  `tabindex`, sans gestion clavier — **impossible de créer un personnage au
  clavier ou avec un lecteur d'écran**, sur la fonctionnalité la plus
  visible du site.
- `StepSummary.vue` : champ de saisie du nom du personnage sans `<label>`
  (seulement un `placeholder`), focus visible faible (juste un changement de
  couleur de bordure).
- Boutons +/- des caractéristiques (`StepAbilities.vue`) : icônes SVG sans
  texte ni `aria-label` — aucun nom accessible.
- `App.vue` : contenu principal dans un `<div>`, pas de `<main>`.

## Corrections apportées (2026-07-07, commits `09fff19` et `5c1cd3b`)

### Navigation clavier sur les cartes de sélection
Appliqué sur **7 composants** : `StepRace.vue`, `StepClass.vue` (2 grilles),
`StepBackground.vue`, `StepSubrace.vue`, `StepSubclass.vue`,
`StepSpecialChoices.vue`, `StepProficiencies.vue`. Pattern uniforme :

```vue
role="button"
tabindex="0"
:aria-pressed="selectedX?.index === item.index"
:aria-label="`Choisir la race ${translateRaceName(race.name)}`"
@click="selectedX = item"
@keydown.enter="selectedX = item"
@keydown.space.prevent="selectedX = item"
class="... focus-visible:outline-2 focus-visible:outline-amber-500 focus-visible:outline-offset-2"
```

Pour les options qui peuvent être indisponibles (`StepSpecialChoices.vue`,
`StepProficiencies.vue`), `tabindex="-1"` et `aria-disabled="true"` quand
l'option n'est pas sélectionnable, pour la sortir de l'ordre de tabulation.

**Vérifié par test automatisé** : `StepRace.spec.ts` teste explicitement la
sélection au clavier (`@keydown.enter`) et vérifie `aria-pressed`.

### Formulaire
- `index.html` : `lang="fr"`.
- `StepSummary.vue` : `<label for="character-name" class="sr-only">Nom du
  personnage</label>` ajouté (invisible visuellement, lu par les lecteurs
  d'écran), focus renforcé avec `focus-visible:ring-2`.
- `StepAbilities.vue` : `aria-label="Augmenter/Diminuer {nom de la
  caractéristique}"` ajouté sur les boutons +/- (découvert en écrivant les
  tests : sans nom accessible, impossible de cibler ces boutons de façon
  fiable, et un lecteur d'écran ne pouvait pas dire à quoi ils servaient).

### Structure sémantique
`App.vue` : le conteneur principal (`<div class="bg-zinc-950 pt-20">
<RouterView /></div>`) est devenu `<main>`.

## Pages ajoutées en octobre 2026 (version en préparation)

Les pages créées depuis la 1.0.0 (fiche de personnage, bestiaire, objets
magiques, règles, campagnes, profil) n'ont **pas fait l'objet d'un audit
dédié**. Ce qui y est fait, relevé dans le code le 2026-10-19 :

- **Formulaires** : champs associés à un `<label>` (filtres du bestiaire et
  des objets magiques, formulaires de campagne, de séance, de quête, de
  rencontre, inventaire, notes des PNJ) ; champs sans libellé visible
  (recherche de monstre, lien d'invitation) avec un `aria-label`.
- **Navigation** : onglets de la campagne et du profil, sommaire des
  règles signalent l'élément courant (`aria-current="page"`) ; le sommaire
  des règles est un `<nav aria-label="Sommaire des règles">`.
- **Fenêtres** : la montée de niveau et le détail d'un PNJ sont des
  `role="dialog"` avec `aria-modal="true"` et un bouton de fermeture
  nommé. **Pas de piège de focus ni de fermeture par `Échap`** (seul le
  lanceur de dés gère `Échap`).
- **Boutons d'icône** (🗑️, ×) : nom accessible par `aria-label`
  (« Supprimer Test moine »).
- **Images** du bestiaire : texte alternatif (nom de la créature), et
  chargement annoncé (`role="status"`).
- **Fiche en lecture seule** (MJ) : un `<fieldset disabled>` désactive tous
  les contrôles, y compris pour le clavier et les lecteurs d'écran.

## Hors périmètre — non traité

- **`ProficiencyBadge.vue`** : les badges de compétences/langues affichent
  une info-bulle uniquement au survol (`group-hover/tooltip:opacity-100`),
  sans équivalent clavier/lecteur d'écran. Non corrigé (le nom reste visible
  en texte, seule la description complémentaire est inaccessible sans
  souris) — repéré mais laissé de côté pour rester dans le périmètre validé.
- **Modales de détails** (`RaceDetailsModal.vue`, `SubraceDetailsModal.vue`,
  `ClassDetailsModal.vue`) : le bouton de fermeture est un vrai `<button>`
  (donc déjà accessible au clavier), mais aucune vérification n'a été faite
  sur le piège de focus (`focus trap`) à l'ouverture ni sur la fermeture via
  `Échap`.
- **Contrastes de couleurs** : évalués uniquement par lecture qualitative de
  la palette Tailwind (zinc/amber) dans le code, pas de calcul de ratio réel
  (aucun outil type axe-core ou Lighthouse exécuté).
- **Autres vues** (`HomeView`, `SortsListView`, `SortView`, `NPCGenerator`,
  `CombatCheatSheetView`, `GMDashboard`, `DocumentationView`, et les pages
  ajoutées en octobre 2026) : non auditées, la campagne de juillet portant
  spécifiquement sur le créateur de personnage à la demande explicite du
  projet.
- **Aucun outil automatisé d'accessibilité** (axe-core, `eslint-plugin-vuejs-accessibility`)
  n'est intégré à la CI — les vérifications faites ici sont manuelles
  (lecture de code) ou couvertes par des tests de comportement (clic/clavier),
  pas par un audit WCAG outillé.
- **Aucun test avec un lecteur d'écran réel** (NVDA, VoiceOver, JAWS) n'a été
  effectué — seule la présence des attributs ARIA a été vérifiée.

## Synthèse

| Élément | Statut |
|---|---|
| `lang` du document | ✅ Corrigé |
| Navigation clavier des cartes (créateur de personnage) | ✅ Corrigé sur 7 composants, testé |
| Labels de formulaire (créateur de personnage) | ✅ Corrigé |
| Focus visible | ✅ Renforcé |
| Structure sémantique (`<main>`) | ✅ Corrigé (niveau applicatif uniquement) |
| Tooltips au clavier | ⬜ Non traité |
| Focus trap des modales | ⬜ Non vérifié |
| Contrastes (mesure réelle) | ⬜ Non mesurés (évaluation qualitative seulement) |
| Autres pages que le créateur de personnage | ⬜ Non auditées ; bonnes pratiques appliquées aux pages d'octobre 2026 (libellés, `aria-current`, `role="dialog"`), sans vérification outillée |
| Fenêtres de dialogue (focus, `Échap`) | ⬜ Pas de piège de focus ni de fermeture au clavier |
