import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { applyArticleLocales } from '@/lib/translation';
import { getDateLocale, pickCopy, t } from '@/lib/copy';
import { getMessages } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function SportPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  const messages = getMessages(locale);

  let articles: any[] = await prisma.article.findMany({
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

  articles = await applyArticleLocales(articles, locale);

  const featuredSport = articles.slice(0, 3).map((article: any) => ({
    id: article.id,
    category: article.category?.title || messages.nav.sport,
    categorySlug: article.category?.slug || 'sport',
    title: article.title,
    excerpt: article.excerpt,
    image: article.mainImageUrl,
    date: article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(getDateLocale(locale), { day: 'numeric', month: 'long', year: 'numeric' }) : '',
    readTime: article.readTime || '5 min',
    slug: article.slug,
  }));

  const latestSport = articles.slice(3, 7).map((article: any) => ({
    id: article.id,
    category: article.category?.title || messages.nav.sport,
    title: article.title,
    date: article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(getDateLocale(locale), { day: 'numeric', month: 'long', year: 'numeric' }) : '',
    readTime: article.readTime || '5 min',
    slug: article.slug,
    categorySlug: article.category?.slug || 'sport',
  }));

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold mb-4">{messages.nav.sport}</h1>
          <p className="text-xl text-gray-200">
            {pickCopy(locale, {
              fr: "Football, basketball, athlétisme : toute l'actualité sportive africaine",
              en: 'Football, basketball, athletics: all African sports news',
              es: 'Fútbol, baloncesto, atletismo: toda la actualidad deportiva africana',
              sw: 'Soka, mpira wa kikapu, riadha: habari zote za michezo ya Afrika',
              ln: 'Football, basketball, athlétisme: sango nionso ya sport ya Afrique',
              rw: 'Umupira w’amaguru, umupira w’amaboko, imikino y’imigenderanire: amakuru yose y’imikino y’Afurika',
            })}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-8">
            {articles.length > 0 ? (
              <>
                <div>
                  <h2 className="font-heading text-2xl font-bold mb-6 text-foreground">{t(locale, 'featured')}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {featuredSport.map((item: any) => (
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
                              <span className="absolute top-4 left-4 px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
                                {item.category}
                              </span>
                            </div>
                          </Link>
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
                            {t(locale, 'read')}
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="font-heading text-2xl font-bold mb-6 text-foreground">{t(locale, 'latestNews')}</h2>
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
                <p className="text-muted-foreground text-lg">{t(locale, 'noArticles')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
