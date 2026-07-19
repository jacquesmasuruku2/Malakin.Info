import Link from 'next/link';
import { Calendar, ArrowRight, BookOpen, Music, Calendar as CalendarIcon, Heart } from 'lucide-react';

export default function ReligionPage() {
  const categories = [
    { name: 'Méditations', href: '/religion/meditations', icon: BookOpen, count: 56 },
    { name: 'Homélies', href: '/religion/homelies', icon: Heart, count: 89 },
    { name: 'Musiques Sacrées', href: '/religion/musiques-sacrees', icon: Music, count: 34 },
    { name: 'Agenda Religieux', href: '/religion/agenda-religieux', icon: CalendarIcon, count: 23 },
  ];

  const messageDuTemps = [
    { name: 'William Branham', href: '/religion/message-du-temps/branham', count: 145 },
    { name: 'Autres Messages', href: '/religion/message-du-temps/autres-messages', count: 67 },
  ];

  const featuredContent = [
    {
      id: 1,
      category: 'Homélie',
      title: 'L\'importance de la prière dans la vie quotidienne',
      excerpt: 'Réflexion sur le rôle central de la prière pour nourrir notre foi et notre relation avec Dieu.',
      image: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&h=400&fit=crop',
      date: '27 Juin 2026',
      readTime: '8 min',
    },
    {
      id: 2,
      category: 'Méditation',
      title: 'Méditation du jour : La paix intérieure',
      excerpt: 'Un moment de calme et de réflexion pour trouver la paix au milieu des tumultes de la vie.',
      image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&h=400&fit=crop',
      date: '27 Juin 2026',
      readTime: '5 min',
    },
    {
      id: 3,
      category: 'Musique Sacrée',
      title: 'Chorale gospel : Nouvel album enregistré à Kinshasa',
      excerpt: 'La chorale de la cathédrale présente son nouvel album de chants sacrés traditionnels.',
      image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=400&fit=crop',
      date: '26 Juin 2026',
      readTime: '4 min',
    },
  ];

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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-card rounded-lg p-6 sticky top-24">
              <h2 className="font-heading text-xl font-bold mb-4">Rubriques</h2>
              <ul className="space-y-2">
                {categories.map((category) => {
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
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="bg-card rounded-lg p-6">
              <h2 className="font-heading text-xl font-bold mb-4">Message du Temps</h2>
              <ul className="space-y-2">
                {messageDuTemps.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {item.count}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="lg:col-span-3 space-y-8">
            <div>
              <h2 className="font-heading text-2xl font-bold mb-6">À la une</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredContent.map((content) => (
                  <article
                    key={content.id}
                    className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-48">
                      <img
                        src={content.image}
                        alt={content.title}
                        className="w-full h-full object-cover"
                      />
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
                        href={`/religion/${content.id}`}
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
