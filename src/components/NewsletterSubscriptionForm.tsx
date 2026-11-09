'use client';

import { useState } from 'react';
import { Check, Send } from 'lucide-react';
import { subscribeToNewsletter } from '@/lib/newsletter-client';
import { t } from '@/lib/copy';

const interestOptions = [
  {
    id: 'actualites',
    title: { fr: 'Actualités', en: 'News' },
    description: {
      fr: 'Les informations essentielles d’Afrique et du monde.',
      en: 'Essential news from Africa and around the world.',
    },
  },
  {
    id: 'economie',
    title: { fr: 'Économie', en: 'Economy' },
    description: {
      fr: 'Entreprises, marchés et initiatives économiques.',
      en: 'Business, markets, and economic initiatives.',
    },
  },
  {
    id: 'culture',
    title: { fr: 'Culture', en: 'Culture' },
    description: {
      fr: 'Arts, musique, cinéma et tendances.',
      en: 'Arts, music, cinema, and trends.',
    },
  },
  {
    id: 'sport',
    title: { fr: 'Sport', en: 'Sports' },
    description: {
      fr: 'Les résultats et les histoires qui font le sport.',
      en: 'The results and stories shaping the world of sports.',
    },
  },
  {
    id: 'tech',
    title: { fr: 'Science & technologie', en: 'Science & technology' },
    description: {
      fr: 'Innovations, découvertes et numérique.',
      en: 'Innovation, discoveries, and digital news.',
    },
  },
];

export default function NewsletterSubscriptionForm({ locale }: { locale: string }) {
  const isEnglish = locale === 'en';
  const [email, setEmail] = useState('');
  const [selectedInterests, setSelectedInterests] = useState(
    interestOptions.map((option) => option.id),
  );
  const [hasConsent, setHasConsent] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    try {
      const result = await subscribeToNewsletter(email.trim(), selectedInterests);

      if (result.status === 'already_subscribed') {
        setStatus({ type: 'error', text: t(locale, 'newsletterAlreadySubscribed') });
      } else if (result.status === 'error') {
        setStatus({
          type: 'error',
          text: result.message || t(locale, 'newsletterError'),
        });
      } else {
        setStatus({ type: 'success', text: t(locale, 'newsletterThanks') });
        setEmail('');
      }
    } catch {
      setStatus({ type: 'error', text: t(locale, 'newsletterError') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
    >
      <div>
        <label htmlFor="newsletter-email" className="mb-2 block text-sm font-semibold text-[#081c3d]">
          {isEnglish ? 'Email address' : 'Adresse e-mail'} <span aria-hidden="true">*</span>
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={isEnglish ? 'you@example.com' : 'vous@exemple.com'}
          autoComplete="email"
          required
          className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-[#081c3d] outline-none transition placeholder:text-slate-400 focus:border-[#0b3b8b] focus:ring-2 focus:ring-[#0b3b8b]/15"
        />
      </div>

      <fieldset className="mt-7">
        <legend className="text-base font-semibold text-[#081c3d]">
          {isEnglish ? 'Choose your topics' : 'Choisissez vos sujets'}
        </legend>
        <p className="mt-1 text-sm text-slate-600">
          {isEnglish
            ? 'You can change your preferences at any time.'
            : 'Vous pourrez modifier vos préférences à tout moment.'}
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {interestOptions.map((option) => {
            const checked = selectedInterests.includes(option.id);
            return (
              <label
                key={option.id}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                  checked
                    ? 'border-[#0b3b8b]/35 bg-[#0b3b8b]/5'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleInterest(option.id)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[#0b3b8b]"
                  aria-label={option.title[isEnglish ? 'en' : 'fr']}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[#081c3d]">
                    {option.title[isEnglish ? 'en' : 'fr']}
                  </span>
                  <span className="mt-0.5 block text-xs leading-5 text-slate-600">
                    {option.description[isEnglish ? 'en' : 'fr']}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-7 border-t border-slate-200 pt-5">
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-700">
          <input
            type="checkbox"
            checked={hasConsent}
            onChange={(event) => setHasConsent(event.target.checked)}
            required
            className="mt-1 h-4 w-4 shrink-0 accent-[#0b3b8b]"
          />
          <span>
            {isEnglish
              ? 'I agree to receive the MalakInfo newsletter by email. I can unsubscribe at any time.'
              : 'J’accepte de recevoir la newsletter MalakInfo par e-mail. Je peux me désabonner à tout moment.'}
          </span>
        </label>
        <button
          type="submit"
          disabled={isSubmitting || !hasConsent}
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[#0b3b8b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#081c3d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b3b8b] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          {isSubmitting
            ? isEnglish ? 'Subscribing…' : 'Inscription…'
            : isEnglish ? 'Subscribe to the newsletter' : 'M’inscrire à la newsletter'}
        </button>
        {status && (
          <p
            role={status.type === 'error' ? 'alert' : 'status'}
            className={`mt-4 flex items-start gap-2 text-sm ${
              status.type === 'success' ? 'text-emerald-700' : 'text-red-700'
            }`}
          >
            {status.type === 'success' && <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
            {status.text}
          </p>
        )}
      </div>
    </form>
  );
}
