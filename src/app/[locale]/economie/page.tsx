import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { applyArticleLocales } from '@/lib/translation';
import { pickCopy, t } from '@/lib/copy';
import { getMessages } from '@/lib/i18n';
import ArticleListingGrid from '@/components/ArticleListingGrid';
import { articleListingSelect } from '@/lib/article-listing';

export const revalidate = 60;

export default async function EconomyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = getMessages(locale);
  let articles: any[] = [];

  try {
    articles = await prisma.article.findMany({
      where: { category: { slug: 'economie' } },
      select: articleListingSelect,
      orderBy: { publishedAt: 'desc' },
      take: 24,
    } as any);
    articles = await applyArticleLocales(articles, locale);
  } catch (error) {
    console.error('Economy page database error:', error);
  }

  const title = messages.nav.economy;
  const description = pickCopy(locale, {
    fr: 'Finance, marchés, entreprises et transformation économique en Afrique et dans le monde.',
    en: 'Finance, markets, business and economic transformation in Africa and around the world.',
    es: 'Finanzas, mercados, empresas y transformación económica en África y el mundo.',
    sw: 'Fedha, masoko, biashara na mabadiliko ya kiuchumi Afrika na duniani.',
    ln: 'Finance, ba marché, ba entreprise mpe transformation économique na Afrique mpe na mokili.',
    rw: 'Imari, isoko, ubucuruzi n’impinduka z’ubukungu mu Afurika no ku isi.',
  });
  const emptyMessage = pickCopy(locale, {
    fr: 'Aucun article économique disponible pour le moment.',
    en: 'No economy articles available at the moment.',
    es: 'Todavía no hay artículos de economía.',
    sw: 'Bado hakuna makala ya uchumi.',
    ln: 'Article ya économie ezali naino te.',
    rw: 'Nta nkuru z’ubukungu zirimo.',
  });

  return (
    <div className="tag-page bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-14">
        <Link
          href={`/${locale}/actualites`}
          className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← {t(locale, 'allNews')}
        </Link>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3 sm:mb-4">
          {title}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-3xl">
          {description}
        </p>

        {articles.length > 0 ? (
          <ArticleListingGrid articles={articles} locale={locale} />
        ) : (
          <div className="py-10 text-muted-foreground">{emptyMessage}</div>
        )}
      </div>
    </div>
  );
}
