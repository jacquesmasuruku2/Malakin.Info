'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface PaywallProps {
  articleId: string;
  articleTitle: string;
  premiumPrice?: number;
}

function DevicesIllustration() {
  return (
    <svg
      viewBox="0 0 220 150"
      className="h-[118px] w-[170px] lg:h-[132px] lg:w-[190px]"
      aria-hidden="true"
    >
      <ellipse cx="168" cy="128" rx="38" ry="10" fill="#f3ead2" />
      <rect x="128" y="58" width="18" height="62" rx="4" fill="#f4e7b8" stroke="#c9ae5a" strokeWidth="2" />
      <rect x="131" y="64" width="12" height="22" rx="1.5" fill="#fff8e6" />
      <circle cx="137" cy="112" r="3" fill="#d4af37" />
      <path d="M176 128c0-28 14-52 22-64 2 10 6 28 4 48-8 8-18 14-26 16Z" fill="#d8edc8" />
      <path d="M196 68c8-6 16-8 20-6-6 10-12 22-14 38-8-6-10-18-6-32Z" fill="#b7d59a" />
      <ellipse cx="198" cy="64" rx="7" ry="4" fill="#8fbf63" />
      <rect x="18" y="42" width="108" height="70" rx="8" fill="#f7edc8" stroke="#c9ae5a" strokeWidth="2.5" />
      <rect x="26" y="50" width="92" height="48" rx="3" fill="#fffdf6" />
      <rect x="32" y="56" width="48" height="6" rx="2" fill="#ead79a" />
      <rect x="32" y="68" width="78" height="4" rx="2" fill="#efe2b4" />
      <rect x="32" y="76" width="70" height="4" rx="2" fill="#efe2b4" />
      <rect x="32" y="84" width="54" height="4" rx="2" fill="#efe2b4" />
      <rect x="48" y="112" width="48" height="8" rx="2" fill="#e6d59a" />
      <rect x="28" y="120" width="88" height="6" rx="3" fill="#dcc87a" />
      <rect x="86" y="22" width="46" height="62" rx="8" fill="#f4e7b8" stroke="#c9ae5a" strokeWidth="2.2" />
      <rect x="91" y="30" width="36" height="44" rx="3" fill="#fffdf6" />
      <circle cx="109" cy="78" r="2.4" fill="#d4af37" />
    </svg>
  );
}

export default function Paywall({ articleId, premiumPrice = 1.9 }: PaywallProps) {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'fr';
  const [isProcessing, setIsProcessing] = useState(false);
  const isFrench = locale === 'fr';

  const copy = isFrench
    ? {
        title: 'Bien s’informer, mieux décider',
        subtitle: 'Abonnez-vous pour lire la suite et accéder à tous nos articles',
        subscribe: 'Découvrez nos abonnements',
        buy: `Ou acheter cet article (${premiumPrice.toFixed(2).replace('.', ',')} $)`,
        buying: 'Traitement en cours...',
        already: 'Déjà abonné ?',
        login: 'Connectez-vous',
      }
    : {
        title: 'Stay informed, decide better',
        subtitle: 'Subscribe to keep reading and unlock every premium article',
        subscribe: 'See our subscriptions',
        buy: `Or buy this article (${premiumPrice.toFixed(2)} $)`,
        buying: 'Processing...',
        already: 'Already a subscriber?',
        login: 'Sign in',
      };

  const handleBuyArticle = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/buy-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId }),
      });

      const { url, error } = await response.json();

      if (error) {
        alert('Erreur lors de la création de la session de paiement');
        setIsProcessing(false);
        return;
      }

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error during purchase:', error);
      alert('Erreur lors du traitement du paiement');
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative mt-1 overflow-hidden rounded-[22px] border border-[#e8e2d4] bg-white px-5 py-6 shadow-[0_10px_32px_rgba(8,28,61,0.06)] sm:px-7 sm:py-7">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 max-w-xl">
          <h3 className="font-heading text-[1.45rem] font-bold leading-tight tracking-[-0.02em] text-[#081C3D] sm:text-[1.7rem]">
            {copy.title}
          </h3>
          <p className="mt-2 max-w-md text-[0.98rem] leading-relaxed text-[#5b6470]">
            {copy.subtitle}
          </p>

          <div className="mt-5 flex flex-col items-start gap-3">
            <Link
              href={`/${locale}/nous-soutenir`}
              className="inline-flex items-center justify-center rounded-full bg-[#f3d56a] px-5 py-2.5 text-sm font-semibold text-[#3b2d00] shadow-[0_8px_18px_rgba(212,175,55,0.28)] transition hover:bg-[#edc84a]"
            >
              {copy.subscribe}
            </Link>
            <button
              type="button"
              onClick={handleBuyArticle}
              disabled={isProcessing}
              className="text-sm font-medium text-[#081C3D] underline decoration-[#081C3D]/30 underline-offset-[5px] transition hover:decoration-[#081C3D] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isProcessing ? copy.buying : copy.buy}
            </button>
            <p className="text-sm text-[#5b6470]">
              {copy.already}{' '}
              <Link
                href={`/${locale}/compte/connexion?redirect=${encodeURIComponent(pathname)}`}
                className="font-medium text-[#081C3D] underline decoration-[#081C3D]/40 underline-offset-[4px] hover:decoration-[#081C3D]"
              >
                {copy.login}
              </Link>
            </p>
          </div>
        </div>

        <div className="hidden shrink-0 sm:flex sm:justify-end">
          <DevicesIllustration />
        </div>
      </div>
    </div>
  );
}
