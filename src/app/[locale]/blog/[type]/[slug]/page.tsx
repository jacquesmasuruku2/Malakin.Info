import Link from 'next/link';
import { Playfair_Display } from 'next/font/google';
import { prisma } from '@/lib/prisma';
import { Calendar, Clock, User, Share2, Bookmark, ArrowLeft, Mail, MessageCircle, Send } from 'lucide-react';
import { notFound } from 'next/navigation';
import ReadAlsoRenderer from '@/components/ReadAlsoRenderer';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
});

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
          <h1 className={`${playfair.className} text-[2.4rem] md:text-[3.5rem] font-bold text-foreground mb-6 leading-[1.08] tracking-[-0.03em]`}>
            {blogPost.title}
          </h1>

          {/* Excerpt */}
          {blogPost.excerpt && (
            <p className={`${playfair.className} text-[1.08rem] md:text-[1.2rem] text-muted-foreground mb-4 leading-[1.8]`}>
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
          <div className={`${playfair.className} text-[1.04rem] font-normal leading-[1.9] text-foreground md:text-[1.18rem]`}>
            <ReadAlsoRenderer content={typeof blogPost.content === 'string' ? blogPost.content : ''} />
          </div>

          {/* Share Buttons */}
          <div className="flex items-center gap-4 mt-6 pt-6 border-t border-border">
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
      </div>
    );
  } catch (error) {
    console.error('Error fetching blog post:', error);
    notFound();
  }
}
