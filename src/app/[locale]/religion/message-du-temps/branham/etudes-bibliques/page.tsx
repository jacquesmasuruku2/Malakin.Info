import Link from 'next/link';
import ArticleListingGrid from '@/components/ArticleListingGrid';

export default async function EtudesBibliquesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const items = [
    {
      id: 1,
      title: 'L\'Apocalypse et les Sept Sceaux',
      date: '1963',
    },
    {
      id: 2,
      title: 'La Genèse et les Origines',
      date: '1961',
    },
    {
      id: 3,
      title: 'Les Épîtres de Paul',
      date: '1962',
    },
    {
      id: 4,
      title: 'Les Paraboles de Jésus',
      date: '1964',
    },
  ];

  const articles = items.map((item) => ({
    id: String(item.id),
    slug: String(item.id),
    title: item.title,
    dateLabel: item.date,
    categoryTitle: 'Études Bibliques',
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
          Études Bibliques
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-3xl">
          Études approfondies de la Bible et enseignements doctrinaux
        </p>

        <ArticleListingGrid
          articles={articles}
          locale={locale}
          hrefFor={(item) => `/${locale}/religion/message-du-temps/branham/etudes-bibliques/${item.slug}`}
        />
      </div>
    </div>
  );
}
