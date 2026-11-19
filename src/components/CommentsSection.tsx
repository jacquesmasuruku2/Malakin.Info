'use client';

import { useState, useEffect, useMemo, type CSSProperties } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { ThumbsUp, MessageSquareText, MessagesSquare, Send, ChevronDown } from 'lucide-react';
import { authFetch } from '@/lib/client-auth';
import { useAccountUser } from '@/lib/use-account-user';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  reactions?: Array<{
    type: string;
    userId: string;
  }>;
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

const commentReactionOptions = [
  { type: 'like', emoji: '👍', particles: ['👏', '✨', '🎉'], celebration: ['👍', '👏', '🎉', '👏'] },
  { type: 'love', emoji: '♥️', particles: ['🌸', '♡', '💐'], celebration: ['❤️', '🌸', '💕', '💐'] },
  { type: 'haha', emoji: '😂', particles: ['🤣', '😂', '✨'], celebration: ['😂', '🤣', '😆', '🤭'] },
  { type: 'wow', emoji: '😮', particles: ['✦', '✨', '🌟'], celebration: ['😮', '✨', '🌟', '🤩'] },
  { type: 'sad', emoji: '😢', particles: ['💧', '💧', '💙'], celebration: ['😢', '💧', '🥺', '💙'] },
  { type: 'angry', emoji: '😡', particles: ['💢', '🔥', '💢'], celebration: ['😡', '🔥', '💢', '😤'] },
];

const reactionCelebrationParticles = Array.from({ length: 28 }, (_, index) => ({
  id: index,
  left: `${(index * 47 + 4) % 94}%`,
  delay: `${(index * 83) % 750}ms`,
  duration: `${2600 + ((index * 137) % 1200)}ms`,
  size: `${1.2 + ((index * 17) % 15) / 10}rem`,
}));

