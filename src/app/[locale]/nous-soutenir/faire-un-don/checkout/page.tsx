'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, CreditCard, Lock } from 'lucide-react';

export default function SupportCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get('email') ?? 'mirindiprincem@gmail.com';
  const planName = searchParams.get('planName') ?? searchParams.get('plan') ?? '1 AN';
  const country = searchParams.get('country') ?? 'RDC';
  const isGift = searchParams.get('gift') === 'true';

  const amount = useMemo(() => {
    const explicitAmount = searchParams.get('amount');
    if (explicitAmount) {
      const numericValue = Number(explicitAmount.replace(',', '.'));
      if (Number.isFinite(numericValue)) {
        return numericValue;
      }
    }

    const match = (searchParams.get('plan') ?? planName).match(/(\d+(?:[.,]\d+)?)/);
    const numericValue = Number((match?.[1] ?? '48').replace(',', '.'));
    return Number.isFinite(numericValue) ? numericValue : 48;
  }, [planName, searchParams]);

  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsProcessing(true);

    try {
      // Create Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount,
          planName,
          country,
          isGift,
        }),
      });

      const { sessionId, error } = await response.json();

      if (error) {
        console.error('Error creating checkout session:', error);
        alert('Erreur lors de la création de la session de paiement');
        setIsProcessing(false);
        return;
      }

      // Redirect to Stripe Checkout
      const stripe = (await import('@stripe/stripe-js')).loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
      );

      const stripeInstance = await stripe;
      if (stripeInstance) {
        const { error: stripeError } = await stripeInstance.redirectToCheckout({
          sessionId,
        });

        if (stripeError) {
          console.error('Stripe redirect error:', stripeError);
          alert('Erreur lors de la redirection vers Stripe');
          setIsProcessing(false);
        }
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Erreur lors du traitement du paiement');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-[#dfe1df] px-4 py-6 text-[#111827] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1200px]">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#111827] transition hover:text-[#0b3b8b]"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>

        <div className="grid gap-8 lg:grid-cols-[1.6fr_0.84fr] lg:items-start">
          <div className="pt-1">
            <h1 className="mb-8 text-[2rem] font-bold tracking-[-0.03em] text-[#111827]">Valider la commande</h1>

            <section className="mb-8">
              <h2 className="mb-4 text-[1.75rem] font-bold leading-tight text-[#111827]">Détails du compte</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#111827]">Courriel</label>
                  <input
                    type="email"
                    defaultValue={email}
                    className="w-full rounded-md border border-[#cfcfcf] bg-[#f3f3f3] px-3.5 py-3 text-sm text-[#111827] outline-none transition focus:border-[#0b3b8b] focus:ring-2 focus:ring-[#0b3b8b]/10"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#111827]">Prénom</label>
                    <input className="w-full rounded-md border border-[#cfcfcf] bg-[#f3f3f3] px-3.5 py-3 text-sm text-[#111827] outline-none transition focus:border-[#0b3b8b] focus:ring-2 focus:ring-[#0b3b8b]/10" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#111827]">Nom</label>
                    <input className="w-full rounded-md border border-[#cfcfcf] bg-[#f3f3f3] px-3.5 py-3 text-sm text-[#111827] outline-none transition focus:border-[#0b3b8b] focus:ring-2 focus:ring-[#0b3b8b]/10" />
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-[1.75rem] font-bold leading-tight text-[#111827]">Adresse de facturation</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#111827]">Prénom (optionnel)</label>
                  <input className="w-full rounded-md border border-[#cfcfcf] bg-[#f3f3f3] px-3.5 py-3 text-sm text-[#111827] outline-none transition focus:border-[#0b3b8b] focus:ring-2 focus:ring-[#0b3b8b]/10" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#111827]">Nom (optionnel)</label>
                  <input className="w-full rounded-md border border-[#cfcfcf] bg-[#f3f3f3] px-3.5 py-3 text-sm text-[#111827] outline-none transition focus:border-[#0b3b8b] focus:ring-2 focus:ring-[#0b3b8b]/10" />
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#111827]">Ligne d&apos;adresse 1</label>
                  <input className="w-full rounded-md border border-[#cfcfcf] bg-[#f3f3f3] px-3.5 py-3 text-sm text-[#111827] outline-none transition focus:border-[#0b3b8b] focus:ring-2 focus:ring-[#0b3b8b]/10" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#111827]">Ligne d&apos;adresse 2 (optionnel)</label>
                  <input className="w-full rounded-md border border-[#cfcfcf] bg-[#f3f3f3] px-3.5 py-3 text-sm text-[#111827] outline-none transition focus:border-[#0b3b8b] focus:ring-2 focus:ring-[#0b3b8b]/10" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#111827]">Ville</label>
                    <input className="w-full rounded-md border border-[#cfcfcf] bg-[#f3f3f3] px-3.5 py-3 text-sm text-[#111827] outline-none transition focus:border-[#0b3b8b] focus:ring-2 focus:ring-[#0b3b8b]/10" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#111827]">Code postal</label>
                    <input className="w-full rounded-md border border-[#cfcfcf] bg-[#f3f3f3] px-3.5 py-3 text-sm text-[#111827] outline-none transition focus:border-[#0b3b8b] focus:ring-2 focus:ring-[#0b3b8b]/10" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#111827]">Province</label>
                  <input className="w-full rounded-md border border-[#cfcfcf] bg-[#f3f3f3] px-3.5 py-3 text-sm text-[#111827] outline-none transition focus:border-[#0b3b8b] focus:ring-2 focus:ring-[#0b3b8b]/10" />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#111827]">Pays</label>
                  <select className="w-full rounded-md border border-[#cfcfcf] bg-[#f3f3f3] px-3.5 py-3 text-sm text-[#111827] outline-none transition focus:border-[#0b3b8b] focus:ring-2 focus:ring-[#0b3b8b]/10">
                    <option>{country}</option>
                  </select>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-[1.75rem] font-bold leading-tight text-[#111827]">Informations de paiement</h2>

              <div className="mb-5 flex items-center gap-2">
                <span className="inline-flex h-9 w-10 items-center justify-center rounded bg-[#e5edf8] text-[10px] font-bold tracking-[0.08em] text-[#0b3b8b]">VISA</span>
                <span className="inline-flex h-9 w-10 items-center justify-center rounded bg-[#f2f7ff] text-[10px] font-bold tracking-[0.08em] text-[#0b3b8b]">MC</span>
                <span className="inline-flex h-9 w-10 items-center justify-center rounded bg-[#f4efef] text-[10px] font-bold tracking-[0.08em] text-[#d42525]">AMEX</span>
                <span className="inline-flex h-9 w-10 items-center justify-center rounded bg-[#eaf3ec] text-[10px] font-bold tracking-[0.08em] text-[#266b31]">PayPal</span>
              </div>

              <div className="rounded-md border border-[#cfcfcf] bg-[#f3f3f3] p-4 text-center text-sm text-[#6b7280]">
                <p className="mb-2">Le paiement sera traité via Stripe Checkout sécurisé</p>
                <p className="text-xs">Vous serez redirigé vers la page de paiement Stripe après avoir cliqué sur le bouton ci-dessous.</p>
              </div>
            </section>
          </div>

          <aside className="lg:pt-12">
            <div className="rounded-[1.5rem] border border-[#dfe2de] bg-[#f7f7f7] p-5 shadow-[0_10px_30px_rgba(17,24,39,0.05)] sm:p-6">
              <h2 className="mb-5 text-[1.8rem] font-bold leading-tight text-[#111827]">Récapitulatif de la commande</h2>

              <div className="space-y-3 border-b border-[#d7d7d7] pb-4 text-sm text-[#111827]">
                <div className="flex items-center justify-between gap-3">
                  <span>Abonnement</span>
                  <span className="font-medium">{amount.toFixed(2).replace('.', ',')} $</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>{planName} ({amount.toFixed(2).replace('.', ',')} $)</span>
                  <span className="font-medium">{country}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Offre cadeau</span>
                  <span className="font-medium">{isGift ? 'Oui' : 'Non'}</span>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm text-[#111827]">
                <div className="flex items-center justify-between gap-3">
                  <span>Appliquer le code promotionnel</span>
                  <span className="text-[#4b5563]">—</span>
                </div>

                <div className="border-t border-[#d7d7d7] pt-4">
                  <div className="flex items-center justify-between text-lg font-bold text-[#111827]">
                    <span>Total</span>
                    <span>{amount.toFixed(2).replace('.', ',')} $</span>
                  </div>
                </div>
              </div>

              <p className="mt-5 text-xs leading-5 text-[#374151]">
                En confirmant, vous acceptez les conditions générales des abonnements.
              </p>

              <button
                type="submit"
                disabled={isProcessing}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-[#1f2023] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0f1114] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <CreditCard className="h-4 w-4" />
                {isProcessing ? 'Traitement en cours...' : `Payer ${amount.toFixed(2).replace('.', ',')} $ et s’abonner`}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#4b5563]">
                <Lock className="h-3.5 w-3.5" />
                Paiement sécurisé via Stripe
              </div>
            </div>
          </aside>
        </div>
      </div>
    </form>
  );
}
