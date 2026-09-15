'use client';

import { useRef, useState } from 'react';
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

const featuredCountries = ['RDC', 'Canada', 'France', 'Belgique', 'États-Unis', 'Afrique du Sud'];
const otherCountries = [
  'Allemagne',
  'Angola',
  'Arabie saoudite',
  'Australie',
  'Autriche',
  'Bénin',
  'Botswana',
  'Brésil',
  'Burundi',
  'Cameroun',
  'Chine',
  'Congo-Brazzaville',
  'Côte d’Ivoire',
  'Égypte',
  'Émirats arabes unis',
  'Espagne',
  'Gabon',
  'Ghana',
  'Guinée',
  'Haïti',
  'Inde',
  'Irlande',
  'Italie',
  'Japon',
  'Kenya',
  'Luxembourg',
  'Madagascar',
  'Malawi',
  'Mali',
  'Maroc',
  'Maurice',
  'Mozambique',
  'Namibie',
  'Nigeria',
  'Norvège',
  'Ouganda',
  'Pays-Bas',
  'Portugal',
  'Qatar',
  'République centrafricaine',
  'Royaume-Uni',
  'Rwanda',
  'Sénégal',
  'Suède',
  'Suisse',
  'Tanzanie',
  'Tchad',
  'Togo',
  'Tunisie',
  'Turquie',
  'Zambie',
  'Zimbabwe',
];

function planCardClass(isSelected: boolean) {
  return `flex cursor-pointer items-center justify-between rounded-md border p-4 transition-colors ${
    isSelected
      ? 'border-secondary bg-secondary/10'
      : 'border-border bg-muted/40 hover:border-primary/40'
  }`;
}

function radioClass(isSelected: boolean) {
  return `flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
    isSelected ? 'border-secondary bg-secondary' : 'border-muted-foreground/40 bg-card'
  }`;
}

