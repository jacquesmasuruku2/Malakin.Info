import Link from 'next/link';
import ArticleListingGrid from '@/components/ArticleListingGrid';

export default async function PolitiquePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const news = [
    {
      id: 1,
      title: 'Sommet de l\'Union Africaine : Les dirigeants s\'engagent pour une intégration économique renforcée',
      image: 'https://images.unsplash.com/photo-1541872703-74c5963631df?w=800&h=400&fit=crop',
      date: '27 Juin 2026',
    },
    {
      id: 2,
      title: 'Élections présidentielles 2026 : Le paysage politique en mutation',
      image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=400&fit=crop',
      date: '26 Juin 2026',
    },
    {
      id: 3,
      title: 'Réforme constitutionnelle : Le débat s\'intensifie',
      image: 'https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=800&h=400&fit=crop',
      date: '25 Juin 2026',
    },
    {
      id: 4,
      title: 'Diplomatie africaine : Nouveaux partenariats stratégiques',
      image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=400&fit=crop',
      date: '24 Juin 2026',
    },
  ];

  const articles = news.map((item) => ({
    id: String(item.id),
    slug: String(item.id),
    title: item.title,
    mainImageUrl: item.image,
    dateLabel: item.date,
    categoryTitle: 'Politique',
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
          Politique
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-3xl">
          Toute l&apos;actualité politique africaine et internationale
        </p>

        <ArticleListingGrid
          articles={articles}
          locale={locale}
          hrefFor={(item) => `/${locale}/actualites/politique/${item.slug}`}
        />
      </div>
    </div>
  );
}
