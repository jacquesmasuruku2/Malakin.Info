import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { applyArticleLocales } from '@/lib/translation';
import { getDateLocale, pickCopy, t } from '@/lib/copy';
import { getMessages } from '@/lib/i18n';

async function getReligionArticles() {
  try {
    // Récupérer les articles de la catégorie religion ou avec des mots-clés religieux
    const religionArticles = await prisma.article.findMany({
      where: {
        OR: [
          { category: { slug: 'religion' } },
          { category: { slug: 'message-du-temps' } },
          { category: { slug: 'homelies' } },
          { category: { slug: 'meditations' } },
          { category: { slug: 'musiques-sacrees' } },
        ],
      },
      include: {
        category: true,
        author: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 20,
    } as any);

    return religionArticles;
  } catch (error) {
    console.error('Error fetching religion articles:', error);
    return [];
  }
}

export default async function ReligionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const messages = getMessages(locale);
  let articles = await getReligionArticles();
  articles = await applyArticleLocales(articles, locale);

  const featuredContent = articles.slice(0, 6).map((article: any) => ({
    id: article.id,
    category: article.category?.title || messages.nav.religion,
    title: article.title,
    excerpt: article.excerpt,
    image: article.mainImageUrl || 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&h=400&fit=crop',
    date: new Date(article.publishedAt).toLocaleDateString(getDateLocale(locale), { day: 'numeric', month: 'long', year: 'numeric' }),
    readTime: article.readTime || '5 min',
    slug: article.slug,
  }));

  const upcomingEvents: Array<{ id: string; title: string; date: string; location: string; time: string }> = [];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold mb-4">{messages.nav.religion}</h1>
          <p className="text-xl text-gray-200">
            {pickCopy(locale, {
              fr: 'Méditations, homélies, musiques sacrées et agenda religieux pour nourrir votre foi',
              en: 'Meditations, homilies, sacred music and a religious calendar to nourish your faith',
              es: 'Meditaciones, homilías, músicas sagradas y agenda religiosa para alimentar la fe',
              sw: 'Tafakari, mahubiri, muziki mtakatifu na kalenda ya kidini',
              ln: 'Ba méditation, ba homélie, ba musique sacrée mpe agenda religieux',
              rw: 'Ibitaro, ubuhamya, umuziki wera n’ ingengabihe y’idini',
            })}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-8">
            <div>
              <h2 className="font-heading text-2xl font-bold mb-6 text-foreground">{t(locale, 'featured')}</h2>
              {featuredContent.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border bg-card p-8 text-muted-foreground">
                  {t(locale, 'noArticles')}
                </p>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredContent.map((content: any) => (
                  <article
                    key={content.id}
                    className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-48">
                      <Link href={`/${locale}/${content.slug}`}>
                        <img
                          src={content.image}
                          alt={content.title}
                          className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
                        />
                      </Link>
                      <span className="absolute top-4 left-4 px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
                        {content.category}
                      </span>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {content.date}
                        </span>
                        <span>{content.readTime}</span>
                      </div>
                      <h3 className="font-heading text-xl font-semibold text-foreground mb-2 line-clamp-2">
                        {content.title}
                      </h3>
                      <p className="text-muted-foreground line-clamp-2 mb-4">
                        {content.excerpt}
                      </p>
                      <Link
                        href={`/${locale}/${content.slug}`}
                        className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
                      >
                        {t(locale, 'read')}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
              )}
            </div>

            {upcomingEvents.length > 0 && (
            <div>
              <h2 className="font-heading text-2xl font-bold mb-6">Événements à venir</h2>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <article
                    key={event.id}
                    className="flex items-center gap-4 p-4 bg-card rounded-lg hover:bg-muted/50 transition-colors border-l-4 border-accent"
                  >
                    <div className="w-16 h-16 bg-accent/10 rounded-lg flex flex-col items-center justify-center">
                      <span className="text-xs text-accent font-medium">
                        {event.date.split(' ')[0]}
                      </span>
                      <span className="text-lg font-bold text-accent">
                        {event.date.split(' ')[1].slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading font-semibold text-foreground mb-1">
                        {event.title}
                      </h3>
                      <div className="text-sm text-muted-foreground">
                        <p>{event.location}</p>
                        <p>{event.time}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