export default function CommentsSection({ articleId, locale }: CommentsSectionProps) {
  const { user, ready } = useAccountUser();
  const pathname = usePathname();
  const isAuthenticated = ready && !!user;

  const [comments, setComments] = useState<Comment[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplyThreads, setExpandedReplyThreads] = useState<Set<string>>(() => new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animatingReaction, setAnimatingReaction] = useState<{
    commentId: string;
    type: string;
    nonce: number;
  } | null>(null);

  const t = {
    comments: locale === 'fr' ? 'Commentaires' : 'Comments',
    writeComment: locale === 'fr' ? 'Écrire un commentaire' : 'Write a comment',
    reply: locale === 'fr' ? 'Répondre' : 'Reply',
    readReplies: locale === 'fr' ? 'Lire les réponses' : 'Read replies',
    hideReplies: locale === 'fr' ? 'Masquer les réponses' : 'Hide replies',
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
  const isCelebratingReaction = animatingReaction !== null;
  const celebrationOption = commentReactionOptions.find(
    (option) => option.type === animatingReaction?.type
  );

  useEffect(() => {
    if (!animatingReaction) return;

    const nonce = animatingReaction.nonce;
    const timeout = window.setTimeout(() => {
      setAnimatingReaction((current) => current?.nonce === nonce ? null : current);
    }, 4500);

    return () => window.clearTimeout(timeout);
  }, [animatingReaction]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/comments?articleId=${articleId}`)
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          if (!cancelled) setComments(data);
        }
      })
      .catch((error) => console.error('Error fetching comments:', error))
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [articleId]);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    authFetch(`/api/likes?articleId=${articleId}`)
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          if (!cancelled) {
            setIsLiked(data.isLiked);
            setLikeCount(data.likeCount);
          }
        }
      })
      .catch((error) => console.error('Error fetching like status:', error));
    return () => {
      cancelled = true;
    };
  }, [articleId, ready, isAuthenticated]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      setError(t.loginToComment);
      return;
    }

    try {
      const response = await authFetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleId }),
      });

      if (response.status === 401) {
        setError(t.loginToComment);
        return;
      }

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

    if (!isAuthenticated) {
      setError(t.loginToComment);
      return;
    }

    try {
      const response = await authFetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleId, content: newComment }),
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

    if (!isAuthenticated) {
      setError(t.loginToComment);
      return;
    }

    try {
      const response = await authFetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleId, content: replyText, parentId: commentId }),
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
        setExpandedReplyThreads((current) => new Set(current).add(commentId));
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

  const handleCommentReaction = async (commentId: string, type: string) => {
    if (!isAuthenticated) {
      setError(t.loginToComment);
      return;
    }

    setAnimatingReaction((current) => ({
      commentId,
      type,
      nonce: (current?.nonce ?? 0) + 1,
    }));

    try {
      const response = await authFetch('/api/comments/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, type }),
      });

      if (response.status === 401) {
        setError(t.loginToComment);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        const updateComment = (comment: Comment): Comment => ({
          ...comment,
          reactions: comment.id === commentId ? data.reactions : comment.reactions,
          replies: comment.replies?.map(updateComment),
        });
        setComments((current) => current.map(updateComment));
      }
    } catch (error) {
      console.error('Error updating comment reaction:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const localeStr = locale === 'fr' ? 'fr-FR' : 'en-US';
    return new Intl.DateTimeFormat(localeStr, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplyThreads((current) => {
      const next = new Set(current);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment.id}
      className={`${isReply ? 'ml-10 sm:ml-[92px] mt-5' : 'mb-8'}`}
    >
      <div className="w-full">
        <p className="text-[1.45rem] font-black tracking-[-0.04em] text-foreground leading-none" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
          {comment.user.name} :
        </p>
        <p className="mt-2 text-[1rem] font-normal text-foreground/80 leading-none" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
          {formatDate(comment.createdAt)}
        </p>

        <div className="relative mt-4 max-w-[820px]">
          <div className="absolute left-4 top-0 h-3.5 w-3.5 -translate-y-1/2 rotate-45 border-l-[2px] border-t-[2px] border-[#d52e96] bg-muted" />
          <div className="overflow-hidden rounded-[12px] border border-border bg-muted px-5 py-4 sm:px-6">
            <p className="text-[1.02rem] leading-[1.7] text-foreground whitespace-pre-line" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
              {comment.content}
            </p>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setReplyingTo((current) => (current === comment.id ? null : comment.id))}
              className="rounded-lg px-2 py-1 text-sm font-bold text-foreground transition hover:bg-muted hover:text-primary"
            >
              {t.reply}
            </button>
            <span className="mx-1 text-border">·</span>
            {commentReactionOptions.map((option) => {
              const count = comment.reactions?.filter((reaction) => reaction.type === option.type).length ?? 0;
              const isSelected = comment.reactions?.some(
                (reaction) => reaction.type === option.type && reaction.userId === user?.id
              );
              return (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => handleCommentReaction(comment.id, option.type)}
                  aria-pressed={isSelected}
                  title={option.type}
                  className={`inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-full px-1.5 text-base transition ${
                    isSelected
                      ? 'bg-primary/10 shadow-sm ring-1 ring-primary/30'
                      : 'hover:bg-muted'
                  }`}
                >
                  <span className="relative inline-flex">
                    <span
                      key={`emoji-${animatingReaction?.commentId === comment.id && animatingReaction.type === option.type
                        ? animatingReaction.nonce
                        : 'idle'}`}
                      className={`inline-flex ${animatingReaction?.commentId === comment.id && animatingReaction.type === option.type
                        ? `comment-reaction-emoji comment-reaction-${option.type}`
                        : ''}`}
                    >
                      {option.emoji}
                    </span>
                    {animatingReaction?.commentId === comment.id && animatingReaction.type === option.type && (
                      <span
                        key={`particles-${animatingReaction.nonce}`}
                        className={`comment-reaction-particles comment-reaction-particles-${option.type}`}
                        aria-hidden="true"
                      >
                        {option.particles.map((particle, index) => (
                          <span key={`${particle}-${index}`} className={`comment-reaction-particle particle-${index + 1}`}>
                            {particle}
                          </span>
                        ))}
                      </span>
                    )}
                  </span>
                  {count > 0 && <span className="text-xs font-bold text-foreground">{count}</span>}
                </button>
              );
            })}
          </div>

          {replyingTo === comment.id && (
            <div className="mt-3 max-w-[820px] rounded-[12px] border border-border bg-background p-4">
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
        <>
          <button
            type="button"
            onClick={() => toggleReplies(comment.id)}
            aria-expanded={expandedReplyThreads.has(comment.id)}
            aria-controls={`comment-replies-${comment.id}`}
            className="mt-3 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <span>{expandedReplyThreads.has(comment.id) ? t.hideReplies : t.readReplies}</span>
            <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
              {comment.replies.length}
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${expandedReplyThreads.has(comment.id) ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>
          <div
            id={`comment-replies-${comment.id}`}
            hidden={!expandedReplyThreads.has(comment.id)}
            className="mt-5 space-y-5"
          >
            {expandedReplyThreads.has(comment.id) &&
              comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 border-t border-border" data-comments-section>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="flex items-baseline gap-3 border-b-2 border-[#b8a1ff] pb-3 pr-4 font-heading text-2xl sm:text-3xl font-normal text-foreground">
            <span>{t.comments} :</span>
            <span className="font-bold text-[#0aa84f]">{commentTotal}</span>
          </h2>
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
                setShowCommentForm(true);
              }
            }}
            aria-expanded={isAuthenticated && showCommentForm}
            aria-controls="article-comment-form"
            className="inline-flex items-center gap-2.5 rounded-xl border border-primary/20 bg-primary/[0.06] px-4 py-2.5 text-sm font-semibold text-primary transition hover:border-primary/40 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-background text-primary shadow-sm">
              <MessageSquareText className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </span>
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
              href={`/${locale}/compte/connexion?redirect=${encodeURIComponent(pathname)}&scroll_to_comments=true`}
              className="inline-flex items-center justify-center rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80 transition"
            >
              {t.login}
            </Link>
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: `${pathname}?scroll_to_comments=true` })}
              className="inline-flex items-center justify-center rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
            >
              {t.loginWithGoogle}
            </button>
          </div>
        </div>
      )}

      {showCommentForm && isAuthenticated && (
        <div
          id="article-comment-form"
          className="mb-6 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
        >
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MessagesSquare className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </span>
            <h3 className="text-sm font-semibold text-foreground">{t.writeComment}</h3>
          </div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t.placeholder}
            aria-label={t.writeComment}
            rows={3}
            className="w-full resize-y rounded-xl border border-border bg-background px-3.5 py-3 text-sm leading-relaxed text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
          />
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowCommentForm(false);
                setNewComment('');
              }}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              onClick={handleSubmitComment}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
            >
              <Send className="h-4 w-4" />
              {t.submit}
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
          <MessageSquareText className="w-12 h-12 mx-auto mb-4 opacity-50" strokeWidth={1.8} />
          <p>{t.noComments}</p>
        </div>
      ) : (
        <div className="space-y-8 py-2">
          {comments.map((comment) => (
            <div key={comment.id} className="mx-auto max-w-[1180px] px-1 sm:px-2">
              {renderComment(comment)}
            </div>
          ))}
        </div>
      )}

      {isCelebratingReaction && celebrationOption && (
        <div
          className={`comment-reaction-celebration comment-reaction-celebration-${celebrationOption.type}`}
          aria-hidden="true"
        >
          {reactionCelebrationParticles.map((particle) => (
            <span
              key={`${animatingReaction.nonce}-${particle.id}`}
              className="comment-reaction-floater"
              style={{
                left: particle.left,
                animationDelay: particle.delay,
                animationDuration: particle.duration,
                fontSize: particle.size,
              } satisfies CSSProperties}
            >
              <span className={`comment-reaction-floater-glyph comment-reaction-floater-glyph-${celebrationOption.type}`}>
                {celebrationOption.celebration[particle.id % celebrationOption.celebration.length]}
              </span>
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
