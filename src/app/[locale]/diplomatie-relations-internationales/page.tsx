import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { applyArticleLocales } from '@/lib/translation';
import { pickCopy, t } from '@/lib/copy';
import ArticleListingGrid from '@/components/ArticleListingGrid';

export const dynamic = 'force-dynamic';
type DiplomacyArticle = Prisma.ArticleGetPayload<{ include: { category: true; author: true } }>;

export default async function DiplomatiePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  let articles: DiplomacyArticle[] = [];

  try {
    const category = await prisma.category.findUnique({
      where: { slug: 'diplomatie-relations-internationales' },
    });

    if (category) {
      articles = await applyArticleLocales(
        await prisma.article.findMany({
          where: { categoryId: category.id },
          include: { category: true, author: true },
          orderBy: { publishedAt: 'desc' },
          take: 24,
        }),
        locale
      );
    }
  } catch (error) {
    console.error('Diplomacy page database error:', error);
  }

  const title = pickCopy(locale, {
    fr: 'Diplomatie & Relations internationales',
    en: 'Diplomacy & International Relations',
    es: 'Diplomacia y relaciones internacionales',
    sw: 'Diplomasia na mahusiano ya kimataifa',
    ln: 'Diplomatie mpe ba relation internationale',
    rw: 'Ubucuti bw’amahanga n’imishyikirano',
  });
  const description = pickCopy(locale, {
    fr: 'Actualités diplomatiques, relations internationales et enjeux géopolitiques en Afrique et dans le monde.',
    en: 'Diplomatic news, international relations and geopolitical issues in Africa and around the world.',
    es: 'Actualidad diplomática, relaciones internacionales y geopolítica en África y el mundo.',
    sw: 'Habari za diplomasia, mahusiano ya kimataifa na siasa za kijiografia Afrika na duniani.',
    ln: 'Sango ya diplomatie, ba relation internationale mpe ba enjeu géopolitique na Afrique.',
    rw: 'Amakuru y’ubucuti bw’amahanga n’ibibazo bya geopolitike mu Afurika no ku isi.',
  });
  const emptyMessage = pickCopy(locale, {
    fr: 'Aucun article diplomatique disponible pour le moment.',
    en: 'No diplomatic articles available at the moment.',
    es: 'Todavía no hay artículos diplomáticos.',
    sw: 'Bado hakuna makala za diplomasia.',
    ln: 'Article ya diplomatie ezali naino te.',
    rw: 'Nta nkuru z’ubucuti bw’amahanga zirimo.',
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
          <div className="py-10 text-muted-foreground">
            <p className="text-lg font-medium text-foreground mb-2">{emptyMessage}</p>
            <p>{t(locale, 'checkBackSoon')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
