# Manuel de mise à jour

## Mettre à jour une dépendance

```bash
npm outdated                # liste les dépendances obsolètes
npm update <paquet>          # mise à jour mineure/patch (respecte package.json)
npm install <paquet>@latest   # mise à jour majeure (à faire consciemment, un par un)
```

Après toute mise à jour, avant de committer :
```bash
npm run type-check   # front : vue-tsc --build / back : npx tsc --noEmit
npm run test:unit -- --run   # front (Vitest)
npm test                      # back (Vitest)
```
Ces mêmes commandes sont rejouées par la CI (voir
[protocole-cicd.md](./protocole-cicd.md)) — un échec local est un échec en
CI, autant le détecter avant de pousser.

### Vulnérabilités connues (état au 2026-07-07)
`npm audit` sur `dungeon-desk-back` signale 21 vulnérabilités (voir détail
dans [securite.md](./securite.md) et
[criteres-qualite-performance.md](./criteres-qualite-performance.md)).
Deux sont pertinentes en production et non corrigées : `express-rate-limit`
et `path-to-regexp`. Avant de les mettre à jour :
```bash
npm audit                 # revoir l'état actuel, les correctifs disponibles évoluent
npm ls express-rate-limit  # vérifier si une mise à jour directe suffit ou si c'est transitif
```
Tester `npm test` + un test manuel du rate limiting après mise à jour (voir
scénario SC-22 du [cahier de recette](./cahier-de-recette.md), non automatisé).

## Créer une migration Prisma

Après modification de `dungeon-desk-back/prisma/schema.prisma` :
```bash
npx prisma migrate dev --name description_du_changement
```
Cela génère un dossier dans `prisma/migrations/` (à committer) et applique
la migration sur la base de développement locale (`docker-compose up -d`
doit tourner). **Ne jamais** utiliser `migrate dev` contre la base de
production — c'est `migrate deploy` qui s'en charge, automatiquement, dans
le pipeline CI (`deploy.yml`, étape "Run Database Migrations", exécutée
avant le build/déploiement de l'image).

Pour inspecter l'état de la base sans passer par du SQL brut :
```bash
npx prisma studio   # http://localhost:5555
```

## Monter de version (SemVer + changelog)

Le projet suit le [Semantic Versioning](https://semver.org/lang/fr/) depuis
la version 1.0.0 (2026-07-07) — voir `CHANGELOG.md` à la racine de chaque
dépôt et les tags Git (`git tag -l -n1`).

1. Ajouter une entrée en haut de `CHANGELOG.md`, sous le format déjà en
   place (`## [x.y.z] - AAAA-MM-JJ`, sections `Ajouté`/`Modifié`/`Corrigé`/
   `Sécurité`/`Supprimé` selon ce qui s'applique).
2. Committer.
3. Taguer le commit :
   ```bash
   git tag -a vX.Y.Z -m "vX.Y.Z - résumé court"
   git push origin vX.Y.Z
   ```

Règle de choix du numéro (à appliquer à partir de maintenant, les versions
antérieures à 1.0.0 ayant été reconstituées rétroactivement) :
- **patch** (x.y.Z) : correction de bug sans changement de comportement visible.
- **mineure** (x.Y.0) : nouvelle fonctionnalité rétrocompatible.
- **majeure** (X.0.0) : changement cassant (ex. changement de schéma de
  données non rétrocompatible, retrait d'une route API utilisée par le
  frontend).

## Où vérifier qu'une mise à jour n'a rien cassé

Pas de couverture de test à 100 % (voir
[criteres-qualite-performance.md](./criteres-qualite-performance.md)) — la
CI ne suffit pas à elle seule. Avant une mise à jour sensible (dépendance
majeure, migration de schéma, changement d'authentification), rejouer
manuellement au minimum les scénarios non automatisés du
[cahier de recette](./cahier-de-recette.md) marqués 🟡 ou ⬜ qui touchent la
zone modifiée.
