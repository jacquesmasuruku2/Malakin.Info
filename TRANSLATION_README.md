# Système de Traduction Multilingue

## Vue d'ensemble

Ce système permet de traduire automatiquement le contenu des articles et des catégories selon la langue du site (fr/en). Les traductions sont stockées dans la base de données et servies avec un système de cache pour optimiser les performances.

## Architecture

### Base de données

Le schéma Prisma a été étendu avec les tables suivantes :

- **ArticleTranslation** : Stocke les traductions des articles
- **CategoryTranslation** : Stocke les traductions des catégories
- **Article.defaultLocale** : Langue par défaut de l'article
- **Category.defaultLocale** : Langue par défaut de la catégorie

### Services

1. **translation.ts** : Gestion des traductions avec cache
2. **translator.ts** : Service de traduction (Mock ou API réelle)
3. **translationCache.ts** : Système de cache pour les traductions

### API Endpoints

- `POST /api/translate/article/[id]` : Traduire un article
- `POST /api/translate/category/[id]` : Traduire une catégorie

## Configuration

### Variables d'environnement

Ajoutez ces variables à votre fichier `.env` :

```env
# Activer le traducteur mock pour le développement
USE_MOCK_TRANSLATOR="true"

# URL de l'API de traduction (optionnel)
TRANSLATION_API_URL="https://libretranslate.com/translate"

# Clé API pour le service de traduction (optionnel)
TRANSLATION_API_KEY=""
```

### Services de traduction

**Pour le développement (Mock)** :
```env
USE_MOCK_TRANSLATOR="true"
```

**Pour la production (API réelle)** :
```env
USE_MOCK_TRANSLATOR="false"
TRANSLATION_API_URL="https://libretranslate.com/translate"
TRANSLATION_API_KEY="your-api-key"
```

## Utilisation

### Traduction automatique dans les pages

Les pages d'articles chargent automatiquement les traductions selon la locale :

```typescript
import { getArticleTranslation, getCategoryTranslation } from '@/lib/translation';

// La traduction est automatique selon la locale de l'URL
const translatedArticle = await getArticleTranslation(article.id, locale);
const translatedCategory = await getCategoryTranslation(article.categoryId, locale);
```

### Traduction manuelle via API

**Traduire un article** :
```bash
curl -X POST https://malakinfo.com/api/translate/article/[article-id] \
  -H "Content-Type: application/json" \
  -d '{"targetLocale": "en"}'
```

**Traduire une catégorie** :
```bash
curl -X POST https://malakinfo.com/api/translate/category/[category-id] \
  -H "Content-Type: application/json" \
  -d '{"targetLocale": "en"}'
```

### Gestion des traductions

**Voir les traductions disponibles** :
```typescript
import { getArticleTranslations } from '@/lib/translation';

const translations = await getArticleTranslations(articleId);
// Returns: { defaultLocale: 'fr', translations: [...] }
```

**Sauvegarder une traduction manuelle** :
```typescript
import { saveArticleTranslation } from '@/lib/translation';

await saveArticleTranslation(articleId, 'en', {
  title: 'Translated Title',
  excerpt: 'Translated excerpt',
  content: '<p>Translated content</p>'
});
```

## Migration de la base de données

Pour appliquer les changements de schéma :

```bash
# Option 1: Utiliser Prisma (recommandé)
npx prisma db push

# Option 2: Utiliser le script de migration personnalisé
node migrate-translation.js
```

## Cache

Le système de cache améliore les performances :

- **TTL par défaut** : 30 minutes pour les articles, 1 heure pour les catégories
- **Invalidation automatique** : Le cache est invalidé lors de la mise à jour des traductions
- **Statistiques** : Vous pouvez vérifier l'état du cache avec `translationCache.getStats()`

## Flux de traduction

1. **Visiteur accède à** `/fr/science-tech/article-slug`
2. **Système vérifie** si une traduction française existe
3. **Si oui** : Affiche le contenu traduit
4. **Si non** : Affiche le contenu original (langue par défaut)
5. **Pour générer une traduction** : Utiliser l'API de traduction

## Exemples d'URL

- **Français** : `https://malakinfo.com/fr/science-tech/informatique-quantique`
- **Anglais** : `https://malakinfo.com/en/science-tech/informatique-quantique`

Le même slug est utilisé, mais le contenu change selon la locale.

## Dépannage

### Les traductions ne s'affichent pas

1. Vérifiez que les tables de traduction existent dans la base de données
2. Vérifiez que `defaultLocale` est défini sur les articles/catégories
3. Consultez les logs pour les erreurs de traduction

### Erreur de connexion à l'API de traduction

1. Vérifiez que `TRANSLATION_API_URL` est correct
2. Vérifiez que `TRANSLATION_API_KEY` est valide (si requis)
3. Pour le développement, utilisez `USE_MOCK_TRANSLATOR="true"`

### Problèmes de cache

```typescript
// Vider le cache manuellement
import { translationCache } from '@/lib/translationCache';

translationCache.clear(); // Tout vider
translationCache.clearType('article'); // Vider les articles
translationCache.clearId('article-id'); // Vider un article spécifique
```

## Extension du système

### Ajouter une nouvelle langue

1. Ajoutez la locale au middleware `src/middleware.ts`
2. Mettez à jour les traductions statiques dans les composants
3. Générez les traductions via l'API

### Support pour d'autres types de contenu

Le système peut être étendu pour :
- Blog posts
- Media
- Press releases
- Job offers

Suivez le même pattern que pour les articles et catégories.