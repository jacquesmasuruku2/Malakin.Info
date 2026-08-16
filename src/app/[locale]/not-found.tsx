import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fafc_0%,_#eef4ff_42%,_#f3f4f6_100%)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl text-center">
        <div className="mb-8">
          <div className="mx-auto mb-6 flex h-40 w-40 items-center justify-center overflow-hidden rounded-full bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] ring-1 ring-slate-200">
            <img src="/images/404.png" alt="Page non trouvée" className="h-32 w-32 object-contain" />
          </div>
          <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-primary/80">
            Error 404
          </div>
          <h1 className="font-heading text-5xl font-black tracking-[-0.05em] text-slate-900 md:text-7xl">
            Page non trouvée
          </h1>
        </div>

        <p className="mx-auto mb-10 max-w-2xl text-base leading-7 text-slate-600 md:text-xl">
          La page que vous recherchez n’existe pas, a été déplacée ou n’est plus disponible.
          Vous pouvez retourner à l’accueil ou lancer une recherche pour continuer votre navigation.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-3 rounded-full bg-[#0B3B8B] px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-[#082a63]"
          >
            <Home className="h-5 w-5" />
            Retour à l'accueil
          </Link>
          <Link
            href="/recherche"
            className="inline-flex items-center justify-center gap-3 rounded-full border border-slate-200 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <Search className="h-5 w-5" />
            Rechercher
          </Link>
        </div>

        <div className="mt-14 border-t border-slate-200 pt-8">
          <p className="mb-6 text-lg text-slate-600">
            Vous pouvez aussi explorer nos rubriques populaires :
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm md:text-base">
            <Link href="/actualites" className="font-semibold text-primary transition hover:text-primary/80">
              Actualités
            </Link>
            <span className="text-slate-400">•</span>
            <Link href="/religion" className="font-semibold text-primary transition hover:text-primary/80">
              Religion
            </Link>
            <span className="text-slate-400">•</span>
            <Link href="/culture" className="font-semibold text-primary transition hover:text-primary/80">
              Culture
            </Link>
            <span className="text-slate-400">•</span>
            <Link href="/sport" className="font-semibold text-primary transition hover:text-primary/80">
              Sport
            </Link>
            <span className="text-slate-400">•</span>
            <Link href="/medias" className="font-semibold text-primary transition hover:text-primary/80">
              Médias
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
