export type ArticleTagItem = {
  name: string;
  slug: string;
};

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

export function getArticleTags(article: {
  articleTags?: Array<{ tag?: { name?: string | null; slug?: string | null } | null } | null> | null;
}): ArticleTagItem[] {
  if (!article?.articleTags?.length) return [];

  const seen = new Set<string>();
  const tags: ArticleTagItem[] = [];

  for (const row of article.articleTags) {
    const tag = row?.tag;
    if (!tag?.slug || !tag.name || seen.has(tag.slug)) continue;
    seen.add(tag.slug);
    tags.push({ name: tag.name, slug: tag.slug });
  }

  return tags;
}
