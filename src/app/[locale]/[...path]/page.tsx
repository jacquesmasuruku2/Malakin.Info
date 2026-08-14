import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Calendar, Clock, User, ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import CommentsSection from '@/components/CommentsSection';
import ShareButtons from '@/components/ShareButtons';
import AdSenseAd from '@/components/AdSenseAd';
import Breadcrumbs from '@/components/Breadcrumbs';
import ReadAlsoRenderer from '@/components/ReadAlsoRenderer';
import ArticleSidebar, { type ArticleSidebarSponsor } from '@/components/ArticleSidebar';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string; path: string[] }> }): Promise<Metadata> {
  const { locale, path } = await params;
  const slug = path[path.length - 1];
  
  try {
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        category: true,
        author: true,
      },
    } as any) as any;

    if (!article) {
      return {
        title: 'Article non trouvé | Malakinfo.com',
      };
    }

    const baseUrl = 'https://malakinfo.com';
    const canonicalUrl = `${baseUrl}/${locale}/${article.category?.slug || 'actualites'}/${slug}`;
    
    // Convert image URL to absolute if it's relative
    const absoluteImageUrl = article.mainImageUrl 
      ? (article.mainImageUrl.startsWith('http') ? article.mainImageUrl : `${baseUrl}${article.mainImageUrl}`)
      : null;
    
    return {
      title: article.title,
      description: article.excerpt || article.title,
      keywords: [article.category?.title || 'actualités', 'Malakinfo', 'Afrique', 'actualités'],
      authors: article.author ? [{ name: article.author.name }] : [{ name: 'Malakinfo' }],
      creator: 'Malakinfo',
      publisher: 'Malakinfo',
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
        publishedTime: article.publishedAt?.toISOString(),
        modifiedTime: article.updatedAt?.toISOString(),
        authors: article.author ? [article.author.name] : ['Malakinfo'],
        section: article.category?.title || 'Actualités',
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
        creator: '@malakinfo',
      },
    };
  } catch (error) {
    return {
      title: 'Erreur | Malakinfo.com',
    };
  }
}

export default async function CatchAllArticlePage({ 
  params 
}: { 
  params: Promise<{ locale: string; path: string[] }> 
}) {
  const { locale, path } = await params;

  // Extract the slug from the path (last segment)
  const slug = path[path.length - 1];

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
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        category: true,
        author: true,
      },
    } as any) as any;

    if (!article) {
      notFound();
    }

    // Don't redirect - just render the article regardless of the path
    // This allows both /fr/culture/slug and /fr/actualites/culture/slug to work

    const baseUrl = 'https://malakinfo.com';
    const canonicalUrl = `${baseUrl}/${locale}/${article.category?.slug || 'actualites'}/${slug}`;

    // Convert image URL to absolute if it's relative
    const absoluteImageUrl = article.mainImageUrl 
      ? (article.mainImageUrl.startsWith('http') ? article.mainImageUrl : `${baseUrl}${article.mainImageUrl}`)
      : null;

    // Structured Data (JSON-LD)
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.excerpt || article.title,
      image: absoluteImageUrl ? [absoluteImageUrl] : [],
      datePublished: article.publishedAt?.toISOString(),
      dateModified: article.updatedAt?.toISOString(),
      author: article.author ? {
        '@type': 'Person',
        name: article.author.name,
      } : {
        '@type': 'Organization',
        name: 'Malakinfo',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Malakinfo',
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/images/logo.png`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl,
      },
    };

    const relatedArticles: any[] = await prisma.article.findMany({
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
    } as any) as any;

    const sponsoredFromDb = await prisma.sponsoredArticle.findMany({
      where: {
        articleId: article.id,
        isActive: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    const sponsoredArticles: ArticleSidebarSponsor[] = sponsoredFromDb.map((item: any) => ({
      id: item.id,
      title: item.title,
      imageUrl: item.imageUrl,
      targetUrl: item.targetUrl,
      sponsorName: item.sponsorName,
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

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-muted/50 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Breadcrumbs
              locale={locale}
              items={[
                { label: article.category?.title || 'Actualités', href: `/${locale}/${article.category?.slug || 'actualites'}` },
                { label: article.title },
              ]}
            />
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[240px_minmax(0,1fr)]">
            <div className="xl:order-1">
              <ArticleSidebar locale={locale} sponsors={sponsoredArticles} />
            </div>

            <article className="max-w-4xl xl:justify-self-center">
              <div className="mb-6">
                <Link
                  href={`/${locale}/${article.category?.slug || 'actualites'}`}
                  className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs sm:text-sm font-medium rounded-full mb-3 sm:mb-4 hover:bg-primary/20 transition-colors"
                >
                  {article.category?.title || 'Actualités'}
                </Link>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    {formattedDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    {readTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 sm:w-4 sm:h-4" />
                    {article.author?.name || t.teamMalakin}
                  </span>
                </div>
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
                {article.title}
              </h1>

              {article.excerpt && (
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
                  {article.excerpt}
                </p>
              )}

              {article.mainImageUrl && (
                <div className="mb-8 rounded-lg overflow-hidden">
                  <img
                    src={article.mainImageUrl}
                    alt={article.title}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}

              <AdSenseAd adSlot="1234567890" className="my-4" />

              <ReadAlsoRenderer content={typeof article.content === 'string' ? article.content : ''} />

              <div className="mt-8">
                <AdSenseAd adSlot="0987654321" className="my-4" />
              </div>

              <ShareButtons 
                title={article.title} 
                url={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://malakinfo.com'}/${locale}/${article.category?.slug || 'actualites'}/${slug}`}
                locale={locale}
              />
            </article>
          </div>
        </div>

        {/* Author Section */}
        {article.author && (
          <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 border-t border-border">
            <div className="bg-muted/50 rounded-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {article.author.imageUrl && (
                  <img
                    src={article.author.imageUrl}
                    alt={article.author.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-heading text-base sm:text-lg font-semibold text-foreground mb-2">
                    {article.author.name}
                  </h3>
                  {article.author.bio && (
                    <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-none">
                      {article.author.bio}
                    </p>
                  )}
                  <Link
                    href={`/${locale}/auteurs/${article.author.slug}`}
                    className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium"
                  >
                    {t.seeAllArticles}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 border-t border-border">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-6 sm:mb-8">
              {t.relatedArticles}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedArticles.map((related: any) => (
                <Link
                  key={related.id}
                  href={`/${locale}/${related.category?.slug || 'actualites'}/${related.slug}`}
                  className="group"
                >
                  <article className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {related.mainImageUrl && (
                      <div className="h-32 sm:h-40 overflow-hidden">
                        <img
                          src={related.mainImageUrl}
                          alt={related.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-3 sm:p-4">
                      <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded mb-2">
                        {related.category?.title || 'Actualités'}
                      </span>
                      <h3 className="font-heading font-semibold text-foreground mb-2 text-sm sm:text-base line-clamp-2 group-hover:text-primary transition-colors">
                        {related.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {related.publishedAt 
                          ? new Date(related.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { 
                              day: 'numeric', 
                              month: 'short' 
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

        {/* Comments Section */}
        <CommentsSection articleId={article.id} locale={locale} />
      </div>
      </>
    );
  } catch (error) {
    console.error('Error fetching article:', error);
    notFound();
  }
}
