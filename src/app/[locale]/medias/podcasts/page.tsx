import Link from 'next/link';
import ArticleListingGrid from '@/components/ArticleListingGrid';

export default async function PodcastsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const podcasts = [
    {
      id: 1,
      title: 'Interview exclusive : Le futur de l\'éducation en Afrique',
      thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&h=400&fit=crop',
      date: '25 Juin 2026',
    },
    {
      id: 2,
      title: 'Débat : La place de l\'Afrique dans l\'économie mondiale',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
      date: '24 Juin 2026',
    },
    {
      id: 3,
      title: 'Culture : Les nouveaux talents du cinéma africain',
      thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=400&fit=crop',
      date: '23 Juin 2026',
    },
  ];

  const articles = podcasts.map((item) => ({
    id: String(item.id),
    slug: String(item.id),
    title: item.title,
    mainImageUrl: item.thumbnail,
    dateLabel: item.date,
    categoryTitle: 'Podcasts',
  }));

  return (
    <div className="tag-page bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-14">
        <Link
          href={`/${locale}/medias`}
          className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← Retour aux Médias
        </Link>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3 sm:mb-4">
          Podcasts
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-3xl">
          Interviews, débats et analyses audio à écouter
        </p>

        <ArticleListingGrid
          articles={articles}
          locale={locale}
          hrefFor={(item) => `/${locale}/medias/podcasts/${item.slug}`}
        />
      </div>
    </div>
  );
}
