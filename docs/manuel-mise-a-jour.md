# Manuel de mise à jour

> **Mise à jour du 2026-10-19** (version en préparation) : schéma réparti
> par domaine, seed des données de jeu, Directus, état des vulnérabilités.

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

### Corriger une vulnérabilité signalée par `npm audit`
Méthode suivie le 2026-10-19 (19 vulnérabilités de production corrigées,
voir [securite.md](./securite.md)) :
```bash
npm audit --omit=dev            # dépendances de production seulement
npm ls <paquet>                 # dépendance directe ou transitive ? tirée par qui ?
npm view <paquet> time --json   # dates de publication des versions
npm install <paquet>@^<version> --before=<date-il-y-a-2-semaines>
npm audit fix --before=<date-il-y-a-2-semaines>   # transitives, sans --force
npm update <paquet> --before=<date-il-y-a-2-semaines>  # transitive restée en arrière
```
- Chercher d'abord la plus petite version qui corrige (corrective, puis
  mineure) ; une majeure (Express 5…) seulement si rien d'autre ne corrige.
- `--before` écarte les versions de moins de deux semaines : une version
  compromise publiée sur npm est en général repérée et retirée dans ce délai.
- Ne pas lancer `npm audit fix --force` : il installe des versions majeures
  sans prévenir.
- `npm audit fix` corrige aussi les outils de développement (Vitest,
  Babel…) : relire le diff du `package-lock.json`.

Vérifier ensuite : compilation et tests (ci-dessus), `npm run build` côté
front, et pour le back une API reconstruite dans Docker
(`docker compose up -d --build api` : routes protégées en 401 sans jeton,
`/api/srd/2014/classes` en 200, en-têtes `RateLimit-*` présents ; voir
scénario SC-22 du [cahier de recette](./cahier-de-recette.md) pour le rate
limiting).

### Vulnérabilités connues (état au 2026-10-19)
**Aucune** dans les dépendances de production des deux dépôts après la mise
à jour du 2026-10-19. Il en reste 8 dans les outils de développement du
back, non déployés : via `prisma` (`deepmerge-ts`, qui demande Prisma 7 ;
`effect`, corrigé par Prisma 6.19.3) et via `nodemon` (`picomatch`, corrigé
en 2.3.2 ; `braces`, qui demande une autre majeure de `nodemon`). Prisma
pilotant les migrations de la CI, sa mise à jour se fait à part.

## Créer une migration Prisma

Le schéma est réparti en un fichier par domaine dans
`dungeon-desk-back/prisma/schema/` (conventions dans
`docs/modelisation/conventions.md` du back). Après modification :
```bash
npx prisma migrate dev --name description_du_changement
```
Cela génère un dossier dans `prisma/schema/migrations/` (à committer) et applique
la migration sur la base de développement locale (`docker-compose up -d`
doit tourner). **Ne jamais** utiliser `migrate dev` contre la base de
production — c'est `migrate deploy` qui s'en charge, automatiquement, dans
le pipeline CI (`deploy.yml`, étape "Run Database Migrations", exécutée
avant le build/déploiement de l'image).

Les contraintes que Prisma ne sait pas exprimer (`CHECK`) s'ajoutent à la
main à la fin du fichier `migration.sql` généré. Vérifier ensuite que le
schéma et les migrations concordent (aucune différence attendue) :
```bash
npx prisma migrate diff --from-migrations prisma/schema/migrations --to-schema-datamodel prisma/schema --shadow-database-url <base vide> --exit-code
```

Pour inspecter l'état de la base sans passer par du SQL brut :
```bash
npx prisma studio   # http://localhost:5555
```

## Mettre à jour les données de jeu

Les données du SRD sont dans `dungeon-desk-back/prisma/data/` et importées
par le seed, idempotent (le relancer met à jour sans doublon) :
```bash
npx prisma db seed                         # tout (environ 1 min 15 sur une base vierge)
npx prisma db seed -- --only monstres,sorts  # certains domaines seulement
```
Les corrections faites dans Directus sont écrasées si le domaine
correspondant est réimporté — sauf les pages de documentation, que le seed
ne crée que si elles n'existent pas (`--reset-guides` pour les réécrire).

## Mettre à jour la configuration de Directus

Menus, formulaires, rôles et automatisations sont décrits par un script
(`dungeon-desk-back/src/directus/`), à relancer après un changement de
schéma :
```bash
npm run directus:config                      # tout (environ 3 min)
npm run directus:config -- --only forms,roles  # certaines étapes
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
