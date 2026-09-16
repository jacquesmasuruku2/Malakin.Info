import { prisma } from '@/lib/prisma';
import { foldTagKey, normalizeTagNames, slugifyTag } from '@/lib/tag-name';

export { cleanTagName, foldTagKey, normalizeTagNames, slugifyTag } from '@/lib/tag-name';

export async function syncArticleTags(articleId: string, tagNames: unknown) {
  const names = normalizeTagNames(tagNames);

  await prisma.articleTag.deleteMany({ where: { articleId } });

  for (const name of names) {
    const slug = slugifyTag(name);
    const folded = foldTagKey(slug);
    const existing = await prisma.tag.findFirst({
      where: {
        OR: [{ slug }, { slug: folded }],
      },
    });

    const tag = existing
      ? await prisma.tag.update({
          where: { id: existing.id },
          data: { name },
        })
      : await prisma.tag.create({
          data: { name, slug },
        });

    await prisma.articleTag.create({
      data: { articleId, tagId: tag.id },
    });
  }
}

export function tagsFromArticle(article: unknown): string[] {
  if (!article || typeof article !== 'object' || !('articleTags' in article)) {
    return [];
  }

  const rows = (article as {
    articleTags?: Array<{ tag?: { name?: string | null } | null }> | null;
  }).articleTags;

  return (rows || [])
    .map((row) => row?.tag?.name?.trim())
    .filter((name): name is string => Boolean(name));
}
