'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const STORAGE_KEY = 'malakinfo_cookie_consent';
const PREFERENCES_KEY = 'malakinfo_cookie_preferences';

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

  useEffect(() => {
    const consent = window.localStorage.getItem(STORAGE_KEY);
    const savedPreferences = buildSavedPreferences(window.localStorage.getItem(PREFERENCES_KEY));

    setPreferences(savedPreferences);

    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    if (isVisible || isPreferencesOpen) {
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

  if (!isVisible && !isPreferencesOpen) {
    return null;
  }

  return (
    <>
      {isVisible && !isPreferencesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-white/95 p-6 shadow-2xl shadow-black/20 transition-all duration-500 ease-out sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="/images/logo.png"
                  alt="MalakInfo"
                  className="h-11 w-auto rounded-lg object-contain"
                  loading="eager"
                />
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500">MalakInfo</p>
                  <h2 className="text-xl font-semibold text-slate-950 sm:text-2xl">Bienvenue sur MalakInfo</h2>
                </div>
              </div>
              <button
                type="button"
                aria-label="Fermer la fenêtre de consentement"
                className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                onClick={() => handleConsent('false')}
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-4 text-sm leading-6 text-slate-700 sm:text-base">
              <p>
                Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et personnaliser le contenu. En continuant, vous acceptez notre utilisation des cookies.
              </p>
              <p className="text-sm text-slate-500">
                Vous pouvez vérifier vos choix à tout moment dans la politique de confidentialité.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
                onClick={() => setIsPreferencesOpen(true)}
              >
                En savoir plus →
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-slate-100 px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-200"
                onClick={() => handleConsent('false')}
              >
                Refuser
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                onClick={() => handleConsent('true')}
              >
                Accepter & Fermer
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
    </>
  );
}
