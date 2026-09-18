import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { applyArticleLocales } from '@/lib/translation';
import { pickCopy, t } from '@/lib/copy';
import { getMessages } from '@/lib/i18n';
import ArticleListingGrid from '@/components/ArticleListingGrid';
import { articleListingSelect } from '@/lib/article-listing';

export const revalidate = 60;

export default async function PolitiquePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const messages = getMessages(locale);

  const rawArticles = await prisma.article.findMany({
    where: { category: { slug: 'politique' } },
    select: articleListingSelect,
    orderBy: { publishedAt: 'desc' },
    take: 12,
  });
  const articles = await applyArticleLocales(rawArticles, locale);

  return (
    <div className="tag-page bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-14">
        <Link
          href={`/${locale}`}
          className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← {t(locale, 'backHome')}
        </Link>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3 sm:mb-4">
          {messages.nav.politics}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-3xl">
          {pickCopy(locale, {
            fr: 'Analyse, institutions, diplomatie et enjeux politiques du continent et du monde',
            en: 'Analysis, institutions, diplomacy and political issues across Africa and the world',
            es: 'Análisis, instituciones, diplomacia y actualidad política de África y del mundo',
            sw: 'Uchambuzi, taasisi, diplomasia na masuala ya kisiasa Afrika na duniani',
            ln: 'Analyse, ba institution, diplomatie mpe ba enjeu politique ya Afrique mpe ya mokili',
            rw: 'Isesengura, inzego, ubucuti bw’amahanga n’ibibazo bya politiki mu Afurika no ku isi',
          })}
        </p>

        {articles.length === 0 ? (
          <div className="py-10 text-muted-foreground">
            {pickCopy(locale, {
              fr: 'Aucun article politique disponible pour le moment.',
              en: 'No political articles available yet.',
              es: 'Todavía no hay artículos políticos.',
              sw: 'Bado hakuna makala za siasa.',
              ln: 'Article ya politique ezali naino te.',
              rw: 'Nta nkuru za politiki zirimo.',
            })}
          </div>
        ) : (
          <ArticleListingGrid articles={articles} locale={locale} />
        )}
      </div>
    </div>
  );
}
