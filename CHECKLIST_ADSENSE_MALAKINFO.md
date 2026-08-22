# Checklist AdSense MalakInfo

**Date**: 22 août 2026  
**Objectif**: Préparation du site pour la validation Google AdSense

## Corrigé automatiquement

- ✅ **Pages légales créées**
  - `/fr/mentions-legales` - Mentions légales avec structure complète
  - `/fr/politique-confidentialite` - Politique de confidentialité détaillée
  - `/fr/cookies` - Politique de cookies avec tableau des cookies
  - `/fr/conditions-utilisation` - Conditions d'utilisation complètes
  - `/fr/politique-correction` - Politique de correction des erreurs

- ✅ **Sitemap mis à jour**
  - Ajout des 5 pages légales au sitemap
  - Priorité 0.3 pour les pages légales
  - Fréquence de mise à jour mensuelle

- ✅ **Structure des routes**
  - Architecture Next.js App Router correcte
  - Pages principales existent et fonctionnent
  - Routes dynamiques pour articles et catégories

- ✅ **Métadonnées SEO globales**
  - Title et description configurés
  - OpenGraph et Twitter cards
  - Canonical et alternates pour langues
  - Robots meta configurés

- ✅ **Services tiers identifiés**
  - Google Tag Manager (GTM-WTSZH2PT)
  - Google Analytics (G-8V0GJZF6WD)
  - Google AdSense (ca-pub-4621769509750492)

- ✅ **robots.txt configuré**
  - Autorise Googlebot et Mediapartners-Google
  - Bloque les zones admin (/compte/, /studio/)
  - Sitemap référencé

- ✅ **Navigation et footer**
  - Liens footer vers pages légales fonctionnels
  - Navigation principale bien structurée
  - Liens sociaux configurés

## À vérifier manuellement

- ⚠️ **Implémentation CMP (Consent Management Platform)**
  - Aucune CMP détectée dans le code
  - Google AdSense actif sans consentement utilisateur
  - **Action requise**: Implémenter une solution de consentement cookies (ex: Cookiebot, OneTrust, ou solution open-source)
  - **Priorité**: CRITIQUE - Bloquant pour AdSense en Europe

- ⚠️ **Test des pages légales**
  - Vérifier que toutes les pages s'affichent correctement
  - Tester les liens entre pages légales
  - Vérifier la cohérence du contenu
  - **Action**: Accéder à chaque page et vérifier l'affichage

- ⚠️ **Test du sitemap**
  - Vérifier que le sitemap est accessible à https://malakinfo.com/sitemap.xml
  - Vérifier que les nouvelles pages légales y figurent
  - **Action**: Soumettre le sitemap à Google Search Console

- ⚠️ **Vérification des liens internes**
  - Tester tous les liens du header et footer
  - Vérifier qu'aucun lien ne mène vers une 404
  - **Action**: Navigation manuelle sur le site

- ⚠️ **Test des formulaires**
  - Tester le formulaire de contact
  - Tester l'inscription newsletter
  - Vérifier les messages de succès/erreur
  - **Action**: Soumettre des tests sur chaque formulaire

- ⚠️ **Vérification mobile**
  - Tester l'affichage sur mobile
  - Vérifier que les pages légales sont lisibles
  - **Action**: Test sur différents appareils

- ⚠️ **Performance**
  - Vérifier le score Lighthouse
  - Optimiser si nécessaire
  - **Action**: Lancer Lighthouse audit

- ⚠️ **Accessibilité**
  - Vérifier le contraste des couleurs
  - Tester la navigation au clavier
  - **Action**: Audit accessibilité

## Information obligatoire à fournir par le propriétaire

### Mentions légales

- **Éditeur du site**
  - [ ] Nom de l'entreprise ou de l'organisation
  - [ ] Forme juridique (SARL, SA, association, etc.)
  - [ ] Capital social
  - [ ] Adresse du siège social complet
  - [ ] Numéro SIRET ou équivalent

- **Responsable de publication**
  - [ ] Nom et prénom
  - [ ] Fonction exacte

- **Hébergeur**
  - [ ] Nom de l'hébergeur
  - [ ] Adresse complète de l'hébergeur
  - [ ] Téléphone de l'hébergeur

### Politique de confidentialité

- **Responsable du traitement**
  - [ ] Nom complet du responsable
  - [ ] Coordonnées complètes

- **Prestataires techniques**
  - [ ] Liste des prestataires (hébergement, email, etc.)
  - [ ] Leurs politiques de confidentialité

### Autres informations

- **Numéro d'enregistrement**
  - [ ] Numéro d'enregistrement de l'entreprise (si applicable)

- **TVA**
  - [ ] Numéro TVA (si applicable)

- **Autorités de régulation**
  - [ ] CNIL ou autorité équivalent (si applicable)

## Actions prioritaires avant soumission AdSense

1. **IMMÉDIAT - Implémenter une CMP**
   - Sans CMP, AdSense rejettera le site pour non-conformité RGPD
   - Solutions recommandées: Cookiebot, OneTrust, ou solution open-source comme CookieConsent

2. **COMPLÉTER les informations légales**
   - Remplacer tous les "[À COMPLÉTER PAR LE PROPRIÉTAIRE]" par les informations réelles
   - Sans ces informations, les pages légales ne sont pas valides

3. **TESTER toutes les pages**
   - Vérifier que chaque page légale est accessible
   - Tester tous les liens

4. **SOUMETTRE le sitemap**
   - Ajouter le sitemap à Google Search Console
   - Vérifier que Google l'indexe correctement

## Fichiers modifiés

### Nouveaux fichiers créés
- `src/app/[locale]/mentions-legales/page.tsx`
- `src/app/[locale]/politique-confidentialite/page.tsx`
- `src/app/[locale]/cookies/page.tsx`
- `src/app/[locale]/conditions-utilisation/page.tsx`
- `src/app/[locale]/politique-correction/page.tsx`
- `AUDIT_PAGES_MALAKINFO.md`
- `CHECKLIST_ADSENSE_MALAKINFO.md`

### Fichiers modifiés
- `src/app/sitemap.ts` - Ajout des pages légales

## Notes importantes

- **Aucune garantie d'acceptation AdSense** : Ce travail corrige les défauts techniques et structurels détectables, mais Google AdSense a d'autres critères (âge du domaine, contenu original, trafic, etc.)

- **CMP obligatoire** : L'absence de Consent Management Platform est un bloquant critique pour l'acceptation AdSense en Europe

- **Informations légales** : Les pages légales contiennent des placeholders qui doivent être complétés avant toute soumission

- **Test requis** : Tous les changements doivent être testés manuellement avant soumission

## Prochaines étapes recommandées

1. Implémenter une CMP pour le consentement cookies
2. Compléter toutes les informations légales manquantes
3. Tester toutes les nouvelles pages
4. Vérifier le sitemap en production
5. Soumettre à Google Search Console
6. Attendre l'indexation des nouvelles pages
7. Soumettre à AdSense une fois tout validé
