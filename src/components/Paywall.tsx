'use client';

import { useState } from 'react';
import { Lock, Crown, ArrowRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface PaywallProps {
  articleId: string;
  articleTitle: string;
  premiumPrice?: number;
}

export default function Paywall({ articleId, articleTitle, premiumPrice = 1.9 }: PaywallProps) {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'fr';
  const [isProcessing, setIsProcessing] = useState(false);

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
    <div className="relative my-8 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
        <Crown className="h-8 w-8 text-primary" />
      </div>
      
      <h3 className="mb-3 text-2xl font-bold text-foreground">
        Cet article est réservé à nos abonnés
      </h3>
      
      <p className="mb-6 text-lg text-muted-foreground">
        Devenez l'un d'entre eux pour lire son intégralité
      </p>

      <div className="mb-6 flex flex-col items-center gap-3">
        <button
          onClick={handleBuyArticle}
          disabled={isProcessing}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Lock className="h-4 w-4" />
          {isProcessing ? 'Traitement en cours...' : `Acheter cet article (${premiumPrice.toFixed(2)} $)`}
        </button>

        <a
          href={`/${locale}/nous-soutenir/faire-un-don`}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition"
        >
          Ou s'abonner pour accéder à tous les articles premium
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>

      <p className="text-xs text-muted-foreground">
        Paiement sécurisé via Stripe • Accès immédiat après paiement
      </p>
    </div>
  );
}
