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

## Back-office — Directus

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

### Production (Cloud Run)

En service depuis le 2026-10-20 (licence active, compte rédacteur et
aperçu des pages testés).

| Élément | Valeur |
|---|---|
| Service Cloud Run | `dungeon-desk-directus` (europe-west9), image `directus/directus:12.4.1` tirée de Docker Hub |
| Adresse (`PUBLIC_URL`) | https://dungeon-desk-directus-657109760065.europe-west9.run.app |
| Base | Neon de prod, point d'accès **direct** (sans `-pooler`), tables système dans le schéma `directus` |
| Fichiers | bucket `dungeon-desk-directus-files` (europe-west9, privé) |
| Compte de service | `directus-run@dungeon-desk-486622.iam.gserviceaccount.com` |
| Variables | `dungeon-desk-back/directus.cloudrun.env.yaml` (versionné, sans secret) |
| Secrets (Secret Manager) | `directus-secret`, `directus-admin-email`, `directus-admin-password`, `directus-admin-token`, `directus-license-key`, `directus-db-url` |

Pourquoi ces choix :
- **Adresse en `run.app`** : elle est connue avant le déploiement (nom du
  service + numéro du projet), donc la licence s'active une seule fois sur
  la bonne adresse. Changer d'adresse plus tard (domaine personnalisé)
  consomme une activation : désactiver d'abord la licence dans Paramètres →
  Licence de l'ancienne adresse.
- **Point d'accès direct** : le pooler de Neon (mode transaction) ne garde
  pas le `search_path` d'une requête à l'autre ; Directus chercherait ses
  tables au mauvais endroit.
- **Une seule instance au plus, zéro au repos** (`--max-instances 1`,
  `--min-instances 0`) : Directus garde cache et tâches planifiées en
  mémoire ; au repos, ni Cloud Run ni Neon ne tournent. Premier affichage
  après une pause : 10 à 20 s.
- **Bucket** : le disque d'un conteneur Cloud Run est effacé à chaque
  redémarrage ; les images insérées dans les guides vont dans le bucket.
- Directus ne crée ni ne modifie de table dans `public` : Prisma ne voit
  rien (vérifié par `prisma migrate diff`, étape 6).

#### Mise en place (une seule fois)

Commandes à lancer dans Git Bash, depuis `dungeon-desk-back`. Aucune ne
fait apparaître de secret à l'écran.

**1. Se reconnecter à Google Cloud**
```bash
gcloud auth login
```
Une page de connexion Google s'ouvre : choisir le compte du projet, puis
« Autoriser ». Le terminal affiche `You are now logged in as …`.
```bash
gcloud config set project dungeon-desk-486622
```

**2. Créer le schéma `directus` sur Neon**
1. Ouvrir https://console.neon.tech et cliquer sur le projet.
2. Dans le menu de gauche, cliquer sur **SQL Editor**.
3. En haut de l'éditeur, vérifier que la branche est **Primary** et la
   base **neondb**.
4. Coller `CREATE SCHEMA IF NOT EXISTS directus;` puis cliquer sur **Run**.
5. Résultat attendu : un message de succès, sans erreur.

**3. Ranger l'adresse de la base dans Secret Manager**
1. Sur Neon, menu de gauche **Dashboard**, puis bouton **Connect**.
2. Dans la fenêtre : branche **Primary**, base **neondb**, et **désactiver**
   l'interrupteur **Connection pooling** (l'adresse ne doit plus contenir
   `-pooler`).
3. Cliquer sur **Show password**, puis sur l'icône de copie de la chaîne.
4. Ouvrir https://console.cloud.google.com/security/secret-manager?project=dungeon-desk-486622
5. Cliquer sur **+ Créer un secret**.
6. **Nom** : `directus-db-url`. **Valeur du secret** : coller la chaîne.
   Ne rien changer d'autre, cliquer sur **Créer le secret**.

