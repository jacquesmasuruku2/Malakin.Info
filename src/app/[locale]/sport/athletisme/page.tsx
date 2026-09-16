import Link from 'next/link';
import ArticleListingGrid from '@/components/ArticleListingGrid';

export default async function AthletismePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const items = [
    {
      id: 1,
      title: 'Championnats d\'Afrique : Les records tombent',
      image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=400&fit=crop',
      date: '26 Juin 2026',
    },
    {
      id: 2,
      title: 'Jeux Olympiques : L\'Afrique en force',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba6851?w=800&h=400&fit=crop',
      date: '25 Juin 2026',
    },
  ];

  const articles = items.map((item) => ({
    id: String(item.id),
    slug: String(item.id),
    title: item.title,
    mainImageUrl: item.image,
    dateLabel: item.date,
    categoryTitle: 'Athlétisme',
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
          Athlétisme
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-3xl">
          Actualité athlétique africaine et internationale
        </p>

        <ArticleListingGrid
          articles={articles}
          locale={locale}
          hrefFor={(item) => `/${locale}/sport/athletisme/${item.slug}`}
        />
      </div>
    </div>
  );
}
