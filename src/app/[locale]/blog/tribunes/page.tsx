import Link from 'next/link';
import { Calendar, Clock, ArrowRight, PenTool } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function TribunesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  let articles: any[] = [];

  try {
    articles = await prisma.blogPost.findMany({
      where: {
        type: 'tribune',
      },
      include: {
        author: true,
      },
      take: 10,
      orderBy: {
        publishedAt: 'desc',
      },
    });
  } catch (error) {
    console.error('Database connection error:', error);
  }

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href={`/${locale}/blog`} className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour au Blog
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Tribunes</h1>
          <p className="text-xl text-gray-200">
            Opinions et analyses de nos experts
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-primary"
            >
              <div className="flex items-center gap-2 mb-3">
                <PenTool className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                {article.title}
              </h3>
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {article.excerpt}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {article.readTime ? `${article.readTime} min` : '5 min'}
                </span>
              </div>
              <Link
                href={`/${locale}/blog/tribunes/${article.slug}`}
                className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
              >
                Lire la tribune
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
