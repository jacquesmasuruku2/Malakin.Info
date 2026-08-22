# Audit MalakInfo - Préparation Google AdSense

**Date**: 22 août 2026  
**Objectif**: Identifier et corriger les défauts techniques, structurels et de confiance pour la validation Google AdSense

## Tableau des pages auditées

| URL attendue | URL réellement utilisée | Statut actuel | Problème détecté | Correction proposée | Information manquante à fournir par le propriétaire |
|-------------|------------------------|---------------|------------------|-------------------|-----------------------------------------------|
| `/fr/` | `src/app/[locale]/page.tsx` | ✅ OK | Aucun | - | - |
| `/fr/a-propos` | `src/app/[locale]/a-propos/page.tsx` | ⚠️ PARTIEL | Page existe mais contenu minimal, manque de détails sur l'équipe, zones géographiques, méthode de vérification | Enrichir le contenu avec sections supplémentaires | Coordonnées légales, détails équipe |
| `/fr/mission` | `src/app/[locale]/mission/page.tsx` | ✅ OK | Aucun | - | - |
| `/fr/equipe` | `src/app/[locale]/equipe/page.tsx` | ✅ OK | Aucun | - | - |
| `/fr/contact` | `src/app/[locale]/contact/page.tsx` | ✅ OK | Aucun | - | - |
| `/fr/mentions-legales` | NON EXISTANTE | ❌ MANQUANTE | Page légale obligatoire pour AdSense | Créer la page avec structure complète | Éditeur, responsable publication, hébergeur, coordonnées légales |
| `/fr/politique-confidentialite` | NON EXISTANTE | ❌ MANQUANTE | Page légale obligatoire pour AdSense | Créer la page avec structure complète | Détails traitement données, prestataires |
| `/fr/cookies` | NON EXISTANTE | ❌ MANQUANTE | Page légale obligatoire pour AdSense | Créer la page avec tableau des cookies | Tableau détaillé des cookies utilisés |
| `/fr/conditions-utilisation` | NON EXISTANTE | ❌ MANQUANTE | Page légale obligatoire pour AdSense | Créer la page avec structure complète | - |
| `/fr/politique-correction` | NON EXISTANTE | ❌ MANQUANTE | Page de confiance importante | Créer la page expliquant la procédure | - |
| `/fr/partenariats` | `src/app/[locale]/partenariats/page.tsx` | ❓ À VÉRIFIER | Page existe mais contenu à vérifier | Vérifier le contenu | - |
| `/fr/nous-soutenir` | `src/app/[locale]/nous-soutenir/page.tsx` | ✅ OK | Aucun | - | - |
| `/fr/actualites` | `src/app/[locale]/actualites/page.tsx` | ✅ OK | Aucun | - | - |
| `/fr/politique` | `src/app/[locale]/politique/page.tsx` | ✅ OK | Aucun | - | - |
| `/fr/economie` | `src/app/[locale]/economie/page.tsx` | ✅ OK | Aucun | - | - |
| `/fr/science-tech` | `src/app/[locale]/science-tech/page.tsx` | ✅ OK | Aucun | - | - |
| `/fr/culture` | `src/app/[locale]/culture/page.tsx` | ✅ OK | Aucun | - | - |
| `/fr/sport` | `src/app/[locale]/sport/page.tsx` | ✅ OK | Aucun | - | - |
| `/fr/religion` | `src/app/[locale]/religion/page.tsx` | ✅ OK | Aucun | - | - |
| `/fr/blog` | `src/app/[locale]/blog/page.tsx` | ✅ OK | Aucun | - | - |
| `/fr/recherche` | `src/app/[locale]/recherche/page.tsx` | ✅ OK | Aucun | - | - |

## Analyse détaillée

### 1. Structure des routes
- ✅ Architecture Next.js App Router avec `[locale]` pour internationalisation
- ✅ Pages principales existent et fonctionnent
- ❌ Pages légales manquantes (mentions-legales, politique-confidentialite, cookies, conditions-utilisation, politique-correction)

### 2. Fichiers de traduction
- ✅ Système i18n personnalisé dans `src/lib/i18n.ts`
- ✅ Langues supportées: fr, en, es, sw, ln, rw
- ✅ Fichier `messages/fr.json` existe
- ⚠️ Certaines traductions manquantes pour les nouvelles pages légales

### 3. Composants header et footer
- ✅ Navigation dans `src/components/Navigation.tsx` bien structurée
- ✅ Footer dans `src/components/Footer.tsx` avec liens vers pages légales
- ❌ Liens footer pointent vers des routes inexistantes (mentions-legales, politique-confidentialite, cookies, conditions-utilisation)
- ⚠️ Certains liens footer pointent vers `#` (réseau Malakin Media)

### 4. Sitemap.xml
- ✅ Fichier `src/app/sitemap.ts` existe
- ✅ Inclut pages principales et articles dynamiques
- ❌ N'inclut PAS les pages légales manquantes
- ⚠️ Pages 404 ou privées ne devraient pas être incluses

### 5. robots.txt
- ✅ Fichier `public/robots.txt` existe
- ✅ Autorise Googlebot et Mediapartners-Google
- ✅ Bloque `/compte/` et `/studio/`
- ⚠️ Vérifier si pages institutionnelles sont accessibles

### 6. Services tiers détectés
- ✅ Google Tag Manager (GTM-WTSZH2PT)
- ✅ Google Analytics (G-8V0GJZF6WD)
- ✅ Google AdSense (ca-pub-4621769509750492)
- ❌ Aucune CMP (Consent Management Platform) détectée
- ❌ Aucun mécanisme de consentement cookies détecté

### 7. Métadonnées SEO
- ✅ Metadata globale dans `src/app/layout.tsx`
- ✅ Title, description, OpenGraph, Twitter cards configurés
- ✅ Canonical et alternates pour langues
- ⚠️ Certaines pages n'ont pas de métadonnées spécifiques

## Problèmes critiques pour AdSense

1. **Pages légales manquantes** (Bloquant)
   - Mentions légales
   - Politique de confidentialité
   - Politique de cookies
   - Conditions d'utilisation
   - Politique de correction

2. **Absence de CMP** (Bloquant)
   - Aucun système de consentement cookies
   - Google AdSense activé sans consentement utilisateur
   - Non conforme RGPD/GDPR

3. **Liens footer cassés** (Bloquant)
   - Liens vers pages légales inexistantes
   - Mauvaise expérience utilisateur

4. **Informations légales manquantes** (Bloquant)
   - Éditeur du site non spécifié
   - Hébergeur non spécifié
   - Coordonnées légales incomplètes

## Actions recommandées

### Priorité 1 - Critique (Bloquant AdSense)
1. Créer les 5 pages légales manquantes
2. Implémenter une CMP pour le consentement cookies
3. Compléter les informations légales dans les pages
4. Corriger les liens footer

### Priorité 2 - Important
1. Enrichir la page À propos
2. Ajouter les pages légales au sitemap
3. Vérifier et compléter les métadonnées SEO
4. Tester tous les liens internes

### Priorité 3 - Recommandé
1. Ajouter des redirections pour anciennes URLs
2. Créer une page de plan du site
3. Optimiser les performances
4. Tester l'accessibilité
