# MalakInfo

MalakInfo est un média d'actualité généraliste consacré à l'Afrique et au monde. Le projet comprend le site public, un panel d'administration séparé et plusieurs APIs métier.

## Fonctionnalités

- Actualités, articles premium, auteurs et catégories.
- Pages éditoriales localisées en français et en anglais.
- Sections politique, économie, société, santé, sécurité, culture, sport, religion, emploi et science & technologie.
- Médias : photos, vidéos, podcasts, lives et radio en direct.
- Radio administrable : station active, émissions, programmation, logo, libellé et flux audio.
- Offres d'emploi et candidatures.
- Partenariats : demandes soumises, validation admin, logo/image et lien public du partenaire.
- Newsletter, contact, comptes utilisateurs et favoris.
- Dons ponctuels via Stripe Checkout, avec confirmation par webhook.
- Consentement cookies et invitation newsletter selon l'intention de sortie.

## Architecture

```text
arizona.info/
├── src/app/                         # Site public Next.js
│   ├── [locale]/                    # Pages localisées
│   └── api/                         # APIs du site public
├── src/components/                  # Navigation, radio, consentement, partage...
├── src/lib/                         # Prisma, Sanity, Stripe, R2, auth et requêtes
├── prisma/                          # Schéma et migrations de la base principale
├── schemas/                         # Schémas Sanity
├── messages/                        # Traductions
├── public/                          # Assets, robots.txt, sitemap et images
└── admin-panel/                     # Application Next.js d'administration
    ├── src/app/                     # Dashboard et écrans de gestion
    ├── src/app/api/                 # APIs du panel
    ├── src/components/              # Layout, authentification et éditeur riche
    └── prisma/                      # Schéma et migrations du panel
```

## Routes principales

### Site public

Les pages localisées utilisent le préfixe `/{locale}` (`fr` ou `en`). Exemples :

- `/fr` : accueil.
- `/fr/actualites` : actualités.
- `/fr/medias/live` : diffusion vidéo en direct.
- `/fr/nous-soutenir/faire-un-don` : don Stripe.
- `/fr/partenaires` : partenaires approuvés.
- `/fr/partenariats` : demande de partenariat.
- `/fr/emploi` : offres d'emploi.

### Panel admin

Le panel est une application distincte dans `admin-panel/` :

- `/` : tableau de bord.
- `/articles` : articles et éditeur riche.
- `/categories` : catégories.
- `/radio` et `/radio/programs` : station et émissions radio.
- `/lives` : diffusions en direct.
- `/job-offers` et `/job-applications` : offres et candidatures.
- `/form-submissions` : messages et demandes de partenariat.
- `/settings` : profil, sécurité, préférences, base et clé API.

Les écrans admin sont protégés par session. Les APIs de réglages utilisent également une vérification serveur de la session admin.

## Stack technique

- Next.js 16 avec App Router et React 19.
- TypeScript.
- Tailwind CSS.
- Lucide React et composants UI locaux.
- Prisma avec CockroachDB/PostgreSQL.
- Sanity pour le contenu éditorial complémentaire.
- Stripe pour les dons et certains paiements.
- HLS.js pour les flux radio HLS.
- Cloudflare R2 pour les médias.
- Déploiement Vercel.

## Prérequis

- Node.js 20 ou version compatible avec Next.js 16.
- npm.
- Une base CockroachDB ou PostgreSQL compatible Prisma.
- Pour les fonctions concernées : Sanity, Stripe, R2 et SMTP configurés.

## Installation du site public

Depuis la racine :

```bash
npm install
npm run dev
```

