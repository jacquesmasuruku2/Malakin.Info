'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Bookmark, Calendar, ExternalLink, User } from 'lucide-react';

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [localUser, setLocalUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setLocalUser(JSON.parse(storedUser));
        } catch {
          setLocalUser(null);
        }
      }
    }
  }, []);

  const currentUser = session?.user ?? localUser;

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    fetchFavorites();
  }, [currentUser]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/favorites');

      if (response.ok) {
        const data = await response.json();
        setFavorites(Array.isArray(data) ? data : []);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const groupedFavorites = favorites.reduce((acc: Record<string, any[]>, favorite) => {
    const categoryName = favorite.article?.category?.title || 'Autres';
    acc[categoryName] = acc[categoryName] || [];
    acc[categoryName].push(favorite);
    return acc;
  }, {});

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt={currentUser.name || 'Utilisateur'} className="h-full w-full object-cover" />
            ) : (
              <User className="h-6 w-6" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Favoris</h1>
            <p className="text-muted-foreground">
              {currentUser ? `Connecté en tant que ${currentUser.name || currentUser.email}` : 'Vous devez être connecté pour voir vos favoris.'}
            </p>
          </div>
        </div>

        {!currentUser ? (
          <div className="bg-card rounded-lg p-12 text-center">
            <Bookmark className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Connexion requise</h2>
            <p className="text-muted-foreground mb-4">
              Veuillez vous reconnecter pour voir vos articles favoris.
            </p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-card rounded-lg p-12 text-center">
            <Bookmark className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Aucun favori</h2>
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas encore ajouté d'article à vos favoris.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedFavorites).map(([categoryName, categoryFavorites]) => (
              <div key={categoryName} className="space-y-4">
                <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
                  <h2 className="text-xl font-bold text-foreground">{categoryName}</h2>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {(categoryFavorites as any[]).length}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(categoryFavorites as any[]).map((favorite) => (
                    <div key={favorite.id} className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      {favorite.article?.mainImageUrl && (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={favorite.article.mainImageUrl}
                            alt={favorite.article.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{favorite.article?.title}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
                          <Calendar className="w-4 h-4" />
                          {new Date(favorite.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                        <a
                          href={`/${favorite.article?.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium"
                        >
                          Voir l'article
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
