import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ArrowRight, Radio } from 'lucide-react';
import AdSenseAd from '@/components/AdSenseAd';
import NewsletterSignupInline from '@/components/NewsletterSignupInline';
import SmartImage from '@/components/SmartImage';
import { ADSENSE_SLOTS } from '@/lib/adsense';
import { getMessages, getLocaleFromPathname } from '@/lib/i18n';
import { withRetry } from '@/lib/database';
import ArticleAuthorLink from '@/components/ArticleAuthorLink';
import RadioOnAirWidget from '@/components/RadioOnAirWidget';
import { applyArticleLocales } from '@/lib/translation';
import { getDateLocale, t as ui } from '@/lib/copy';
import { articleListingSelect } from '@/lib/article-listing';

export const revalidate = 60;

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const normalizedLocale = getLocaleFromPathname(`/${locale}`);
  const messages = getMessages(normalizedLocale);
  const t = messages.home;
  let featuredArticles: any[] = [];
  let latestArticles: any[] = [];
  let currentLive: any = null;
  let activeRadio: any = null;

  try {
    const now = new Date();
    const [featuredResult, latestResult, liveResult, radioResult] = await Promise.all([
      withRetry(() => prisma.article.findMany({
        where: {
          featured: true,
        },
        select: articleListingSelect,
        take: 3,
        orderBy: {
          publishedAt: 'desc',
        },
      } as any)),
      withRetry(() => prisma.article.findMany({
        select: articleListingSelect,
        take: 6,
        orderBy: {
          publishedAt: 'desc',
        },
      } as any)),
      withRetry(() => prisma.liveEvent.findFirst({
        where: {
          streamType: 'VIDEO',
          startTime: { lte: now },
          OR: [
            { endTime: null },
            { endTime: { gte: now } }
          ]
        },
        select: {
          id: true,
          title: true,
        },
        orderBy: {
          startTime: 'desc'
        }
      })),
      withRetry(() => prisma.radioStation.findFirst({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          streamUrl: true,
        },
        orderBy: { createdAt: 'desc' },
      })),
    ]);

    featuredArticles = featuredResult || [];
    latestArticles = latestResult || [];
    currentLive = liveResult;
    activeRadio = radioResult;
  } catch (error) {
    console.error('Database connection error:', error);
  }

  try {
    const ids = new Set(featuredArticles.map((article) => article.id));
    const uniqueLatest = latestArticles.filter((article) => !ids.has(article.id));
    const localized = await applyArticleLocales(
      [...featuredArticles, ...uniqueLatest],
      normalizedLocale,
    );
    const byId = new Map(localized.map((article) => [article.id, article]));
    featuredArticles = featuredArticles.map((article) => byId.get(article.id) || article);
    latestArticles = latestArticles.map((article) => byId.get(article.id) || article);
  } catch (error) {
    console.error('Article locale error:', error);
  }

  const featuredNews = featuredArticles.map(article => ({
    id: article.id,
    slug: article.slug,
    categorySlug: article.category?.slug || 'actualites',
    category: article.category?.title || ui(normalizedLocale, 'news'),
    title: article.title,
    excerpt: article.excerpt,
    image: article.mainImageUrl || 'https://images.unsplash.com/photo-1541872703-74c5963631df?w=800&h=400&fit=crop',
    date: article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(getDateLocale(normalizedLocale), { day: 'numeric', month: 'long', year: 'numeric' }) : '',
    readTime: article.readTime ? `${article.readTime} min` : '5 min',
    author: article.author,
  }));

  const latestNews = latestArticles.map(article => ({
    id: article.id,
    slug: article.slug,
    categorySlug: article.category?.slug || 'actualites',
    category: article.category?.title || ui(normalizedLocale, 'news'),
    title: article.title,
    excerpt: article.excerpt,
    date: article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(getDateLocale(normalizedLocale), { day: 'numeric', month: 'long', year: 'numeric' }) : '',
    readTime: article.readTime ? `${article.readTime} min` : '3 min',
    author: article.author,
    image: article.mainImageUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=300&fit=crop',
  }));

  const tNav = messages.nav;
  const allLabels: Record<string, string> = {
    fr: 'Tout',
    en: 'All',
    es: 'Todo',
    sw: 'Zote',
    ln: 'Nionso',
    rw: 'Byose',
  };
  const categoryFilters = [
    { name: allLabels[normalizedLocale] || 'Tout', slug: 'all', href: `/${locale}` },
    { name: tNav.news, slug: 'actualites', href: `/${locale}/actualites` },
    { name: tNav.politics, slug: 'politique', href: `/${locale}/politique` },
    { name: tNav.economy, slug: 'economie', href: `/${locale}/economie` },
    { name: tNav.culture, slug: 'culture', href: `/${locale}/culture` },
    { name: tNav.sport, slug: 'sport', href: `/${locale}/sport` },
    { name: tNav.scienceTech, slug: 'science-tech', href: `/${locale}/science-tech` },
  ];

  const filteredFeaturedNews = featuredNews;
  const filteredLatestNews = latestNews;

  return (
    <div className="flex flex-col">
      {currentLive ? (
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href={`/${locale}/medias/live/${currentLive.id}`} className="hidden md:flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-white text-red-600 text-sm font-bold rounded-full animate-pulse">
                  🔴 {t.live}
                </span>
                <span className="font-semibold">{currentLive.title}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Radio className="w-4 h-4" />
                <span>{t.watchNow}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            <Link href={`/${locale}/medias/live/${currentLive.id}`} className="md:hidden block">
              <div className="py-3 marquee-track">
                <span className="marquee-content text-sm font-semibold">
                  {`🔴 ${t.live} — ${currentLive.title} — ${t.watchNow}`}
                </span>
              </div>
            </Link>
          </div>
        </div>
      ) : null}
      {activeRadio?.streamUrl ? (
        <section className="bg-[#1f7a6a]">
          <div className="mx-auto flex max-w-7xl justify-center px-3 py-5 sm:px-6">
            <RadioOnAirWidget
              name={activeRadio.name || 'Radio MalakInfo'}
              onlineLabel={t.onAir}
            />
          </div>
        </section>
      ) : null}

      {/* Main Editorial Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 border-b border-border pb-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {categoryFilters.map((item) => {
              const isActive = item.slug === 'all';
              return (
                <Link
                  key={item.slug}
                  href={item.href}
                  prefetch
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                    isActive
                      ? 'border-secondary bg-secondary/10 text-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground'
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
              <article className="mb-8 border-b border-border pb-8">
                <div className="overflow-hidden border border-border bg-card">
                  <Link href={`/${locale}/${filteredFeaturedNews[0].slug}`} className="group block">
                    <div className="relative h-72 sm:h-80 md:h-[30rem] overflow-hidden bg-muted">
                      <SmartImage
                        src={filteredFeaturedNews[0].image}
                        alt={filteredFeaturedNews[0].title}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 70vw"
                        className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/15 sm:from-black/70 sm:via-black/20 sm:to-transparent" />

                      <div className="absolute inset-x-0 top-0 p-4 sm:p-6">
                        <span className="inline-flex items-center bg-secondary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-secondary-foreground">
                          {t.featuredNews}
                        </span>
                      </div>

                      <div className="absolute inset-x-0 bottom-0 hidden p-4 sm:block sm:p-6">
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

                    <div className="border-t border-border bg-card px-4 pt-4 sm:hidden">
                      <div className="mb-2 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        <span>{filteredFeaturedNews[0].category}</span>
                        <span>•</span>
                        <span>{filteredFeaturedNews[0].date}</span>
                      </div>
                      <h1 className="font-heading text-[1.55rem] font-black leading-tight tracking-[-0.03em] text-foreground">
                        {filteredFeaturedNews[0].title}
                      </h1>
                    </div>
                  </Link>

                  <div className="border-t border-border bg-card p-4 sm:p-5">
                    <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {filteredFeaturedNews[0].excerpt}
                    </p>
                  </div>
                </div>

                {filteredFeaturedNews.length > 1 && (
                  <div className="mt-6 grid gap-4 border-t border-border pt-5 md:grid-cols-2">
                    {filteredFeaturedNews.slice(1, 3).map((story) => (
                      <Link
                        key={story.id}
                        href={`/${locale}/${story.slug}`}
                        className="group block border-l border-border pl-4 first:border-l-0 first:pl-0"
                      >
                        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary">
                          {story.category}
                        </div>
                        <h2 className="font-heading text-xl font-bold leading-snug text-foreground group-hover:text-secondary transition-colors">
                          {story.title}
                        </h2>
                      </Link>
                    ))}
                  </div>
                )}
              </article>
            )}

            <div className="mb-8">
              <h2 className="font-heading text-xl font-bold text-foreground mb-6 uppercase tracking-wide border-l-4 border-secondary pl-3">
                {t.latestNews}
              </h2>
              {filteredLatestNews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredLatestNews.slice(0, 6).map((news, index) => (
                    <article
                      key={news.id}
                      className="group border border-border bg-card text-card-foreground transition-all duration-200 hover:-translate-y-1 hover:border-secondary"
                    >
                      <Link href={`/${locale}/${news.slug}`} prefetch className="block p-[5px] bg-white">
                        <div className="article-preview-frame relative h-52">
                          <SmartImage
                            src={news.image}
                            alt={news.title}
                            fill
                            priority={index < 3}
                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <span className="absolute bottom-3 left-3 z-10 px-2 py-1 bg-primary text-[10px] font-bold uppercase tracking-[0.12em] text-primary-foreground">
                            {news.category}
                          </span>
                        </div>
                      </Link>
                      <div className="p-4">
                        <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          <span className="text-secondary">{news.date}</span>
                        </div>
                        <Link href={`/${locale}/${news.slug}`} className="block">
                          <h3 className="font-heading text-xl font-bold leading-tight text-foreground hover:text-secondary transition-colors line-clamp-3 cursor-pointer">
                            {news.title}
                          </h3>
                        </Link>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                          {(news as any).excerpt || ''}
                        </p>
                        <ArticleAuthorLink author={news.author} locale={locale} className="mt-4 text-xs text-muted-foreground" />
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-muted p-8 text-center text-muted-foreground">
                  {t.noArticlesInCategory}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="sticky top-20">
              <div className="bg-card border border-border">
                <div className="flex items-center justify-between gap-3 bg-primary px-4 py-2 text-primary-foreground">
                  <h3 className="font-heading flex items-center text-lg font-bold uppercase tracking-wide">
                      {t.latestFeed}
                      <span className="ml-2 animate-pulse">›</span>
                  </h3>
                </div>
                {activeRadio?.streamUrl ? (
                  <div className="flex justify-center bg-[#1f7a6a] px-3 py-3">
                    <RadioOnAirWidget
                      compact
                      name={activeRadio.name || 'Radio MalakInfo'}
                      onlineLabel={t.onAir}
                    />
                  </div>
                ) : null}
                <div className="divide-y divide-border">
                  {filteredLatestNews.slice(0, 8).map((news) => (
                    <article
                      key={news.id}
                      className="px-3 py-2 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                        <span className="text-secondary font-bold text-[10px] sm:text-xs whitespace-nowrap pt-0.5">
                          {new Date().toLocaleTimeString(getDateLocale(normalizedLocale), { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="min-w-0 flex-1">
                          <Link href={`/${locale}/${news.slug}`} className="block">
                            <h4 className="font-heading font-semibold text-foreground text-sm hover:text-secondary transition-colors line-clamp-3 leading-snug m-0">
                              {news.title}
                            </h4>
                          </Link>
                          <span className="text-[10px] sm:text-xs text-muted-foreground mt-1 block">
                            {news.category}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <AdSenseAd adSlot={ADSENSE_SLOTS.sidebar} className="my-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <section className="border-t border-border bg-muted py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <NewsletterSignupInline
            locale={normalizedLocale}
            title={t.stayInformed}
            subtitle={t.newsletterSubtitle}
            buttonText={t.subscribe}
          />
        </div>
      </section>
    </div>
  );
}
