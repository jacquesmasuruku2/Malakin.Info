'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Calendar, ExternalLink } from 'lucide-react';

export default function CommentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/fr/compte/connexion');
      return;
    }
    setUser(JSON.parse(userData));
    fetchComments();
  }, [router]);

  const fetchComments = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;
      
      const parsedUser = JSON.parse(userData);
      const response = await fetch(`/api/user/comments?userId=${parsedUser.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Mes commentaires</h1>
          <p className="text-muted-foreground">Tous vos commentaires sur les articles</p>
        </div>

        {loading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : comments.length === 0 ? (
          <div className="bg-card rounded-lg p-12 text-center">
            <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Aucun commentaire</h2>
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas encore laissé de commentaire sur les articles.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-card rounded-lg p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{comment.article?.title || 'Article'}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <a
                    href={`/${comment.article?.category?.slug || 'actualites'}/${comment.article?.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
                <p className="text-foreground">{comment.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
