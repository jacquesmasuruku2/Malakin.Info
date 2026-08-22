import Link from 'next/link';
import { Playfair_Display } from 'next/font/google';
import { prisma } from '@/lib/prisma';
import { Calendar, Clock, User, Bookmark, ArrowLeft } from 'lucide-react';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import CommentsSection from '@/components/CommentsSection';
import ShareButtons from '@/components/ShareButtons';
import AdSenseAd from '@/components/AdSenseAd';
import ViewIncrementer from '@/components/ViewIncrementer';
import FavoriteButton from '@/components/FavoriteButton';
import ReadAlsoRenderer from '@/components/ReadAlsoRenderer';
import ArticleSidebar, { type ArticleSidebarSponsor } from '@/components/ArticleSidebar';
import { SponsoredSection } from '@/components/SponsoredSection';
import { getArticleTranslation, getCategoryTranslation } from '@/lib/translation';
import ScrollToComments from '@/components/ScrollToComments';
import Paywall from '@/components/Paywall';
import { getPremiumPreviewContent, hasPremiumAccess } from '@/lib/premium-access';
import { withRetry } from '@/lib/database';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
});

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string; category: string; slug: string }> }): Promise<Metadata> {
  const { locale, category, slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://malakinfo.com';

  const article = await withRetry(() => prisma.article.findUnique({
    where: { slug },
    include: {
      category: true,
      author: true,
    },
  } as any)) as any;

  if (!article) {
    return {
      title: 'Article non trouvé | Malakinfo.com',
    };
  }

  const canonicalUrl = `${baseUrl}/${locale}/${slug}`;
  const absoluteImageUrl = article.mainImageUrl
    ? (article.mainImageUrl.startsWith('http') ? article.mainImageUrl : `${baseUrl}${article.mainImageUrl}`)
    : null;

  return {
    title: article.title,
    description: article.excerpt || article.title,
    icons: {
      icon: absoluteImageUrl ?? '/images/logo.png',
      shortcut: absoluteImageUrl ?? '/images/logo.png',
      apple: absoluteImageUrl ?? '/images/logo.png',
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      url: canonicalUrl,
      title: article.title,
      description: article.excerpt || article.title,
      siteName: 'Malakinfo',
      images: absoluteImageUrl ? [
        {
          url: absoluteImageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt || article.title,
      images: absoluteImageUrl ? [absoluteImageUrl] : [],
    },
  };
}

export default async function ArticlePage({ 
  params 
}: { 
  params: Promise<{ locale: string; category: string; slug: string }> 
}) {
  const { locale, category, slug } = await params;

  // Translations
  const t = {
    backTo: locale === 'fr' ? 'Retour à' : 'Back to',
    readTime: locale === 'fr' ? 'min de lecture' : 'min read',
    share: locale === 'fr' ? 'Partager' : 'Share',
    relatedArticles: locale === 'fr' ? 'Articles similaires' : 'Related Articles',
    seeAllArticles: locale === 'fr' ? 'Voir tous les articles de cet auteur' : 'See all articles by this author',
    teamMalakin: locale === 'fr' ? 'Équipe Malakinfo' : 'Malakinfo Team',
  };

  try {
    const article = await withRetry(() => prisma.article.findUnique({
      where: { slug },
      include: {
        category: true,
        author: true,
      },
    } as any)) as any;

    if (!article) {
      notFound();
    }

    const canonicalArticlePath = `/${locale}/${slug}`;
    const currentPath = `/${locale}/${category}/${slug}`;

    if (currentPath !== canonicalArticlePath) {
      redirect(canonicalArticlePath);
    }

    if (article.externalLink) {
      redirect(article.externalLink);
    }

    // Get translated content based on locale
    const translatedArticle = await getArticleTranslation(article.id, locale);
    const translatedCategory = await getCategoryTranslation(article.categoryId, locale);
    const premiumAccess = article.isPremium ? await hasPremiumAccess(article.id) : true;

    const relatedArticles: any[] = await withRetry(() => prisma.article.findMany({
      where: {
        categoryId: article.categoryId,
        id: { not: article.id },
      },
      include: {
        category: true,
        author: true,
      },
      take: 4,
      orderBy: {
        publishedAt: 'desc',
      },
    } as any)) || [];

    const sponsoredFromDb = await withRetry(() => prisma.sponsoredArticle.findMany({
      where: {
        articleId: article.id,
        isActive: true,
      },
      include: {
        article: {
          include: {
            category: true,
            author: true,
          },
        },
      },
      orderBy: {
        position: 'asc',
      },
    } as any)) || [];

    const sponsoredArticles = sponsoredFromDb.map((item: any) => ({
      id: item.article.id,
      title: item.article.title,
      imageUrl: item.article.mainImageUrl || '',
      targetUrl: `/${locale}/${item.article.category?.slug || 'actualites'}/${item.article.slug}`,
      sponsorName: item.categoryBadge || 'Sponsor',
      categoryBadge: item.categoryBadge || 'Publicité',
    }));

    const otherSponsoredFromDb = await withRetry(() => prisma.sponsoredArticle.findMany({
      where: {
        isActive: true,
        articleId: { not: article.id },
      },
      include: {
        article: {
          include: {
            category: true,
            author: true,
          },
        },
      },
      orderBy: {
        position: 'asc',
      },
      take: 2,
    } as any)) || [];

    const otherSponsoredArticles = otherSponsoredFromDb.map((item: any) => ({
      id: item.article.id,
      title: item.article.title,
      imageUrl: item.article.mainImageUrl || '',
      targetUrl: `/${locale}/${item.article.category?.slug || 'actualites'}/${item.article.slug}`,
      sponsorName: item.categoryBadge || 'Sponsor',
      categoryBadge: item.categoryBadge || 'Publicité',
    }));

    const formattedDate = article.publishedAt 
      ? new Date(article.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        }) 
      : '';

    const readTime = article.readTime ? `${article.readTime} ${t.readTime}` : `5 ${t.readTime}`;

    // Use translated content if available, otherwise fallback to original
    const displayTitle = translatedArticle.title;
    const displayExcerpt = translatedArticle.excerpt;
    const displayContent = premiumAccess
      ? (typeof translatedArticle.content === 'string' ? translatedArticle.content : JSON.stringify(translatedArticle.content))
      : '';
    const previewContent = !premiumAccess
      ? getPremiumPreviewContent(typeof translatedArticle.content === 'string' ? translatedArticle.content : JSON.stringify(translatedArticle.content))
      : '';
    const displayCategoryTitle = translatedCategory.title;

    return (
      <div className="min-h-screen bg-background">
        {/* Scroll to comments if needed */}
        <ScrollToComments />

        {/* Increment views */}
        <ViewIncrementer articleId={article.id} />

        <main className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-8 w-full">
            <div className="mb-3 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.12em] text-gray-500">
              <span>{formattedDate}</span>
            </div>

            <h1 className={`${playfair.className} text-[2.25rem] font-bold leading-[1.08] tracking-[-0.03em] text-gray-900 md:text-[3.5rem]`}>
              {displayTitle}
            </h1>
          </header>

          <div className="grid w-full grid-cols-1 items-start gap-8 xl:grid-cols-[72px_minmax(0,1fr)_300px]">
            <div className="hidden xl:flex xl:justify-center xl:pt-8">
              <div className="sticky top-24">
                <ShareButtons
                  title={displayTitle}
                  url={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://malakinfo.com'}/${locale}/${slug}`}
                  locale={locale}
                  orientation="vertical"
                />
              </div>
            </div>

            <article className="w-full min-w-0">
              {article.mainImageUrl && (
                <div className="mb-8 overflow-hidden bg-white">
                  <img
                    src={article.mainImageUrl}
                    alt={displayTitle}
                    className="block h-auto w-full object-cover"
                  />
                </div>
              )}

              {article.additionalImages && Array.isArray(article.additionalImages) && article.additionalImages.length > 0 && (
                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {article.additionalImages.map((imageUrl: string, index: number) => (
                    imageUrl && (
                      <div key={index} className="overflow-hidden bg-white">
                        <img
                          src={imageUrl}
                          alt={`${displayTitle} - Image ${index + 1}`}
                          className="block h-auto w-full object-cover"
                        />
                      </div>
                    )
                  ))}
                </div>
              )}

              <div className="xl:hidden">
                <ShareButtons
                  title={displayTitle}
                  url={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://malakinfo.com'}/${locale}/${slug}`}
                  locale={locale}
                />
              </div>

              {premiumAccess ? (
                <div className={`${playfair.className} text-[1.04rem] font-normal leading-[1.9] text-gray-800 md:text-[1.18rem]`}>
                  <ReadAlsoRenderer content={displayContent} />
                </div>
              ) : (
                <div>
                  <div className="premium-preview premium-preview-lines text-[1.04rem] leading-[1.9] text-gray-800 md:text-[1.18rem]" dangerouslySetInnerHTML={{ __html: previewContent }} />
                  <p className="mt-3 text-sm font-medium text-muted-foreground">
                    {locale === 'fr' ? 'Les cinq premières lignes sont visibles. Abonnez-vous ou achetez cet article pour lire la suite.' : 'The first five lines are visible. Subscribe or purchase this article to continue reading.'}
                  </p>
                </div>
              )}

              {article.isPremium && !premiumAccess && (
                <Paywall 
                  articleId={article.id} 
                  articleTitle={displayTitle}
                  premiumPrice={article.premiumPrice ? Number(article.premiumPrice) : 1.9}
                />
              )}

              <div className="mt-8">
                <AdSenseAd adSlot="0987654321" className="my-4" />
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <FavoriteButton articleId={article.id} locale={locale} />
              </div>
            </article>

            <aside className="w-full min-w-0 xl:sticky xl:top-6 xl:self-start">
              <ArticleSidebar locale={locale} sponsors={sponsoredArticles} />
            </aside>
          </div>
        </main>

        <CommentsSection articleId={article.id} locale={locale} />

        {otherSponsoredArticles.length > 0 && (
          <div className="mx-auto max-w-5xl px-4 pb-0 pt-8 md:px-6">
            <SponsoredSection items={otherSponsoredArticles} />
          </div>
        )}

        {relatedArticles.length > 0 && (
          <section className="mx-auto max-w-5xl px-4 pb-12 pt-12 md:px-6">
            <h2 className="mb-6 text-xl font-bold text-gray-900 md:text-2xl">
              {t.relatedArticles}
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {relatedArticles.map((related: any) => (
                <Link
                  key={related.id}
                  href={`/${locale}/${related.slug}`}
                  className="group block"
                >
                  <article className="overflow-hidden bg-white">
                    {related.mainImageUrl && (
                      <div className="overflow-hidden bg-gray-100">
                        <img
                          src={related.mainImageUrl}
                          alt={related.title}
                          className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      </div>
                    )}
                    <div className="pt-3">
                      <h3 className="text-base font-bold leading-snug text-gray-900 group-hover:text-red-700">
                        {related.title}
                      </h3>
                      <div className="mt-2 text-xs text-gray-500">
                        {related.publishedAt 
                          ? new Date(related.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { 
                              day: 'numeric', 
                              month: 'short',
                              year: 'numeric'
                            }) 
                          : ''}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error fetching article:', error);
    notFound();
  }
}
