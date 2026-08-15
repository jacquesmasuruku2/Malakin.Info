import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PolitiqueArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      category: true,
      author: true,
    },
  } as any) as any;

  if (!article || article.category?.slug !== 'politique') {
    notFound();
  }

  return (
    <div className="flex flex-col">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/politique" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="mr-2 w-4 h-4" />
          Retour à Politique
        </Link>

        <header className="mb-8">
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {article.readTime || '5 min'}
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
          <div dangerouslySetInnerHTML={{ __html: typeof article.content === 'string' ? article.content : JSON.stringify(article.content) }} />
        </div>
      </article>
    </div>
  );
}
