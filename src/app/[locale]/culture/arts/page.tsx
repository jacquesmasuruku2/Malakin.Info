import Link from 'next/link';
import ArticleListingGrid from '@/components/ArticleListingGrid';

export default async function ArtsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const items = [
    {
      id: 1,
      title: 'Exposition : L\'art contemporain africain à Paris',
      image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=400&fit=crop',
      date: '26 Juin 2026',
    },
    {
      id: 2,
      title: 'Sculpture traditionnelle : Renaissance des techniques ancestrales',
      image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=800&h=400&fit=crop',
      date: '25 Juin 2026',
    },
  ];

  const articles = items.map((item) => ({
    id: String(item.id),
    slug: String(item.id),
    title: item.title,
    mainImageUrl: item.image,
    dateLabel: item.date,
    categoryTitle: 'Arts',
  }));

  return (
    <div className="tag-page bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-14">
        <Link
          href={`/${locale}/culture`}
          className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← Retour à Culture
        </Link>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3 sm:mb-4">
          Arts
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-3xl">
          Arts visuels, peinture, sculpture et expositions
        </p>

        <ArticleListingGrid
          articles={articles}
          locale={locale}
          hrefFor={(item) => `/${locale}/culture/arts/${item.slug}`}
        />
      </div>
    </div>
  );
}
