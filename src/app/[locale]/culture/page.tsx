import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { applyArticleLocales } from '@/lib/translation';
import { getDateLocale, pickCopy, t } from '@/lib/copy';
import { getMessages } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function CulturePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = getMessages(locale);

  let articles: any[] = await prisma.article.findMany({
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

  articles = await applyArticleLocales(articles, locale);

  const featuredCulture = articles.slice(0, 3).map((article: any) => ({
    id: article.id,
    category: article.category?.title || messages.nav.culture,
    title: article.title,
    excerpt: article.excerpt,
    image: article.mainImageUrl,
    date: article.publishedAt
      ? new Date(article.publishedAt).toLocaleDateString(getDateLocale(locale), {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '',
    readTime: article.readTime || '5 min',
    slug: article.slug,
  }));

  const latestCulture = articles.slice(3, 7).map((article: any) => ({
    id: article.id,
    category: article.category?.title || messages.nav.culture,
    title: article.title,
    date: article.publishedAt
      ? new Date(article.publishedAt).toLocaleDateString(getDateLocale(locale), {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '',
    readTime: article.readTime || '5 min',
    slug: article.slug,
  }));

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold mb-4">{messages.nav.culture}</h1>
          <p className="text-xl text-gray-200">
            {pickCopy(locale, {
              fr: "Musique, cinéma, arts et tendances : la richesse culturelle africaine à l'honneur",
              en: 'Music, cinema, arts and trends: African cultural richness in the spotlight',
              es: 'Música, cine, artes y tendencias: la riqueza cultural africana en primer plano',
              sw: 'Muziki, sinema, sanaa na mitindo: utajiri wa kitamaduni wa Afrika',
              ln: 'Miziki, cinéma, ba arts mpe ba tendances: bokolisi ya culture ya Afrique',
              rw: 'Umuziki, filime, ubuhanzi n’imihango: ubukire bw’umuco w’Afurika',
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
                  <h2 className="font-heading text-2xl font-black uppercase tracking-[0.08em] text-foreground mb-6">
                    {t(locale, 'featured')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {featuredCulture.map((item: any) => (
                      <article
                        key={item.id}
                        className="group overflow-hidden border border-border bg-card text-card-foreground transition-all duration-200 hover:-translate-y-1 hover:border-secondary"
                      >
                        {item.image && (
                          <Link href={`/${locale}/${item.slug}`} className="block">
                            <div className="relative h-52 overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              <span className="absolute bottom-3 left-3 inline-flex items-center bg-foreground px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-background">
                                {item.category}
                              </span>
                            </div>
                          </Link>
                        )}
                        <div className="p-5">
                          <div className="mb-3 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            <span>{item.date}</span>
                            <span className="text-secondary">•</span>
                            <span>{item.readTime}</span>
                          </div>
                          <h3 className="font-heading text-[1.5rem] font-black leading-tight tracking-[-0.03em] text-foreground transition-colors group-hover:text-secondary line-clamp-3">
                            {item.title}
                          </h3>
                          <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                            {item.excerpt}
                          </p>
                          <Link
                            href={`/${locale}/${item.slug}`}
                            className="mt-4 inline-flex items-center text-[11px] font-bold uppercase tracking-[0.14em] text-foreground transition-colors hover:text-secondary"
                          >
                            {t(locale, 'read')}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="font-heading text-2xl font-bold mb-6 text-foreground">{t(locale, 'latestNews')}</h2>
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
                <p className="text-muted-foreground text-lg">{t(locale, 'noArticles')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
