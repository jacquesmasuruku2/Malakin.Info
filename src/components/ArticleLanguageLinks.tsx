import Link from 'next/link';
import { getArticleTranslations } from '@/lib/translation';

const ARTICLE_LOCALES = [
  { locale: 'fr', label: 'FR' },
  { locale: 'en', label: 'EN' },
] as const;

export default async function ArticleLanguageLinks({
  articleId,
  slug,
  locale,
}: {
  articleId: string;
  slug: string;
  locale: string;
}) {
  const { defaultLocale, translations } = await getArticleTranslations(articleId);
  const availableLocales = new Set([
    defaultLocale,
    ...translations.map((translation) => translation.locale),
  ]);
  const links = ARTICLE_LOCALES.filter((item) => availableLocales.has(item.locale));

  if (links.length < 2) return null;

  return (
    <nav aria-label={locale === 'en' ? 'Article language' : 'Langue de l’article'} className="flex items-center gap-2">
      {links.map((item) => item.locale === locale ? (
        <span
          key={item.locale}
          aria-current="page"
          className="rounded border border-border px-2 py-1 text-xs font-semibold"
        >
          {item.label}
        </span>
      ) : (
        <Link
          key={item.locale}
          href={`/${item.locale}/${slug}`}
          hrefLang={item.locale}
          className="rounded border border-border px-2 py-1 text-xs font-semibold hover:bg-muted"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
