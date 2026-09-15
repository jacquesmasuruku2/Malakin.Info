import { prisma } from '@/lib/prisma';

export function slugifyTag(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeTagNames(input: unknown): string[] {
  if (!Array.isArray(input)) return [];

  const seen = new Set<string>();
  const names: string[] = [];

  for (const value of input) {
    const name = String(value || '').trim();
    const slug = slugifyTag(name);
    if (!name || !slug || seen.has(slug)) continue;
    seen.add(slug);
    names.push(name);
  }

  return names;
}

export async function syncArticleTags(articleId: string, tagNames: unknown) {
  const names = normalizeTagNames(tagNames);

  await prisma.articleTag.deleteMany({ where: { articleId } });

  for (const name of names) {
    const slug = slugifyTag(name);
    const tag = await prisma.tag.upsert({
      where: { slug },
      create: { name, slug },
      update: { name },
    });

    await prisma.articleTag.create({
      data: { articleId, tagId: tag.id },
    });
  }
}

export function tagsFromArticle(article: {
  articleTags?: Array<{ tag?: { name?: string | null } | null }> | null;
}): string[] {
  return (article.articleTags || [])
    .map((row) => row.tag?.name?.trim())
    .filter((name): name is string => Boolean(name));
}
