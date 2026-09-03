'use client';

import { useState } from 'react';
import { ArrowRight, Check, CheckCircle2, Gift, Mail, MapPin, ShieldCheck, Sparkles } from 'lucide-react';

const digitalPlans = [
  { id: 'digital-1m', label: '1 MOIS', price: 6, period: '1 mois', badge: null },
  { id: 'digital-1y', label: '1 AN', price: 48, period: '1 an', badge: 'Le plus populaire' },
  { id: 'digital-2y', label: '2 ANS', price: 84, period: '2 ans', badge: null },
];

const printPlans = [
  { id: 'print-1y', label: '1 AN', price: 72, period: '1 an', badge: null },
  { id: 'print-2y', label: '2 ANS', price: 120, period: '2 ans', badge: null },
];

const countries = ['RDC', 'Canada', 'Autres pays'];

export default function NousSoutenirPage() {
  const [selectedDigitalPlan, setSelectedDigitalPlan] = useState('digital-1y');
  const [selectedPrintPlan, setSelectedPrintPlan] = useState('print-1y');
  const [selectedPlanType, setSelectedPlanType] = useState<'digital' | 'print'>('digital');
  const [selectedCountry, setSelectedCountry] = useState('RDC');
  const [isGift, setIsGift] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const activeDigitalPlan = digitalPlans.find((plan) => plan.id === selectedDigitalPlan) ?? digitalPlans[1];
  const activePrintPlan = printPlans.find((plan) => plan.id === selectedPrintPlan) ?? printPlans[0];
  const activePlan = selectedPlanType === 'digital' ? activeDigitalPlan : activePrintPlan;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setError('Veuillez renseigner votre adresse email.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Create Stripe checkout session directly
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          amount: activePlan.price,
          planName: activePlan.label,
          country: selectedCountry,
          isGift,
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        console.error('Error creating checkout session:', error);
        setError('Erreur lors de la création de la session de paiement');
        setIsProcessing(false);
        return;
      }

      // Redirect to Stripe Checkout URL directly
      if (url) {
        window.location.href = url;
      } else {
        setError('Erreur lors de la création de la session de paiement');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      setError('Erreur lors du traitement du paiement');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f7f1] text-[#081C3D]">
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <header className="mx-auto mb-10 max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#e5d9a7] bg-[#fffaf0] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5a4700]">
            <Sparkles className="h-3.5 w-3.5" />
            Soutenez Malakinfo
          </div>
          <h1 className="font-heading text-4xl font-bold tracking-[-0.03em] text-[#081C3D] sm:text-5xl lg:text-6xl">
            Grands reportages, analyses et réflexions pour élargir vos horizons.
          </h1>
          <p className="mt-4 text-base text-[#4A5568] sm:text-lg">
            Choisissez votre formule de soutien à Malakinfo
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1.1fr_0.8fr]">
            <section className="rounded-[28px] border border-[#e9e4d6] bg-white p-5 shadow-[0_20px_50px_rgba(11,59,139,0.06)] sm:p-7">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0B3B8B]">NUMÉRIQUE</p>
                  <h2 className="mt-2 text-2xl font-bold text-[#081C3D]">Accès en ligne</h2>
                </div>
                <div className="rounded-full bg-[#eef3ff] p-2 text-[#0B3B8B]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>

              <p className="mb-6 text-sm text-[#4A5568]">
                Un accès numérique illimité sur tous vos appareils.
              </p>

              <div className="space-y-3">
                {digitalPlans.map((plan) => {
                  const isSelected = selectedDigitalPlan === plan.id && selectedPlanType === 'digital';

                  return (
                    <label
                      key={plan.id}
                      className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all ${
                        isSelected
                          ? 'border-[#D4AF37] bg-[#fffaf0] shadow-[0_10px_25px_rgba(212,175,55,0.18)]'
                          : 'border-[#e7e5e0] bg-[#f9fafb] hover:border-[#d0d7e2]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                            isSelected ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-[#9aa4b5] bg-white'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 text-[#081C3D]" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-semibold text-[#081C3D]">{plan.label}</span>
                            {plan.badge && (
                              <span className="rounded-full bg-[#F3E9C9] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#6d5705]">
                                {plan.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-[#4A5568]">{plan.period}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#081C3D]">{plan.price} $</div>
                      </div>

                      <input
                        type="radio"
                        name="digital-plan"
                        checked={isSelected}
                        onChange={() => {
                          setSelectedDigitalPlan(plan.id);
                          setSelectedPlanType('digital');
                        }}
                        className="sr-only"
                      />
                    </label>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[28px] border border-[#e9e4d6] bg-[#fffdf8] p-5 shadow-[0_20px_50px_rgba(11,59,139,0.06)] sm:p-7">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0B3B8B]">NUMÉRIQUE + PAPIER</p>
                  <h2 className="mt-2 text-2xl font-bold text-[#081C3D]">Abonnement complet</h2>
                </div>
                <div className="rounded-full bg-[#fff1c2] p-2 text-[#6d5705]">
                  <Gift className="h-5 w-5" />
                </div>
              </div>

              <p className="mb-6 text-sm text-[#4A5568]">
                Le magazine livré chez vous et un accès numérique illimité sur tous vos appareils.
              </p>

              <div className="mb-6 flex flex-wrap gap-2">
                {countries.map((country) => {
                  const isActive = selectedCountry === country;

                  return (
                    <button
                      key={country}
                      type="button"
                      onClick={() => setSelectedCountry(country)}
                      className={`rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'border-[#0B3B8B] bg-[#0B3B8B] text-white'
                          : 'border-[#dfe4ec] bg-white text-[#081C3D] hover:border-[#0B3B8B] hover:text-[#0B3B8B]'
                      }`}
                    >
                      {country}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3">
                {printPlans.map((plan) => {
                  const isSelected = selectedPrintPlan === plan.id && selectedPlanType === 'print';

                  return (
                    <label
                      key={plan.id}
                      className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all ${
                        isSelected
                          ? 'border-[#D4AF37] bg-[#fffaf0] shadow-[0_10px_25px_rgba(212,175,55,0.18)]'
                          : 'border-[#e7e5e0] bg-white hover:border-[#d0d7e2]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                            isSelected ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-[#9aa4b5] bg-white'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 text-[#081C3D]" />}
                        </div>
                        <div>
                          <div className="text-base font-semibold text-[#081C3D]">{plan.label}</div>
                          <div className="text-sm text-[#4A5568]">{plan.period}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#081C3D]">{plan.price} $</div>
                      </div>

                      <input
                        type="radio"
                        name="print-plan"
                        checked={isSelected}
                        onChange={() => {
                          setSelectedPrintPlan(plan.id);
                          setSelectedPlanType('print');
                        }}
                        className="sr-only"
                      />
                    </label>
                  );
                })}
              </div>
            </section>

            <aside className="rounded-[28px] border border-[#e9e4d6] bg-white p-5 shadow-[0_20px_50px_rgba(11,59,139,0.06)] sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-full bg-[#0B3B8B]/10 p-2 text-[#0B3B8B]">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#081C3D]">Finalisation</p>
              </div>

              <label className="mb-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-[#e7e5e0] bg-[#f9fafb] p-4 text-sm text-[#081C3D] transition-colors hover:border-[#d4af37]">
                <input
                  type="checkbox"
                  checked={isGift}
                  onChange={(event) => setIsGift(event.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[#c8ccd6] text-[#0B3B8B] focus:ring-[#0B3B8B]"
                />
                <span>J&apos;offre cet abonnement / don en cadeau</span>
              </label>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-[#081C3D]">
                  Adresse courriel <span className="text-[#b42318]">*</span>
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#697586]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (error) setError('');
                    }}
                    placeholder="votre@email.com"
                    className="w-full rounded-2xl border border-[#dfe4ec] bg-white py-3 pl-10 pr-4 text-sm text-[#081C3D] outline-none transition focus:border-[#0B3B8B] focus:ring-2 focus:ring-[#0B3B8B]/10"
                    aria-label="Adresse courriel"
                  />
                </div>
              </div>

              {error && <p className="mt-4 text-sm font-medium text-[#b42318]">{error}</p>}

              <div className="mt-6 rounded-2xl border border-[#efeac4] bg-[#fffaf0] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6d5705]">Plan sélectionné</p>
                    <p className="mt-2 text-lg font-bold text-[#081C3D]">{activePlan.label} · {activePlan.price} $</p>
                  </div>
                  <div className="rounded-full bg-[#0B3B8B] p-2 text-white">
                    <MapPin className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-2 text-sm text-[#4A5568]">Livraison : {selectedCountry}</p>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0B3B8B] px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#082a63] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Traitement en cours...' : 'Prochaine étape'}
                {!isProcessing && <ArrowRight className="h-4 w-4" />}
              </button>
            </aside>
          </div>
        </form>
      </main>
    </div>
  );
}
