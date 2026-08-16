import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

export default async function SantePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const category = await prisma.category.findUnique({
    where: { slug: 'sante' },
  });

  const articles = category
    ? await prisma.article.findMany({
        where: { categoryId: category.id },
        orderBy: { publishedAt: 'desc' },
        take: 12,
      })
    : [];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href={`/${locale}`} className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour à l'accueil
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Santé</h1>
          <p className="text-xl text-gray-200">
            Actualité santé, médecine et bien-être
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((item: any) => (
            <article
              key={item.id}
              className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {item.mainImageUrl && (
                <div className="relative h-48">
                  <img
                    src={item.mainImageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(item.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {item.readTime || '5 min'}
                  </span>
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2 line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground line-clamp-2 mb-4">
                  {item.excerpt}
                </p>
                <Link
                  href={`/${locale}/${item.slug}`}
                  className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
                >
                  Lire la suite
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
