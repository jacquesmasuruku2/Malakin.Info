'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, CreditCard, Lock } from 'lucide-react';

export default function SupportCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get('email') ?? 'mirindiprincem@gmail.com';
  const planLabel = searchParams.get('plan') ?? '1 AN (48 $)';
  const country = searchParams.get('country') ?? 'Canada';
  const isGift = searchParams.get('gift') === 'true';

  const amount = useMemo(() => {
    const match = planLabel.match(/(\d+(?:[.,]\d+)?)/);
    const numericValue = Number((match?.[1] ?? '48').replace(',', '.'));
    return Number.isFinite(numericValue) ? numericValue : 48;
  }, [planLabel]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsProcessing(true);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    setIsProcessing(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef1ef] px-4 py-10">
        <div className="w-full max-w-xl rounded-2xl border border-[#dfe4dd] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#e9f7ee] text-[#1e7d4d]">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0b3b8b]">Abonnement validé</p>
          <h1 className="text-3xl font-bold text-[#111827]">Merci pour votre soutien !</h1>
          <p className="mt-4 text-base text-[#4b5563]">
            Votre abonnement {planLabel} a bien été enregistré pour <span className="font-semibold text-[#111827]">{email}</span>.
          </p>

          <div className="mt-6 rounded-xl border border-[#dfe4dd] bg-[#f8faf8] p-4 text-left text-sm text-[#111827]">
            <div className="flex items-center justify-between gap-3">
              <span>Plan</span>
              <span className="font-semibold">{planLabel}</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span>Pays</span>
              <span>{country}</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span>Offre cadeau</span>
              <span>{isGift ? 'Oui' : 'Non'}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex-1 rounded-md bg-[#111827] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0f172a]"
            >
              Retour à l&apos;accueil
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 rounded-md border border-[#d1d5db] bg-white px-4 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#f9fafb]"
            >
              Revenir en arrière
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-[#dfe1df] px-4 py-6 text-[#111827] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#111827] hover:text-[#0b3b8b]"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>

        <div className="grid gap-8 lg:grid-cols-[1.6fr_0.9fr]">
          <div>
            <h1 className="mb-6 text-3xl font-bold tracking-[-0.02em] text-[#111827]">Valider la commande</h1>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-[#111827]">Détails du compte</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#111827]">Courriel</label>
                  <input
                    type="email"
                    defaultValue={email}
                    className="w-full rounded-md border border-[#cfcfcf] bg-[#f3f3f3] px-3 py-3 text-sm outline-none ring-0 placeholder:text-[#7b7b7b] focus:border-[#0b3b8b]"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#111827]">Prénom</label>
                    <input className="w-full rounded-md border border-[#cfcfcf] bg-[#f3f3f3] px-3 py-3 text-sm outline-none focus:border-[#0b3b8b]" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#111827]">Nom</label>
                    <input className="w-full rounded-md border border-[#cfcfcf] bg-[#f3f3f3] px-3 py-3 text-sm outline-none focus:border-[#0b3b8b]" />
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-[#111827]">Adresse de facturation</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#111827]">Prénom (optionnel)</label>
                  <input className="w-full rounded-md border border-[#cfcfcf] bg-[#f3f3f3] px-3 py-3 text-sm outline-none focus:border-[#0b3b8b]" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#111827]">Nom (optionnel)</label>
                  <input className="w-full rounded-md border border-[#cfcfcf] bg-[#f3f3f3] px-3 py-3 text-sm outline-none focus:border-[#0b3b8b]" />
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#111827]">Ligne d&apos;adresse 1</label>
                  <input className="w-full rounded-md border border-[#cfcfcf] bg-[#f3f3f3] px-3 py-3 text-sm outline-none focus:border-[#0b3b8b]" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#111827]">Ligne d&apos;adresse 2 (optionnel)</label>
                  <input className="w-full rounded-md border border-[#cfcfcf] bg-[#f3f3f3] px-3 py-3 text-sm outline-none focus:border-[#0b3b8b]" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#111827]">Ville</label>
                    <input className="w-full rounded-md border border-[#cfcfcf] bg-[#f3f3f3] px-3 py-3 text-sm outline-none focus:border-[#0b3b8b]" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#111827]">Code postal</label>
                    <input className="w-full rounded-md border border-[#cfcfcf] bg-[#f3f3f3] px-3 py-3 text-sm outline-none focus:border-[#0b3b8b]" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#111827]">Province</label>
                  <input className="w-full rounded-md border border-[#cfcfcf] bg-[#f3f3f3] px-3 py-3 text-sm outline-none focus:border-[#0b3b8b]" />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#111827]">Pays</label>
                  <select className="w-full rounded-md border border-[#cfcfcf] bg-[#f3f3f3] px-3 py-3 text-sm outline-none focus:border-[#0b3b8b]">
                    <option>{country}</option>
                  </select>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-[#111827]">Informations de paiement</h2>

              <div className="mb-4 flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-[#e5edf8] text-xs font-bold text-[#0b3b8b]">VISA</span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-[#f2f7ff] text-xs font-bold text-[#0b3b8b]">MC</span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-[#f4efef] text-xs font-bold text-[#d42525]">AMEX</span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-[#eaf3ec] text-xs font-bold text-[#266b31]">PayPal</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#111827]">Numéro de carte</label>
                  <input className="w-full rounded-md border border-[#cfcfcf] bg-[#f3f3f3] px-3 py-3 text-sm outline-none focus:border-[#0b3b8b]" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#111827]">Expire le</label>
                    <input className="w-full rounded-md border border-[#cfcfcf] bg-[#f3f3f3] px-3 py-3 text-sm outline-none focus:border-[#0b3b8b]" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#111827]">CVV</label>
                    <input className="w-full rounded-md border border-[#cfcfcf] bg-[#f3f3f3] px-3 py-3 text-sm outline-none focus:border-[#0b3b8b]" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#111827]">Code postal de la carte</label>
                  <input className="w-full rounded-md border border-[#cfcfcf] bg-[#f3f3f3] px-3 py-3 text-sm outline-none focus:border-[#0b3b8b]" />
                </div>
              </div>
            </section>
          </div>

          <aside className="mt-2 lg:mt-12">
            <div className="rounded-xl border border-[#dfe2de] bg-[#f7f7f7] p-5 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-[#111827]">Récapitulatif de la commande</h2>

              <div className="space-y-3 border-b border-[#d7d7d7] pb-4 text-sm text-[#111827]">
                <div className="flex items-center justify-between gap-3">
                  <span>Abonnement</span>
                  <span>{amount.toFixed(2).replace('.', ',')} $</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>{planLabel}</span>
                  <span>{country}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Offre cadeau</span>
                  <span>{isGift ? 'Oui' : 'Non'}</span>
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
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-[#1f2023] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0f1114] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <CreditCard className="h-4 w-4" />
                {isProcessing ? 'Traitement en cours...' : `Payer ${amount.toFixed(2).replace('.', ',')} $ et s’abonner`}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#4b5563]">
                <Lock className="h-3.5 w-3.5" />
                Paiement sécurisé
              </div>
            </div>
          </aside>
        </div>
      </div>
    </form>
  );
}
