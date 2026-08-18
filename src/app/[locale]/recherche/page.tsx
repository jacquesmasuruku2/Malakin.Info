import { Suspense } from 'react';
import { Search, Calendar, Clock, ArrowRight } from 'lucide-react';
import SearchContent from './SearchContent';

export default function RecherchePage() {
  return (
    <div className="flex flex-col bg-[#f5f2ea]">
      <section className="border-b border-[#d6c388] bg-gradient-to-r from-[#d2b15f] via-[#d9bf72] to-[#c8a64b] py-10 text-[#12203d] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#0b3b8b]">Malakinfo</p>
          <h1 className="font-heading text-3xl font-black tracking-[-0.03em] sm:text-5xl">Recherche</h1>
          <p className="mt-3 max-w-2xl text-base text-[#1d2f4d] sm:text-xl">
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
