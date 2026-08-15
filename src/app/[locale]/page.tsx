import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ArrowRight, Calendar, Clock, TrendingUp, Radio } from 'lucide-react';
import AdSenseAd from '@/components/AdSenseAd';
import { getMessages, getLocaleFromPathname } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function Home({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const selectedCategory = String(resolvedSearchParams.category || '').trim().toLowerCase();
  const normalizedLocale = getLocaleFromPathname(`/${locale}`);
  const messages = getMessages(normalizedLocale);
  const t = messages.home;
  const tCommon = messages.common;
  let featuredArticles: any[] = [];
  let latestArticles: any[] = [];
  let currentLive: any = null;
  let activeRadio: any = null;

  try {
    featuredArticles = await prisma.article.findMany({
      where: {
        featured: true,
      },
      include: {
        category: true,
        author: true,
      },
      take: 3,
      orderBy: {
        publishedAt: 'desc',
      },
    } as any);

    latestArticles = await prisma.article.findMany({
      include: {
        category: true,
        author: true,
      },
      take: 6,
      orderBy: {
        publishedAt: 'desc',
      },
    } as any);

    const now = new Date();
    currentLive = await prisma.liveEvent.findFirst({
      where: {
        streamType: 'VIDEO',
        startTime: { lte: now },
        OR: [
          { endTime: null },
          { endTime: { gte: now } }
        ]
      },
      orderBy: {
        startTime: 'desc'
      }
    });

    activeRadio = await prisma.radioStation.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Database connection error:', error);
  }

  const featuredNews = featuredArticles.map(article => ({
    id: article.id,
    slug: article.slug,
    categorySlug: article.category?.slug || 'actualites',
    category: article.category?.title || (locale === 'fr' ? 'Actualités' : 'News'),
    title: article.title,
    excerpt: article.excerpt,
    image: article.mainImageUrl || 'https://images.unsplash.com/photo-1541872703-74c5963631df?w=800&h=400&fit=crop',
    date: article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
    readTime: article.readTime ? `${article.readTime} min` : '5 min',
  }));

  const latestNews = latestArticles.map(article => ({
    id: article.id,
    slug: article.slug,
    categorySlug: article.category?.slug || 'actualites',
    category: article.category?.title || (locale === 'fr' ? 'Actualités' : 'News'),
    title: article.title,
    excerpt: article.excerpt,
    date: article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
    readTime: article.readTime ? `${article.readTime} min` : '3 min',
    image: article.mainImageUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=300&fit=crop',
  }));

  const categoryFilters = [
    { name: locale === 'fr' ? 'Tout' : 'All', slug: 'all', href: `/${locale}` },
    { name: locale === 'fr' ? 'Actualités' : 'News', slug: 'actualites', href: `/${locale}?category=actualites` },
    { name: locale === 'fr' ? 'Politique' : 'Politics', slug: 'politique', href: `/${locale}?category=politique` },
    { name: locale === 'fr' ? 'Économie' : 'Economy', slug: 'economie', href: `/${locale}?category=economie` },
    { name: locale === 'fr' ? 'Culture' : 'Culture', slug: 'culture', href: `/${locale}?category=culture` },
    { name: locale === 'fr' ? 'Sport' : 'Sport', slug: 'sport', href: `/${locale}?category=sport` },
    { name: locale === 'fr' ? 'Science & Tech' : 'Science & Tech', slug: 'science-tech', href: `/${locale}?category=science-tech` },
  ];

  const filteredFeaturedNews = selectedCategory && selectedCategory !== 'all'
    ? featuredNews.filter((item) => item.categorySlug === selectedCategory)
    : featuredNews;

  const filteredLatestNews = selectedCategory && selectedCategory !== 'all'
    ? latestNews.filter((item) => item.categorySlug === selectedCategory)
    : latestNews;

  const liveBanner = currentLive ? {
    label: locale === 'fr' ? '🔴 EN DIRECT' : '🔴 LIVE',
    title: currentLive.title,
    text: locale === 'fr' ? 'Regarder maintenant' : 'Watch now',
    href: `/${locale}/medias/live/${currentLive.id}`,
  } : activeRadio ? {
    label: locale === 'fr' ? '📻 RADIO EN DIRECT' : '📻 LIVE RADIO',
    title: activeRadio.name || 'Radio Okapi',
    text: activeRadio.description || 'La voix de la paix',
    href: `/${locale}`,
  } : null;

  return (
    <div className="flex flex-col">
      {/* Live Banner - Priorité: TV live, puis radio active */}
      {liveBanner && (
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href={liveBanner.href} className="hidden md:flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-white text-red-600 text-sm font-bold rounded-full animate-pulse">
                  {liveBanner.label}
                </span>
                <span className="font-semibold">{liveBanner.title}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Radio className="w-4 h-4" />
                <span>{liveBanner.text}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            <Link href={liveBanner.href} className="md:hidden block">
              <div className="py-3 marquee-track">
                <span className="marquee-content text-sm font-semibold">
                  {`${liveBanner.label} — ${liveBanner.title} — ${liveBanner.text}`}
                </span>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Main Editorial Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 border-b border-gray-200 pb-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {categoryFilters.map((item) => {
              const isActive = selectedCategory === item.slug || (!selectedCategory && item.slug === 'all');
              return (
                <Link
                  key={item.slug}
                  href={item.href}
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                    isActive
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#081C3D]'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-[#081C3D] hover:text-[#081C3D]'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          <div className="lg:col-span-7">
            {filteredFeaturedNews.length > 0 && (
              <article className="mb-8 border-b-2 border-gray-200 pb-8">
                <Link href={`/${locale}/${filteredFeaturedNews[0].categorySlug}/${filteredFeaturedNews[0].slug}`} className="block">
                  <div className="relative h-80 md:h-96 mb-4">
                    <img
                      src={filteredFeaturedNews[0].image}
                      alt={filteredFeaturedNews[0].title}
                      className="w-full h-full object-cover hover:opacity-95 transition-opacity cursor-pointer"
                    />
                    <span className="absolute top-4 left-4 px-3 py-1 bg-[#D4AF37] text-[#081C3D] text-xs font-bold uppercase tracking-wide">
                      {locale === 'fr' ? 'DIRECT' : 'LIVE'}
                    </span>
                  </div>
                </Link>
                <Link href={`/${locale}/${filteredFeaturedNews[0].categorySlug}/${filteredFeaturedNews[0].slug}`} className="block">
                  <h1 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-[#081C3D] mb-4 leading-tight hover:text-[#D4AF37] transition-colors cursor-pointer">
                    {filteredFeaturedNews[0].title}
                  </h1>
                </Link>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="text-[#D4AF37] font-semibold">
                    {new Date().toLocaleTimeString(locale === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span>•</span>
                  <span className="text-gray-500">{filteredFeaturedNews[0].category}</span>
                </div>
                <p className="text-gray-700 text-lg mb-4 leading-relaxed">
                  {filteredFeaturedNews[0].excerpt}
                </p>

                {filteredFeaturedNews.length > 1 && (
                  <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-200">
                    <Link
                      href={`/${locale}/${filteredFeaturedNews[1].categorySlug}/${filteredFeaturedNews[1].slug}`}
                      className="text-sm font-semibold text-[#D4AF37] hover:underline"
                    >
                      {locale === 'fr' ? 'Crisis:' : 'Crisis:'} {filteredFeaturedNews[1].title}
                    </Link>
                    {filteredFeaturedNews.length > 2 && (
                      <Link
                        href={`/${locale}/${filteredFeaturedNews[2].categorySlug}/${filteredFeaturedNews[2].slug}`}
                        className="text-sm font-semibold text-[#D4AF37] hover:underline"
                      >
                        {locale === 'fr' ? 'À la Une:' : 'Featured:'} {filteredFeaturedNews[2].title}
                      </Link>
                    )}
                  </div>
                )}
              </article>
            )}

            <div className="mb-8">
              <h2 className="font-heading text-xl font-bold text-[#081C3D] mb-6 uppercase tracking-wide border-l-4 border-[#D4AF37] pl-3">
                {selectedCategory && selectedCategory !== 'all'
                  ? categoryFilters.find((item) => item.slug === selectedCategory)?.name || (locale === 'fr' ? 'Actualités' : 'News')
                  : locale === 'fr' ? 'Dernières actualités' : 'Latest news'}
              </h2>
              {filteredLatestNews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredLatestNews.slice(0, 6).map((news) => (
                    <article
                      key={news.id}
                      className="bg-white border border-gray-200 hover:border-[#D4AF37] transition-colors"
                    >
                      <Link href={`/${locale}/${news.categorySlug}/${news.slug}`} className="block">
                        <div className="relative h-40">
                          <img
                            src={news.image}
                            alt={news.title}
                            className="w-full h-full object-cover hover:opacity-95 transition-opacity cursor-pointer"
                          />
                          <span className="absolute bottom-2 left-2 px-2 py-1 bg-[#0B3B8B] text-white text-xs font-bold uppercase">
                            {news.category}
                          </span>
                        </div>
                      </Link>
                      <div className="p-4">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                          <span className="text-[#D4AF37] font-semibold">
                            {new Date().toLocaleTimeString(locale === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span>•</span>
                          <span>{news.date}</span>
                        </div>
                        <Link href={`/${locale}/${news.categorySlug}/${news.slug}`} className="block">
                          <h3 className="font-heading font-bold text-[#081C3D] text-lg mb-2 hover:text-[#D4AF37] transition-colors line-clamp-2 cursor-pointer">
                            {news.title}
                          </h3>
                        </Link>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {(news as any).excerpt || ''}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-600">
                  {locale === 'fr' ? 'Aucune actualité pour cette catégorie pour le moment.' : 'No articles available for this category yet.'}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="sticky top-20">
              <div className="bg-white border border-gray-200">
                <div className="bg-[#0B3B8B] text-white px-4 py-3">
                  <h3 className="font-heading font-bold text-lg uppercase tracking-wide flex items-center">
                    {locale === 'fr' ? 'RÉPERTOIRE' : 'DIRECTORY'}
                    <span className="ml-2 animate-pulse">›</span>
                  </h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {filteredLatestNews.slice(0, 8).map((news) => (
                    <article
                      key={news.id}
                      className="px-3 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                        <span className="text-[#D4AF37] font-bold text-[10px] sm:text-xs whitespace-nowrap pt-0.5">
                          {new Date().toLocaleTimeString(locale === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="min-w-0 flex-1">
                          <Link href={`/${locale}/${news.categorySlug}/${news.slug}`} className="block">
                            <h4 className="font-heading font-semibold text-[#081C3D] text-sm hover:text-[#D4AF37] transition-colors line-clamp-3 leading-snug m-0">
                              {news.title}
                            </h4>
                          </Link>
                          <span className="text-[10px] sm:text-xs text-gray-500 mt-1 block">
                            {news.category}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <AdSenseAd adSlot="3333333333" className="my-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <section className="py-12 bg-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-heading text-2xl font-bold text-[#081C3D] mb-4">
              {locale === 'fr' ? 'Restez informé' : 'Stay informed'}
            </h2>
            <p className="text-gray-600 mb-6">
              {locale === 'fr' ? 'Abonnez-vous à notre newsletter pour recevoir les dernières actualités.' : 'Subscribe to our newsletter to receive the latest news.'}
            </p>
            <Link
              href={`/${locale}/newsletter`}
              className="inline-flex items-center px-6 py-3 bg-[#0B3B8B] text-white font-semibold rounded hover:bg-[#082a63] transition-colors"
            >
              {locale === 'fr' ? 'S\'abonner' : 'Subscribe'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
