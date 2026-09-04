'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { MessageSquare, Calendar, ExternalLink, User, Pencil, Save, X } from 'lucide-react';

export default function CommentsPage() {
  const { data: session, status } = useSession();
  const { locale } = useParams<{ locale: string }>();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [localUser, setLocalUser] = useState<any>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [saving, setSaving] = useState(false);

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

    fetchComments();
  }, [currentUser]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/comments');

      if (response.ok) {
        const data = await response.json();
        setComments(Array.isArray(data) ? data : []);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (comment: any) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editingContent.trim()) return;

    try {
      setSaving(true);
      const response = await fetch('/api/user/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, content: editingContent.trim() }),
      });

      if (!response.ok) {
        throw new Error('Impossible de modifier le commentaire');
      }

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId ? { ...comment, content: editingContent.trim() } : comment,
        ),
      );
      setEditingCommentId(null);
      setEditingContent('');
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Une erreur est survenue lors de la modification du commentaire.');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

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
            <h1 className="text-3xl font-bold text-foreground mb-1">Mes commentaires</h1>
            <p className="text-muted-foreground">
              {currentUser ? `Connecté en tant que ${currentUser.name || currentUser.email}` : 'Vous devez être connecté pour voir vos commentaires.'}
            </p>
          </div>
        </div>

        {!currentUser ? (
          <div className="bg-card rounded-lg p-12 text-center">
            <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Connexion requise</h2>
            <p className="text-muted-foreground mb-4">
              Veuillez vous reconnecter pour voir vos commentaires.
            </p>
          </div>
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
                <div className="flex items-start justify-between mb-4 gap-3">
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
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(comment)}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Modifier
                    </button>
                    <a
                      href={`/${locale}/${comment.article?.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                </div>

                {editingCommentId === comment.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      rows={4}
                      className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditingContent('');
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                        Annuler
                      </button>
                      <button
                        type="button"
                        disabled={saving || !editingContent.trim()}
                        onClick={() => handleSaveEdit(comment.id)}
                        className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Save className="h-3.5 w-3.5" />
                        {saving ? '...' : 'Enregistrer'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-foreground whitespace-pre-wrap">{comment.content}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
