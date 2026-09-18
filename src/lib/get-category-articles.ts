import { prisma } from '@/lib/prisma';
import { articleListingSelect } from '@/lib/article-listing';

export async function getCategoryArticles(slugs: string[], take = 24) {
  try {
    const [articles, category] = await Promise.all([
      prisma.article.findMany({
        where: {
          category: { slug: { in: slugs } },
        },
        select: articleListingSelect,
        orderBy: { publishedAt: 'desc' },
        take,
      }),
      prisma.category.findFirst({
        where: { slug: { in: slugs } },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
        },
      }),
    ]);

    return {
      category: category || articles[0]?.category || null,
      articles,
    };
  } catch (error) {
    console.error('Error loading category articles:', error);
    return { category: null, articles: [] };
  }
}
