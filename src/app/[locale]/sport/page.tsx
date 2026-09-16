import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { applyArticleLocales } from '@/lib/translation';
import { pickCopy, t } from '@/lib/copy';
import { getMessages } from '@/lib/i18n';
import ArticleListingGrid from '@/components/ArticleListingGrid';

export const dynamic = 'force-dynamic';

export default async function SportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = getMessages(locale);

  let articles: any[] = await prisma.article.findMany({
    where: {
      category: {
        slug: 'sport',
      },
    },
    include: {
      category: true,
      author: true,
    },
    orderBy: {
      publishedAt: 'desc',
    },
    take: 12,
  } as any);

  articles = await applyArticleLocales(articles, locale);

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
          {messages.nav.sport}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-3xl">
          {pickCopy(locale, {
            fr: "Football, basketball, athlétisme : toute l'actualité sportive africaine",
            en: 'Football, basketball, athletics: all African sports news',
            es: 'Fútbol, baloncesto, atletismo: toda la actualidad deportiva africana',
            sw: 'Soka, mpira wa kikapu, riadha: habari zote za michezo ya Afrika',
            ln: 'Football, basketball, athlétisme: sango nionso ya sport ya Afrique',
            rw: 'Umupira w’amaguru, umupira w’amaboko, imikino y’imigenderanire: amakuru yose y’imikino y’Afurika',
          })}
        </p>

        {articles.length === 0 ? (
          <div className="py-10 text-muted-foreground">{t(locale, 'noArticles')}</div>
        ) : (
          <ArticleListingGrid articles={articles} locale={locale} />
        )}
      </div>
    </div>
  );
}
