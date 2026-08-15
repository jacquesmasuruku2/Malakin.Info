import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ArrowRight, Calendar, Clock, TrendingUp, Radio } from 'lucide-react';
import AdSenseAd from '@/components/AdSenseAd';
import { getMessages, getLocaleFromPathname } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
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

  const categories = [
    { name: locale === 'fr' ? 'Politique' : 'Politics', href: `/${locale}/politique`, color: 'bg-red-500' },
    { name: locale === 'fr' ? 'Économie' : 'Economy', href: `/${locale}/economie`, color: 'bg-blue-500' },
    { name: locale === 'fr' ? 'Société' : 'Society', href: `/${locale}/societe`, color: 'bg-green-500' },
    { name: locale === 'fr' ? 'Santé' : 'Health', href: `/${locale}/sante`, color: 'bg-purple-500' },
    { name: locale === 'fr' ? 'Sport' : 'Sport', href: `/${locale}/sport`, color: 'bg-orange-500' },
    { name: locale === 'fr' ? 'Culture' : 'Culture', href: `/${locale}/culture`, color: 'bg-pink-500' },
  ];

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
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          
          {/* Left Column - Main Content (70%) */}
          <div className="lg:col-span-7">
            {/* Featured Article - À la une */}
            {featuredNews.length > 0 && (
              <article className="mb-8 border-b-2 border-gray-200 pb-8">
                <Link href={`/${locale}/${featuredNews[0].categorySlug}/${featuredNews[0].slug}`} className="block">
                  <div className="relative h-80 md:h-96 mb-4">
                    <img
                      src={featuredNews[0].image}
                      alt={featuredNews[0].title}
                      className="w-full h-full object-cover hover:opacity-95 transition-opacity cursor-pointer"
                    />
                    <span className="absolute top-4 left-4 px-3 py-1 bg-[#D4AF37] text-[#081C3D] text-xs font-bold uppercase tracking-wide">
                      {locale === 'fr' ? 'DIRECT' : 'LIVE'}
                    </span>
                  </div>
                </Link>
                <Link href={`/${locale}/${featuredNews[0].categorySlug}/${featuredNews[0].slug}`} className="block">
                  <h1 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-[#081C3D] mb-4 leading-tight hover:text-[#D4AF37] transition-colors cursor-pointer">
                    {featuredNews[0].title}
                  </h1>
                </Link>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="text-[#D4AF37] font-semibold">
                    {new Date().toLocaleTimeString(locale === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span>•</span>
                  <span className="text-gray-500">{featuredNews[0].category}</span>
                </div>
                <p className="text-gray-700 text-lg mb-4 leading-relaxed">
                  {featuredNews[0].excerpt}
                </p>
                
                {/* Related Sub-links */}
                {featuredNews.length > 1 && (
                  <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-200">
                    <Link
                      href={`/${locale}/${featuredNews[1].categorySlug}/${featuredNews[1].slug}`}
                      className="text-sm font-semibold text-[#D4AF37] hover:underline"
                    >
                      {locale === 'fr' ? 'Crisis:' : 'Crisis:'} {featuredNews[1].title}
                    </Link>
                    {featuredNews.length > 2 && (
                      <Link
                        href={`/${locale}/${featuredNews[2].categorySlug}/${featuredNews[2].slug}`}
                        className="text-sm font-semibold text-[#D4AF37] hover:underline"
                      >
                        {locale === 'fr' ? 'À la Une:' : 'Featured:'} {featuredNews[2].title}
                      </Link>
                    )}
                  </div>
                )}
              </article>
            )}

            {/* Article Cards Grid */}
            <div className="mb-8">
              <h2 className="font-heading text-xl font-bold text-[#081C3D] mb-6 uppercase tracking-wide border-l-4 border-[#D4AF37] pl-3">
                {locale === 'fr' ? 'Dernières actualités' : 'Latest news'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {latestNews.slice(0, 6).map((news) => (
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
                      <Link
                        href={`/${locale}/${news.categorySlug}/${news.slug}`}
                        className="block"
                      >
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
            </div>
          </div>

          {/* Right Column - Sidebar (30%) */}
          <div className="lg:col-span-3">
            <div className="sticky top-20">
              <div className="bg-white border border-gray-200">
                <div className="bg-[#0B3B8B] text-white px-4 py-3">
                  <h3 className="font-heading font-bold text-lg uppercase tracking-wide flex items-center">
                    {locale === 'fr' ? 'En continu' : 'Live feed'}
                    <span className="ml-2 animate-pulse">›</span>
                  </h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {latestNews.slice(0, 8).map((news, index) => (
                    <article
                      key={news.id}
                      className="px-3 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                        <span className="text-[#D4AF37] font-bold text-[10px] sm:text-xs whitespace-nowrap pt-0.5">
                          {new Date().toLocaleTimeString(locale === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/${locale}/${news.categorySlug}/${news.slug}`}
                            className="block"
                          >
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

              {/* AdSense in Sidebar */}
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
