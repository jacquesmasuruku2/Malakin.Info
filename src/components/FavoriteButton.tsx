'use client';

import { useEffect, useState } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { getClientAuthHeaders } from '@/lib/client-auth';

interface FavoriteButtonProps {
  articleId: string;
  locale: string;
  initialFavorited?: boolean;
}

export default function FavoriteButton({ articleId, locale, initialFavorited = false }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    const checkFavorite = async () => {
      try {
        const response = await fetch(`/api/user/favorites?articleId=${encodeURIComponent(articleId)}`, {
          headers: getClientAuthHeaders(),
        });
        if (!response.ok) {
          return;
        }

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

  const handleToggleFavorite = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getClientAuthHeaders(),
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
      setFavorited(Boolean(data?.favorited));
    } catch (error) {
      console.error('Error toggling favorite:', error);
      window.alert('Une erreur est survenue lors de la modification du favori.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggleFavorite}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        favorited
          ? 'border-primary bg-primary text-white hover:bg-primary/90'
          : 'border-border bg-background text-foreground hover:bg-muted'
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {favorited ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
      {loading ? '...' : favorited ? 'Enregistré' : 'Ajouter aux favoris'}
    </button>
  );
}
