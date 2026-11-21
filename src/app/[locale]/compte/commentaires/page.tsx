'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare, Calendar, ExternalLink, User, Pencil, Save, X, Trash2 } from 'lucide-react';
import { authFetch } from '@/lib/client-auth';
import { useAccountUser } from '@/lib/use-account-user';
import { getArticleUrl } from '@/lib/article-url';

interface UserComment {
  id: string;
  content: string;
  createdAt: string;
  article?: {
    title?: string;
    slug?: string;
    publishedAt?: string;
  } | null;
}

export default function CommentsPage() {
  const { user: currentUser, ready } = useAccountUser();
  const { locale } = useParams<{ locale: string }>();
  const [comments, setComments] = useState<UserComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);

  const userKey = currentUser?.id ?? currentUser?.email ?? null;

  useEffect(() => {
    if (!ready) return;

    if (!userKey) return;

    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await authFetch('/api/user/comments');

        if (response.status === 401) {
          setUnauthorized(true);
          setComments([]);
          return;
        }

        if (!response.ok) {
          setComments([]);
          return;
        }

        const data = await response.json();
        setUnauthorized(false);
        setComments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching comments:', error);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [ready, userKey]);

  const handleEdit = (comment: UserComment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editingContent.trim()) return;

    try {
      setSaving(true);
      const response = await authFetch('/api/user/comments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
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

  const handleDelete = async (commentId: string) => {
    try {
      setDeletingCommentId(commentId);
      const response = await authFetch('/api/user/comments', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentId }),
      });

      if (!response.ok) {
        throw new Error('Impossible de supprimer le commentaire');
      }

      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      if (editingCommentId === commentId) {
        setEditingCommentId(null);
        setEditingContent('');
      }
      setDeleteConfirmationId(null);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Une erreur est survenue lors de la suppression du commentaire.');
    } finally {
      setDeletingCommentId(null);
    }
  };

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
            <h1 className="text-3xl font-bold text-foreground mb-1">Mes commentaires</h1>
            <p className="text-muted-foreground">
              {currentUser && !unauthorized
                ? `Connecté en tant que ${currentUser.name || currentUser.email}`
                : 'Vous devez être connecté pour voir vos commentaires.'}
            </p>
          </div>
        </div>

        {showLogin ? (
          <div className="bg-card rounded-lg p-12 text-center">
            <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Connexion requise</h2>
            <p className="text-muted-foreground mb-4">
              Veuillez vous reconnecter pour voir vos commentaires.
            </p>
            <a
              href={`/${locale}/compte/connexion`}
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              Se connecter
            </a>
          </div>
        ) : comments.length === 0 ? (
          <div className="bg-card rounded-lg p-12 text-center">
            <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Aucun commentaire</h2>
            <p className="text-muted-foreground mb-4">
              Vous n&apos;avez pas encore laissé de commentaire sur les articles.
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
                    <button
                      type="button"
                      disabled={deletingCommentId === comment.id}
                      onClick={() => setDeleteConfirmationId(comment.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {deletingCommentId === comment.id ? 'Suppression...' : 'Supprimer'}
                    </button>
                    {comment.article?.slug && <Link
                      href={getArticleUrl(locale, comment.article.slug, comment.article.publishedAt)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </Link>}
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

      {deleteConfirmationId && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-comment-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && deletingCommentId === null) {
              setDeleteConfirmationId(null);
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Trash2 className="h-6 w-6" />
            </div>
            <h2 id="delete-comment-title" className="text-xl font-bold text-foreground">
              Supprimer ce commentaire ?
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Cette action est définitive. Le commentaire et ses réponses seront supprimés.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deletingCommentId !== null}
                onClick={() => setDeleteConfirmationId(null)}
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-60"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={deletingCommentId !== null}
                onClick={() => handleDelete(deleteConfirmationId)}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                {deletingCommentId ? 'Suppression...' : 'Oui, supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
