'use client';

import { useState } from 'react';
import { Heart, MessageCircle, Send, User as UserIcon } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
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
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const t = {
    comments: locale === 'fr' ? 'Commentaires' : 'Comments',
    writeComment: locale === 'fr' ? 'Écrire un commentaire' : 'Write a comment',
    reply: locale === 'fr' ? 'Répondre' : 'Reply',
    like: locale === 'fr' ? 'J\'aime' : 'Like',
    likes: locale === 'fr' ? 'J\'aimes' : 'Likes',
    submit: locale === 'fr' ? 'Envoyer' : 'Submit',
    cancel: locale === 'fr' ? 'Annuler' : 'Cancel',
    noComments: locale === 'fr' ? 'Soyez le premier à commenter' : 'Be the first to comment',
    loginToComment: locale === 'fr' ? 'Connectez-vous pour commenter' : 'Login to comment',
    placeholder: locale === 'fr' ? 'Votre commentaire...' : 'Your comment...',
    replyPlaceholder: locale === 'fr' ? 'Votre réponse...' : 'Your reply...',
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      createdAt: new Date().toISOString(),
      user: {
        name: 'Utilisateur',
      },
    };
    
    setComments([comment, ...comments]);
    setNewComment('');
    setShowCommentForm(false);
  };

  const handleReply = (commentId: string) => {
    if (!replyText.trim()) return;
    
    const reply: Comment = {
      id: Date.now().toString(),
      content: replyText,
      createdAt: new Date().toISOString(),
      user: {
        name: 'Utilisateur',
      },
    };

    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), reply],
        };
      }
      return comment;
    }));
    
    setReplyText('');
    setReplyingTo(null);
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

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-12 mt-3' : 'mb-6'}`}>
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          {comment.user.avatarUrl ? (
            <img
              src={comment.user.avatarUrl}
              alt={comment.user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-primary" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-foreground">{comment.user.name}</span>
              <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
            </div>
            <p className="text-sm text-foreground mb-3">{comment.content}</p>
            <div className="flex items-center gap-4">
              <button
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setReplyingTo(comment.id)}
              >
                <MessageCircle className="w-4 h-4" />
                {t.reply}
              </button>
              <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors">
                <Heart className="w-4 h-4" />
                {t.like}
              </button>
            </div>
          </div>
          
          {replyingTo === comment.id && (
            <div className="mt-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={t.replyPlaceholder}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={3}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleReply(comment.id)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
                >
                  {t.submit}
                </button>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyText('');
                  }}
                  className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors text-sm"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground">{t.comments}</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              isLiked
                ? 'bg-red-500 text-white'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likeCount}</span>
          </button>
          <button
            onClick={() => setShowCommentForm(!showCommentForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            {t.writeComment}
          </button>
        </div>
      </div>

      {showCommentForm && (
        <div className="mb-8 bg-muted/50 rounded-lg p-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t.placeholder}
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            rows={4}
          />
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => {
                setShowCommentForm(false);
                setNewComment('');
              }}
              className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSubmitComment}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {t.submit}
            </button>
          </div>
        </div>
      )}

      {comments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{t.noComments}</p>
        </div>
      ) : (
        <div>
          {comments.map(comment => renderComment(comment))}
        </div>
      )}
    </section>
  );
}
