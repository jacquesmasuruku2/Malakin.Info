import { Suspense } from 'react';
import { Search, Calendar, Clock, ArrowRight } from 'lucide-react';
import SearchContent from './SearchContent';

export default function RecherchePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground dark:bg-[#0b1628]">
      <section className="border-b border-border bg-[#e9e1c3] py-10 text-[#12203d] dark:border-[#24364f] dark:bg-[#0f1d30] dark:text-[#e8eef8] sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#0b3b8b] dark:text-[#8bb8ff]">Malakinfo</p>
          <h1 className="font-heading text-3xl font-black tracking-[-0.03em] sm:text-5xl">Recherche</h1>
          <p className="mt-3 max-w-2xl text-base text-[#1d2f4d] dark:text-[#cfd9ea] sm:text-xl">
            Trouvez des articles, auteurs, médias et sujets de l’actualité en quelques secondes.
          </p>
        </div>
      </section>

      <Suspense fallback={
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Chargement...</p>
          </div>
        </div>
      }>
        <SearchContent />
      </Suspense>
    </div>
  );
}
