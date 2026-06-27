# Malakin.info

Site d'actualité généraliste axé sur l'Afrique et le monde.

**Slogan :** "L'info qui traverse les frontières"

## 🎯 Mission

Informer, éduquer et connecter l'Afrique à travers un journalisme indépendant, fiable et multiculturel.

## 🛠️ Stack Technique

- **Frontend** : React avec Next.js (App Router)
- **Styling** : TailwindCSS v4
- **UI Components** : shadcn/ui
- **Icons** : Lucide React
- **CMS** : Sanity.io (headless CMS)
- **Hébergement** : Vercel

## 📂 Architecture du Site

```
malakin.info/
├── accueil/
├── actualites/
│   ├── politique/
│   ├── economie/
│   ├── societe/
│   ├── sante/
│   ├── securite/
│   └── environnement/
├── medias/
│   ├── photos/
│   ├── videos/
│   ├── podcasts/
│   └── live/
├── communiques/
│   ├── gouvernement/
│   ├── religieux/
│   ├── ong/
│   └── educatif/
├── infos-pratiques/
│   ├── guides/
│   ├── tutoriels/
│   ├── checklists/
│   └── ressources-educatives/
├── religion/
│   ├── meditations/
│   ├── homelies/
│   ├── musiques-sacrees/
│   ├── agenda-religieux/
│   └── message-du-temps/
│       ├── branham/
│       └── autres-messages/
├── culture/
│   ├── musique/
│   ├── cinema/
│   ├── arts/
│   └── tendances/
├── sport/
│   ├── football/
│   ├── basket/
│   ├── athletisme/
│   └── evenements/
├── emploi/
│   ├── offres/
│   ├── deposez-offre/
│   ├── conseils-carriere/
│   └── bourses-stages/
├── nous-soutenir/
│   ├── faire-un-don/
│   ├── partenariats/
│   ├── mecenat/
│   ├── pourquoi-soutenir/
│   └── temoignages-donateurs/
├── blog/
│   ├── tribunes/
│   ├── chroniques/
│   ├── enquetes/
│   └── sondages/
├── a-propos/
│   ├── mission/
│   ├── equipe/
│   └── charte/
├── contact/
└── compte/
    ├── connexion/
    ├── inscription/
    ├── abonnement-premium/
    └── mon-profil/
```

## 🎨 Identité Visuelle

- **Couleurs** :
  - Rouge : `#E63946`
  - Bleu profond : `#1D3557`
  - Or : `#F4A261`
- **Polices** :
  - Poppins (titres)
  - Open Sans (corps)

## 🚀 Démarrage

### Prérequis

- Node.js 18+ installé
- npm ou yarn

### Installation

1. Cloner le repository
2. Installer les dépendances :
```bash
npm install
```

3. Lancer le serveur de développement :
```bash
npm run dev
```

4. Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur

## 📦 Construction pour la production

```bash
npm run build
npm start
```

## 🌐 Déploiement

### Vercel (Recommandé)

1. Créer un compte sur [Vercel](https://vercel.com)
2. Connecter le repository GitHub : https://github.com/jacquesmasuruku2/Malakin.Info
3. Configurer les variables d'environnement dans Vercel :
   - `NEXT_PUBLIC_SANITY_PROJECT_ID` : Votre ID de projet Sanity
   - `NEXT_PUBLIC_SANITY_DATASET` : `production`
4. Déployer automatiquement

## 🔧 Configuration Sanity.io

### 1. Créer un projet Sanity

1. Aller sur [Sanity.io](https://sanity.io) et créer un compte
2. Créer un nouveau projet
3. Copier le `Project ID` depuis les paramètres du projet

### 2. Configurer les variables d'environnement

**Option A : Vercel (Production)**
- Dans Vercel Dashboard → Settings → Environment Variables
- Ajouter :
  - `NEXT_PUBLIC_SANITY_PROJECT_ID` : votre_project_id
  - `NEXT_PUBLIC_SANITY_DATASET` : `production`

**Option B : Local (Développement)**
- Créer un fichier `.env.local` à la racine du projet
- Ajouter :
  ```
  NEXT_PUBLIC_SANITY_PROJECT_ID=votre_project_id
  NEXT_PUBLIC_SANITY_DATASET=production
  ```

### 3. Lancer le studio Sanity

```bash
npm install -g @sanity/cli
sanity login
sanity init
```

Choisissez :
- Utiliser le projet existant
- Sélectionner le schéma : `schemas/`
- Démarrer le studio : `npx sanity start`

### 4. Structure des schémas Sanity

Le projet inclut les schémas suivants :
- **Article** : Articles d'actualité avec contenu riche
- **Category** : Catégories d'articles
- **Author** : Auteurs et journalistes

### 5. Utiliser les données Sanity dans Next.js

Les fonctions utilitaires sont disponibles dans `src/lib/queries.ts` :
- `getArticles()` : Récupérer tous les articles
- `getFeaturedArticles()` : Articles à la une
- `getLatestArticles()` : Derniers articles
- `getArticleBySlug(slug)` : Article par slug
- `getArticlesByCategory(categorySlug)` : Articles par catégorie
- `getCategories()` : Toutes les catégories
- `searchArticles(query)` : Recherche d'articles

## 📝 Pages Implémentées

- ✅ Page d'accueil
- ✅ Actualités (avec sous-catégories)
- ✅ Médias (photos, vidéos, podcasts, live)
- ✅ Communiqués (gouvernement, religieux, ONG, éducatif)
- ✅ Infos Pratiques (guides, tutoriels, checklists, ressources)
- ✅ Religion (méditations, homélies, musiques sacrées, agenda)
- ✅ Culture (musique, cinéma, arts, tendances)
- ✅ Sport (football, basket, athlétisme, événements)
- ✅ Emploi (offres, conseils carrière, bourses)
- ✅ Nous Soutenir (dons, partenariats, mécénat)
- ✅ Blog (tribunes, chroniques, enquêtes, sondages)
- ✅ À Propos (mission, équipe, charte)
- ✅ Contact
- ✅ Compte (connexion, inscription)

## 👥 Équipe

- Jean Dupont - Rédacteur en chef (ex-RFI)
- Marie Koffi - Journaliste politique (ex-Jeune Afrique)
- Ahmed Benali - Correspondant Maghreb
- Grace Okafor - Rédactrice culture
- Pierre Mwamba - Responsable Sport
- Sr. Véronique Nzambi - Coordinatrice Religieux

## 📄 Licence

Propriété de Malakin.info - Tous droits réservés

## 📞 Contact

- Email : contact@malakin.info
- Téléphone : +243 000 000 000
- Adresse : Avenue de la Liberté, Quartier Gombe, Kinshasa, RDC
