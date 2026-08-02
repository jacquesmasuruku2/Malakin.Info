import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Calendar, Clock, User, Bookmark, ArrowLeft } from 'lucide-react';
import { notFound, redirect } from 'next/navigation';
import CommentsSection from '@/components/CommentsSection';
import ShareButtons from '@/components/ShareButtons';
import AdSenseAd from '@/components/AdSenseAd';
import ViewIncrementer from '@/components/ViewIncrementer';

export const dynamic = 'force-dynamic';

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
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        category: true,
        author: true,
      },
    });

    if (!article) {
      notFound();
    }

    // If the category in URL doesn't match the article's actual category, redirect
    if (article.category?.slug !== category) {
      redirect(`/${locale}/${article.category?.slug || 'actualites'}/${slug}`);
    }

    const relatedArticles = await prisma.article.findMany({
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
    });

    const formattedDate = article.publishedAt 
      ? new Date(article.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        }) 
      : '';

    const readTime = article.readTime ? `${article.readTime} ${t.readTime}` : `5 ${t.readTime}`;

    return (
      <div className="min-h-screen bg-background">
        {/* Increment views */}
        <ViewIncrementer articleId={article.id} />

        {/* Header */}
        <header className="bg-muted/50 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href={`/${locale}/${article.category?.slug || 'actualites'}`}
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.backTo} {article.category?.title || 'Actualités'}
            </Link>
          </div>
        </header>

        {/* Article */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Category & Meta */}
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

          {/* Title */}
          <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              {article.excerpt}
            </p>
          )}

          {/* Featured Image */}
          {article.mainImageUrl && (
            <div className="mb-4 rounded-lg overflow-hidden">
              <img
                src={article.mainImageUrl}
                alt={article.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* AdSense Ad - After Featured Image */}
          <div className="mb-4">
            <AdSenseAd adSlot="1234567890" className="my-4" />
          </div>

          {/* Content */}
          <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none prose-img:my-6 prose-img:rounded-lg prose-img:shadow-md prose-h2:mt-8 prose-h2:mb-4 prose-h3:mt-6 prose-h3:mb-3 prose-p:my-4 prose-ul:my-4 prose-ol:my-4 prose-li:my-2">
            <div
              dangerouslySetInnerHTML={{ __html: typeof article.content === 'string' ? article.content : '' }}
              className="text-foreground leading-relaxed prose-headings:text-foreground prose-p:text-foreground prose-a:text-primary prose-strong:text-foreground"
            />
          </div>

          {/* AdSense Ad - After Content */}
          <div className="mt-8">
            <AdSenseAd adSlot="0987654321" className="my-4" />
          </div>

          {/* Share Buttons */}
          <ShareButtons 
            title={article.title} 
            url={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://malakinfo.com'}/${locale}/${category}/${slug}`}
            locale={locale}
          />
        </article>

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
              {relatedArticles.map((related) => (
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
    );
  } catch (error) {
    console.error('Error fetching article:', error);
    notFound();
  }
}
