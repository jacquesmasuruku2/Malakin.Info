import Link from 'next/link';
import ArticleListingGrid from '@/components/ArticleListingGrid';

export default async function AnalyseDeDonneesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const items = [
    {
      id: 1,
      title: 'L\'analyse de données au service du développement africain',
      date: '26 Juin 2026',
    },
    {
      id: 2,
      title: 'Les outils d\'analyse de données open source',
      date: '23 Juin 2026',
    },
    {
      id: 3,
      title: 'Introduction à Python pour la data science',
      date: '21 Juin 2026',
    },
    {
      id: 4,
      title: 'Visualisation de données avec Python',
      date: '20 Juin 2026',
    },
  ];

  const articles = items.map((item) => ({
    id: String(item.id),
    slug: String(item.id),
    title: item.title,
    dateLabel: item.date,
    categoryTitle: 'Analyse de Données',
  }));

  return (
    <div className="tag-page bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-14">
        <Link
          href={`/${locale}/science-tech`}
          className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← Retour à Science & Tech
        </Link>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3 sm:mb-4">
          Analyse de Données
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-3xl">
          Articles et tutoriels sur l&apos;analyse de données, la data science et les statistiques
        </p>

        <ArticleListingGrid
          articles={articles}
          locale={locale}
          hrefFor={(item) => `/${locale}/science-tech/analyse-de-donnees/${item.slug}`}
        />
      </div>
    </div>
  );
}
