import Link from 'next/link';
import { Calendar, ArrowRight, Music, Film, Palette, TrendingUp } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function CulturePage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;

  // Fetch articles from culture category
  const articles = await prisma.article.findMany({
    where: {
      category: {
        slug: 'culture',
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

  // Subcategories with their counts (based on article titles)
  const categories = [
    { name: 'Musique', href: `/${locale}/culture/musique`, icon: Music, count: articles.filter((a: any) => a.title.toLowerCase().includes('musique') || a.title.toLowerCase().includes('musique')).length },
    { name: 'Cinéma', href: `/${locale}/culture/cinema`, icon: Film, count: articles.filter((a: any) => a.title.toLowerCase().includes('cinéma') || a.title.toLowerCase().includes('film')).length },
    { name: 'Arts', href: `/${locale}/culture/arts`, icon: Palette, count: articles.filter((a: any) => a.title.toLowerCase().includes('art') || a.title.toLowerCase().includes('exposition')).length },
    { name: 'Tendances', href: `/${locale}/culture/tendances`, icon: TrendingUp, count: articles.filter((a: any) => a.title.toLowerCase().includes('tendance') || a.title.toLowerCase().includes('mode')).length },
  ];

  const featuredCulture = articles.slice(0, 3).map((article: any) => ({
    id: article.id,
    category: article.category?.title || 'Culture',
    categorySlug: article.category?.slug || 'culture',
    title: article.title,
    excerpt: article.excerpt,
    image: article.mainImageUrl,
    date: article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
    readTime: article.readTime || '5 min',
    slug: article.slug,
  }));

  const latestCulture = articles.slice(3, 7).map((article: any) => ({
    id: article.id,
    category: article.category?.title || 'Culture',
    title: article.title,
    date: article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
    readTime: article.readTime || '5 min',
    slug: article.slug,
    categorySlug: article.category?.slug || 'culture',
  }));

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold mb-4">Culture</h1>
          <p className="text-xl text-gray-200">
            Musique, cinéma, arts et tendances : la richesse culturelle africaine à l'honneur
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-card rounded-lg p-6 sticky top-24">
              <h2 className="font-heading text-xl font-bold mb-4">Catégories</h2>
              <ul className="space-y-0">
                {categories.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <li key={category.name}>
                      <Link
                        href={category.href}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-primary" />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
                          {category.count}
                        </span>
                      </Link>
                      {index < categories.length - 1 && (
                        <div className="h-px bg-border my-2"></div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          <div className="lg:col-span-3 space-y-8">
            {articles.length > 0 ? (
              <>
                <div>
                  <h2 className="font-heading text-2xl font-bold mb-6">À la une</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {featuredCulture.map((item: any) => (
                      <article
                        key={item.id}
                        className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        {item.image && (
                          <div className="relative h-48">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-4 left-4 px-3 py-1 bg-accent text-white text-xs font-medium rounded-full">
                              {item.category}
                            </span>
                          </div>
                        )}
                        <div className="p-6">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {item.date}
                            </span>
                            <span>{item.readTime}</span>
                          </div>
                          <h3 className="font-heading text-xl font-semibold text-foreground mb-2 line-clamp-2">
                            {item.title}
                          </h3>
                          <p className="text-muted-foreground line-clamp-2 mb-4">
                            {item.excerpt}
                          </p>
                          <Link
                            href={`/${locale}/actualites/${item.categorySlug}/${item.slug}`}
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

                <div>
                  <h2 className="font-heading text-2xl font-bold mb-6">Dernières actualités</h2>
                  <div className="space-y-4">
                    {latestCulture.map((item: any) => (
                      <article
                        key={item.id}
                        className="flex gap-4 p-4 bg-card rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <span className="inline-block px-2 py-1 bg-accent/10 text-accent text-xs font-medium rounded mb-2">
                            {item.category}
                          </span>
                          <h3 className="font-heading font-semibold text-foreground mb-2 line-clamp-2">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {item.date}
                            </span>
                            <span>{item.readTime}</span>
                          </div>
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
