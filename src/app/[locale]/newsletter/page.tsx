'use client';

import { useState } from 'react';
import { Mail, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function NewsletterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string | null;
    const name = formData.get('name') as string | null;
    const interests = formData.getAll('interests').map((value) => String(value));
    const consent = formData.get('consent') === 'on';

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, interests, consent }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        e.currentTarget.reset();
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de l\'abonnement' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion. Veuillez réessayer.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fafc,_#f1f5f9_45%,_#eef2f7_100%)] text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="bg-[#0f172a] px-6 py-8 text-white sm:px-8 lg:px-10 lg:py-12">
              <div className="mb-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/5">
                  <Mail className="h-4 w-4" />
                </span>
                MalakInfo
              </div>

              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-red-300">
                Lettre d'information
              </p>

              <h1 className="max-w-md text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
                L’essentiel de l’actualité, dans votre boîte mail.
              </h1>

              <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
                Une sélection claire, fiable et sans bruit pour rester informé sans perdre de temps.
              </p>

              <div className="mt-8 space-y-4 border-t border-white/10 pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-red-400" />
                  <div>
                    <p className="text-sm font-semibold text-white">Contenu exclusif</p>
                    <p className="mt-1 text-sm text-slate-300">
                      Accédez à des articles et analyses que vous ne trouverez nulle part ailleurs.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-red-400" />
                  <div>
                    <p className="text-sm font-semibold text-white">Mises à jour quotidiennes</p>
                    <p className="mt-1 text-sm text-slate-300">
                      Recevez une sélection des meilleures actualités chaque matin directement dans votre boîte mail.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-red-400" />
                  <div>
                    <p className="text-sm font-semibold text-white">100% gratuit</p>
                    <p className="mt-1 text-sm text-slate-300">
                      Notre newsletter est entièrement gratuite, sans spam ni publicité intrusive.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-8 sm:px-8 lg:px-9 lg:py-10">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Abonnement
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-900">
                    Inscrivez-vous maintenant
                  </h2>
                </div>

                {message && (
                  <div
                    className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
                      message.type === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-red-200 bg-red-50 text-red-800'
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                      Adresse email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="votre@email.com"
                      required
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
                      Nom (optionnel)
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Votre nom"
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>

                  <div className="space-y-2.5">
                    <label className="block text-sm font-medium text-slate-700">
                      Centres d’intérêt
                    </label>
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-2">
                      {[
                        ['actualites', 'Actualités'],
                        ['economie', 'Économie'],
                        ['culture', 'Culture'],
                        ['sport', 'Sport'],
                        ['tech', 'Science & Tech'],
                      ].map(([value, label]) => (
                        <label
                          key={value}
                          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm text-slate-700"
                        >
                          <input
                            type="checkbox"
                            name="interests"
                            value={value}
                            defaultChecked={value === 'actualites'}
                            disabled={isSubmitting}
                            className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="truncate">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <input
                      type="checkbox"
                      id="consent"
                      name="consent"
                      required
                      disabled={isSubmitting}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500 disabled:opacity-60"
                    />
                    <label htmlFor="consent" className="text-sm leading-6 text-slate-600">
                      J’accepte de recevoir des emails de MalakInfo.com et je peux me désabonner à tout moment.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d11f2b] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#b71a24] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Envoi en cours...</span>
                      </>
                    ) : (
                      <>
                        <span>S’abonner</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center text-sm text-slate-500">
          Nous respectons votre vie privée. Vos informations ne sont jamais partagées.{' '}
          <a href="/politique-de-confidentialite" className="font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-900">
            Politique de confidentialité
          </a>
        </div>
      </div>
    </div>
  );
}
