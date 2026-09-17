import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { applyArticleLocales } from '@/lib/translation';
import ArticleListingGrid from '@/components/ArticleListingGrid';

export const revalidate = 60;

export default async function EconomiePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  let news: any[] = [];

  try {
    const economyCategory = await prisma.category.findUnique({
      where: { slug: 'economie' },
    });

    if (economyCategory) {
      news = await prisma.article.findMany({
        where: {
          categoryId: economyCategory.id,
        },
        include: {
          category: true,
          author: true,
        },
        take: 10,
        orderBy: {
          publishedAt: 'desc',
        },
      } as any);
      news = await applyArticleLocales(news, locale);
    }
  } catch (error) {
    console.error('Database connection error:', error);
  }

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
          Économie
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-3xl">
          Actualité économique, finance et business en Afrique
        </p>

        {news.length === 0 ? (
          <div className="py-10 text-muted-foreground">
            Aucun article économique disponible pour le moment.
          </div>
        ) : (
          <ArticleListingGrid
            articles={news.map((item) => ({
              ...item,
              categoryTitle: item.category?.title || 'Économie',
            }))}
            locale={locale}
          />
        )}
      </div>
    </div>
  );
}
