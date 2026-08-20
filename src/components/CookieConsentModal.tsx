'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Mail, X } from 'lucide-react';

const STORAGE_KEY = 'malakinfo_cookie_consent';
const PREFERENCES_KEY = 'malakinfo_cookie_preferences';
const NEWSLETTER_PROMPT_KEY = 'malakinfo_newsletter_prompt_dismissed';

const PREFERENCE_CATEGORIES = [
  { key: 'improveServices', label: 'Développer et améliorer les services', required: false },
  { key: 'adsPersonalization', label: 'Publicité et contenus personnalisés', required: false },
  { key: 'deviceAnalytics', label: 'Analyser activement les caractéristiques de l\'appareil pour l\'identification', required: false },
  { key: 'profilePersonalization', label: 'Créer des profils de contenus personnalisés', required: false },
  { key: 'contentPerformance', label: 'Mesurer la performance des contenus', required: false },
  { key: 'preciseLocation', label: 'Utiliser des données de géolocalisation précises', required: false },
  { key: 'functionality', label: 'Fonctionnement', required: true },
  { key: 'personalizedContent', label: 'Utiliser mes informations personnelles pour des contenus ciblés', required: false },
];

const defaultPreferences = PREFERENCE_CATEGORIES.reduce<Record<string, boolean>>((acc, item) => {
  acc[item.key] = item.required ? true : false;
  return acc;
}, {});

function buildSavedPreferences(raw: string | null) {
  if (!raw) {
    return defaultPreferences;
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, boolean>;
    return {
      ...defaultPreferences,
      ...parsed,
    };
  } catch {
    return defaultPreferences;
  }
}

