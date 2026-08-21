import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

export default async function PolitiquePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const category = await prisma.category.findUnique({
    where: { slug: 'politique' },
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
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href={`/${locale}`} className="text-red-100 hover:text-white mb-4 inline-block">
            ← {locale === 'fr' ? 'Retour à l’accueil' : 'Back to home'}
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">{locale === 'fr' ? 'Politique' : 'Politics'}</h1>
          <p className="text-xl text-red-100">
            {locale === 'fr'
              ? 'Analyse, institutions, diplomatie et enjeux politiques du continent et du monde'
              : 'Analysis, institutions, diplomacy and political issues across Africa and the world'}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {articles.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground">
            {locale === 'fr' ? 'Aucun article politique disponible pour le moment.' : 'No political articles available yet.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((item: any) => (
              <article
                key={item.id}
                className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {item.mainImageUrl && (
                  <Link href={`/${locale}/${item.slug}`} className="block">
                    <div className="relative h-48">
                      <img
                        src={item.mainImageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  </Link>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {item.publishedAt
                        ? new Date(item.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : ''}
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
                    {locale === 'fr' ? 'Lire la suite' : 'Read more'}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
