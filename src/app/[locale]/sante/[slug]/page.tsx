import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft, Share2, Bookmark } from 'lucide-react';

// This would normally fetch from your database/API
async function getArticleBySlug(slug: string) {
  // Placeholder - replace with actual Prisma query
  return null;
}

export default async function SanteArticlePage({ params }: { params: { locale: string; slug: string } }) {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="flex flex-col">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href={`/${params.locale}/sante`}
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Retour à Santé
        </Link>

        <header className="mb-8">
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {article.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {article.readTime}
            </span>
          </div>
          <h1 className="font-heading text-4xl font-bold text-foreground mb-4">
            {article.title}
          </h1>
          <p className="text-xl text-muted-foreground">
            {article.excerpt}
          </p>
        </header>

        {article.mainImageUrl && (
          <div className="relative h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
            <img
              src={article.mainImageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="prose prose-lg max-w-none mb-8">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
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
