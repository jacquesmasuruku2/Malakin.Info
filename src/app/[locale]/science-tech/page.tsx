import Link from 'next/link';
import { Calendar, Clock, ArrowRight, Database, BarChart3, Globe } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ScienceTechPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;

  // Fetch articles from science-tech category
  const articles = await prisma.article.findMany({
    where: {
      category: {
        slug: 'science-tech',
      },
    },
    include: {
      category: true,
      author: true,
    },
    orderBy: {
      publishedAt: 'desc',
    },
    take: 12,
  } as any);

  // Subcategories with their counts (these would be subcategories or tags in a real implementation)
  const categories = [
    { name: 'Base de Données', href: `/${locale}/science-tech/base-de-donnees`, icon: Database, count: articles.filter((a: any) => a.title.toLowerCase().includes('base') || a.title.toLowerCase().includes('donnée')).length },
    { name: 'Analyse de Données', href: `/${locale}/science-tech/analyse-de-donnees`, icon: BarChart3, count: articles.filter((a: any) => a.title.toLowerCase().includes('analyse') || a.title.toLowerCase().includes('data')).length },
    { name: 'Nature & Environnement', href: `/${locale}/science-tech/nature-environnement`, icon: Globe, count: articles.filter((a: any) => a.title.toLowerCase().includes('nature') || a.title.toLowerCase().includes('environnement')).length },
  ];

  const featured = articles.slice(0, 3).map((article: any) => ({
    id: article.id,
    category: article.category?.title || 'Science & Tech',
    categorySlug: article.category?.slug || 'science-tech',
    title: article.title,
    excerpt: article.excerpt,
    image: article.mainImageUrl,
    date: article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
    readTime: article.readTime || '10 min',
    slug: article.slug,
  }));

  const latest = articles.slice(3, 6).map((article: any) => ({
    id: article.id,
    category: article.category?.title || 'Science & Tech',
    title: article.title,
    excerpt: article.excerpt,
    date: article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
    readTime: article.readTime || '10 min',
    slug: article.slug,
    categorySlug: article.category?.slug || 'science-tech',
  }));

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold mb-4">Science & Tech</h1>
          <p className="text-xl text-gray-200">
            Base de données, analyse de données et environnement
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-2xl font-bold text-[#081C3D] mb-3">Science & technologie au service de demain</h2>
          <p className="text-base leading-relaxed text-gray-700">
            Des innovations, des données, des solutions environnementales et des avancées qui façonnent le futur numérique et technologique du continent.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-8">
            {articles.length > 0 ? (
              <>
                <div>
                  <h2 className="font-heading text-2xl font-bold mb-6">À la une</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {featured.map((item: any) => (
                      <article
                        key={item.id}
                        className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        {item.image && (
                          <Link href={`/${locale}/${item.slug}`} className="block">
                            <div className="relative h-48">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                              />
                              <div className="absolute top-4 left-4 px-3 py-1 bg-primary/90 text-white text-xs font-medium rounded">
                                {item.category}
                              </div>
                            </div>
                          </Link>
                        )}
                        <div className="p-6">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {item.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {item.readTime}
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

                <div>
                  <h2 className="font-heading text-2xl font-bold mb-6">Derniers articles</h2>
                  <div className="space-y-4">
                    {latest.map((item: any) => (
                      <article
                        key={item.id}
                        className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-primary"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                            {item.category}
                          </span>
                        </div>
                        <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground line-clamp-2 mb-4">
                          {item.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {item.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {item.readTime}
                            </span>
                          </div>
                          <Link
                            href={`/${locale}/${item.slug}`}
                            className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
                          >
                            Lire
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-card rounded-lg p-12 text-center">
                <p className="text-muted-foreground text-lg">Aucun article disponible pour le moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
