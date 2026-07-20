import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Calendar, Clock, User, Share2, Bookmark, ArrowLeft, Facebook, Twitter, Mail } from 'lucide-react';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ArticlePage({ 
  params 
}: { 
  params: { locale: string; category: string; slug: string } 
}) {
  const { locale, category, slug } = params;

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
      ? new Date(article.publishedAt).toLocaleDateString('fr-FR', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        }) 
      : '';

    const readTime = article.readTime ? `${article.readTime} min` : '5 min';

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-muted/50 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href={`/${locale}/${article.category?.slug || 'actualites'}`}
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à {article.category?.title || 'Actualités'}
            </Link>
          </div>
        </header>

        {/* Article */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Category & Meta */}
          <div className="mb-6">
            <Link
              href={`/${locale}/${article.category?.slug || 'actualites'}`}
              className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4 hover:bg-primary/20 transition-colors"
            >
              {article.category?.title || 'Actualités'}
            </Link>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {readTime} de lecture
              </span>
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {article.author?.name || 'Équipe Malakin'}
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              {article.excerpt}
            </p>
          )}

          {/* Featured Image */}
          {article.mainImageUrl && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img
                src={article.mainImageUrl}
                alt={article.title}
                className="w-full h-auto object-cover"
              />
              {article.imageCaption && (
                <p className="text-sm text-muted-foreground mt-2 italic">
                  {article.imageCaption}
                </p>
              )}
            </div>
          )}

          {/* Share Buttons */}
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border">
            <span className="text-sm font-medium text-foreground">Partager :</span>
            <button className="p-2 text-muted-foreground hover:text-blue-600 transition-colors">
              <Facebook className="w-5 h-5" />
            </button>
            <button className="p-2 text-muted-foreground hover:text-blue-400 transition-colors">
              <Twitter className="w-5 h-5" />
            </button>
            <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
              <Mail className="w-5 h-5" />
            </button>
            <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
              <Bookmark className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div 
              dangerouslySetInnerHTML={{ __html: article.content || '' }}
              className="text-foreground leading-relaxed"
            />
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t border-border">
              <h3 className="text-sm font-medium text-foreground mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Author Section */}
        {article.author && (
          <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-border">
            <div className="bg-muted/50 rounded-lg p-6">
              <div className="flex items-start gap-4">
                {article.author.avatar && (
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                    {article.author.name}
                  </h3>
                  {article.author.bio && (
                    <p className="text-muted-foreground text-sm mb-4">
                      {article.author.bio}
                    </p>
                  )}
                  <Link
                    href={`/${locale}/auteurs/${article.author.slug}`}
                    className="text-sm text-primary hover:text-primary/80 font-medium"
                  >
                    Voir tous les articles de cet auteur
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-border">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-8">
              Articles similaires
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  href={`/${locale}/${related.category?.slug || 'actualites'}/${related.slug}`}
                  className="group"
                >
                  <article className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {related.mainImageUrl && (
                      <div className="h-40 overflow-hidden">
                        <img
                          src={related.mainImageUrl}
                          alt={related.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded mb-2">
                        {related.category?.title || 'Actualités'}
                      </span>
                      <h3 className="font-heading font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {related.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {related.publishedAt 
                          ? new Date(related.publishedAt).toLocaleDateString('fr-FR', { 
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
      </div>
    );
  } catch (error) {
    console.error('Error fetching article:', error);
    notFound();
  }
}
