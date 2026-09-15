'use client';

import { useEffect, useState } from 'react';
import { Mail, X } from 'lucide-react';
import {
  CONSENT_CATEGORIES,
  CONSENT_PREFERENCES_KEY,
  CONSENT_STORAGE_KEY,
  CONSENT_UPDATED_EVENT,
  DEFAULT_CONSENT_PREFERENCES,
  readConsentPreferences,
} from '@/lib/consent';
import { subscribeToNewsletter } from '@/lib/newsletter-client';

const STORAGE_KEY = CONSENT_STORAGE_KEY;
const PREFERENCES_KEY = CONSENT_PREFERENCES_KEY;
const NEWSLETTER_PROMPT_KEY = 'malakinfo_newsletter_prompt_dismissed';
const COOKIE_CONSENT_DELAY_MS = 2_000;
const PREFERENCE_CATEGORIES = CONSENT_CATEGORIES;
const defaultPreferences = DEFAULT_CONSENT_PREFERENCES;

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

function CookieWidgetIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden>
      <path
        d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"
        fill="none"
        stroke="#2563EB"
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8.2" cy="10.3" r="1.05" fill="#2563EB" />
      <circle cx="14.1" cy="9.2" r="0.85" fill="#2563EB" />
      <circle cx="11.2" cy="15.4" r="1" fill="#2563EB" />
    </svg>
  );
}

function choiceButtonClass(active: boolean) {
  return `inline-flex min-h-11 flex-1 items-center justify-center rounded-md border px-3 py-2.5 text-sm font-semibold transition sm:min-w-[7.5rem] sm:flex-none ${
    active
      ? 'border-[#081c3d] bg-[#081c3d] text-white'
      : 'border-[#c5ced8] bg-white text-[#53606b] hover:bg-[#f7f3eb]'
  }`;
}

