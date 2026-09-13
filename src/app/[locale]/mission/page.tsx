import { Metadata } from 'next';
import Link from 'next/link';
import { LEGAL_UPDATED_AT, PUBLICATION_DIRECTOR, SITE_NAME } from '@/lib/site-legal';

export const metadata: Metadata = {
  title: 'Notre mission - Malakinfo.com',
  description: 'La mission de MalakInfo : informer, éduquer et connecter l’Afrique à travers un journalisme indépendant.',
};

export default async function MissionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-heading text-4xl font-bold text-foreground mb-8">
          Notre mission
        </h1>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Engagement</h2>
            <p className="text-muted-foreground">
              Informer, éduquer et connecter l’Afrique à travers un journalisme indépendant, fiable et multiculturel.
            </p>
            <p className="text-muted-foreground">
              {SITE_NAME} est né de la conviction que l’accès à une information de qualité est un droit fondamental et un moteur du développement du continent africain.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Informer</h2>
            <p className="text-muted-foreground">
              Nous fournissons une information précise, vérifiée et pertinente sur les événements qui façonnent l’Afrique et le monde. Notre couverture va de la politique à l’économie, en passant par la culture, le sport et la religion.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Éduquer</h2>
            <p className="text-muted-foreground">
              Au-delà de l’actualité, nous proposons des analyses, des contextes et des perspectives pour aider les lecteurs à comprendre les enjeux auxquels l’Afrique fait face.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Connecter</h2>
            <p className="text-muted-foreground">
              Nous créons des ponts entre les communautés africaines et le reste du monde. La plateforme donne une place aux voix africaines et favorise le dialogue.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Ligne éditoriale</h2>
            <p className="text-muted-foreground">
              {SITE_NAME} est édité par {PUBLICATION_DIRECTOR}. Notre travail est guidé par l’intérêt public et par notre charte éthique.
            </p>
            <p className="text-muted-foreground">
              Consultez la{' '}
              <Link href={`/${locale}/charte`} className="text-primary hover:underline">
                charte éthique
              </Link>
              {' '}et la page{' '}
              <Link href={`/${locale}/a-propos`} className="text-primary hover:underline">
                À propos
              </Link>
              .
            </p>
          </section>

          <section className="border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">
              Date de dernière mise à jour : {LEGAL_UPDATED_AT}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