export default function NousSoutenirPage() {
  const [selectedDigitalPlan, setSelectedDigitalPlan] = useState('digital-1y');
  const [selectedPrintPlan, setSelectedPrintPlan] = useState('print-1y');
  const [selectedPlanType, setSelectedPlanType] = useState<'digital' | 'print'>('digital');
  const [selectedCountry, setSelectedCountry] = useState('RDC');
  const [showOtherCountries, setShowOtherCountries] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const otherCountrySelectRef = useRef<HTMLSelectElement>(null);
  const isOtherCountryMode = showOtherCountries || otherCountries.includes(selectedCountry);

  const activeDigitalPlan = digitalPlans.find((plan) => plan.id === selectedDigitalPlan) ?? digitalPlans[1];
  const activePrintPlan = printPlans.find((plan) => plan.id === selectedPrintPlan) ?? printPlans[0];
  const activePlan = selectedPlanType === 'digital' ? activeDigitalPlan : activePrintPlan;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedCountry) {
      setError('Veuillez choisir un pays de livraison.');
      setShowOtherCountries(true);
      return;
    }

    if (!email.trim()) {
      setError('Veuillez renseigner votre adresse email.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
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

      const { url, error: checkoutError } = await response.json();

      if (checkoutError) {
        console.error('Error creating checkout session:', checkoutError);
        setError('Erreur lors de la création de la session de paiement');
        setIsProcessing(false);
        return;
      }

      if (url) {
        window.location.href = url;
      } else {
        setError('Erreur lors de la création de la session de paiement');
        setIsProcessing(false);
      }
    } catch (submitError) {
      console.error('Error during checkout:', submitError);
      setError('Erreur lors du traitement du paiement');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <header className="mx-auto mb-10 max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-secondary/40 bg-secondary/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary">
            <Sparkles className="h-3.5 w-3.5" />
            Soutenez Malakinfo
          </div>
          <h1 className="font-heading text-4xl font-bold tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl">
            Grands reportages, analyses et réflexions pour élargir vos horizons.
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Choisissez votre formule de soutien à Malakinfo
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1.1fr_0.8fr]">
            <section className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-7">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Numérique</p>
                  <h2 className="mt-2 font-heading text-2xl font-bold text-card-foreground">Accès en ligne</h2>
                </div>
                <div className="rounded-md bg-primary/10 p-2 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>

              <p className="mb-6 text-sm text-muted-foreground">
                Un accès numérique illimité sur tous vos appareils.
              </p>

              <div className="space-y-3">
                {digitalPlans.map((plan) => {
                  const isSelected = selectedDigitalPlan === plan.id && selectedPlanType === 'digital';

                  return (
                    <label key={plan.id} className={planCardClass(isSelected)}>
                      <div className="flex items-center gap-3">
                        <div className={radioClass(isSelected)}>
                          {isSelected && <Check className="h-3 w-3 text-secondary-foreground" />}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-base font-semibold text-foreground">{plan.label}</span>
                            {plan.badge && (
                              <span className="rounded-md bg-secondary px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-secondary-foreground">
                                {plan.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">{plan.period}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground">{plan.price} $</div>
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

            <section className="rounded-lg border border-secondary/40 bg-card p-5 shadow-sm sm:p-7">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-secondary">Numérique + papier</p>
                  <h2 className="mt-2 font-heading text-2xl font-bold text-card-foreground">Abonnement complet</h2>
                </div>
                <div className="rounded-md bg-secondary/15 p-2 text-secondary">
                  <Gift className="h-5 w-5" />
                </div>
              </div>

              <p className="mb-6 text-sm text-muted-foreground">
                Le magazine livré chez vous et un accès numérique illimité sur tous vos appareils.
              </p>

              <div className="mb-6 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {featuredCountries.map((country) => {
                    const isActive = selectedCountry === country && !isOtherCountryMode;

                    return (
                      <button
                        key={country}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(country);
                          setShowOtherCountries(false);
                          if (error) setError('');
                        }}
                        className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-muted/40 text-foreground hover:border-primary hover:text-primary'
                        }`}
                      >
                        {country}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      setShowOtherCountries(true);
                      if (!otherCountries.includes(selectedCountry)) {
                        setSelectedCountry('');
                      }
                      requestAnimationFrame(() => otherCountrySelectRef.current?.focus());
                    }}
                    className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                      isOtherCountryMode
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-muted/40 text-foreground hover:border-primary hover:text-primary'
                    }`}
                  >
                    Autres pays
                  </button>
                </div>

                {isOtherCountryMode && (
                  <div>
                    <label htmlFor="other-country" className="mb-2 block text-sm font-medium text-foreground">
                      Choisir un pays
                    </label>
                    <select
                      id="other-country"
                      ref={otherCountrySelectRef}
                      value={selectedCountry}
                      onChange={(event) => {
                        setSelectedCountry(event.target.value);
                        if (error) setError('');
                      }}
                      aria-label="Choisir un autre pays de livraison"
                      className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Sélectionnez un pays</option>
                      {otherCountries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {printPlans.map((plan) => {
                  const isSelected = selectedPrintPlan === plan.id && selectedPlanType === 'print';

                  return (
                    <label key={plan.id} className={planCardClass(isSelected)}>
                      <div className="flex items-center gap-3">
                        <div className={radioClass(isSelected)}>
                          {isSelected && <Check className="h-3 w-3 text-secondary-foreground" />}
                        </div>
                        <div>
                          <div className="text-base font-semibold text-foreground">{plan.label}</div>
                          <div className="text-sm text-muted-foreground">{plan.period}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground">{plan.price} $</div>
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

            <aside className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-md bg-primary/10 p-2 text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground">Finalisation</p>
              </div>

              <label className="mb-5 flex cursor-pointer items-start gap-3 rounded-md border border-border bg-muted/40 p-4 text-sm text-foreground transition-colors hover:border-secondary">
                <input
                  type="checkbox"
                  checked={isGift}
                  onChange={(event) => setIsGift(event.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded-md border-input text-primary focus:ring-primary"
                />
                <span>J&apos;offre cet abonnement / don en cadeau</span>
              </label>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground">
                  Adresse courriel <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (error) setError('');
                    }}
                    placeholder="votre@email.com"
                    className="w-full rounded-md border border-input bg-background py-3 pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                    aria-label="Adresse courriel"
                  />
                </div>
              </div>

              {error && <p className="mt-4 text-sm font-medium text-destructive">{error}</p>}

              <div className="mt-6 rounded-md border border-secondary/30 bg-secondary/10 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Plan sélectionné</p>
                    <p className="mt-2 text-lg font-bold text-foreground">
                      {activePlan.label} · {activePlan.price} $
                    </p>
                  </div>
                  <div className="rounded-md bg-primary p-2 text-primary-foreground">
                    <MapPin className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Livraison : {selectedCountry || 'À choisir'}
                </p>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
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
