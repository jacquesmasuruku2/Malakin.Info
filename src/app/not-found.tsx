import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-card rounded-2xl shadow-lg p-12">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full mb-6">
              <Search className="w-12 h-12 text-primary" />
            </div>
            <h1 className="font-heading text-6xl font-bold text-foreground mb-4">404</h1>
            <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
              Page non trouvée
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              La page que vous recherchez n'existe pas ou a été déplacée.
              Vérifiez l'URL ou utilisez la recherche pour trouver ce que vous cherchez.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <Home className="w-5 h-5" />
              Retour à l'accueil
            </Link>
            <Link
              href="/recherche"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-card border border-border rounded-lg hover:bg-muted transition-colors font-medium"
            >
              <Search className="w-5 h-5" />
              Rechercher
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Vous pouvez aussi explorer nos rubriques populaires :
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              <Link href="/actualites" className="text-sm text-primary hover:text-primary/80">
                Actualités
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link href="/religion" className="text-sm text-primary hover:text-primary/80">
                Religion
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link href="/culture" className="text-sm text-primary hover:text-primary/80">
                Culture
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link href="/sport" className="text-sm text-primary hover:text-primary/80">
                Sport
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link href="/medias" className="text-sm text-primary hover:text-primary/80">
                Médias
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
