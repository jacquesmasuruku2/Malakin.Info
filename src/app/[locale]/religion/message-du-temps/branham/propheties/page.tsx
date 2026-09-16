import Link from 'next/link';
import ArticleListingGrid from '@/components/ArticleListingGrid';

export default async function ProphetiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const items = [
    {
      id: 1,
      title: 'Prophétie sur l\'Afrique - 1962',
      date: '1962',
    },
    {
      id: 2,
      title: 'La Chute de l\'Allemagne - 1937',
      date: '1937',
    },
    {
      id: 3,
      title: 'La Venue des Sept Sceaux - 1963',
      date: '1963',
    },
    {
      id: 4,
      title: 'Le Réveil de Laodicée',
      date: '1960',
    },
  ];

  const articles = items.map((item) => ({
    id: String(item.id),
    slug: String(item.id),
    title: item.title,
    dateLabel: item.date,
    categoryTitle: 'Prophéties',
  }));

  return (
    <div className="tag-page bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-14">
        <Link
          href={`/${locale}/religion/message-du-temps/branham`}
          className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← Retour à William Branham
        </Link>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3 sm:mb-4">
          Prophéties
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-3xl">
          Les prophéties de William Branham et leur accomplissement
        </p>

        <ArticleListingGrid
          articles={articles}
          locale={locale}
          hrefFor={(item) => `/${locale}/religion/message-du-temps/branham/propheties/${item.slug}`}
        />
      </div>
    </div>
  );
}
