import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { applyArticleLocales } from '@/lib/translation';
import { pickCopy, t } from '@/lib/copy';
import { getMessages } from '@/lib/i18n';
import ArticleListingGrid from '@/components/ArticleListingGrid';

async function getReligionArticles() {
  try {
    return await prisma.article.findMany({
      where: {
        OR: [
          { category: { slug: 'religion' } },
          { category: { slug: 'message-du-temps' } },
          { category: { slug: 'homelies' } },
          { category: { slug: 'meditations' } },
          { category: { slug: 'musiques-sacrees' } },
        ],
      },
      include: {
        category: true,
        author: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 20,
    } as any);
  } catch (error) {
    console.error('Error fetching religion articles:', error);
    return [];
  }
}

export default async function ReligionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const messages = getMessages(locale);
  let articles = await getReligionArticles();
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
          {messages.nav.religion}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-3xl">
          {pickCopy(locale, {
            fr: 'Méditations, homélies, musiques sacrées et agenda religieux pour nourrir votre foi',
            en: 'Meditations, homilies, sacred music and a religious calendar to nourish your faith',
            es: 'Meditaciones, homilías, músicas sagradas y agenda religiosa para alimentar la fe',
            sw: 'Tafakari, mahubiri, muziki mtakatifu na kalenda ya kidini',
            ln: 'Ba méditation, ba homélie, ba musique sacrée mpe agenda religieux',
            rw: 'Ibitaro, ubuhamya, umuziki wera n’ ingengabihe y’idini',
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