**4. Créer les autres secrets, le bucket et le compte de service**
```bash
gcloud services enable run.googleapis.com secretmanager.googleapis.com storage.googleapis.com
```
```bash
for s in directus-secret directus-admin-password directus-admin-token; do node -e "process.stdout.write(require('crypto').randomBytes(32).toString('hex'))" | gcloud secrets create $s --data-file=- --replication-policy=automatic; done
```
```bash
grep '^LICENSE_KEY=' .env.directus | cut -d= -f2- | tr -d '\r\n' | gcloud secrets create directus-license-key --data-file=- --replication-policy=automatic
```
```bash
printf '%s' "ADRESSE_EMAIL_DE_L_ADMIN" | gcloud secrets create directus-admin-email --data-file=- --replication-policy=automatic
```
(remplacer `ADRESSE_EMAIL_DE_L_ADMIN` par l'e-mail du compte administrateur.)
```bash
gcloud iam service-accounts create directus-run --display-name="Directus (Cloud Run)"
```
```bash
for s in directus-secret directus-admin-email directus-admin-password directus-admin-token directus-license-key directus-db-url; do gcloud secrets add-iam-policy-binding $s --member=serviceAccount:directus-run@dungeon-desk-486622.iam.gserviceaccount.com --role=roles/secretmanager.secretAccessor --quiet > /dev/null; done
```
```bash
gcloud storage buckets create gs://dungeon-desk-directus-files --location=europe-west9 --uniform-bucket-level-access --public-access-prevention
```
```bash
gcloud storage buckets add-iam-policy-binding gs://dungeon-desk-directus-files --member=serviceAccount:directus-run@dungeon-desk-486622.iam.gserviceaccount.com --role=roles/storage.objectAdmin
```

**5. Déployer**
```bash
gcloud run deploy dungeon-desk-directus --image docker.io/directus/directus:12.4.1 --region europe-west9 --service-account directus-run@dungeon-desk-486622.iam.gserviceaccount.com --allow-unauthenticated --memory 1Gi --cpu 1 --cpu-boost --min-instances 0 --max-instances 1 --env-vars-file directus.cloudrun.env.yaml --set-secrets "SECRET=directus-secret:latest,ADMIN_EMAIL=directus-admin-email:latest,ADMIN_PASSWORD=directus-admin-password:latest,ADMIN_TOKEN=directus-admin-token:latest,LICENSE_KEY=directus-license-key:latest,DB_CONNECTION_STRING=directus-db-url:latest"
```
Le premier démarrage crée les tables système (`directus_*`) dans le schéma
`directus` et le compte administrateur ; il prend une à deux minutes. Le
terminal finit par `Service URL: https://dungeon-desk-directus-657109760065.europe-west9.run.app`.
Si l'adresse affichée est différente, **s'arrêter** : corriger `PUBLIC_URL`
dans `directus.cloudrun.env.yaml` et redéployer avant toute connexion.

Vérifier :
1. Ouvrir l'adresse du service : la page de connexion Directus s'affiche.
2. Mot de passe administrateur : dans Secret Manager, cliquer sur
   `directus-admin-password`, puis sur la version **1**, menu **⋮** →
   **Afficher la valeur du secret**.
3. Se connecter, puis **Paramètres** (roue dentée, en bas à gauche) →
   **Licence** : la licence doit apparaître comme active.

**6. Vérifier que Prisma ne voit aucune dérive**
```bash
NEON_URL="$(gcloud secrets versions access latest --secret=directus-db-url)" && npx prisma migrate diff --from-url "$NEON_URL" --to-schema-datamodel prisma/schema --exit-code; unset NEON_URL
```
Attendu : `No difference detected.` (Prisma ne lit que `public`).

**7. Configurer l'interface (menus, formulaires, rôles, aperçu)**
```bash
DIRECTUS_URL=https://dungeon-desk-directus-657109760065.europe-west9.run.app DIRECTUS_PREVIEW_URL=https://www.dungeon-desk.com DIRECTUS_TOKEN="$(gcloud secrets versions access latest --secret=directus-admin-token)" npm run directus:config
```
Attendu : une ligne `[directus] … collections, … champs, … 3 rôles ; … s`,
après environ 12 minutes (chaque appel attend la base Neon ; le terminal
reste muet jusqu'à la fin).
`DIRECTUS_PREVIEW_URL` sert au lien d'aperçu des pages de documentation :
le relancer avec cette valeur à chaque nouvelle configuration de la prod
(sinon l'aperçu pointe vers `http://localhost:5173`).

**8. Créer le compte du rédacteur et tester l'aperçu**
1. Dans Directus (connecté en administrateur), cliquer sur l'icône
   **Annuaire des utilisateurs** (silhouettes) dans la barre de gauche.
2. Cliquer sur **+** en haut à droite.
3. Remplir **Prénom**, **E-mail**, **Mot de passe** ; **Rôle** :
   *Rédacteur de la documentation* ; **Statut** : *Actif*. Cliquer sur ✓.
4. Se déconnecter (icône en bas à gauche), se reconnecter avec ce compte.
5. **Contenu** → **Pages de la documentation** → ouvrir une page, puis
   cliquer sur l'icône **Aperçu** (œil) en haut à droite : la page du site
   s'affiche dans le cadre. Une modification apparaît dans l'aperçu au plus
   une minute après l'enregistrement (cache de l'API).

#### Mises à jour

- Après une migration Prisma : relancer l'étape 7.
- Nouvelle version de Directus : changer le numéro d'image dans la commande
  de l'étape 5 et la relancer (les migrations de Directus s'appliquent au
  démarrage) ; mettre aussi à jour `docker-compose.directus.yml`.
- Changer une variable : modifier `directus.cloudrun.env.yaml` et relancer
  l'étape 5.

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
