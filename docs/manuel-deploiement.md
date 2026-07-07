# Manuel de déploiement

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
- `JWT_SECRET`, `FRONTEND_URL`, `AUTH0_AUDIENCE`, `AUTH0_ISSUER`

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
  --set-env-vars DATABASE_URL=...,JWT_SECRET=...,FRONTEND_URL=...,AUTH0_AUDIENCE=...,AUTH0_ISSUER=...
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
cp .env.example .env   # puis ajuster JWT_SECRET, DATABASE_URL...
docker compose up -d   # lance Postgres local + API sur http://localhost:3000
# ou, sans Docker :
npm run dev
```

⚠️ `.env.example` ne liste que `PORT`, `JWT_SECRET`, `DATABASE_URL`,
`DIRECT_URL` — il manque `FRONTEND_URL`, `AUTH0_AUDIENCE`, `AUTH0_ISSUER`,
pourtant nécessaires (`app.ts` et `authMiddleware.ts` les lisent). À
compléter si une nouvelle personne doit démarrer l'environnement local à
partir de ce seul fichier.

## Base de données (Prisma / Neon)

Consulter/modifier la base sans passer par l'API :
```bash
npx prisma studio   # interface graphique sur http://localhost:5555
```

Les migrations sont versionnées dans `prisma/migrations/` et appliquées
automatiquement en CI via `npx prisma migrate deploy` — jamais `migrate dev`
en production (voir [manuel-mise-a-jour.md](./manuel-mise-a-jour.md) pour la
création d'une nouvelle migration).
