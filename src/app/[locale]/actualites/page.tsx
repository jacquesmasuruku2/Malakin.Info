import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ActualitesPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;

  // Fetch all articles with their categories
  const articles = await prisma.article.findMany({
    include: {
      category: true,
      author: true,
    },
    orderBy: {
      publishedAt: 'desc',
    },
    take: 12,
  } as any);

  // Fetch all categories and compute article counts without a non-existent relation field
  const categories = await prisma.category.findMany();
  const articleCounts = await prisma.article.groupBy({
    by: ['categoryId'],
    _count: {
      categoryId: true,
    },
  });
  const articleCountMap = new Map(
    articleCounts.map((item) => [item.categoryId, item._count.categoryId])
  );

  // Fetch live events for this category
  const actualitesCategory = await prisma.category.findUnique({
    where: { slug: 'actualites' }
  });

  const liveEvents = actualitesCategory ? await prisma.liveEvent.findMany({
    where: {
      categoryId: actualitesCategory.id,
      OR: [
        { status: 'LIVE' },
        { status: 'SCHEDULED' }
      ]
    },
    orderBy: {
      startTime: 'desc'
    },
  }) : [];

  // Format categories for display
  const categoryList: { name: string; href: string; count: number }[] = categories.map((cat: any) => ({
    name: cat.title,
    href: `/${locale}/${cat.slug}`,
    count: articleCountMap.get(cat.id) ?? 0,
  }));

  // Format articles for display
  const news: { id: string; category: string; categorySlug: string; title: string; excerpt: string; image: string | null; date: string; readTime: string; slug: string }[] = articles.map((article: any) => ({
    id: article.id,
    category: article.category?.title || 'Actualités',
    categorySlug: article.category?.slug || 'actualites',
    title: article.title,
    excerpt: article.excerpt,
    image: article.mainImageUrl,
    date: article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
    readTime: article.readTime || '5 min',
    slug: article.slug,
  }));

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold mb-4">Actualités</h1>
          <p className="text-xl text-gray-200">
            Suivez l'actualité africaine et internationale en temps réel
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Live Events Section */}
        {liveEvents.length > 0 && (
          <section className="mb-12">
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                Événements en direct
              </h2>
              <p className="text-red-100">Suivez nos diffusions en direct</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveEvents.map((live: any) => (
                <Link
                  key={live.id}
                  href={`/${locale}/medias/live/${live.id}`}
                  className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {live.thumbnail && (
                    <div className="relative h-48">
                      <img
                        src={live.thumbnail}
                        alt={live.title}
                        className="w-full h-full object-cover"
                      />
                      <span className={`absolute top-4 left-4 px-3 py-1 text-white text-xs font-medium rounded-full ${
                        live.status === 'LIVE' ? 'bg-red-600 animate-pulse' : 'bg-blue-600'
                      }`}>
                        {live.status === 'LIVE' ? 'EN DIRECT' : 'PROGRAMMÉ'}
                      </span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-2 line-clamp-2">
                      {live.title}
                    </h3>
                    {live.description && (
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                        {live.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{new Date(live.startTime).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                      {live.viewerCount > 0 && (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          {live.viewerCount} spectateurs
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-2xl font-bold text-[#081C3D] mb-3">L’actualité en direct</h2>
          <p className="text-base leading-relaxed text-gray-700">
            Suivez les faits, les analyses et les sujets qui structurent le débat public en Afrique et dans le monde, avec une lecture claire, rapide et fiable.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div>
            {news.length > 0 ? (
              <>
                <div className="mb-8 border-b border-gray-200 pb-6">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-heading text-2xl font-black uppercase tracking-[0.06em] text-[#081C3D]">
                      Dernières infos
                    </h2>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#D4AF37]">
                      {locale === 'fr' ? 'Edition locale' : 'Local edition'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {news.map((item) => (
                    <article
                      key={item.id}
                      className="group overflow-hidden border border-gray-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-[#D4AF37] hover:shadow-[0_16px_32px_rgba(8,28,61,0.08)]"
                    >
                      {item.image && (
                        <Link href={`/${locale}/${item.slug}`} className="relative block h-52 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <span className="absolute bottom-3 left-3 inline-flex items-center bg-[#081C3D] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                            {item.category}
                          </span>
                        </Link>
                      )}
                      <div className="p-5">
                        <div className="mb-3 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                          <span>{item.date}</span>
                          <span className="text-[#D4AF37]">•</span>
                          <span>{item.readTime}</span>
                        </div>
                        <h3 className="font-heading text-[1.5rem] font-black leading-tight tracking-[-0.03em] text-[#081C3D] transition-colors group-hover:text-[#D4AF37] line-clamp-3">
                          {item.title}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-gray-600 line-clamp-3">
                          {item.excerpt}
                        </p>
                        <Link
                          href={`/${locale}/${item.slug}`}
                          className="mt-4 inline-flex items-center text-[11px] font-bold uppercase tracking-[0.14em] text-[#081C3D] transition-colors hover:text-[#D4AF37]"
                        >
                          Lire la suite
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center mt-8">
                  <nav className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                      Précédent
                    </button>
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
                      1
                    </button>
                    <button className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                      2
                    </button>
                    <button className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                      3
                    </button>
                    <button className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                      Suivant
                    </button>
                  </nav>
                </div>
              </>
            ) : (
              <div className="bg-card rounded-lg p-12 text-center">
                <p className="text-muted-foreground text-lg">Aucune actualité disponible pour le moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
