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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function linkifyArticleTags(
  html: string,
  tags: ArticleTagItem[],
  locale: string
): string {
  if (!html || !tags.length) return html;

  const usable = [...tags]
    .filter((tag) => tag.slug && tag.name.trim().length >= 2)
    .sort((a, b) => b.name.length - a.name.length);

  if (!usable.length) return html;

  const names = usable.map((tag) => escapeRegExp(tag.name.trim())).join('|');
  const pattern = new RegExp(
    `(<a\\b[^>]*>[\\s\\S]*?<\\/a>|<script\\b[^>]*>[\\s\\S]*?<\\/script>|<style\\b[^>]*>[\\s\\S]*?<\\/style>|<[^>]+>)|(?<![\\p{L}\\p{N}])(${names})(?![\\p{L}\\p{N}])`,
    'giu'
  );

  const linked = new Set<string>();
  const localeSafe = locale.replace(/[^a-z-]/gi, '') || 'fr';

  return html.replace(pattern, (match, skipped: string | undefined, nameMatch: string | undefined) => {
    if (skipped || !nameMatch) return match;

    const tag = usable.find((item) => item.name.toLowerCase() === nameMatch.toLowerCase());
    if (!tag || linked.has(tag.slug)) return match;

    linked.add(tag.slug);
    return `<a href="/${localeSafe}/tag/${encodeURIComponent(tag.slug)}" class="article-inline-tag">${nameMatch}</a>`;
  });
}
