# Traductions éditoriales (français / anglais)

## Architecture en place

- Les articles restent dans `Article`; une seule ligne par langue est enregistrée dans `ArticleTranslation`, liée à l’article d’origine.
- Les billets de blog restent dans `BlogPost`; leurs contenus localisés sont enregistrés séparément dans `BlogPostTranslation` sans dupliquer les entrées source.
- `TranslationJob` conserve l’état, le nombre de tentatives et la dernière erreur. Les jobs démarrent immédiatement après la réponse; le worker planifié les reprend aussi après une interruption.
- `BlogPostTranslationJob` applique le même suivi, la reprise et la relance aux billets de blog.
- Une traduction générée est un brouillon. Un administrateur la corrige dans l’éditeur de l’article puis la publie explicitement.
- Les noms et descriptions de catégories sont enregistrés dans `CategoryTranslation`. Les catégories manquantes sont traduites lors du premier job d’article, puis éditables avec la traduction de l’article.
- Les versions non publiées, absentes ou obsolètes ne sont pas affichées sous une URL de langue cible. Les routes indisponibles ont une page 404 localisée et `noindex`.
- Les URL des articles conservent le même slug entre langues (`/fr/mon-article` et `/en/mon-article`). Le sitemap ne publie que les langues avec traduction éditoriale et catégorie disponibles.
- Les billets ont des routes dédiées (`/fr/blog/mon-billet` et `/en/blog/mon-billet`), une liste localisée et des métadonnées/canoniques `hreflang`; une langue absente répond en 404 `noindex`.

## LibreTranslate auto-hébergé

Configurer ces variables **uniquement côté serveur** du site public et du backoffice :

```env
LIBRETRANSLATE_URL="http://libretranslate:5000/translate"
LIBRETRANSLATE_API_KEY="secret-fourni-par-votre-instance"
```

`LIBRETRANSLATE_URL` doit être joignable depuis les processus Next.js. Ne pas utiliser de variable `NEXT_PUBLIC_*` pour l’URL ou la clé. Sans instance configurée, la tâche échoue explicitement et son erreur est visible dans le backoffice. Les appels ont un délai maximal et les erreurs HTTP ne créent pas de traduction de remplacement.

Les anciennes routes `/api/translate/*` du site public exigent le secret serveur `TRANSLATION_ADMIN_API_KEY` dans un en-tête `Authorization: Bearer …`; le backoffice actuel utilise ses routes authentifiées et ne transmet jamais la clé LibreTranslate au navigateur.

## Flux éditorial

1. À la création d’un article ou d’un billet de blog, le backoffice met en file la langue cible sélectionnée; depuis l’édition, un administrateur peut également générer ou relancer une tâche.
2. Next.js démarre la tâche après l’envoi de la réponse. En complément, le cron Vercel appelle chaque cinq minutes `/api/translation-jobs/worker`; ce worker récupère les tâches en attente et remet en file celles restées en cours depuis plus de cinq minutes. Le job et ses erreurs restent enregistrés en base; l’interface actualise son état.
3. Le contenu HTML est envoyé à LibreTranslate au format HTML. Les articles structurés conservent leur structure et seuls les champs de texte éditorial sont traduits; URLs et attributs de liens restent inchangés.
4. Le résultat est enregistré avec l’état `draft`. Dans **Éditeur de traduction**, corriger le titre, le chapeau, le corps, les textes alternatifs/légendes, la catégorie et le SEO, puis choisir « Publier cette traduction ».
5. Si le texte source est modifié, les traductions existantes deviennent `outdated`; les versions obsolètes sont retirées des pages publiques et du sitemap jusqu’à leur révision.

## Migration additive

Les schémas Prisma du site et du backoffice sont synchronisés. Les migrations additives créent `TranslationJob` et `BlogPostTranslationJob`, ajoutent les tables de contenu traduit, les champs SEO/captions et les horodatages éditoriaux nécessaires. Les lignes de traduction d’articles déjà présentes restent publiées. Aucune table d’article, de billet, d’utilisateur, de commentaire ou de statistiques n’est remplacée.

En déploiement, exécuter les migrations Prisma habituelles (`prisma migrate deploy`) avant d’utiliser l’éditeur. Les répertoires `prisma/migrations` du site et `admin-panel/prisma/migrations` contiennent la même migration pour garder les deux clients alignés sur la base partagée.

Le worker exige `CRON_SECRET`, configuré dans le projet Vercel du backoffice; Vercel l’envoie comme jeton Bearer. En dehors de Vercel, configurer un ordonnanceur externe pour appeler cette route avec `Authorization: Bearer <CRON_SECRET>` toutes les cinq minutes. Le traitement immédiat via `after()` reste une optimisation; l’ordonnanceur constitue le mécanisme de reprise.

## Périmètre des sources de contenu

Les articles d’actualité utilisent les tables Prisma `Article` et `Category`. Les billets du modèle `BlogPost` ont maintenant des routes publiques `/[locale]/blog`, une gestion dédiée dans le backoffice et un parcours de traduction éditoriale. Les données Sanity ne sont pas converties implicitement afin de préserver les données et le comportement existants.
