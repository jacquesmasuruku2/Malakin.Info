import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { applyArticleLocales } from '@/lib/translation';
import { pickCopy, t } from '@/lib/copy';
import { getMessages } from '@/lib/i18n';
import ArticleListingGrid from '@/components/ArticleListingGrid';
import { articleListingSelect } from '@/lib/article-listing';
import RadioOnAirWidget from '@/components/RadioOnAirWidget';

export const revalidate = 60;

export default async function InfosPratiquesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = getMessages(locale);
  const isFrench = locale === 'fr';

  let articles: any[] = await prisma.article.findMany({
    where: {
      category: {
        slug: 'infos-pratiques',
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
    <div className="min-h-screen bg-[#f8f9fb]">
      <section className="bg-[#081c3d] text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <Link
            href={`/${locale}`}
            className="mb-6 inline-flex items-center text-sm font-medium text-blue-100 transition hover:text-white"
          >
            ← {t(locale, 'backHome')}
          </Link>

          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[#d4af37]">
              MalakInfo
            </p>
            <h1 className="font-heading text-4xl font-black tracking-[-0.03em] text-white sm:text-5xl">
              {messages.nav.practicalInfo}
            </h1>
            <p className="mt-4 text-base leading-7 text-blue-100 sm:text-lg">
              {pickCopy(locale, {
                fr: 'Guides, tutoriels et ressources pour vous accompagner au quotidien',
                en: 'Guides, tutorials and resources to help you every day',
                es: 'Guías, tutoriales y recursos para acompañarte cada día',
                sw: 'Miongozo, mafunzo na rasilimali za kila siku',
                ln: 'Ba guide, ba tutoriel mpe ba ressource mpo na mokolo na mokolo',
                rw: 'Amabwiriza, amahugurwa n’ibikoresho bya buri munsi',
              })}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#1f7a6a]">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 text-center sm:px-6 lg:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/80">Radio</p>
          <h2 className="font-heading text-2xl font-black text-white sm:text-3xl">
            {isFrench ? 'Flux radio en direct' : 'Live radio stream'}
          </h2>
          <RadioOnAirWidget
            name="Radio MalakInfo"
            onlineLabel={isFrench ? 'en ligne' : 'on air'}
          />
          <p className="max-w-xl text-sm leading-6 text-white/85">
            {isFrench
              ? 'Lancez le direct pour écouter les émissions et les contenus audio de MalakInfo.'
              : 'Start the live stream to listen to MalakInfo broadcasts and audio content.'}
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {articles.length === 0 ? (
          <div className="rounded-xl border border-border bg-white p-8 text-center text-muted-foreground shadow-sm">
            {t(locale, 'noArticles')}
          </div>
        ) : (
          <ArticleListingGrid articles={articles} locale={locale} />
        )}
      </main>
    </div>
  );
}
