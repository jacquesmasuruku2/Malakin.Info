'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import { FormEvent, useState } from 'react';

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-12">
      <div className="mx-auto max-w-xl rounded-sm bg-white p-8 shadow-sm md:p-12">
        <Link
          href="/fr/compte/connexion"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la connexion
        </Link>

        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
          Mot de passe oublié
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-600 md:text-base">
          Saisissez votre adresse e-mail pour recevoir un lien de restauration de votre compte.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="relative text-left">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                className="peer w-full rounded-sm border border-gray-300 bg-white px-3 pt-6 pb-2 font-mono text-gray-700 placeholder:text-transparent focus:border-primary focus:outline-none"
                required
              />
              <label
                htmlFor="email"
                className="pointer-events-none absolute left-3 top-3 text-xs font-medium text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-primary"
              >
                Adresse e-mail
              </label>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 font-bold text-white transition-colors hover:bg-primary/90"
            >
              <Mail className="h-4 w-4" />
              Envoyer le lien
            </button>
          </form>
        ) : (
          <div className="mt-8 rounded-sm border border-green-200 bg-green-50 p-5 text-left">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Lien envoyé</p>
                <p className="mt-1 text-sm text-green-700">
                  Si un compte existe pour <span className="font-medium">{email}</span>, un message de restauration a été envoyé.
                </p>
              </div>
            </div>

            <Link
              href="/fr/compte/connexion"
              className="mt-5 inline-block text-sm font-medium text-primary hover:text-primary/80"
            >
              Retour à la connexion
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
