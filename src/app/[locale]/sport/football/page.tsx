import Link from 'next/link';
import ArticleListingGrid from '@/components/ArticleListingGrid';

export default async function FootballPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const items = [
    {
      id: 1,
      title: 'CAN 2027 : La RDC finalise ses préparatifs pour accueillir la compétition',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=400&fit=crop',
      date: '27 Juin 2026',
    },
    {
      id: 2,
      title: 'Ligue des Champions : Les clubs africains brillent',
      image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=400&fit=crop',
      date: '26 Juin 2026',
    },
    {
      id: 3,
      title: 'Transferts : Les stars africaines convoitées par l\'Europe',
      image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&h=400&fit=crop',
      date: '25 Juin 2026',
    },
  ];

  const articles = items.map((item) => ({
    id: String(item.id),
    slug: String(item.id),
    title: item.title,
    mainImageUrl: item.image,
    dateLabel: item.date,
    categoryTitle: 'Football',
  }));

  return (
    <div className="tag-page bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-14">
        <Link
          href={`/${locale}/sport`}
          className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← Retour à Sport
        </Link>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3 sm:mb-4">
          Football
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-3xl">
          Actualité footballistique africaine et internationale
        </p>

        <ArticleListingGrid
          articles={articles}
          locale={locale}
          hrefFor={(item) => `/${locale}/sport/football/${item.slug}`}
        />
      </div>
    </div>
  );
}
