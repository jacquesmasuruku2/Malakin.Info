import Link from 'next/link';
import ArticleListingGrid from '@/components/ArticleListingGrid';

export default async function TemoignagesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const items = [
    {
      id: 1,
      title: 'Guérison miraculeuse - Témoignage de Marie K.',
      date: '1955',
    },
    {
      id: 2,
      title: 'Conversion radicales - Témoignage de Jean M.',
      date: '1960',
    },
    {
      id: 3,
      title: 'Vision et révélation - Témoignage de Pierre L.',
      date: '1962',
    },
  ];

  const articles = items.map((item) => ({
    id: String(item.id),
    slug: String(item.id),
    title: item.title,
    dateLabel: item.date,
    categoryTitle: 'Témoignages',
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
          Témoignages
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-3xl">
          Témoignages de guérisons, conversions et expériences spirituelles
        </p>

        <ArticleListingGrid
          articles={articles}
          locale={locale}
          hrefFor={(item) => `/${locale}/religion/message-du-temps/branham/temoignages/${item.slug}`}
        />
      </div>
    </div>
  );
}
