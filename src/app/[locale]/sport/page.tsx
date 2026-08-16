import Link from 'next/link';
import { Calendar, ArrowRight, Trophy, Circle, Activity, Flag } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function SportPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;

  // Fetch articles from sport category
  const articles = await prisma.article.findMany({
    where: {
      category: {
        slug: 'sport',
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
    { name: 'Football', href: `/${locale}/sport/football`, icon: Trophy, count: articles.filter((a: any) => a.title.toLowerCase().includes('football') || a.title.toLowerCase().includes('can')).length },
    { name: 'Basketball', href: `/${locale}/sport/basket`, icon: Circle, count: articles.filter((a: any) => a.title.toLowerCase().includes('basket') || a.title.toLowerCase().includes('nba')).length },
    { name: 'Athlétisme', href: `/${locale}/sport/athletisme`, icon: Activity, count: articles.filter((a: any) => a.title.toLowerCase().includes('athlétisme') || a.title.toLowerCase().includes('athlète')).length },
    { name: 'Événements', href: `/${locale}/sport/evenements`, icon: Flag, count: articles.filter((a: any) => a.title.toLowerCase().includes('championnat') || a.title.toLowerCase().includes('compétition')).length },
  ];

  const featuredSport = articles.slice(0, 3).map((article: any) => ({
    id: article.id,
    category: article.category?.title || 'Sport',
    categorySlug: article.category?.slug || 'sport',
    title: article.title,
    excerpt: article.excerpt,
    image: article.mainImageUrl,
    date: article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
    readTime: article.readTime || '5 min',
    slug: article.slug,
  }));

  const latestSport = articles.slice(3, 7).map((article: any) => ({
    id: article.id,
    category: article.category?.title || 'Sport',
    title: article.title,
    date: article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
    readTime: article.readTime || '5 min',
    slug: article.slug,
    categorySlug: article.category?.slug || 'sport',
  }));

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold mb-4">Sport</h1>
          <p className="text-xl text-gray-200">
            Football, basketball, athlétisme : toute l\'actualité sportive africaine
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-2xl font-bold text-[#081C3D] mb-3">Le sport en mouvement</h2>
          <p className="text-base leading-relaxed text-gray-700">
            Une lecture complète de l’actualité sportive africaine, des performances qui font la une, des grands rendez-vous et des moments de passion qui traversent les stades, les salles et les villes.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-8">
            {articles.length > 0 ? (
              <>
                <div>
                  <h2 className="font-heading text-2xl font-bold mb-6">À la une</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {featuredSport.map((item: any) => (
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
                            <span className="absolute top-4 left-4 px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
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

                <div>
                  <h2 className="font-heading text-2xl font-bold mb-6">Dernières actualités</h2>
                  <div className="space-y-4">
                    {latestSport.map((item: any) => (
                      <article
                        key={item.id}
                        className="flex gap-4 p-4 bg-card rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded mb-2">
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
