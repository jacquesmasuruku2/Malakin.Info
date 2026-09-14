'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Heart, Calendar, ExternalLink, User } from 'lucide-react';
import { authFetch } from '@/lib/client-auth';
import { useAccountUser } from '@/lib/use-account-user';

export default function LikesPage() {
  const { user: currentUser, ready } = useAccountUser();
  const { locale } = useParams<{ locale: string }>();
  const [likes, setLikes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  const userKey = currentUser?.id ?? currentUser?.email ?? null;

  useEffect(() => {
    if (!ready) return;

    if (!userKey) {
      setUnauthorized(true);
      setLikes([]);
      setLoading(false);
      return;
    }

    const fetchLikes = async () => {
      try {
        const response = await authFetch('/api/user/likes');

        if (response.status === 401) {
          setUnauthorized(true);
          setLikes([]);
          return;
        }

        if (!response.ok) {
          setLikes([]);
          return;
        }

        const data = await response.json();
        setUnauthorized(false);
        setLikes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching likes:', error);
        setLikes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLikes();
  }, [ready, userKey]);

  if (!ready || loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  const showLogin = !currentUser || unauthorized;

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt={currentUser.name || 'Utilisateur'} className="h-full w-full object-cover" />
            ) : (
              <User className="h-6 w-6" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Mes likes</h1>
            <p className="text-muted-foreground">
              {currentUser && !unauthorized
                ? `Connecté en tant que ${currentUser.name || currentUser.email}`
                : 'Vous devez être connecté pour voir vos likes.'}
            </p>
          </div>
        </div>

        {showLogin ? (
          <div className="bg-card rounded-lg p-12 text-center">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Connexion requise</h2>
            <p className="text-muted-foreground mb-4">
              Veuillez vous reconnecter pour voir vos likes.
            </p>
            <a
              href={`/${locale}/compte/connexion`}
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              Se connecter
            </a>
          </div>
        ) : likes.length === 0 ? (
          <div className="bg-card rounded-lg p-12 text-center">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Aucun like</h2>
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas encore aimé d'article.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {likes.map((like) => (
              <div key={like.id} className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {like.article?.mainImageUrl && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={like.article.mainImageUrl}
                      alt={like.article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{like.article?.title}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
                    <Calendar className="w-4 h-4" />
                    {new Date(like.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <a
                    href={`/${locale}/${like.article?.slug}`}
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
        )}
      </div>
    </div>
  );
}
