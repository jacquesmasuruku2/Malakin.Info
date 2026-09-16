import Link from 'next/link';
import ArticleListingGrid from '@/components/ArticleListingGrid';

export default async function SantePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const news = [
    {
      id: 1,
      title: 'Nouvelle initiative de vaccination contre le paludisme en Afrique centrale',
      image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&h=400&fit=crop',
      date: '25 Juin 2026',
    },
    {
      id: 2,
      title: 'Hôpitaux modernes : Nouveaux équipements pour les centres de santé',
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=400&fit=crop',
      date: '24 Juin 2026',
    },
  ];

  const articles = news.map((item) => ({
    id: String(item.id),
    slug: String(item.id),
    title: item.title,
    mainImageUrl: item.image,
    dateLabel: item.date,
    categoryTitle: 'Santé',
  }));

  return (
    <div className="tag-page bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-14">
        <Link
          href={`/${locale}/actualites`}
          className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← Retour aux actualités
        </Link>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3 sm:mb-4">
          Santé
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-3xl">
          Actualité santé, médecine et bien-être
        </p>

        <ArticleListingGrid
          articles={articles}
          locale={locale}
          hrefFor={(item) => `/${locale}/actualites/sante/${item.slug}`}
        />
      </div>
    </div>
  );
}
