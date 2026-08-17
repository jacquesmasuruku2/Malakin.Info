import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Calendar, Clock, ArrowLeft, Share2, Bookmark } from 'lucide-react';
import { getArticleTranslation, getCategoryTranslation } from '@/lib/translation';

export default async function SanteArticlePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      category: true,
    },
  } as any) as any;

  if (!article) {
    notFound();
  }

  if (article.category?.slug !== 'sante') {
    redirect(`/${locale}/${article.category?.slug || 'actualites'}/${slug}`);
  }

  const translatedArticle = await getArticleTranslation(article.id, locale);
  const translatedCategory = await getCategoryTranslation(article.categoryId, locale);
  const displayTitle = translatedArticle.title || article.title;
  const displayExcerpt = translatedArticle.excerpt || article.excerpt;
  const displayContent = typeof translatedArticle.content === 'string' ? translatedArticle.content : JSON.stringify(translatedArticle.content ?? '');

  return (
    <div className="flex flex-col">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href={`/${locale}/sante`}
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          {locale === 'fr' ? 'Retour à' : 'Back to'} {translatedCategory.title || (locale === 'fr' ? 'Santé' : 'Health')}
        </Link>

        <header className="mb-8">
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {article.readTime || '5 min'}
            </span>
          </div>
          <h1 className="font-heading text-4xl font-bold text-foreground mb-4">
            {displayTitle}
          </h1>
          <p className="text-xl text-muted-foreground">
            {displayExcerpt}
          </p>
        </header>

        {article.mainImageUrl && (
          <div className="relative h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
            <img
              src={article.mainImageUrl}
              alt={displayTitle}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="prose prose-lg max-w-none mb-8">
          <div dangerouslySetInnerHTML={{ __html: displayContent }} />
        </div>

        <div className="flex items-center gap-4 border-t border-border pt-6">
          <button className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <Share2 className="w-4 h-4" />
            Partager
          </button>
          <button className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <Bookmark className="w-4 h-4" />
            Sauvegarder
          </button>
        </div>
      </article>
    </div>
  );
}
