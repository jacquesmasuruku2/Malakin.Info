'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LocaleNotFoundContent() {
  const locale = usePathname().split('/')[1];
  const isEnglish = locale === 'en';

  return (
    <main className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">404</p>
      <h1 className="text-3xl font-bold text-foreground">
        {isEnglish ? 'Content unavailable' : 'Contenu indisponible'}
      </h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        {isEnglish
          ? 'This page or its translation is not available in English yet.'
          : 'Cette page ou sa traduction n’est pas encore disponible en français.'}
      </p>
      <Link
        href={`/${isEnglish ? 'en' : 'fr'}`}
        className="mt-8 rounded-lg bg-primary px-5 py-3 font-semibold text-white"
      >
        {isEnglish ? 'Go to the home page' : 'Retour à l’accueil'}
      </Link>
    </main>
  );
}
