'use client';

import { useEffect, useState } from 'react';
import { Bookmark, BookmarkCheck, Bell } from 'lucide-react';
import { authFetch } from '@/lib/client-auth';
import {
  fetchCategorySuggestion,
  followCategory,
  markFollowedCategoryNotified,
  showCategoryNotification,
  type SuggestedArticle,
} from '@/lib/followed-categories';

interface FavoriteButtonProps {
  articleId: string;
  locale: string;
  categoryId?: string;
  categoryTitle?: string;
  initialFavorited?: boolean;
}

export default function FavoriteButton({
  articleId,
  locale,
  categoryId,
  categoryTitle,
  initialFavorited = false,
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestedArticle | null>(null);
  const isFrench = locale === 'fr';

  useEffect(() => {
    let ignore = false;

    const checkFavorite = async () => {
      try {
        const response = await authFetch(`/api/user/favorites?articleId=${encodeURIComponent(articleId)}`);
        if (!response.ok) return;

        const data = await response.json();
        if (!ignore) {
          setFavorited(Boolean(data?.favorited));
        }
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    checkFavorite();
    return () => {
      ignore = true;
    };
  }, [articleId]);

  const offerRelatedArticle = async () => {
    if (!categoryId) return;

    followCategory({
      id: categoryId,
      title: categoryTitle || (isFrench ? 'cette rubrique' : 'this section'),
    });

    const related = await fetchCategorySuggestion(categoryId, articleId);
    if (!related) return;

    setSuggestion(related);

    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch {
        // Permission prompt can be ignored; the in-page card still appears.
      }
    }

    showCategoryNotification(
      locale,
      categoryTitle || related.categoryTitle || (isFrench ? 'MalakInfo' : 'MalakInfo'),
      related,
    );
    markFollowedCategoryNotified();
  };

  const handleToggleFavorite = async () => {
    try {
      setLoading(true);

      const response = await authFetch('/api/user/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleId }),
      });

      if (response.status === 401) {
        window.location.href = `/${locale}/compte/connexion?redirect=${encodeURIComponent(window.location.href)}`;
        return;
      }

      if (!response.ok) {
        throw new Error('Impossible de modifier le favori');
      }

      const data = await response.json();
      const isFavorited = Boolean(data?.favorited);
      setFavorited(isFavorited);

      if (isFavorited) {
        await offerRelatedArticle();
      } else {
        setSuggestion(null);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      window.alert('Une erreur est survenue lors de la modification du favori.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 space-y-4 border-t border-border pt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {isFrench ? 'Garder cet article' : 'Save this article'}
          </p>
          <p className="text-sm text-muted-foreground">
            {isFrench
              ? 'Enregistrez-le en favori pour retrouver la suite de cette rubrique.'
              : 'Save it to favorites to keep reading from this section.'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggleFavorite}
          disabled={loading}
          className={`inline-flex items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors ${
            favorited
              ? 'border-primary bg-primary text-white hover:bg-primary/90'
              : 'border-border bg-background text-foreground hover:bg-muted'
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {favorited ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          {loading
            ? '...'
            : favorited
              ? (isFrench ? 'Enregistré en favori' : 'Saved to favorites')
              : (isFrench ? 'Enregistrer en favori' : 'Save to favorites')}
        </button>
      </div>

      {suggestion && (
        <a
          href={`/${locale}/${suggestion.slug}`}
          className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:border-primary/30"
        >
          {suggestion.mainImageUrl && (
            <img
              src={suggestion.mainImageUrl}
              alt=""
              className="h-20 w-28 shrink-0 rounded-xl object-cover"
            />
          )}
          <div className="min-w-0">
            <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
              <Bell className="h-3.5 w-3.5" />
              {isFrench ? 'À lire aussi dans cette rubrique' : 'More from this section'}
            </p>
            <p className="font-semibold leading-snug text-foreground">{suggestion.title}</p>
            {suggestion.excerpt && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{suggestion.excerpt}</p>
            )}
          </div>
        </a>
      )}
    </div>
  );
}
