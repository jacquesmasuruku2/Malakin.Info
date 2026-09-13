import { prisma } from '@/lib/prisma';

export async function getCategoryArticles(slugs: string[], take = 24) {
  try {
    const category = await prisma.category.findFirst({
      where: { slug: { in: slugs } },
    });

    if (!category) {
      return { category: null, articles: [] };
    }

    const articles = await prisma.article.findMany({
      where: { categoryId: category.id },
      include: {
        author: true,
        category: true,
      },
      orderBy: { publishedAt: 'desc' },
      take,
    });

    return { category, articles };
  } catch (error) {
    console.error('Error loading category articles:', error);
    return { category: null, articles: [] };
  }
}
