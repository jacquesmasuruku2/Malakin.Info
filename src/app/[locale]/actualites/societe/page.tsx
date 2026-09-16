import Link from 'next/link';
import ArticleListingGrid from '@/components/ArticleListingGrid';

export default async function SocietePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const news = [
    {
      id: 1,
      title: 'Festival de cinéma africain : Les talents locaux à l\'honneur',
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=400&fit=crop',
      date: '27 Juin 2026',
    },
    {
      id: 2,
      title: 'Éducation : Nouveau programme numérique dans les écoles',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop',
      date: '26 Juin 2026',
    },
  ];

  const articles = news.map((item) => ({
    id: String(item.id),
    slug: String(item.id),
    title: item.title,
    mainImageUrl: item.image,
    dateLabel: item.date,
    categoryTitle: 'Société',
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
          Société
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-3xl">
          Actualité sociale, éducation et vie quotidienne
        </p>

        <ArticleListingGrid
          articles={articles}
          locale={locale}
          hrefFor={(item) => `/${locale}/actualites/societe/${item.slug}`}
        />
      </div>
    </div>
  );
}
