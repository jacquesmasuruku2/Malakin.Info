import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ArrowRight, Calendar, Clock, TrendingUp, Radio } from 'lucide-react';
import AdSenseAd from '@/components/AdSenseAd';
import NewsletterSignupInline from '@/components/NewsletterSignupInline';
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
    { name: locale === 'fr' ? 'Actualités' : 'News', slug: 'actualites', href: `/${locale}/actualites` },
    { name: locale === 'fr' ? 'Politique' : 'Politics', slug: 'politique', href: `/${locale}/politique` },
    { name: locale === 'fr' ? 'Économie' : 'Economy', slug: 'economie', href: `/${locale}/economie` },
    { name: locale === 'fr' ? 'Culture' : 'Culture', slug: 'culture', href: `/${locale}/culture` },
    { name: locale === 'fr' ? 'Sport' : 'Sport', slug: 'sport', href: `/${locale}/sport` },
    { name: locale === 'fr' ? 'Science & Tech' : 'Science & Tech', slug: 'science-tech', href: `/${locale}/science-tech` },
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
              <article className="mb-8 border-b border-gray-200 pb-8">
                <div className="overflow-hidden border border-gray-200 bg-white">
                  <Link href={`/${locale}/${filteredFeaturedNews[0].slug}`} className="group block">
                    <div className="relative h-72 sm:h-80 md:h-[30rem] overflow-hidden bg-gray-100">
                      <img
                        src={filteredFeaturedNews[0].image}
                        alt={filteredFeaturedNews[0].title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      <div className="absolute inset-x-0 top-0 p-4 sm:p-6">
                        <span className="inline-flex items-center bg-[#D4AF37] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#081C3D]">
                          {locale === 'fr' ? 'À la Une' : 'Top Story'}
                        </span>
                      </div>

                      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
                        <div className="mb-3 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/90">
                          <span>{filteredFeaturedNews[0].category}</span>
                          <span>•</span>
                          <span>{filteredFeaturedNews[0].date}</span>
                        </div>

                        <h1 className="font-heading text-3xl font-black leading-[0.92] tracking-[-0.04em] text-white sm:text-4xl lg:text-[3.2rem]">
                          {filteredFeaturedNews[0].title}
                        </h1>
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-end gap-4 border-t border-gray-200 bg-white p-4 sm:p-5">
                    <div className="flex-1">
                      <p className="text-base leading-relaxed text-gray-700">
                        {filteredFeaturedNews[0].excerpt}
                      </p>
                    </div>

                    <Link
                      href={`/${locale}/${filteredFeaturedNews[0].slug}`}
                      className="inline-flex shrink-0 items-center justify-center border border-[#081C3D] bg-[#081C3D] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#D4AF37] hover:text-[#081C3D]"
                    >
                      {locale === 'fr' ? 'Lire plus' : 'Read more'}
                    </Link>
                  </div>
                </div>

                {filteredFeaturedNews.length > 1 && (
                  <div className="mt-6 grid gap-4 border-t border-gray-200 pt-5 md:grid-cols-2">
                    {filteredFeaturedNews.slice(1, 3).map((story) => (
                      <Link
                        key={story.id}
                        href={`/${locale}/${story.slug}`}
                        className="group block border-l border-gray-200 pl-4 first:border-l-0 first:pl-0"
                      >
                        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#D4AF37]">
                          {story.category}
                        </div>
                        <h2 className="font-heading text-xl font-bold leading-snug text-[#081C3D] group-hover:text-[#D4AF37] transition-colors">
                          {story.title}
                        </h2>
                      </Link>
                    ))}
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredLatestNews.slice(0, 6).map((news) => (
                    <article
                      key={news.id}
                      className="group overflow-hidden border border-gray-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-[#D4AF37] hover:shadow-[0_10px_30px_rgba(8,28,61,0.08)]"
                    >
                      <Link href={`/${locale}/${news.slug}`} className="block">
                        <div className="relative h-52 overflow-hidden">
                          <img
                            src={news.image}
                            alt={news.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <span className="absolute bottom-3 left-3 px-2 py-1 bg-[#0B3B8B] text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                            {news.category}
                          </span>
                        </div>
                      </Link>
                      <div className="p-4">
                        <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                          <span className="text-[#D4AF37]">{news.date}</span>
                        </div>
                        <Link href={`/${locale}/${news.slug}`} className="block">
                          <h3 className="font-heading text-xl font-bold leading-tight text-[#081C3D] hover:text-[#D4AF37] transition-colors line-clamp-3 cursor-pointer">
                            {news.title}
                          </h3>
                        </Link>
                        <p className="mt-3 text-sm leading-relaxed text-gray-600 line-clamp-3">
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
                    {locale === 'fr' ? 'Dernières Infos' : 'Latest News'}
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
                          <Link href={`/${locale}/${news.slug}`} className="block">
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
      <section className="border-t border-gray-200 bg-gray-100 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <NewsletterSignupInline
            locale={locale}
            title={locale === 'fr' ? 'Restez informé' : 'Stay informed'}
            subtitle={locale === 'fr' ? 'Abonnez-vous à notre newsletter pour recevoir les dernières actualités.' : 'Subscribe to our newsletter to receive the latest news.'}
            buttonText={locale === 'fr' ? 'S\'abonner' : 'Subscribe'}
          />
        </div>
      </section>
    </div>
  );
}
