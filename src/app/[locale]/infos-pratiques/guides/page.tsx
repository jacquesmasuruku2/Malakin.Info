import Link from 'next/link';
import ArticleListingGrid from '@/components/ArticleListingGrid';

export default async function GuidesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const items = [
    {
      id: 1,
      title: 'Guide complet pour créer une entreprise en RDC',
      date: '26 Juin 2026',
      category: 'Entrepreneuriat',
    },
    {
      id: 2,
      title: 'Guide des formalités administratives pour les étrangers',
      date: '25 Juin 2026',
      category: 'Administration',
    },
    {
      id: 3,
      title: 'Guide de santé : Prévenir les maladies tropicales',
      date: '24 Juin 2026',
      category: 'Santé',
    },
  ];

  const articles = items.map((item) => ({
    id: String(item.id),
    slug: String(item.id),
    title: item.title,
    dateLabel: item.date,
    categoryTitle: item.category,
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
          Guides
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-3xl">
          Guides pratiques pour faciliter votre quotidien
        </p>

        <ArticleListingGrid
          articles={articles}
          locale={locale}
          hrefFor={(item) => `/${locale}/infos-pratiques/guides/${item.slug}`}
        />
      </div>
    </div>
  );
}
