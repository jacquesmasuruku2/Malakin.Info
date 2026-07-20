import Link from 'next/link';
import { Target, ArrowRight } from 'lucide-react';

export default function MissionPage() {
  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/a-propos" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour à À Propos
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Notre Mission</h1>
          <p className="text-xl text-gray-200">
            Notre engagement envers l'Afrique et son avenir
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-card rounded-lg p-8 md:p-12 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-heading text-3xl font-bold">Notre Mission</h2>
          </div>

          <blockquote className="text-2xl font-heading text-primary mb-8 italic border-l-4 border-primary pl-6">
            "Informer, éduquer et connecter l'Afrique à travers un journalisme indépendant, fiable et multiculturel."
          </blockquote>

          <div className="space-y-6 text-muted-foreground">
            <p className="text-lg">
              Malakin.info est né de la conviction que l'accès à une information de qualité est un droit fondamental et un moteur essentiel pour le développement du continent africain.
            </p>

            <p>
              Notre mission s'articule autour de trois piliers fondamentaux :
            </p>

            <div className="space-y-4 mt-8">
              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">Informer</h3>
                <p>
                  Nous nous engageons à fournir une information précise, vérifiée et pertinente sur les événements qui façonnent l'Afrique et le monde. Notre couverture journalistique est exhaustive, allant de la politique à l'économie, en passant par la culture, le sport et la religion.
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">Éduquer</h3>
                <p>
                  Au-delà de l'information, nous visons à éduquer nos lecteurs en leur offrant des analyses approfondies, des contextes historiques et des perspectives qui leur permettent de comprendre les enjeux complexes auxquels l'Afrique fait face.
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">Connecter</h3>
                <p>
                  Nous créons des ponts entre les communautés africaines et le reste du monde, facilitant le dialogue et la compréhension mutuelle. Notre plateforme est un espace où les voix africaines peuvent être entendues et valorisées.
                </p>
              </div>
            </div>

            <p className="text-lg mt-8">
              Notre engagement est de maintenir les plus hauts standards du journalisme, en respectant notre charte éthique et en servant l'intérêt public avant tout autre considération.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <Link
              href="/a-propos/charte"
              className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
            >
              Découvrir notre charte éthique
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
