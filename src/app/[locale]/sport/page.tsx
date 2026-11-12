import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { applyArticleLocales } from '@/lib/translation';
import { pickCopy, t } from '@/lib/copy';
import { getMessages } from '@/lib/i18n';
import ArticleListingGrid from '@/components/ArticleListingGrid';
import { articleListingSelect } from '@/lib/article-listing';
import { ArrowRight, Radio } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocalizedPageMetadata } from '@/lib/page-metadata';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const english = locale === 'en';
  return getLocalizedPageMetadata(locale, '/sport',
    english ? 'African sports news' : 'Actualités sportives africaines',
    english ? 'Sports news, competitions and athletes from Africa and around the world.' : 'Actualités sportives, compétitions et parcours d’athlètes en Afrique et dans le monde.');
}

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
    select: articleListingSelect,
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

        <section className="mb-10 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-blue-500/5 p-5 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                <Radio className="h-4 w-4" aria-hidden="true" />
                Football
              </p>
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {locale === 'en' ? 'Live and completed matches' : 'Matches en direct et terminés'}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {locale === 'en'
                  ? 'Follow live scores, today’s results and match highlights.'
                  : 'Suivez les scores en direct, les résultats du jour et les temps forts des matches.'}
              </p>
            </div>
            <Link
              href={`/${locale}/matches-en-direct`}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {locale === 'en' ? 'View match scores' : 'Voir les matches'}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        {articles.length === 0 ? (
          <div className="py-10 text-muted-foreground">{t(locale, 'noArticles')}</div>
        ) : (
          <ArticleListingGrid articles={articles} locale={locale} />
        )}
      </div>
    </div>
  );
}
