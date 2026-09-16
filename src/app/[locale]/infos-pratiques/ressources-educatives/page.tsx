import Link from 'next/link';
import ArticleListingGrid from '@/components/ArticleListingGrid';

export default async function RessourcesEducativesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const items = [
    {
      id: 1,
      title: 'Modèle de CV professionnel',
      date: '26 Juin 2026',
    },
    {
      id: 2,
      title: 'Checklist démarrage entreprise',
      date: '25 Juin 2026',
    },
    {
      id: 3,
      title: 'Guide des impôts 2026',
      date: '24 Juin 2026',
    },
  ];

  const articles = items.map((item) => ({
    id: String(item.id),
    slug: String(item.id),
    title: item.title,
    dateLabel: item.date,
    categoryTitle: 'Ressources',
  }));

  return (
    <div className="tag-page bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-14">
        <Link
          href={`/${locale}/infos-pratiques`}
          className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← Retour aux Infos Pratiques
        </Link>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3 sm:mb-4">
          Ressources Éducatives
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-3xl">
          Documents et téléchargements utiles
        </p>

        <ArticleListingGrid
          articles={articles}
          locale={locale}
          hrefFor={(item) => `/${locale}/infos-pratiques/ressources-educatives/${item.slug}`}
        />
      </div>
    </div>
  );
}
