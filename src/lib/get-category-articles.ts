import { prisma } from '@/lib/prisma';

export async function getCategoryArticles(slugs: string[], take = 24) {
  try {
    const category = await prisma.category.findFirst({
      where: { slug: { in: slugs } },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
      },
    });

    if (!category) {
      return { category: null, articles: [] };
    }

    const articles = await prisma.article.findMany({
      where: { categoryId: category.id },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        mainImageUrl: true,
        mainImageAlt: true,
        publishedAt: true,
        author: {
          select: { name: true, slug: true },
        },
        category: {
          select: { id: true, slug: true, title: true },
        },
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
