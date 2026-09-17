'use client';

import { useState } from 'react';
import { t } from '@/lib/copy';
import { subscribeToNewsletter } from '@/lib/newsletter-client';

interface NewsletterSignupInlineProps {
  locale?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
}

export default function NewsletterSignupInline({
  locale = 'fr',
  title = 'Restez informé',
  subtitle = 'Abonnez-vous à notre newsletter pour recevoir les dernières actualités.',
  buttonText = "S'abonner",
}: NewsletterSignupInlineProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setStatus({
        type: 'error',
        text: t(locale, 'invalidEmail'),
      });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const result = await subscribeToNewsletter(trimmedEmail);

      if (result.status === 'already_subscribed') {
        setStatus({
          type: 'error',
          text: t(locale, 'newsletterAlreadySubscribed'),
        });
        return;
      }

      if (result.status === 'error') {
        setStatus({
          type: 'error',
          text: result.message || t(locale, 'newsletterError'),
        });
        return;
      }

      setStatus({
        type: 'success',
        text: t(locale, 'newsletterThanks'),
      });
      setEmail('');
    } catch {
      setStatus({
        type: 'error',
        text: t(locale, 'newsletterError'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 text-center sm:mb-8">
        <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">{title}</h2>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:gap-4">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t(locale, 'emailPlaceholder')}
            required
            className="w-full border-0 border-b border-border bg-transparent px-0 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? t(locale, 'sending') : buttonText}
          </button>
        </div>
      </form>

      {status && (
        <p className={`mt-4 text-center text-sm ${status.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
          {status.text}
        </p>
      )}
    </div>
  );
}
