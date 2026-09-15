import Link from 'next/link';
import { Calendar, Clock } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { applyArticleLocales } from '@/lib/translation';
import { getDateLocale, pickCopy, t } from '@/lib/copy';
import { getMessages } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function EconomyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = getMessages(locale);
  let articles: any[] = [];

  try {
    const category = await prisma.category.findUnique({
      where: { slug: 'economie' },
    });

    if (category) {
      articles = await prisma.article.findMany({
        where: { categoryId: category.id },
        include: { category: true, author: true },
        orderBy: { publishedAt: 'desc' },
        take: 24,
      } as any);
      articles = await applyArticleLocales(articles, locale);
    }
  } catch (error) {
    console.error('Economy page database error:', error);
  }

  const dateLocale = getDateLocale(locale);
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
    <div className="min-h-screen bg-background">
      <section className="border-b border-border bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <Link href={`/${locale}/actualites`} className="mb-6 inline-flex text-xs font-bold uppercase tracking-[0.16em] text-secondary transition hover:text-background">
            ← {t(locale, 'allNews')}
          </Link>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-secondary">MalakInfo</p>
          <h1 className="font-heading text-4xl font-black tracking-[-0.03em] sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-background/80 sm:text-lg">{description}</p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {articles.length > 0 ? (
          <>
            <div className="mb-8 flex items-end justify-between border-b border-border pb-4">
              <h2 className="font-heading text-2xl font-black uppercase tracking-[0.06em] text-foreground">
                {t(locale, 'latestStories')}
              </h2>
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">{articles.length} articles</span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {articles.map((article) => (
                <article key={article.id} className="group overflow-hidden border border-border bg-card text-card-foreground transition duration-300 hover:-translate-y-1 hover:border-secondary">
                  <Link href={`/${locale}/${article.slug}`} className="block">
                    <div className="relative h-56 overflow-hidden bg-muted">
                      {article.mainImageUrl ? (
                        <img src={article.mainImageUrl} alt={article.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm font-semibold text-muted-foreground">MalakInfo</div>
                      )}
                      <span className="absolute bottom-3 left-3 bg-foreground px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-background">{title}</span>
                    </div>
                  </Link>
                  <div className="p-5">
                    <div className="mb-3 flex flex-wrap items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{article.readTime ? `${article.readTime} min` : '5 min'}</span>
                    </div>
                    <h3 className="font-heading text-2xl font-black leading-tight tracking-[-0.025em] text-foreground transition-colors group-hover:text-secondary">
                      <Link href={`/${locale}/${article.slug}`}>{article.title}</Link>
                    </h3>
                    {article.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{article.excerpt}</p>}
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="border border-dashed border-border bg-card px-6 py-20 text-center text-muted-foreground">{emptyMessage}</div>
        )}
      </main>
    </div>
  );
}