function CookiePreferencesModal({
  preferences,
  onSetPreference,
  onSave,
  onAcceptAll,
  onRejectAll,
  onClose,
}: {
  preferences: Record<string, boolean>;
  onSetPreference: (key: string, value: boolean) => void;
  onSave: () => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-consent-title"
        className="flex max-h-[100dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-lg border border-[#d4af37]/40 bg-[#f7f3eb] shadow-2xl shadow-[#081c3d]/30 sm:max-h-[min(92dvh,44rem)] sm:rounded-lg"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#081c3d]/10 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:pt-5">
          <div className="min-w-0 pr-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0b3b8b]">MalakInfo</p>
            <h2 id="cookie-consent-title" className="mt-2 text-xl font-semibold leading-tight text-[#081c3d] sm:text-2xl">
              Gestion du consentement
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#53606b]">
              Choisissez les cookies que vous acceptez. Vos choix sont appliqués dès que vous les enregistrez.
            </p>
            <a
              href="/fr/politique-confidentialite"
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex text-sm font-medium text-[#0b3b8b] underline underline-offset-4"
            >
              Politique de confidentialité
            </a>
          </div>
          <button
            type="button"
            aria-label="Fermer la gestion du consentement"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#081c3d] text-white transition hover:bg-[#0b3b8b]"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
          {PREFERENCE_CATEGORIES.map((category) => {
            const accepted = Boolean(preferences[category.key]);

            return (
              <div
                key={category.key}
                className="rounded-md border border-[#d4af37]/30 bg-white p-3.5 sm:p-4"
              >
                <p className="text-sm font-semibold leading-snug text-[#081c3d] sm:text-base">
                  {category.label}
                </p>
                {category.required ? (
                  <span className="mt-3 inline-flex rounded-md border border-[#d4af37] bg-[#fff8dc] px-4 py-2 text-sm font-semibold text-[#081c3d]">
                    Requis
                  </span>
                ) : (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      aria-pressed={!accepted}
                      className={choiceButtonClass(!accepted)}
                      onClick={() => onSetPreference(category.key, false)}
                    >
                      Refuser
                    </button>
                    <button
                      type="button"
                      aria-pressed={accepted}
                      className={choiceButtonClass(accepted)}
                      onClick={() => onSetPreference(category.key, true)}
                    >
                      Accepter
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="grid shrink-0 gap-2 border-t border-[#081c3d]/10 bg-[#f7f3eb] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:grid-cols-3 sm:px-6">
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#081c3d] bg-white px-4 py-2.5 text-sm font-semibold text-[#081c3d]"
            onClick={onRejectAll}
          >
            Refuser tout
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#d4af37] bg-[#d4af37] px-4 py-2.5 text-sm font-semibold text-[#081c3d]"
            onClick={onAcceptAll}
          >
            Accepter tout
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#081c3d] px-4 py-2.5 text-sm font-semibold text-white sm:col-auto"
            onClick={onSave}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CookieConsentModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [preferences, setPreferences] = useState<Record<string, boolean>>(defaultPreferences);
  const [isNewsletterPromptOpen, setIsNewsletterPromptOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isNewsletterSubmitting, setIsNewsletterSubmitting] = useState(false);

  useEffect(() => {
    const consent = window.localStorage.getItem(STORAGE_KEY);

    if (!consent) {
      const timer = window.setTimeout(() => setIsVisible(true), COOKIE_CONSENT_DELAY_MS);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => setHasConsent(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const settleNewsletterPrompt = () => {
    try {
      window.sessionStorage.setItem(NEWSLETTER_PROMPT_KEY, 'true');
    } catch {
      // ignore storage failures
    }
  };

  const hasNewsletterPromptSettled = () => {
    try {
      return Boolean(
        window.sessionStorage.getItem(NEWSLETTER_PROMPT_KEY) ||
          window.localStorage.getItem(NEWSLETTER_PROMPT_KEY)
      );
    } catch {
      return false;
    }
  };

  const closeNewsletterPrompt = () => {
    settleNewsletterPrompt();
    setIsNewsletterPromptOpen(false);
  };

  useEffect(() => {
    if (!hasConsent || isVisible || isPreferencesOpen || isNewsletterPromptOpen) return;
    if (hasNewsletterPromptSettled()) return;

    const openNewsletterPrompt = () => {
      if (isVisible || isPreferencesOpen || isNewsletterPromptOpen) return;
      if (hasNewsletterPromptSettled()) return;

      settleNewsletterPrompt();
      setIsNewsletterPromptOpen(true);
    };

    const handleMouseOut = (event: MouseEvent) => {
      if (!event.relatedTarget && event.clientY <= 0) {
        openNewsletterPrompt();
      }
    };

    document.addEventListener('mouseout', handleMouseOut);
    return () => document.removeEventListener('mouseout', handleMouseOut);
  }, [hasConsent, isVisible, isPreferencesOpen, isNewsletterPromptOpen]);

  useEffect(() => {
    if (!isPreferencesOpen && !isNewsletterPromptOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (isPreferencesOpen) {
        savePreferences(preferences, true);
        return;
      }
      closeNewsletterPrompt();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNewsletterPromptOpen, isPreferencesOpen, preferences]);

  useEffect(() => {
    if (isPreferencesOpen || isNewsletterPromptOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isPreferencesOpen, isNewsletterPromptOpen]);

  const savePreferences = (nextPreferences: Record<string, boolean>, close = true) => {
    const next = {
      ...nextPreferences,
      functionality: true,
    };
    window.localStorage.setItem(STORAGE_KEY, 'configured');
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(CONSENT_UPDATED_EVENT));
    setHasConsent(true);
    setPreferences(next);
    if (close) {
      setIsVisible(false);
      setIsPreferencesOpen(false);
    }
  };

  const handleNewsletterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsNewsletterSubmitting(true);
    setNewsletterStatus(null);

    try {
      const result = await subscribeToNewsletter(newsletterEmail.trim());

      if (result.status === 'already_subscribed') {
        setNewsletterStatus({
          type: 'error',
          text: 'Cet email est déjà inscrit à la newsletter.',
        });
        return;
      }

      if (result.status === 'error') {
        setNewsletterStatus({
          type: 'error',
          text: result.message || 'Une erreur est survenue. Veuillez réessayer.',
        });
        return;
      }

      try {
        window.localStorage.setItem(NEWSLETTER_PROMPT_KEY, 'true');
      } catch {
        // ignore storage failures
      }
      settleNewsletterPrompt();
      setNewsletterStatus({ type: 'success', text: 'Merci, vous êtes inscrit à la newsletter MalakInfo.' });
      window.setTimeout(() => setIsNewsletterPromptOpen(false), 1400);
    } catch {
      setNewsletterStatus({
        type: 'error',
        text: 'Une erreur est survenue. Veuillez réessayer.',
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
    savePreferences(preferences, true);
  };

  const handlePreferenceChange = (key: string, value: boolean) => {
    savePreferences({ ...preferences, [key]: value }, false);
  };

  const openCookieSettings = () => {
    setPreferences(readConsentPreferences());
    setIsPreferencesOpen(true);
  };

  const showCookieButton = !isVisible && !isPreferencesOpen && !isNewsletterPromptOpen;

  return (
    <>
      {showCookieButton && (
        <button
          type="button"
          onClick={openCookieSettings}
          aria-label="Gérer les cookies"
          title="Gérer les cookies"
          className="group fixed bottom-[5.75rem] left-3 z-[80] flex items-center rounded-full border border-black/5 bg-white shadow-[0_4px_18px_rgba(15,40,80,0.16)] transition hover:shadow-[0_8px_24px_rgba(15,40,80,0.22)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] sm:bottom-5 sm:left-5"
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center">
            <CookieWidgetIcon />
          </span>
          <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold text-[#0B3B8B] opacity-0 transition-all duration-200 group-hover:max-w-[11rem] group-hover:pr-4 group-hover:opacity-100 group-focus-visible:max-w-[11rem] group-focus-visible:pr-4 group-focus-visible:opacity-100">
            Gérer les cookies
          </span>
        </button>
      )}

      {isVisible && !isPreferencesOpen && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[5.5rem] z-[70] max-h-[calc(100svh-6.5rem)] overflow-y-auto px-3 pb-1 sm:inset-x-auto sm:bottom-0 sm:left-3 sm:max-h-none sm:max-w-[430px] sm:overflow-visible sm:px-0 sm:pb-3">
          <div className="pointer-events-auto cookie-consent-enter w-full rounded-[3px] border border-[#d4af37] bg-[#081c3d] p-4 text-white shadow-2xl shadow-[#081c3d]/40 sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="/images/logo.png"
                  alt="MalakInfo"
                  className="h-8 w-auto rounded object-contain brightness-0 invert"
                  loading="eager"
                />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">Cookie Consent</p>
                  <h2 className="sr-only">Gestion du consentement sur MalakInfo</h2>
                </div>
              </div>
              <button
                type="button"
                aria-label="Fermer la fenêtre de consentement"
                className="rounded-full bg-[#d4af37] px-3 py-2 text-sm font-medium text-[#081c3d] transition hover:bg-[#e4c65c]"
                onClick={() => handleConsent('true')}
              >
                ×
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs leading-5 text-blue-100 sm:text-sm">
              <p>
                Nous partageons les informations que vous nous communiquez et des données sur votre utilisation du site avec nos partenaires, notamment pour la publicité et l&apos;analyse.
              </p>
            </div>

            <div className="mt-4 grid gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-[2px] bg-[#d4af37] px-4 py-3 text-sm font-bold text-[#081c3d] transition hover:bg-[#e4c65c]"
                onClick={() => handleConsent('true')}
              >
                Accepter tous les cookies
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-[2px] border border-[#d4af37] bg-transparent px-4 py-3 text-sm font-bold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-[#081c3d]"
                onClick={() => handleConsent('false')}
              >
                Refuser tout
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-[2px] bg-white px-4 py-3 text-sm font-bold text-[#081c3d] transition hover:bg-[#f7f3eb]"
                onClick={() => {
                  setPreferences(readConsentPreferences());
                  setIsPreferencesOpen(true);
                }}
              >
                Paramètres des cookies
              </button>
            </div>
          </div>
        </div>
      )}

      {isPreferencesOpen && (
        <CookiePreferencesModal
          preferences={preferences}
          onSetPreference={handlePreferenceChange}
          onSave={handleSave}
          onAcceptAll={handleAcceptAll}
          onRejectAll={handleRejectAll}
          onClose={() => savePreferences(preferences, true)}
        />
      )}

      {isNewsletterPromptOpen && (
        <div
          className="newsletter-backdrop fixed inset-0 z-[85] flex cursor-pointer items-end justify-center bg-[#07111c]/80 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6"
          onClick={closeNewsletterPrompt}
          role="presentation"
        >
          <div
            className="newsletter-card-enter relative flex max-h-[calc(100svh-1.5rem)] w-full max-w-4xl cursor-auto flex-col overflow-hidden border border-[#d7cdbb] bg-[#f7f3eb] shadow-2xl sm:max-h-[calc(100svh-3rem)]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="newsletter-prompt-title"
          >
            <button
              type="button"
              onClick={closeNewsletterPrompt}
              aria-label="Fermer l'inscription à la newsletter"
              className="newsletter-close absolute right-3 top-3 z-30 flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border border-[#081c3d] bg-white text-[#081c3d] shadow-md transition hover:bg-[#081c3d] hover:text-white sm:right-4 sm:top-4"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <div className="grid md:grid-cols-[1fr_0.85fr]">
                <div className="newsletter-copy order-2 p-4 sm:p-10 md:order-1 md:p-12">
                  <p className="newsletter-stagger text-[11px] font-bold uppercase tracking-[0.28em] text-[#c56b36]">La lettre MalakInfo</p>
                  <h2 id="newsletter-prompt-title" className="newsletter-stagger mt-2 font-heading text-2xl font-bold leading-[1.05] text-[#081c3d] sm:mt-4 sm:text-5xl">
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

                <div className="newsletter-form-panel relative order-1 flex min-h-0 items-end overflow-hidden bg-[#0b315e] p-4 pt-16 sm:p-10 sm:pt-10 md:order-2 md:min-h-0">
                  <img src="/images/logo.png" alt="" className="newsletter-logo pointer-events-none absolute left-1/2 top-1/2 w-[80%] -translate-x-1/2 -translate-y-1/2 opacity-10 grayscale brightness-0 invert" />
                  <div className="relative z-10 w-full">
                    <div className="newsletter-icon newsletter-stagger mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#d4af37] text-[#081c3d] sm:mb-5 sm:h-11 sm:w-11"><Mail className="h-4 w-4 sm:h-5 sm:w-5" /></div>
                    <h3 className="newsletter-stagger text-lg font-bold leading-6 text-white sm:text-xl">Restez au cœur de l&apos;information.</h3>
                    <p className="newsletter-stagger mt-1 text-xs leading-4 text-blue-100 sm:mt-2 sm:text-sm sm:leading-6">Inscription gratuite. Vous pouvez vous désabonner à tout moment.</p>

                    <form onSubmit={handleNewsletterSubmit} className="newsletter-stagger mt-4 space-y-2 sm:mt-6 sm:space-y-3">
                      <input type="email" value={newsletterEmail} onChange={(event) => setNewsletterEmail(event.target.value)} placeholder="Votre adresse e-mail" required className="newsletter-input w-full border border-white/20 bg-white px-3 py-2 text-xs text-[#081c3d] outline-none placeholder:text-slate-400 focus:border-[#d4af37] sm:px-4 sm:py-3 sm:text-sm" />
                      <button type="submit" disabled={isNewsletterSubmitting} className="newsletter-submit w-full bg-[#d4af37] px-3 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-[#081c3d] transition hover:bg-[#e4c65c] disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:py-3 sm:text-sm sm:tracking-[0.12em]">
                        {isNewsletterSubmitting ? 'Inscription...' : 'Recevoir la newsletter'}
                      </button>
                      <button
                        type="button"
                        onClick={closeNewsletterPrompt}
                        className="w-full py-2.5 text-xs font-semibold text-blue-100 underline decoration-blue-100/40 underline-offset-4 touch-manipulation sm:text-sm"
                      >
                        Plus tard
                      </button>
                    </form>
                    {newsletterStatus && <p className={`mt-3 text-sm ${newsletterStatus.type === 'success' ? 'text-emerald-200' : 'text-red-200'}`}>{newsletterStatus.text}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
