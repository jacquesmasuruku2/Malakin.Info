import Link from 'next/link';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function EconomyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
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
    }
  } catch (error) {
    console.error('Economy page database error:', error);
  }

  const dateLocale = locale === 'fr' ? 'fr-FR' : 'en-US';
  const title = locale === 'fr' ? 'Économie' : 'Economy';
  const description = locale === 'fr'
    ? 'Finance, marchés, entreprises et transformation économique en Afrique et dans le monde.'
    : 'Finance, markets, business and economic transformation in Africa and around the world.';
  const readMore = locale === 'fr' ? 'Lire la suite' : 'Read more';
  const emptyMessage = locale === 'fr'
    ? 'Aucun article économique disponible pour le moment.'
    : 'No economy articles available at the moment.';

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <section className="border-b border-[#dfe3e8] bg-[#081c3d] text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <Link href={`/${locale}/actualites`} className="mb-6 inline-flex text-xs font-bold uppercase tracking-[0.16em] text-[#d4af37] transition hover:text-white">
            ← {locale === 'fr' ? 'Toutes les actualités' : 'All news'}
          </Link>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[#d4af37]">MalakInfo</p>
          <h1 className="font-heading text-4xl font-black tracking-[-0.03em] sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">{description}</p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {articles.length > 0 ? (
          <>
            <div className="mb-8 flex items-end justify-between border-b border-[#dfe3e8] pb-4">
              <h2 className="font-heading text-2xl font-black uppercase tracking-[0.06em] text-[#081c3d]">
                {locale === 'fr' ? 'Dernières informations' : 'Latest stories'}
              </h2>
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#b88f18]">{articles.length} articles</span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {articles.map((article) => (
                <article key={article.id} className="group overflow-hidden border border-[#e1e4e8] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#d4af37] hover:shadow-[0_18px_36px_rgba(8,28,61,0.1)]">
                  <Link href={`/${locale}/${article.slug}`} className="block">
                    <div className="relative h-56 overflow-hidden bg-[#e8edf2]">
                      {article.mainImageUrl ? (
                        <img src={article.mainImageUrl} alt={article.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-500">MalakInfo</div>
                      )}
                      <span className="absolute bottom-3 left-3 bg-[#081c3d] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">{title}</span>
                    </div>
                  </Link>
                  <div className="p-5">
                    <div className="mb-3 flex flex-wrap items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{article.readTime ? `${article.readTime} min` : '5 min'}</span>
                    </div>
                    <h3 className="font-heading text-2xl font-black leading-tight tracking-[-0.025em] text-[#081c3d] transition-colors group-hover:text-[#b88f18]">{article.title}</h3>
                    {article.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{article.excerpt}</p>}
                    <Link href={`/${locale}/${article.slug}`} className="mt-5 inline-flex items-center text-[11px] font-bold uppercase tracking-[0.14em] text-[#081c3d] transition-colors hover:text-[#b88f18]">
                      {readMore}<ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="border border-dashed border-[#cfd6df] bg-white px-6 py-20 text-center text-slate-600">{emptyMessage}</div>
        )}
      </main>
    </div>
  );
}
