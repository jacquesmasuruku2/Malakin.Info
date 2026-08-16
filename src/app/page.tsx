import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ArrowRight, Calendar, Clock, TrendingUp } from 'lucide-react';
import NewsletterSignupInline from '@/components/NewsletterSignupInline';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let featuredArticles: any[] = [];
  let latestArticles: any[] = [];
  let currentLive: any = null;
  let activeRadio: any = null;

  try {
    featuredArticles = await prisma.article.findMany({
      where: {
        featured: true,
      },
      include: {
        category: true,
        author: true,
      },
      take: 3,
      orderBy: {
        publishedAt: 'desc',
      },
    });

    latestArticles = await prisma.article.findMany({
      include: {
        category: true,
        author: true,
      },
      take: 6,
      orderBy: {
        publishedAt: 'desc',
      },
    });

    const now = new Date();
    currentLive = await prisma.liveEvent.findFirst({
      where: {
        streamType: 'VIDEO',
        startTime: { lte: now },
        OR: [
          { endTime: null },
          { endTime: { gte: now } }
        ]
      },
      orderBy: { startTime: 'desc' }
    });

    activeRadio = await prisma.radioStation.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Database connection error:', error);
  }

  const featuredNews = featuredArticles.map(article => ({
    id: article.id,
    category: article.category.title,
    title: article.title,
    excerpt: article.excerpt,
    image: article.mainImageUrl || 'https://images.unsplash.com/photo-1541872703-74c5963631df?w=800&h=400&fit=crop',
    date: article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
    readTime: article.readTime ? `${article.readTime} min` : '5 min',
  }));

  const latestNews = latestArticles.map(article => ({
    id: article.id,
    category: article.category.title,
    title: article.title,
    date: article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
    readTime: article.readTime ? `${article.readTime} min` : '3 min',
    image: article.mainImageUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=300&fit=crop',
  }));

  const categories = [
    { name: 'Politique', href: '/actualites/politique', color: 'bg-red-500' },
    { name: 'Économie', href: '/actualites/economie', color: 'bg-blue-500' },
    { name: 'Société', href: '/actualites/societe', color: 'bg-green-500' },
    { name: 'Santé', href: '/actualites/sante', color: 'bg-purple-500' },
    { name: 'Sport', href: '/sport', color: 'bg-orange-500' },
    { name: 'Culture', href: '/culture', color: 'bg-pink-500' },
  ];

  const liveBanner = currentLive ? {
    label: '🔴 EN DIRECT',
    title: currentLive.title,
    text: 'Regarder maintenant',
    href: `/medias/live/${currentLive.id}`,
  } : activeRadio ? {
    label: '📻 RADIO EN DIRECT',
    title: activeRadio.name || 'Radio Okapi',
    text: activeRadio.description || 'La voix de la paix',
    href: '/#radio',
  } : null;

  return (
    <div className="flex flex-col">
      {liveBanner && (
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href={liveBanner.href} className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-white text-red-600 text-sm font-bold rounded-full animate-pulse">
                  {liveBanner.label}
                </span>
                <span className="font-semibold">{liveBanner.title}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span>{liveBanner.text}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              L'info qui traverse les frontières
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Informer, éduquer et connecter l'Afrique à travers un journalisme indépendant, fiable et multiculturel.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/actualites"
                className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Découvrir l'actualité
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/a-propos"
                className="inline-flex items-center px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium"
              >
                En savoir plus
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured News */}
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-3xl font-bold text-foreground">
              À la une
            </h2>
            <Link
              href="/actualites"
              className="flex items-center text-primary hover:text-primary/80 font-medium"
            >
              Voir tout
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredNews.map((news) => (
              <article
                key={news.id}
                className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative h-48">
                  <img
                    src={news.image}
                    alt={news.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-4 left-4 px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
                    {news.category}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {news.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {news.readTime}
                    </span>
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-2 line-clamp-2">
                    {news.title}
                  </h3>
                  <p className="text-muted-foreground line-clamp-2 mb-4">
                    {news.excerpt}
                  </p>
                  <Link
                    href={`/actualites/${news.id}`}
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
      </section>

      {/* Categories */}
      <section className="py-12 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-foreground mb-8">
            Explorez par catégorie
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group"
              >
                <div className={`${category.color} rounded-lg p-6 text-center text-white hover:opacity-90 transition-opacity`}>
                  <h3 className="font-heading font-semibold text-lg">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-3xl font-bold text-foreground">
              Dernières actualités
            </h2>
            <Link
              href="/actualites"
              className="flex items-center text-primary hover:text-primary/80 font-medium"
            >
              Voir tout
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {latestNews.map((news) => (
              <article
                key={news.id}
                className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-card rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-24 h-20 sm:w-28 sm:h-24 flex-shrink-0 overflow-hidden rounded-lg">
                  <img
                    src={news.image}
                    alt={news.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-[10px] sm:text-xs font-medium rounded mb-1.5 sm:mb-2">
                    {news.category}
                  </span>
                  <h3 className="font-heading font-semibold text-foreground text-sm sm:text-base mb-1.5 sm:mb-2 line-clamp-3 leading-snug">
                    {news.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-4 text-[10px] sm:text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      {news.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      {news.readTime}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-secondary py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <NewsletterSignupInline
            locale="fr"
            title="Restez informé"
            subtitle="Abonnez-vous à notre newsletter pour recevoir les dernières actualités directement dans votre boîte mail."
            buttonText="S'abonner"
          />
        </div>
      </section>
    </div>
  );
}
