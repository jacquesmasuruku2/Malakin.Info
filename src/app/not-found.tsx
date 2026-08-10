import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full text-center">
        <div className="mb-12">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-primary/10 rounded-full mb-8">
            <Search className="w-16 h-16 text-primary" />
          </div>
          <h1 className="font-heading text-8xl font-bold text-foreground mb-6">404</h1>
          <h2 className="font-heading text-4xl font-semibold text-foreground mb-6">
            Page non trouvée
          </h2>
          <p className="text-muted-foreground text-xl mb-12 max-w-2xl mx-auto">
            La page que vous recherchez n'existe pas ou a été déplacée.
            Vérifiez l'URL ou utilisez la recherche pour trouver ce que vous cherchez.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-lg"
          >
            <Home className="w-6 h-6" />
            Retour à l'accueil
          </Link>
          <Link
            href="/recherche"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-border rounded-lg hover:bg-gray-50 transition-colors font-medium text-lg"
          >
            <Search className="w-6 h-6" />
            Rechercher
          </Link>
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-lg text-muted-foreground mb-6">
            Vous pouvez aussi explorer nos rubriques populaires :
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/actualites" className="text-lg text-primary hover:text-primary/80 font-medium">
              Actualités
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/religion" className="text-lg text-primary hover:text-primary/80 font-medium">
              Religion
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/culture" className="text-lg text-primary hover:text-primary/80 font-medium">
              Culture
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/sport" className="text-lg text-primary hover:text-primary/80 font-medium">
              Sport
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/medias" className="text-lg text-primary hover:text-primary/80 font-medium">
              Médias
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
