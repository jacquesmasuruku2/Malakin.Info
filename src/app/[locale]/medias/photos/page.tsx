import Link from 'next/link';
import ArticleListingGrid from '@/components/ArticleListingGrid';

export default async function PhotosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const galleries = [
    {
      id: 1,
      title: 'Galerie : Festival des arts de Kinshasa 2026',
      date: '26 Juin 2026',
      thumbnail: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=400&fit=crop',
    },
    {
      id: 2,
      title: 'Reportage : La vie quotidienne à Lagos',
      date: '25 Juin 2026',
      thumbnail: 'https://images.unsplash.com/photo-1574359801655-5df1d4c7dd7b?w=800&h=400&fit=crop',
    },
    {
      id: 3,
      title: 'Nature : Les paysages spectaculaires du Kilimandjaro',
      date: '24 Juin 2026',
      thumbnail: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&h=400&fit=crop',
    },
    {
      id: 4,
      title: 'Portrait : Les visages de l\'Afrique',
      date: '23 Juin 2026',
      thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
    },
  ];

  const articles = galleries.map((item) => ({
    id: String(item.id),
    slug: String(item.id),
    title: item.title,
    mainImageUrl: item.thumbnail,
    dateLabel: item.date,
    categoryTitle: 'Photos',
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
          Photos
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-3xl">
          Galeries photographiques et reportages visuels
        </p>

        <ArticleListingGrid
          articles={articles}
          locale={locale}
          hrefFor={(item) => `/${locale}/medias/photos/${item.slug}`}
        />
      </div>
    </div>
  );
}
