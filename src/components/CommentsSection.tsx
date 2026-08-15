'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { ThumbsUp, MessageCircle, Send, User as UserIcon } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  replies?: Comment[];
}

interface CommentsSectionProps {
  articleId: string;
  locale: string;
}

export default function CommentsSection({ articleId, locale }: CommentsSectionProps) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const userId = session?.user?.id ?? null;

  const [comments, setComments] = useState<Comment[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCommentIndex, setActiveCommentIndex] = useState(0);

  const t = {
    comments: locale === 'fr' ? 'Commentaires' : 'Comments',
    writeComment: locale === 'fr' ? 'Écrire un commentaire' : 'Write a comment',
    reply: locale === 'fr' ? 'Répondre' : 'Reply',
    like: locale === 'fr' ? 'J\'aime' : 'Like',
    submit: locale === 'fr' ? 'Envoyer' : 'Submit',
    cancel: locale === 'fr' ? 'Annuler' : 'Cancel',
    noComments: locale === 'fr' ? 'Soyez le premier à commenter' : 'Be the first to comment',
    loginToComment: locale === 'fr' ? 'Connectez-vous pour interagir' : 'Login to interact',
    loginPrompt: locale === 'fr' ? 'Connectez-vous pour interagir avec cet article.' : 'Login to interact with this article.',
    login: locale === 'fr' ? 'Connexion' : 'Login',
    loginWithGoogle: locale === 'fr' ? 'Google' : 'Google',
    placeholder: locale === 'fr' ? 'Votre commentaire...' : 'Your comment...',
    replyPlaceholder: locale === 'fr' ? 'Votre réponse...' : 'Your reply...',
    enterComment: locale === 'fr' ? 'Veuillez écrire un commentaire.' : 'Please enter a comment.',
    enterReply: locale === 'fr' ? 'Veuillez entrer une réponse.' : 'Please enter a reply.',
  };

  const commentTotal = useMemo(
    () => comments.reduce((acc, comment) => acc + 1 + (comment.replies?.length ?? 0), 0),
    [comments]
  );

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  useEffect(() => {
    fetchLikeStatus();
  }, [articleId, userId]);

  useEffect(() => {
    if (comments.length <= 1) return;

    const interval = setInterval(() => {
      setActiveCommentIndex((current) => (current + 1) % comments.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [comments.length]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/comments?articleId=${articleId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLikeStatus = async () => {
    try {
      const url = `/api/likes?articleId=${articleId}${userId ? `&userId=${userId}` : ''}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.isLiked);
        setLikeCount(data.likeCount);
      }
    } catch (error) {
      console.error('Error fetching like status:', error);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated || !userId) {
      setError(t.loginToComment);
      return;
    }

    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleId, userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        setLikeCount(data.likeCount);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSubmitComment = async () => {
    setError(null);

    if (!newComment.trim()) {
      setError(t.enterComment);
      return;
    }

    if (!isAuthenticated || !userId) {
      setError(t.loginToComment);
      return;
    }

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleId, userId, content: newComment }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments([comment, ...comments]);
        setNewComment('');
        setShowCommentForm(false);
      } else {
        const data = await response.json();
        setError(data?.error || 'Failed to submit comment.');
      }
    } catch (error) {
      console.error('Error creating comment:', error);
      setError('Failed to submit comment.');
    }
  };

  const handleReply = async (commentId: string) => {
    setError(null);

    if (!replyText.trim()) {
      setError(t.enterReply);
      return;
    }

    if (!isAuthenticated || !userId) {
      setError(t.loginToComment);
      return;
    }

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleId, userId, content: replyText, parentId: commentId }),
      });

      if (response.ok) {
        const reply = await response.json();
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? { ...comment, replies: [...(comment.replies || []), reply] }
              : comment
          )
        );
        setReplyText('');
        setReplyingTo(null);
      } else {
        const data = await response.json();
        setError(data?.error || 'Failed to submit reply.');
      }
    } catch (error) {
      console.error('Error creating reply:', error);
      setError('Failed to submit reply.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const localeStr = locale === 'fr' ? 'fr-FR' : 'en-US';
    return new Intl.DateTimeFormat(localeStr, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const renderCommentCard = (comment: Comment) => (
    <div className="w-full">
      <p className="text-[1.45rem] font-black tracking-[-0.04em] text-foreground leading-none" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
        {comment.user.name} :
      </p>
      <p className="mt-2 text-[1rem] font-normal text-foreground/80 leading-none" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
        {formatDate(comment.createdAt)}
      </p>

      <div className="relative mt-4">
        <div className="absolute left-4 top-0 h-3.5 w-3.5 -translate-y-1/2 rotate-45 border-l-[2px] border-t-[2px] border-[#d52e96] bg-[#e9e9e9]" />
        <div className="overflow-hidden rounded-[12px] bg-[#e9e9e9] px-5 py-4 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)] sm:px-6">
          <p className="text-[1.02rem] leading-[1.7] text-foreground whitespace-pre-line" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
            {comment.content}
          </p>
        </div>
      </div>
    </div>
  );

  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment.id}
      className={`${isReply ? 'ml-6 sm:ml-10 mt-4' : 'mb-6'}`}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          {comment.user.avatarUrl ? (
            <img
              src={comment.user.avatarUrl}
              alt={comment.user.name}
              className="w-11 h-11 rounded-full object-cover"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-primary" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="bg-muted/70 border border-border rounded-3xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <p className="text-sm font-semibold text-foreground truncate">{comment.user.name}</p>
                <p className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</p>
              </div>
              <button
                type="button"
                onClick={() => setReplyingTo((current) => (current === comment.id ? null : comment.id))}
                className="text-xs text-primary hover:text-primary/90 font-medium"
              >
                {t.reply}
              </button>
            </div>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{comment.content}</p>
          </div>

          {replyingTo === comment.id && (
            <div className="mt-3 rounded-3xl border border-border bg-background p-4">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={t.replyPlaceholder}
                rows={3}
                className="w-full rounded-2xl border border-border bg-muted/10 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              <div className="mt-3 flex flex-wrap gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyText('');
                  }}
                  className="px-4 py-2 rounded-2xl bg-muted text-foreground hover:bg-muted/80 text-sm"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={() => handleReply(comment.id)}
                  className="px-4 py-2 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
                >
                  {t.submit}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 border-t border-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-muted-foreground">{commentTotal} {t.comments}</p>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">{t.comments}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleLike}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
              isLiked
                ? 'bg-gradient-to-r from-[#f6d365] to-[#d4af37] text-[#201a07] shadow-[0_8px_20px_rgba(212,175,55,0.35)]'
                : 'bg-[#f8f5ea] text-[#3b2d00] ring-1 ring-[#e7d48d] hover:bg-[#f2e6b7]'
            }`}
          >
            <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            {likeCount}
          </button>
          <button
            type="button"
            onClick={() => {
              if (!isAuthenticated) {
                setError(t.loginToComment);
              } else {
                setShowCommentForm((prev) => !prev);
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition"
          >
            <MessageCircle className="w-4 h-4" />
            {t.writeComment}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!isAuthenticated && (
        <div className="mb-6 rounded-3xl border border-border bg-muted/50 p-5 text-sm text-foreground">
          <p className="mb-4 text-sm text-muted-foreground">{t.loginPrompt}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${locale}/compte/connexion`}
              className="inline-flex items-center justify-center rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80 transition"
            >
              {t.login}
            </Link>
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: window.location.href })}
              className="inline-flex items-center justify-center rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
            >
              {t.loginWithGoogle}
            </button>
          </div>
        </div>
      )}

      {showCommentForm && isAuthenticated && (
        <div className="mb-6 rounded-3xl border border-border bg-muted/70 p-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t.placeholder}
            rows={4}
            className="w-full rounded-3xl border border-border bg-background px-4 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <div className="mt-4 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setShowCommentForm(false);
                setNewComment('');
              }}
              className="rounded-2xl border border-border bg-muted px-4 py-2 text-sm text-foreground hover:bg-muted/80 transition"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              onClick={handleSubmitComment}
              className="rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
            >
              <Send className="w-4 h-4 inline-block" />
              <span>{t.submit}</span>
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Chargement...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{t.noComments}</p>
        </div>
      ) : (
        <div className="space-y-8 py-2">
          {comments.map((comment) => (
            <div key={comment.id} className="mx-auto max-w-[1180px] px-1 sm:px-2">
              {renderCommentCard(comment)}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
