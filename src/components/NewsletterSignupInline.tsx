'use client';

import { useState } from 'react';
import { t } from '@/lib/copy';

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
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          consent: true,
          interests: ['actualites', 'economie', 'culture', 'sport', 'tech'],
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || t(locale, 'newsletterError'));
      }

      setStatus({
        type: 'success',
        text: t(locale, 'newsletterThanks'),
      });
      setEmail('');
    } catch (error) {
      setStatus({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : t(locale, 'newsletterError'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="mb-6 text-center">
        <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">{title}</h2>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t(locale, 'emailPlaceholder')}
            required
            className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:bg-background"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? t(locale, 'sending') : buttonText}
          </button>
        </div>
      </form>

      {status && (
        <p className={`mt-4 text-sm ${status.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
          {status.text}
        </p>
      )}
    </div>
  );
}
