'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(email, password, 'email');

    if (success) {
      const redirectUrl = localStorage.getItem('redirect-after-login');
      localStorage.removeItem('redirect-after-login');
      router.replace(redirectUrl && redirectUrl !== '/login' ? redirectUrl : '/');
      router.refresh();
      return;
    }

    setError('Email ou mot de passe incorrect.');
    setPassword('');
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f3f4f6] p-4">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">MalakInfo</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Connexion admin</h1>
        <p className="mt-2 text-sm text-slate-600">Accédez au tableau de bord pour gérer le site.</p>

        {error && (
          <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
              Adresse e-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#0b3b8b] focus:ring-2 focus:ring-[#0b3b8b]/15"
              required
              autoFocus
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 pr-11 text-sm text-slate-900 outline-none focus:border-[#0b3b8b] focus:ring-2 focus:ring-[#0b3b8b]/15"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="mt-2 text-right">
              <Link href="/forgot-password" className="text-xs font-medium text-[#0b3b8b] hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[#0b3b8b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#082a63] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </section>
    </main>
  );
}
