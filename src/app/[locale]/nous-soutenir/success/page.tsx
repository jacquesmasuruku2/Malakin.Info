'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, ArrowLeft, Home } from 'lucide-react';
import Stripe from 'stripe';

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setError('Session ID manquant');
      setLoading(false);
      return;
    }

    // Fetch session details from Stripe
    fetch(`/api/stripe/session?session_id=${sessionId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setSessionData(data);
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Erreur lors de la récupération des détails de la session');
        setLoading(false);
      });
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef1ef] px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#0b3b8b] border-t-transparent"></div>
          <p className="text-lg text-[#111827]">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef1ef] px-4 py-10">
        <div className="w-full max-w-xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-[#111827]">Erreur</h1>
          <p className="mt-4 text-base text-[#4b5563]">{error}</p>
          <button
            onClick={() => router.push('/fr/nous-soutenir/faire-un-don')}
            className="mt-6 rounded-md bg-[#0b3b8b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#082a63]"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#eef1ef] px-4 py-10">
      <div className="w-full max-w-xl rounded-2xl border border-[#dfe4dd] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#e9f7ee] text-[#1e7d4d]">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0b3b8b]">Paiement réussi</p>
        <h1 className="text-3xl font-bold text-[#111827]">Merci pour votre soutien !</h1>
        
        {sessionData && (
          <>
            <p className="mt-4 text-base text-[#4b5563]">
              Votre paiement de <span className="font-semibold text-[#111827]">
                {(sessionData.amount_total / 100).toFixed(2)} $
              </span> a bien été effectué.
            </p>

            <div className="mt-6 rounded-xl border border-[#dfe4dd] bg-[#f8faf8] p-4 text-left text-sm text-[#111827]">
              <div className="flex items-center justify-between gap-3">
                <span>Email</span>
                <span className="font-semibold">{sessionData.customer_email || 'N/A'}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span>Plan</span>
                <span className="font-semibold">{sessionData.metadata?.planName || 'N/A'}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span>Pays</span>
                <span className="font-semibold">{sessionData.metadata?.country || 'N/A'}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span>Offre cadeau</span>
                <span className="font-semibold">{sessionData.metadata?.isGift === 'true' ? 'Oui' : 'Non'}</span>
              </div>
            </div>
          </>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex-1 flex items-center justify-center gap-2 rounded-md bg-[#111827] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0f172a]"
          >
            <Home className="h-4 w-4" />
            Retour à l&apos;accueil
          </button>
          <button
            type="button"
            onClick={() => router.push('/fr/nous-soutenir/faire-un-don')}
            className="flex-1 flex items-center justify-center gap-2 rounded-md border border-[#d1d5db] bg-white px-4 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#f9fafb]"
          >
            <ArrowLeft className="h-4 w-4" />
            Faire un autre don
          </button>
        </div>
      </div>
    </div>
  );
}