Le site est disponible sur [http://localhost:3000](http://localhost:3000).

Le build applique les migrations de la base principale avant la compilation :

```bash
npm run build
npm start
```

## Installation du panel admin

```bash
cd admin-panel
npm install
npm run dev
```

Le panel est généralement disponible sur [http://localhost:3001](http://localhost:3001), selon la configuration Next.js locale.

Le build du panel exécute les migrations lorsqu'une base est configurée. Pour un déploiement Preview sans base, le script `scripts/migrate-if-configured.js` permet de compiler l'interface ; les APIs nécessitant une base doivent alors utiliser une base Preview ou une URL de relais configurée.

## Variables d'environnement

Ne jamais committer les fichiers `.env`, `.env.local` ou les secrets. Utiliser les fichiers `.env.example` comme modèle et configurer les variables dans Vercel pour chaque environnement.

### Site public

Variables couramment utilisées :

```env
DATABASE_URL=...
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_DONATION_CURRENCY=xof
NEXT_PUBLIC_SITE_URL=https://malakinfo.com
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
```

### Panel admin

```env
DATABASE_URL=...
NEXT_PUBLIC_MAIN_SITE_URL=https://malakinfo.com
ADMIN_PANEL_URL=https://dashboard.malakinfo.com
NEXT_PUBLIC_ADMIN_URL=https://dashboard.malakinfo.com
```

`DATABASE_URL` doit être disponible au build et au runtime pour le panel en Production. Pour un Preview, ajouter également `NEXT_PUBLIC_MAIN_SITE_URL` si le panel doit relayer certaines opérations vers le site principal.

## Base de données et migrations

Chaque application possède son schéma Prisma :

```bash
# Base du site public
npx prisma migrate deploy
npx prisma generate

# Base utilisée par le panel admin
cd admin-panel
npx prisma migrate deploy
npx prisma generate
```

Les migrations sont versionnées dans :

- `prisma/migrations/`
- `admin-panel/prisma/migrations/`

Les migrations CockroachDB peuvent nécessiter le déverrouillage temporaire d'une table surveillée par un changefeed avant une modification de schéma. Restaurer le verrou après l'opération.

## Flux métier importants

### Radio

La station et les émissions sont enregistrées dans `RadioStation` et `RadioProgram`. Le panel admin modifie ces données via les APIs radio. Les flux HTTP externes peuvent être lus par le site via `/api/radio/stream`, un proxy HTTPS limité à des hôtes autorisés, afin d'éviter le contenu mixte dans le navigateur.

### Partenaires

Une demande est créée avec le statut `pending`. Depuis le panel, elle peut être approuvée. Seuls les partenaires `approved` sont affichés publiquement, avec leur `imageUrl` et leur `websiteUrl` lorsqu'ils sont renseignés.

### Dons

La page de don crée une session Stripe Checkout dédiée via `/api/donations/checkout`. Un don est créé en `pending`, puis passe à `completed` uniquement après confirmation du webhook `/api/stripe/webhook`. Les informations de carte ne sont jamais collectées par le site.

### Offres d'emploi

Les offres sont gérées par le panel et persistées via Prisma. Le build du panel applique les migrations nécessaires, notamment celle de `JobOffer.details`.

## Déploiement Vercel

Le dépôt peut être déployé comme deux applications :

1. Le site public depuis la racine.
2. Le panel admin depuis le dossier `admin-panel/`.

Pour le site public, définir le répertoire racine du projet à la racine du dépôt. Pour le panel, définir `admin-panel` comme Root Directory et utiliser son script de build.

Après chaque changement de schéma :

1. Vérifier la migration localement.
2. Définir `DATABASE_URL` dans l'environnement Vercel concerné.
3. Redéployer afin que `prisma migrate deploy` s'exécute.
4. Vérifier les logs de build et le statut Prisma.

## Sécurité

- Ne jamais stocker de clé Stripe, mot de passe de base ou token Sanity dans Git.
- Utiliser Stripe Checkout plutôt que de collecter des données de carte dans un formulaire local.
- Restreindre les domaines autorisés par le proxy radio.
- Vérifier les statuts et permissions côté serveur, pas uniquement dans l'interface admin.
- Régénérer tout secret ayant été exposé dans un fichier ou un log.

## Vérifications utiles

```bash
# Lint du site
npm run lint

# Build du site
npm run build

# Build du panel
cd admin-panel
npm run build
```

## Licence

Projet privé de MalakInfo. Les conditions de réutilisation du code et des contenus sont définies par les propriétaires du projet.
