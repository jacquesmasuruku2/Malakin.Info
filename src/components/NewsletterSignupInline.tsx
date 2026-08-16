'use client';

import { useState } from 'react';

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
  buttonText = 'S\'abonner',
}: NewsletterSignupInlineProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setStatus({
        type: 'error',
        text: locale === 'fr' ? 'Veuillez saisir une adresse email valide.' : 'Please enter a valid email address.',
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
          name: trimmedName || null,
          consent: true,
          interests: ['actualites', 'economie', 'culture', 'sport', 'tech'],
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || 'Erreur lors de l’inscription.');
      }

      setStatus({
        type: 'success',
        text:
          locale === 'fr'
            ? 'Merci, vous êtes inscrit à la newsletter.'
            : 'Thank you, you are subscribed to the newsletter.',
      });
      setEmail('');
      setName('');
    } catch (error) {
      setStatus({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : locale === 'fr'
              ? 'Une erreur est survenue.'
              : 'An error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.08)] sm:p-8">
      <div className="mb-6 text-center">
        <h2 className="font-heading text-2xl font-bold text-[#081C3D] sm:text-3xl">{title}</h2>
        <p className="mt-3 text-sm text-slate-600 sm:text-base">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-[1.1fr_1fr_auto]">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={locale === 'fr' ? 'Votre nom (optionnel)' : 'Your name (optional)'}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0B3B8B] focus:bg-white"
          />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={locale === 'fr' ? 'Votre adresse email' : 'Your email address'}
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0B3B8B] focus:bg-white"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-[#0B3B8B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#082a63] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (locale === 'fr' ? 'Envoi...' : 'Sending...') : buttonText}
          </button>
        </div>
      </form>

      {status && (
        <p className={`mt-4 text-sm ${status.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
          {status.text}
        </p>
      )}
    </div>
  );
}
