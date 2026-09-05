'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CheckCircle, Heart, Loader2, Shield } from 'lucide-react';

const presetAmounts = [5000, 10000, 25000, 50000, 100000];

export default function FaireUnDonPage() {
  const [selectedAmount, setSelectedAmount] = useState(10000);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const amount = customAmount ? Number(customAmount) : selectedAmount;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsProcessing(true);
    setError('');

    try {
      const response = await fetch('/api/donations/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, donorName, donorEmail, message, isAnonymous }),
      });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error(data.error || 'Impossible de créer le paiement.');
      window.location.assign(data.url);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Impossible de créer le paiement.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <section className="bg-gradient-to-r from-primary to-primary/80 py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link href="/nous-soutenir" className="mb-4 inline-block text-gray-300 hover:text-white">← Retour à Nous Soutenir</Link>
          <h1 className="font-heading mb-4 text-4xl font-bold">Faire un don</h1>
          <p className="text-xl text-gray-200">Soutenez le journalisme indépendant africain</p>
        </div>
      </section>

      <main className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:px-8 lg:py-16">
        <section>
          <div className="mb-8 rounded-xl bg-gradient-to-br from-accent/10 to-primary/10 p-6">
            <div className="mb-4 flex items-center gap-3"><Heart className="h-8 w-8 text-primary" /><h2 className="font-heading text-2xl font-bold">Pourquoi donner ?</h2></div>
            <ul className="space-y-3">{['Soutenir un journalisme indépendant', 'Contribuer à une information de qualité', 'Aider à couvrir les coûts de production', 'Permettre le développement de nouvelles rubriques', 'Soutenir nos enquêtes et reportages'].map((reason) => <li key={reason} className="flex items-start gap-2"><CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" /><span>{reason}</span></li>)}</ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-6"><div className="mb-3 flex items-center gap-3"><Shield className="h-6 w-6 text-primary" /><h3 className="font-heading text-lg font-semibold">Paiement sécurisé par Stripe</h3></div><p className="text-sm text-muted-foreground">Vos informations bancaires sont saisies directement sur Stripe. MalakInfo ne reçoit ni votre numéro de carte ni votre code de sécurité.</p></div>
        </section>

        <form onSubmit={handleSubmit} className="rounded-xl bg-card p-6 shadow-sm sm:p-8">
          <h2 className="font-heading mb-2 text-2xl font-bold">Votre don</h2>
          <p className="mb-6 text-sm text-muted-foreground">Paiement unique en FCFA via Stripe Checkout.</p>
          <label className="mb-3 block text-sm font-medium">Montant du don</label>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{presetAmounts.map((preset) => <button key={preset} type="button" onClick={() => { setSelectedAmount(preset); setCustomAmount(''); }} className={`rounded-lg border-2 px-3 py-3 text-sm font-medium transition-colors ${selectedAmount === preset && !customAmount ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:border-primary/50'}`}>{preset.toLocaleString()} FCFA</button>)}</div>
          <input type="number" min="500" max="5000000" step="1" value={customAmount} onChange={(event) => { setCustomAmount(event.target.value); setSelectedAmount(0); }} placeholder="Autre montant (min. 500 FCFA)" className="mb-6 w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary" />

          <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Nom (optionnel)<input value={donorName} onChange={(event) => setDonorName(event.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-primary" placeholder="Votre nom" /></label><label className="text-sm font-medium">Email (optionnel)<input type="email" value={donorEmail} onChange={(event) => setDonorEmail(event.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-primary" placeholder="vous@exemple.com" /></label></div>
          <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={isAnonymous} onChange={(event) => setIsAnonymous(event.target.checked)} />Afficher ce don comme anonyme</label>
          <label className="mt-4 block text-sm font-medium">Message (optionnel)<textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} maxLength={500} className="mt-2 w-full resize-none rounded-lg border border-border bg-background px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-primary" placeholder="Un mot pour notre équipe" /></label>
          {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={!amount || amount < 500 || isProcessing} className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-4 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">{isProcessing ? <><Loader2 className="h-5 w-5 animate-spin" />Redirection vers Stripe...</> : <><Heart className="h-5 w-5" />Continuer vers le paiement</>}</button>
          <p className="mt-4 text-center text-xs text-muted-foreground">Le don sera confirmé uniquement après validation du paiement par Stripe.</p>
        </form>
      </main>
    </div>
  );
}
