import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ArticleListingGrid from '@/components/ArticleListingGrid';

export default async function SermonsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  let articles: Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    publishedAt?: Date | null;
    mainImageUrl?: string | null;
  }> = [];
  try {
    articles = await prisma.article.findMany({
      where: {
        OR: [
          { category: { slug: 'religion' } },
          { category: { slug: 'message-du-temps' } },
        ],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        publishedAt: true,
        mainImageUrl: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: 12,
    });
  } catch (error) {
    console.error('Error loading sermon-related articles:', error);
  }

  return (
    <div className="tag-page bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-14">
        <Link
          href={`/${locale}/religion`}
          className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← Retour à Religion
        </Link>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3 sm:mb-4">
          Message du temps
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-3xl">
          Réflexions et articles de la rubrique religieuse de MalakInfo
        </p>

        {articles.length === 0 ? (
          <div className="py-10 text-muted-foreground">
            Aucun article n’est encore publié dans cette rubrique.
          </div>
        ) : (
          <ArticleListingGrid
            articles={articles.map((article) => ({
              ...article,
              categoryTitle: 'Religion',
            }))}
            locale={locale}
          />
        )}
      </div>
    </div>
  );
}
