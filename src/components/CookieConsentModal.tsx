'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const STORAGE_KEY = 'malakinfo_cookie_consent';

export default function CookieConsentModal() {
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'fr';
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = window.localStorage.getItem(STORAGE_KEY);
    if (consent !== 'true') {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  const handleConsent = (value: 'true' | 'false') => {
    window.localStorage.setItem(STORAGE_KEY, value);
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
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
          <Link
            href={`/${locale}/politique-confidentialite`}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
          >
            En savoir plus →
          </Link>
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
  );
}
