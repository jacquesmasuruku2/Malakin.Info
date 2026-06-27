# Arizona.info

Site d'actualité généraliste axé sur l'Afrique et le monde.

**Slogan :** "L'info qui traverse les frontières"

## 🎯 Mission

Informer, éduquer et connecter l'Afrique à travers un journalisme indépendant, fiable et multiculturel.

## 🛠️ Stack Technique

- **Frontend** : React avec Next.js (App Router)
- **Styling** : TailwindCSS v4
- **UI Components** : shadcn/ui
- **Icons** : Lucide React
- **Backend / CMS** : Strapi (à configurer)
- **Base de données** : PostgreSQL (via Supabase ou VPS)
- **Hébergement** : Oracle Cloud Always Free Tier

## 📂 Architecture du Site

```
arizona.info/
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

### Oracle Cloud (VPS)

1. Préparer le VPS Oracle Cloud avec Ubuntu
2. Installer Node.js et npm
3. Cloner le projet sur le VPS
4. Installer les dépendances
5. Construire le projet : `npm run build`
6. Utiliser PM2 pour gérer le processus :
```bash
npm install -g pm2
pm2 start npm --name "arizona" -- start
pm2 save
pm2 startup
```

### Alternative : Vercel

1. Connecter le repository GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer automatiquement

## 🔧 Configuration CMS (Strapi)

À venir : Installation et configuration de Strapi pour la gestion du contenu.

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

Propriété de Arizona.info - Tous droits réservés

## 📞 Contact

- Email : contact@arizona.info
- Téléphone : +243 000 000 000
- Adresse : Avenue de la Liberté, Quartier Gombe, Kinshasa, RDC
