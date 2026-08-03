import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Calendar, Clock, User, Share2, Bookmark, ArrowLeft, Mail, MessageCircle, Send } from 'lucide-react';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function BlogPostPage({ 
  params 
}: { 
  params: Promise<{ locale: string; type: string; slug: string }> 
}) {
  const { locale, type, slug } = await params;

  try {
    const blogPost = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: true,
      },
    });

    if (!blogPost) {
      notFound();
    }

    const formattedDate = blogPost.publishedAt 
      ? new Date(blogPost.publishedAt).toLocaleDateString('fr-FR', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        }) 
      : '';

    const readTime = blogPost.readTime ? `${blogPost.readTime} min` : '5 min';

    const typeLabels: Record<string, string> = {
      'tribune': 'Tribune',
      'chronique': 'Chronique',
      'enquete': 'Enquête',
    };

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-muted/50 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href={`/${locale}/blog/${type}`}
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à {typeLabels[type] || 'Blog'}
            </Link>
          </div>
        </header>

        {/* Article */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Type & Meta */}
          <div className="mb-6">
            <Link
              href={`/${locale}/blog/${type}`}
              className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4 hover:bg-primary/20 transition-colors"
            >
              {typeLabels[type] || 'Blog'}
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
                {blogPost.author?.name || 'Équipe Malakin'}
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            {blogPost.title}
          </h1>

          {/* Excerpt */}
          {blogPost.excerpt && (
            <p className="text-xl text-muted-foreground mb-4 leading-relaxed">
              {blogPost.excerpt}
            </p>
          )}

          {/* Featured Image */}
          {blogPost.mainImageUrl && (
            <div className="mb-6 rounded-lg overflow-hidden">
              <img
                src={blogPost.mainImageUrl}
                alt={blogPost.title}
                className="w-full h-auto max-h-[500px] object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none prose-img:my-6 prose-img:rounded-lg prose-img:shadow-md prose-h2:mt-8 prose-h2:mb-4 prose-h3:mt-6 prose-h3:mb-3 prose-p:my-4 prose-ul:my-4 prose-ol:my-4 prose-li:my-2">
            <div 
              dangerouslySetInnerHTML={{ __html: typeof blogPost.content === 'string' ? blogPost.content : '' }}
              className="text-foreground leading-relaxed prose-headings:text-foreground prose-p:text-foreground prose-a:text-primary prose-strong:text-foreground"
            />
          </div>

          {/* Share Buttons */}
          <div className="flex items-center gap-4 mt-8 pt-8 border-t border-border">
            <span className="text-sm font-medium text-foreground">Partager :</span>
            <button className="p-2 text-muted-foreground hover:text-blue-600 transition-colors">
              <MessageCircle className="w-5 h-5" />
            </button>
            <button className="p-2 text-muted-foreground hover:text-blue-400 transition-colors">
              <Send className="w-5 h-5" />
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
        </article>

        {/* Author Section */}
        {blogPost.author && (
          <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-border">
            <div className="bg-muted/50 rounded-lg p-6">
              <div className="flex items-start gap-4">
                {blogPost.author.imageUrl && (
                  <img
                    src={blogPost.author.imageUrl}
                    alt={blogPost.author.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                    {blogPost.author.name}
                  </h3>
                  {blogPost.author.bio && (
                    <p className="text-muted-foreground text-sm mb-4">
                      {blogPost.author.bio}
                    </p>
                  )}
                  <Link
                    href={`/${locale}/auteurs/${blogPost.author.slug}`}
                    className="text-sm text-primary hover:text-primary/80 font-medium"
                  >
                    Voir tous les articles de cet auteur
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error fetching blog post:', error);
    notFound();
  }
}
