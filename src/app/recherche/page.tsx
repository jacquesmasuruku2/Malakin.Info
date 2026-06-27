import { Suspense } from 'react';
import { Search, Calendar, Clock, ArrowRight } from 'lucide-react';
import SearchContent from './SearchContent';

export default function RecherchePage() {
  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold mb-4">Recherche</h1>
          <p className="text-xl text-gray-200">
            Rechercher sur Malakin.info
          </p>
        </div>
      </section>

      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Chargement...</p>
          </div>
        </div>
      }>
        <SearchContent />
      </Suspense>
    </div>
  );
}
