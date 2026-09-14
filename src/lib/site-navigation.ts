import { prisma } from '@/lib/prisma';
import { withRetry } from '@/lib/database';

export type LocalizedCategory = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  articleCount: number;
};

export async function getLocalizedCategories(locale: string): Promise<LocalizedCategory[]> {
  const [categories, translations] = await Promise.all([
    withRetry(() =>
      prisma.category.findMany({
        include: {
          _count: {
            select: { articles: true },
          },
        },
      })
    ),
    withRetry(() =>
      prisma.categoryTranslation.findMany({
        where: { locale },
        select: { categoryId: true, title: true, description: true },
      })
    ),
  ]);

  const translationMap = new Map(
    (translations || []).map((item) => [item.categoryId, item])
  );

  return (categories || [])
    .map((category) => {
      const translation = translationMap.get(category.id);
      return {
        id: category.id,
        slug: category.slug,
        title: translation?.title || category.title,
        description: translation?.description ?? category.description,
        articleCount: category._count.articles,
      };
    })
    .sort((a, b) => {
      if (b.articleCount !== a.articleCount) {
        return b.articleCount - a.articleCount;
      }
      return a.title.localeCompare(b.title, locale);
    });
}
