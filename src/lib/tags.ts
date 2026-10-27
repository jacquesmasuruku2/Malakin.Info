export type ArticleTagItem = {
  name: string;
  slug: string;
};

export function cleanTagName(value: string): string {
  return value.trim().replace(/^#+/, '').replace(/,+$/g, '').trim();
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
    .replace(/["'’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeTagNames(values: unknown): string[] {
  if (!Array.isArray(values)) return [];

  const seen = new Set<string>();
  const result: string[] = [];

  for (const entry of values) {
    if (typeof entry !== 'string') continue;
    const cleaned = cleanTagName(entry);
    if (!cleaned) continue;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(cleaned);
  }

  return result;
}

export function slugifyTag(name: string): string {
  return cleanTagName(name)
    .toLowerCase()
    .replace(/["'’]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

export function tagNamesFromContent(content: unknown): string[] {
  if (typeof content !== 'string' || !content.trim()) return [];

  const matches = content.match(/#[\wÀ-ÖØ-öø-ÿ-]+/g) || [];
  return matches.map((match) => cleanTagName(match.replace('#', ''))).filter(Boolean);
}

export function getArticleTags(article: {
  articleTags?: Array<{ tag?: { name?: string | null; slug?: string | null } | null } | null> | null;
}): ArticleTagItem[] {
  if (!article?.articleTags?.length) return [];

  const seen = new Set<string>();
  const tags: ArticleTagItem[] = [];

  for (const row of article.articleTags) {
    const tag = row?.tag;
    if (!tag?.slug || !tag.name) continue;
    const slug = tag.slug.trim();
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    tags.push({ name: tag.name.trim(), slug });
  }

  return tags;
}

export function normalizeArticleHtmlContent(content: unknown): string {
  if (typeof content === 'string') return content;
  if (content == null) return '';
  if (typeof content === 'object') {
    try {
      return JSON.stringify(content);
    } catch {
      return '';
    }
  }
  return String(content);
}

function readQuotedAttr(html: string, name: string): string {
  const match = html.match(new RegExp(`\\b${name}=(?:\"([^\"]*)\"|'([^']*)')`, 'i'));
  return (match?.[1] || match?.[2] || '').trim();
}

function plainText(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function isCaptionCandidate(html: string): boolean {
  if (!html || /<(img|figure|ul|ol|blockquote|h[1-6]|table)\b/i.test(html)) return false;
  const text = plainText(html);
  if (text.length < 2 || text.length > 160) return false;
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length > 2) return false;
  if (sentences.length === 2 && text.length > 110) return false;
  return true;
}

function captionMarkup(inner: string): string {
  return `<figcaption class="article-image-caption">${inner}</figcaption>`;
}

function figureOpenTag(attrs: string): string {
  return /class=/i.test(attrs)
    ? `<figure${attrs}>`
    : `<figure class="article-inline-figure"${attrs}>`;
}

export function wrapImagesWithCaptions(html: string): string {
  if (!html) return html;

  let next = html.replace(
    /<p\b[^>]*>\s*(<img\b[^>]*>)\s*<\/p>/gi,
    '<figure class="article-inline-figure">$1</figure>'
  );

  next = next.replace(/(<figure\b[\s\S]*?<\/figure>)|(<img\b[^>]*>)/gi, (match, figure?: string, image?: string) => {
    if (figure) return figure;
    if (!image) return match;
    return `<figure class="article-inline-figure">${image}</figure>`;
  });

  return next.replace(
    /<figure\b([^>]*)>([\s\S]*?)<\/figure>(\s*<p\b[^>]*>([\s\S]*?)<\/p>)?/gi,
    (_match, attrs: string, inner: string, followingParagraph?: string, paragraphInner?: string) => {
      let body = inner;
      let captionInner = '';

      const existingCaption = body.match(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/i);
      if (existingCaption) {
        captionInner = existingCaption[1];
        body = body.replace(existingCaption[0], '');
      }

      const innerParagraph = body.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);
      if (!captionInner && innerParagraph && isCaptionCandidate(innerParagraph[1])) {
        captionInner = innerParagraph[1];
        body = body.replace(innerParagraph[0], '');
      }

      if (!captionInner && followingParagraph && isCaptionCandidate(paragraphInner || '')) {
        captionInner = paragraphInner || '';
        followingParagraph = '';
      }

      if (!captionInner) {
        captionInner = readQuotedAttr(body, 'data-caption') || readQuotedAttr(body, 'alt');
      }

      const figureHtml = captionInner
        ? `${figureOpenTag(attrs)}${body.trim()}${captionMarkup(captionInner)}</figure>`
        : `${figureOpenTag(attrs)}${body.trim()}</figure>`;

      return `${figureHtml}${followingParagraph || ''}`;
    }
  );
}

export function normalizeAudioHtml(html: string): string {
  if (!html) return html;

  return html.replace(/<audio\b([^>]*)>/gi, (match, attrs: string) => {
    const attributes = (attrs || '').trim();
    if (/\bcontrols\b/i.test(attributes)) {
      return match;
    }
    return `<audio controls${attributes ? ` ${attributes}` : ''}>`;
  });
}

function tagPath(locale: string, slug: string): string {
  const localeSafe = locale.replace(/[^a-z-]/gi, '') || 'fr';
  return `/${localeSafe}/tag/${slug}`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function foldText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function tagMatchSources(name: string): string[] {
  const clean = cleanTagName(name);
  if (clean.length < 2) return [];

  const parts = clean.split(/\s+/).filter(Boolean);
  const last = parts[parts.length - 1] || '';
  const sources = [clean];

  if (parts.length > 1 && last && last.length >= 4) {
    sources.push(last);
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

export function linkifyArticleTags(html: string, tags: ArticleTagItem[], locale: string): string {
  if (!html || !tags.length) return html;

  const usable = [...tags]
    .filter((tag) => tag.slug && cleanTagName(tag.name).length >= 2)
    .sort((a, b) => cleanTagName(b.name).length - cleanTagName(a.name).length);

  if (!usable.length) return html;

  const pattern = new RegExp(
    `(<a\\b[^>]*>[\\s\\S]*?<\\/a>|<script\\b[^>]*>[\\s\\S]*?<\\/script>|<style\\b[^>]*>[\\s\\S]*?<\\/style>|<[^>]+>)|(${usable
      .map((tag) => escapeRegExp(cleanTagName(tag.name)))
      .join('|')})`,
    'gi'
  );

  return html.replace(pattern, (match, skipped: string | undefined, label: string | undefined) => {
    if (skipped || !label) return match;
    const found = findTagForMatch(label, usable);
    if (!found) return match;
    return `<a href="${tagPath(locale, found.slug)}" class="article-inline-tag">${label}</a>`;
  });
}

export function prepareArticleHtml(html: string, tags: ArticleTagItem[] = [], locale = 'fr'): string {
  const normalized = normalizeAudioHtml(normalizeArticleHtmlContent(html));
  const withCaptions = wrapImagesWithCaptions(normalized);
  return linkifyArticleTags(withCaptions, tags, locale);
}
