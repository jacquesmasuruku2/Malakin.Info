export type ArticleTagItem = {
  name: string;
  slug: string;
};

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

export function tagPath(locale: string, slug: string): string {
  const localeSafe = locale.replace(/[^a-z-]/gi, '') || 'fr';
  return `/${localeSafe}/tag/${slug}/`;
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

function letterClass(char: string): string {
  const folded = char.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const variants = new Set(
    [char, char.toLowerCase(), char.toUpperCase(), folded, folded.toLowerCase(), folded.toUpperCase()].filter(Boolean)
  );
  const list = [...variants];
  if (list.length === 1) return escapeRegExp(list[0]);
  return `[${list.map(escapeRegExp).join('')}]`;
}

function caseInsensitiveSource(value: string): string {
  return [...value].map(letterClass).join('');
}

function foldText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function tagMatchSources(name: string): string[] {
  const clean = cleanTagName(name);
  if (clean.length < 2) return [];

  const parts = clean.split(/\s+/).filter(Boolean);
  const last = parts[parts.length - 1];
  const fullEsc = caseInsensitiveSource(clean);
  const lastEsc = caseInsensitiveSource(last);
  const firstNames = `(?:[\\p{Lu}\\p{Lt}][\\p{L}'’-]*\\s+){1,2}`;
  const sources = [fullEsc];

  if (parts.length > 1 && last && last.length >= 4) {
    sources.push(`${firstNames}${lastEsc}`);
    sources.push(lastEsc);
  } else if (parts.length === 1 && last && last.length >= 5) {
    sources.push(`${firstNames}${lastEsc}`);
  }

  return sources;
}

function findTagForMatch(text: string, tags: ArticleTagItem[]): ArticleTagItem | undefined {
  const folded = foldText(text);

  const exact = tags.find((tag) => foldText(cleanTagName(tag.name)) === folded);
  if (exact) return exact;

  return tags.find((tag) => {
    const last = cleanTagName(tag.name).split(/\s+/).pop() || '';
    if (last.length < 4) return false;
    const lastFolded = foldText(last);
    return folded === lastFolded || folded.endsWith(` ${lastFolded}`);
  });
}

export function wrapImagesWithCaptions(html: string): string {
  if (!html) return html;

  const readAlt = (image: string) => {
    const quoted = image.match(/\balt=(?:"([^"]*)"|'([^']*)')/i);
    return (quoted?.[1] || quoted?.[2] || '').trim();
  };

  const withStandaloneImages = html.replace(
    /<p(\b[^>]*)>\s*(<img\b[^>]*>)\s*(?:<\/p>)?/gi,
    '<figure class="article-inline-figure">$2</figure>'
  );

  return withStandaloneImages.replace(
    /(<figure\b[\s\S]*?<\/figure>)|(<img\b[^>]*>)/gi,
    (match, figure: string | undefined, image: string | undefined) => {
      if (figure) {
        if (/<figcaption\b/i.test(figure)) return figure;
        const alt = readAlt(figure);
        if (!alt) return figure;
        return figure.replace(/<\/figure>/i, `<figcaption>${alt}</figcaption></figure>`);
      }

      if (!image) return match;
      const alt = readAlt(image);
      if (!alt) return `<figure class="article-inline-figure">${image}</figure>`;
      return `<figure class="article-inline-figure">${image}<figcaption>${alt}</figcaption></figure>`;
    }
  );
}

export function linkifyArticleTags(
  html: string,
  tags: ArticleTagItem[],
  locale: string
): string {
  if (!html || !tags.length) return html;

  const usable = [...tags]
    .filter((tag) => tag.slug && cleanTagName(tag.name).length >= 2)
    .sort((a, b) => cleanTagName(b.name).length - cleanTagName(a.name).length);

  if (!usable.length) return html;

  const sources: string[] = [];
  const seen = new Set<string>();
  for (const tag of usable) {
    for (const source of tagMatchSources(tag.name)) {
      const key = source.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      sources.push(source);
    }
  }

  sources.sort((a, b) => b.length - a.length);
  if (!sources.length) return html;

  const pattern = new RegExp(
    `(<a\\b[^>]*>[\\s\\S]*?<\\/a>|<script\\b[^>]*>[\\s\\S]*?<\\/script>|<style\\b[^>]*>[\\s\\S]*?<\\/style>|<[^>]+>)|(?<![\\p{L}\\p{N}])#?(${sources.join('|')})(?![\\p{L}\\p{N}])`,
    'gu'
  );

  return html.replace(pattern, (match, skipped: string | undefined, nameMatch: string | undefined) => {
    if (skipped || !nameMatch) return match;

    const tag = findTagForMatch(nameMatch, usable);
    if (!tag) return match;

    return `<a href="${tagPath(locale, tag.slug)}" class="article-inline-tag">${nameMatch}</a>`;
  });
}

export function prepareArticleHtml(
  html: string,
  tags: ArticleTagItem[] = [],
  locale = 'fr'
): string {
  return linkifyArticleTags(wrapImagesWithCaptions(html), tags, locale);
}