function CookiePreferencesModal({
  locale,
  preferences,
  onSetPreference,
  onSave,
  onAcceptAll,
  onRejectAll,
  onClose,
}: {
  locale: string;
  preferences: Record<string, boolean>;
  onSetPreference: (key: string, value: boolean) => void;
  onSave: () => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[calc(100vh-4rem)] overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl shadow-black/15 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-[calc(100%-3rem)]">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">MalakInfo</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950 sm:text-3xl">
              Bienvenue chez MalakInfo - Gestion du consentement
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              Nos partenaires et nous déposons des cookies et utilisons des informations non sensibles de votre appareil pour améliorer nos services, analyser notre audience et afficher du contenu adapté. Vous pouvez personnaliser vos choix ci-dessous.
            </p>
            <a
              href="https://malakinfo.com/fr/politique-confidentialite"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex text-sm font-medium text-slate-950 underline underline-offset-4 transition hover:text-slate-700"
            >
              Voir la politique de confidentialité
            </a>
          </div>
          <button
            type="button"
            aria-label="Fermer la gestion du consentement"
            className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="mt-8 space-y-4">
          {PREFERENCE_CATEGORIES.map((category) => (
            <div
              key={category.key}
              className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-base font-semibold text-slate-950">{category.label}</p>
                  {category.required && (
                    <span className="mt-2 inline-flex rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white">
                      REQUIS
                    </span>
                  )}
                </div>
                {!category.required ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        preferences[category.key]
                          ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                          : 'border-slate-900 bg-slate-950 text-white hover:bg-slate-800'
                      }`}
                      onClick={() => onSetPreference(category.key, false)}
                    >
                      Refuser
                    </button>
                    <button
                      type="button"
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        preferences[category.key]
                          ? 'border-slate-900 bg-slate-950 text-white hover:bg-slate-800'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                      onClick={() => onSetPreference(category.key, true)}
                    >
                      Accepter
                    </button>
                  </div>
                ) : (
                  <span className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                    Requis
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            onClick={onRejectAll}
          >
            Refuser tout
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            onClick={onAcceptAll}
          >
            Accepter tout
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            onClick={onSave}
          >
            Enregistrer mes préférences
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CookieConsentModal() {
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'fr';
  const [isVisible, setIsVisible] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [preferences, setPreferences] = useState<Record<string, boolean>>(defaultPreferences);
  const [isNewsletterPromptOpen, setIsNewsletterPromptOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterName, setNewsletterName] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isNewsletterSubmitting, setIsNewsletterSubmitting] = useState(false);

  useEffect(() => {
    const consent = window.localStorage.getItem(STORAGE_KEY);
    const savedPreferences = buildSavedPreferences(window.localStorage.getItem(PREFERENCES_KEY));

    setPreferences(savedPreferences);

    if (!consent) {
      const timer = window.setTimeout(() => setIsVisible(true), 15_000);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const consent = window.localStorage.getItem(STORAGE_KEY);
    const dismissed = window.localStorage.getItem(NEWSLETTER_PROMPT_KEY);

    if (!consent || dismissed) return;

    const timer = window.setTimeout(() => {
      setIsNewsletterPromptOpen(true);
    }, 35_000);

    return () => window.clearTimeout(timer);
  }, [isVisible]);

  useEffect(() => {
    if (isPreferencesOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible, isPreferencesOpen]);

  const savePreferences = (nextPreferences: Record<string, boolean>) => {
    window.localStorage.setItem(STORAGE_KEY, 'configured');
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(nextPreferences));
    setPreferences(nextPreferences);
    setIsVisible(false);
    setIsPreferencesOpen(false);
  };

  const closeNewsletterPrompt = () => {
    window.localStorage.setItem(NEWSLETTER_PROMPT_KEY, 'true');
    setIsNewsletterPromptOpen(false);
  };

  const handleNewsletterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsNewsletterSubmitting(true);
    setNewsletterStatus(null);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newsletterEmail.trim(),
          name: newsletterName.trim() || null,
          consent: true,
          interests: ['actualites', 'economie', 'culture', 'sport', 'tech'],
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(data?.error || 'Une erreur est survenue.');

      window.localStorage.setItem(NEWSLETTER_PROMPT_KEY, 'true');
      setNewsletterStatus({ type: 'success', text: 'Merci, vous êtes inscrit à la newsletter MalakInfo.' });
      window.setTimeout(() => setIsNewsletterPromptOpen(false), 1400);
    } catch (error) {
      setNewsletterStatus({
        type: 'error',
        text: error instanceof Error ? error.message : 'Une erreur est survenue. Veuillez réessayer.',
      });
    } finally {
      setIsNewsletterSubmitting(false);
    }
  };

  const handleConsent = (value: 'true' | 'false') => {
    const nextPreferences = PREFERENCE_CATEGORIES.reduce<Record<string, boolean>>((acc, item) => {
      acc[item.key] = value === 'true' ? true : item.required ? true : false;
      return acc;
    }, {});

    savePreferences(nextPreferences);
  };

  const handleAcceptAll = () => {
    savePreferences(
      PREFERENCE_CATEGORIES.reduce<Record<string, boolean>>((acc, item) => {
        acc[item.key] = true;
        return acc;
      }, {})
    );
  };

  const handleRejectAll = () => {
    savePreferences(
      PREFERENCE_CATEGORIES.reduce<Record<string, boolean>>((acc, item) => {
        acc[item.key] = item.required ? true : false;
        return acc;
      }, {})
    );
  };

  const handleSave = () => {
    savePreferences(preferences);
  };

  const handlePreferenceChange = (key: string, value: boolean) => {
    setPreferences((current) => ({ ...current, [key]: value }));
  };

  if (!isVisible && !isPreferencesOpen && !isNewsletterPromptOpen) {
    return null;
  }

  return (
    <>
      {isVisible && !isPreferencesOpen && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-3 sm:inset-x-auto sm:left-3 sm:max-w-[430px] sm:px-0 sm:pb-3">
          <div className="pointer-events-auto cookie-consent-enter w-full rounded-[3px] border border-slate-700 bg-[#101a21] p-4 text-white shadow-2xl shadow-black/30 sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="/images/logo.png"
                  alt="MalakInfo"
                  className="h-8 w-auto rounded object-contain brightness-0 invert"
                  loading="eager"
                />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white">Cookie Consent</p>
                  <h2 className="sr-only">Gestion du consentement sur MalakInfo</h2>
                </div>
              </div>
              <button
                type="button"
                aria-label="Fermer la fenêtre de consentement"
                className="rounded-full bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/20"
                onClick={() => handleConsent('false')}
              >
                ×
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs leading-5 text-slate-200 sm:text-sm">
              <p>
                Nous partageons les informations que vous nous communiquez et des données sur votre utilisation du site avec nos partenaires, notamment pour la publicité et l&apos;analyse.
              </p>
            </div>

            <div className="mt-4 grid gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-[2px] bg-[#6846ff] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#5634ef]"
                onClick={() => handleConsent('true')}
              >
                Accepter tous les cookies
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-[2px] bg-[#6846ff] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#5634ef]"
                onClick={() => handleConsent('false')}
              >
                Refuser tout
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-[2px] bg-white px-4 py-3 text-sm font-bold text-[#6846ff] transition hover:bg-slate-100"
                onClick={() => setIsPreferencesOpen(true)}
              >
                Paramètres des cookies
              </button>
            </div>
          </div>
        </div>
      )}

      {isPreferencesOpen && (
        <CookiePreferencesModal
          locale={locale}
          preferences={preferences}
          onSetPreference={handlePreferenceChange}
          onSave={handleSave}
          onAcceptAll={handleAcceptAll}
          onRejectAll={handleRejectAll}
          onClose={() => setIsPreferencesOpen(false)}
        />
      )}

      {isNewsletterPromptOpen && (
        <div className="newsletter-backdrop fixed inset-0 z-[60] flex items-center justify-center bg-[#07111c]/80 px-4 py-6 backdrop-blur-sm">
          <div className="newsletter-card-enter relative max-h-[calc(100svh-1rem)] w-full max-w-4xl overflow-y-auto border border-[#d7cdbb] bg-[#f7f3eb] shadow-2xl">
            <button
              type="button"
              onClick={closeNewsletterPrompt}
              aria-label="Fermer l'inscription à la newsletter"
              className="newsletter-close absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#081c3d] bg-white/90 text-[#081c3d] transition hover:bg-[#081c3d] hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid md:grid-cols-[1fr_0.85fr]">
              <div className="newsletter-copy order-2 p-4 sm:p-10 md:order-1 md:p-12">
                <p className="newsletter-stagger text-[11px] font-bold uppercase tracking-[0.28em] text-[#c56b36]">La lettre MalakInfo</p>
                <h2 className="newsletter-stagger mt-2 font-heading text-2xl font-bold leading-[1.05] text-[#081c3d] sm:mt-4 sm:text-5xl">
                  L&apos;essentiel de l&apos;actualité africaine.
                </h2>
                <div className="newsletter-rule mt-3 h-px w-14 bg-[#c56b36] sm:mt-5" />
                <p className="newsletter-stagger mt-3 max-w-xl text-sm leading-5 text-[#53606b] sm:mt-5 sm:text-lg sm:leading-7">
                  Recevez nos informations les plus importantes, nos analyses et nos dossiers directement dans votre boîte mail.
                </p>
                <p className="newsletter-stagger mt-2 text-xs font-medium text-[#081c3d] sm:mt-4 sm:text-sm">
                  Une lecture claire, fiable et indépendante. Sans bruit inutile.
                </p>
              </div>

              <div className="newsletter-form-panel relative order-1 flex min-h-0 items-end overflow-hidden bg-[#0b315e] p-4 sm:p-10 md:order-2 md:min-h-0">
                <img src="/images/logo.png" alt="MalakInfo" className="newsletter-logo absolute left-1/2 top-1/2 w-[80%] -translate-x-1/2 -translate-y-1/2 opacity-10 grayscale brightness-0 invert" />
                <div className="relative z-10 w-full">
                  <div className="newsletter-icon newsletter-stagger mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#d4af37] text-[#081c3d] sm:mb-5 sm:h-11 sm:w-11"><Mail className="h-4 w-4 sm:h-5 sm:w-5" /></div>
                  <h3 className="newsletter-stagger text-lg font-bold leading-6 text-white sm:text-xl">Restez au cœur de l&apos;information.</h3>
                  <p className="newsletter-stagger mt-1 text-xs leading-4 text-blue-100 sm:mt-2 sm:text-sm sm:leading-6">Inscription gratuite. Vous pouvez vous désabonner à tout moment.</p>

                  <form onSubmit={handleNewsletterSubmit} className="newsletter-stagger mt-4 space-y-2 sm:mt-6 sm:space-y-3">
                    <input type="text" value={newsletterName} onChange={(event) => setNewsletterName(event.target.value)} placeholder="Votre nom (optionnel)" className="newsletter-input w-full border border-white/20 bg-white px-3 py-2 text-xs text-[#081c3d] outline-none placeholder:text-slate-400 focus:border-[#d4af37] sm:px-4 sm:py-3 sm:text-sm" />
                    <input type="email" value={newsletterEmail} onChange={(event) => setNewsletterEmail(event.target.value)} placeholder="Votre adresse e-mail" required className="newsletter-input w-full border border-white/20 bg-white px-3 py-2 text-xs text-[#081c3d] outline-none placeholder:text-slate-400 focus:border-[#d4af37] sm:px-4 sm:py-3 sm:text-sm" />
                    <button type="submit" disabled={isNewsletterSubmitting} className="newsletter-submit w-full bg-[#d4af37] px-3 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-[#081c3d] transition hover:bg-[#e4c65c] disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:py-3 sm:text-sm sm:tracking-[0.12em]">
                      {isNewsletterSubmitting ? 'Inscription...' : 'Recevoir la newsletter'}
                    </button>
                  </form>
                  {newsletterStatus && <p className={`mt-3 text-sm ${newsletterStatus.type === 'success' ? 'text-emerald-200' : 'text-red-200'}`}>{newsletterStatus.text}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
