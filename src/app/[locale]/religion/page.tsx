import Link from 'next/link';
import { Calendar, ArrowRight, BookOpen, Music, Calendar as CalendarIcon, Heart } from 'lucide-react';
import { prisma } from '@/lib/prisma';

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

export default async function ReligionPage() {
  const articles = await getReligionArticles();

  const categories = [
    { name: 'Méditations', href: '/religion/meditations', icon: BookOpen, count: articles.filter((a: any) => a.category.slug === 'meditations').length || 56 },
    { name: 'Homélies', href: '/religion/homelies', icon: Heart, count: articles.filter((a: any) => a.category.slug === 'homelies').length || 89 },
    { name: 'Musiques Sacrées', href: '/religion/musiques-sacrees', icon: Music, count: articles.filter((a: any) => a.category.slug === 'musiques-sacrees').length || 34 },
    { name: 'Agenda Religieux', href: '/religion/agenda-religieux', icon: CalendarIcon, count: 23 },
  ];

  const messageDuTemps = [
    { name: 'William Branham', href: '/religion/message-du-temps/branham', count: 145 },
    { name: 'Les 7 Âges de l\'Église', href: '/religion/message-du-temps/les-7-ages-de-l-eglise', count: 7 },
    { name: 'Autres Messages', href: '/religion/message-du-temps/autres-messages', count: 67 },
  ];

  const featuredContent = articles.slice(0, 6).map((article: any) => ({
    id: article.id,
    category: article.category.title,
    title: article.title,
    excerpt: article.excerpt,
    image: article.mainImageUrl || 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&h=400&fit=crop',
    date: new Date(article.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
    readTime: article.readTime || '5 min',
    slug: article.slug,
  }));

  const upcomingEvents = [
    {
      id: 1,
      title: 'Messe spéciale Fête Nationale',
      date: '30 Juin 2026',
      location: 'Cathédrale Notre-Dame, Kinshasa',
      time: '10:00',
    },
    {
      id: 2,
      title: 'Conférence sur la vie spirituelle',
      date: '5 Juillet 2026',
      location: 'Centre Paroissial Saint-Pierre',
      time: '15:00',
    },
    {
      id: 3,
      title: 'Concert de musique sacrée',
      date: '10 Juillet 2026',
      location: 'Église Sainte-Anne',
      time: '18:00',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold mb-4">Religion</h1>
          <p className="text-xl text-gray-200">
            Méditations, homélies, musiques sacrées et agenda religieux pour nourrir votre foi
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-2xl font-bold text-[#081C3D] mb-3">Une foi, des enseignements et des paroles</h2>
          <p className="text-base leading-relaxed text-gray-700">
            Une lecture inspirante des sujets spirituels, des homélies, des méditations et des réflexions qui accompagnent la vie de foi et la réflexion sur le sens de l’existence.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-8">
            <div>
              <h2 className="font-heading text-2xl font-bold mb-6">À la une</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredContent.map((content: any) => (
                  <article
                    key={content.id}
                    className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-48">
                      <Link href={`/${content.slug}`}>
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
                        href={`/${content.slug}`}
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
          </div>
        </div>
      </div>
    </div>
  );
}
