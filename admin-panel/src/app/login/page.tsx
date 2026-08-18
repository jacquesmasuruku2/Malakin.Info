'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(email, password, 'email');

    if (success) {
      const redirectUrl = localStorage.getItem('redirect-after-login');
      if (redirectUrl && redirectUrl !== '/login' && redirectUrl !== '/') {
        localStorage.removeItem('redirect-after-login');
        router.push(redirectUrl);
      } else {
        router.push('/');
      }
    } else {
      setError('Email ou mot de passe incorrect');
      setPassword('');
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f4f6] p-4">
      <div className="w-full max-w-[760px] rounded-[18px] border border-[#d9dfe6] bg-[#f8f8f8] p-6 shadow-[0_6px_26px_rgba(15,23,42,0.04)] sm:p-8">
        <h1 className="mb-6 text-4xl font-black tracking-[-0.05em] text-[#111827]">Connexion</h1>

        <div className="grid gap-3 border-t border-[#dfe4ea] pt-5 sm:grid-cols-2">
          <button
            type="button"
            className="flex items-center justify-center gap-3 rounded-xl border border-[#dfe4ea] bg-[#f9fafb] px-4 py-3 text-base font-medium text-[#111827] transition hover:bg-white"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#f9d648] via-[#f08a2b] to-[#db4d3f] text-xs font-black text-white">
              G
            </div>
            <span>Google</span>
          </button>

          <button
            type="button"
            className="flex items-center justify-center gap-3 rounded-xl border border-[#dfe4ea] bg-[#f9fafb] px-4 py-3 text-base font-medium text-[#111827] transition hover:bg-white"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1877f2] text-xs font-black text-white">
              f
            </div>
            <span>Facebook</span>
          </button>
        </div>

        <div className="my-5 flex items-center gap-4">
          <div className="h-px flex-1 bg-[#dfe4ea]" />
          <span className="text-sm font-medium uppercase tracking-[0.2em] text-[#6b7280]">ou</span>
          <div className="h-px flex-1 bg-[#dfe4ea]" />
        </div>

        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-[-0.04em] text-[#111827]">Se connecter avec un mot de passe</h2>
          <p className="mt-2 text-base text-[#374151]">
            Vous n&apos;avez pas de compte ? <span className="font-semibold text-[#0b3b8b]">Créez-en un.</span>
          </p>
          <p className="mt-1 text-base text-[#374151]">
            <span className="font-medium text-[#0b3b8b]">Connectez-vous sans mot de passe.</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-base font-medium text-[#111827]">
              Adresse e-mail
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6b7280]" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[#cfd8e3] bg-white py-3 pl-12 pr-4 text-base text-[#111827] outline-none transition focus:border-[#0b3b8b] focus:ring-4 focus:ring-[#0b3b8b]/10"
                placeholder=""
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-base font-medium text-[#111827]">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6b7280]" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#cfd8e3] bg-white py-3 pl-12 pr-12 text-base text-[#111827] outline-none transition focus:border-[#0b3b8b] focus:ring-4 focus:ring-[#0b3b8b]/10"
                placeholder=""
              />
              <button
                type="button"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7280] transition hover:text-[#111827]"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm font-medium text-red-600">{error}</p>
          )}

          <div className="pt-1 text-right">
            <button type="button" className="text-base font-medium text-[#0b3b8b] hover:underline">
              Mot de passe oublié ?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="mt-2 w-full rounded-xl bg-[#0b3b8b] px-5 py-3 text-lg font-bold text-white shadow-[0_10px_18px_rgba(11,59,139,0.2)] transition hover:bg-[#082a63] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Confirmer →'}
          </button>
        </form>
      </div>
    </div>
  );
}
