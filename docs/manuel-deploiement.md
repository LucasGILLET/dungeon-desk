# Manuel de déploiement

> **Mise à jour du 2026-10-19** (version en préparation) : variables
> d'environnement, seed et Directus. La mise en production de cette version
> n'a pas encore eu lieu ; les étapes nouvelles sont signalées.

## Frontend — Azure Static Web Apps

### Déploiement automatique (voie normale)
Tout push sur `main` déclenche `.github/workflows/azure-static-web-apps-icy-rock-0d5406403.yml` :
le job `quality_checks` (type-check + tests) doit réussir avant que
`build_and_deploy_job` ne s'exécute. Rien à faire manuellement — voir
[protocole-cicd.md](./protocole-cicd.md) pour le détail des étapes.

### Prérequis (secrets GitHub déjà configurés sur le dépôt)
- `AZURE_STATIC_WEB_APPS_API_TOKEN_ICY_ROCK_0D5406403`
- `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, `VITE_AUTH0_AUDIENCE`, `VITE_API_URL`

### Build local (vérification avant de pousser)
```bash
npm ci
npm run type-check
npm run test:unit -- --run
npm run build      # type-check + build Vite -> dist/
npm run preview    # sert dist/ localement pour vérification visuelle
```

### En cas de problème de déploiement Azure
Le nom du fichier de workflow (`azure-static-web-apps-icy-rock-0d5406403.yml`)
correspond au nom de la ressource Azure Static Web Apps
(`icy-rock-0d5406403`). Le token API doit être régénéré depuis le portail
Azure (ressource Static Web App → "Manage deployment token") si le
déploiement échoue avec une erreur d'authentification, puis remplacé dans le
secret GitHub correspondant.

## Backend — Google Cloud Run

### Déploiement automatique (voie normale)
Tout push sur `main` déclenche `.github/workflows/deploy.yml` :
tests → type-check → migrations Prisma → build/push image Docker → déploiement
Cloud Run. Voir [protocole-cicd.md](./protocole-cicd.md) pour le détail.

⚠️ Contrairement au front, **aucune vérification n'a lieu sur les pull
requests** — seul le push sur `main` déclenche le pipeline.

### Prérequis (secrets GitHub)
- `DATABASE_URL` (chaîne de connexion Neon, avec pooling)
- `GCP_SA_KEY` (clé JSON du compte de service GCP, pour `google-github-actions/auth@v2`)
- `FRONTEND_URL`, `AUTH0_AUDIENCE`, `AUTH0_ISSUER` (`JWT_SECRET` n'est plus utilisé depuis le 2026-10-19)

### Infrastructure cible (définie dans `deploy.yml`)
- Projet GCP : `dungeon-desk-486622`
- Région : `europe-west9`
- Registre d'images : `europe-west9-docker.pkg.dev/dungeon-desk-486622/dungeon-desk-repo`
- Service Cloud Run : `dungeon-desk-back`

### Déploiement manuel (dépannage, si la CI est indisponible)
```bash
# Authentification GCP (nécessite gcloud CLI installé et configuré)
gcloud auth login
gcloud config set project dungeon-desk-486622

# Build et push de l'image
docker build -t europe-west9-docker.pkg.dev/dungeon-desk-486622/dungeon-desk-repo/dungeon-desk-back:manual .
docker push europe-west9-docker.pkg.dev/dungeon-desk-486622/dungeon-desk-repo/dungeon-desk-back:manual

# Migrations (à faire AVANT le déploiement, avec la bonne DATABASE_URL en variable d'env)
npx prisma migrate deploy

# Déploiement
gcloud run deploy dungeon-desk-back \
  --image europe-west9-docker.pkg.dev/dungeon-desk-486622/dungeon-desk-repo/dungeon-desk-back:manual \
  --region europe-west9 \
  --set-env-vars DATABASE_URL=...,FRONTEND_URL=...,AUTH0_AUDIENCE=...,AUTH0_ISSUER=...
```

### Port d'écoute
Le conteneur écoute sur `process.env.PORT || 3000` (`src/server.ts`). Cloud
Run injecte automatiquement `PORT=8080` (cohérent avec l'`EXPOSE 8080` du
`Dockerfile`) — ne pas fixer `PORT` manuellement dans les variables d'env
Cloud Run, sous peine de conflit.

### Environnement local (développement, pas production)
Décrit dans `dungeon-desk-back/README.md` :
```bash
cd dungeon-desk-back
npm install
cp .env.example .env   # base locale, origine du front, Auth0
docker compose up -d   # lance Postgres local + API sur http://localhost:3000
npx prisma migrate deploy && npx prisma db seed   # schéma + données de jeu
# ou, sans Docker pour l'API :
npm run dev
```

`.env.example` liste toutes les variables lues par l'API (complété le
2026-10-19 : `FRONTEND_URL`, `AUTH0_AUDIENCE`, `AUTH0_ISSUER`). Le front a
son propre `.env.example` (`VITE_API_URL`, `VITE_AUTH0_*`).

## Back-office — Directus (nouveau)

En local :
```bash
docker compose -f docker-compose.yml -f docker-compose.directus.yml up -d   # http://localhost:8055
npm run directus:config   # menus, formulaires, rôles, automatisations
```
Secrets dans `.env.directus` (à partir de `.env.directus.example`) : clé
de chiffrement, compte administrateur, jeton d'API, licence. La licence
(programme Open Innovation Grant) est liée à l'adresse publique de
l'instance (`PUBLIC_URL`) : chaque nouvelle adresse consomme une
activation.

En production (**à mettre en place**) : un service Cloud Run sur la même
base Neon, avec :
- `PUBLIC_URL` = son adresse définitive (avant d'activer la licence) ;
- `CONTENT_SECURITY_POLICY_DIRECTIVES__FRAME_SRC` incluant l'adresse du
  front (sinon l'aperçu des pages est bloqué) ;
- `DIRECTUS_PREVIEW_URL` = l'adresse du front, pour le lien « Voir sur le
  site » ;
- puis `npm run directus:config` contre cette instance.

## Mise en production de la version en préparation

Étapes propres à cette version (une seule fois) :
1. **Sauvegarder la base Neon** : la migration `20261017100000_character_model`
   supprime les personnages existants (ancien format JSON).
2. Fusionner `feat/srd-database` dans `main` sur les deux dépôts : la CI
   applique les migrations puis déploie l'API et le front.
3. **Lancer le seed** contre la base de production (`npx prisma db seed`,
   environ 1 min 15) : la CI ne le fait pas.
4. Déployer et configurer Directus (section précédente).
5. Vérifier côté Auth0 que les URL de rappel et origines autorisées
   contiennent l'adresse de production du front, et côté API que
   `FRONTEND_URL` correspond (CORS).

## Base de données (Prisma / Neon)

Consulter/modifier la base sans passer par l'API :
```bash
npx prisma studio   # interface graphique sur http://localhost:5555
```

Les migrations sont versionnées dans `prisma/schema/migrations/` et appliquées
automatiquement en CI via `npx prisma migrate deploy` — jamais `migrate dev`
en production (voir [manuel-mise-a-jour.md](./manuel-mise-a-jour.md) pour la
création d'une nouvelle migration).
