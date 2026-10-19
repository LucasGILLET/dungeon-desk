# Changelog

Toutes les versions notables de ce projet sont documentées dans ce fichier.

Le format s'inspire de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
et ce projet suit le [Semantic Versioning](https://semver.org/lang/fr/).

> Les versions antérieures à 1.0.0 ont été reconstituées a posteriori à partir
> de l'historique Git (aucun tag n'existait avant juillet 2026) afin de
> documenter l'évolution du projet pour le dossier de certification.

## [Non publié]

Données de jeu lues depuis l'API (branche `feat/srd-database`).

### Ajouté
- Bestiaire et objets magiques (listes filtrables, fiches complètes).
- Règles du SRD (`/rules`), documentation et aide-mémoire de combat lus
  depuis la base, rendu Markdown nettoyé par DOMPurify.
- Fiche de personnage dédiée : montée de niveau, inventaire, sorts,
  compteurs de ressources ; lecture seule pour le MJ d'une campagne.
- Tableau de bord MJ et pages de campagne (séances, quêtes, PNJ,
  rencontres), invitation des joueurs par lien.
- Profil : onglet Campagnes, détail et notes des PNJ, suppression des
  personnages, recherche.
- `.env.example`.

### Modifié
- Créateur de personnage piloté par l'API (choix, aperçu calculé par le
  back).
- Pages chargées à la demande : le fichier JS principal passe de 1,76 Mo à
  0,95 Mo.
- Le bouton « Générer » du générateur de PNJ attend le chargement des
  tables (il ne faisait rien si on cliquait trop tôt).

### Sécurité
- DOMPurify 3.2.6 → 3.4.16 (contournements connus jusqu'à 3.4.15, signalés
  par `npm audit`).
- Vue 3.5.32 → 3.5.43 et Vite 7.3.2 → 7.3.6 (avec `esbuild` 0.28.2,
  `postcss` 8.5.28, `nanoid` 3.3.19, `source-map-js` 1.2.2) : corrige les
  7 vulnérabilités de production signalées par `npm audit` (XSS du rendu
  serveur de Vue, contournement de `server.fs.deny` de Vite sous Windows…),
  sans changement de version majeure.

### Documentation
- Dossier `docs/` mis à jour pour cette version : architecture, frameworks,
  prototype, manuels, sécurité, qualité, accessibilité, plan de correction
  des bogues (bogues d'octobre), cahier de recette (SC-23 à SC-37).

### Supprimé
- `public/data` (8 Mo de JSON du SRD), données et descriptions codées en
  dur, `stores/app.ts`, code et dépendances inutilisés
  (`express-oauth2-jwt-bearer`, `three`, `@types/three`).

## [1.0.0] - 2026-07-07

Version de référence pour la certification RNCP39583 : accessibilité du
créateur de personnage, harnais de tests anti-régression, durcissement
sécurité et intégration continue avec porte qualité.

### Ajouté
- Tests unitaires sur le créateur de personnage (store, étapes Race et
  Caractéristiques) et sur le filtrage de la liste des sorts (29 tests).
- Cahier de recette (22 scénarios documentés).
- Porte qualité (type-check + tests) obligatoire avant tout déploiement.

### Modifié
- Navigation clavier et lecteur d'écran sur les 7 étapes du créateur de
  personnage à sélection par cartes (`role="button"`, `aria-pressed`,
  gestion clavier), labels de formulaire, `lang="fr"`, structure sémantique.

### Corrigé
- Le budget de 27 points du système de caractéristiques pouvait être
  dépassé (le palier 13→14 coûte 2 points, seul un point restant était
  vérifié).

### Supprimé
- `netlify.toml`, reliquat inutilisé d'une tentative de déploiement
  temporaire (le déploiement réel se fait sur Azure Static Web Apps).

## [0.6.0] - 2026-05-19

### Ajouté
- Liste et pages de détail des sorts, avec traductions complètes du SRD.

### Corrigé
- Affichage du nom des écoles de magie, bonus de caractéristiques des
  demi-elfes.

## [0.5.0] - 2026-04-30

### Ajouté
- Zone de documentation.

### Modifié
- Logo, barre de navigation, responsivité générale.

## [0.4.0] - 2026-04-08

### Ajouté
- Génération de fiche de personnage en PDF.
- Lanceur de dés.
- Première suite de tests unitaires et end-to-end (Vitest / Playwright).

### Modifié
- Client API généré via Orval + Vue Query, refactorisation du type
  `Character`, onboarding du créateur de personnage.

## [0.3.0] - 2026-02-27

### Ajouté
- Authentification via Auth0.
- Déploiement continu sur Azure Static Web Apps.

## [0.2.0] - 2026-02-08

### Ajouté
- Connexion, générateur de PNJ, tableau de bord MJ, aide de combat.
- Modification des personnages sauvegardés.

## [0.1.0] - 2025-10-10

### Ajouté
- Socle initial du projet (Vue 3 + Vite + Tailwind).
- Première version du créateur de personnage (choix de race, classe,
  sous-classes de niveau 1).
