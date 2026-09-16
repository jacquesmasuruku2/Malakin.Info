import { prisma } from '@/lib/prisma';

export function cleanTagName(name: string): string {
  return name.trim().replace(/^#+/, '').replace(/,+$/g, '').trim();
}

export function foldTagKey(value: string): string {
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    decoded = value;
  }

  return decoded
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function slugifyTag(name: string): string {
  return cleanTagName(name)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeTagNames(input: unknown): string[] {
  if (!Array.isArray(input)) return [];

  const seen = new Set<string>();
  const names: string[] = [];

  for (const value of input) {
    const name = cleanTagName(String(value || ''));
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
