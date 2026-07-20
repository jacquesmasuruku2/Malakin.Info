import Link from 'next/link';
import { Calendar, ArrowRight, Trophy, Circle, Activity, Flag } from 'lucide-react';

export default function SportPage() {
  const categories = [
    { name: 'Football', href: '/sport/football', icon: Trophy, count: 89 },
    { name: 'Basketball', href: '/sport/basket', icon: Circle, count: 34 },
    { name: 'Athlétisme', href: '/sport/athletisme', icon: Activity, count: 28 },
    { name: 'Événements', href: '/sport/evenements', icon: Flag, count: 45 },
  ];

  const featuredSport = [
    {
      id: 1,
      category: 'Football',
      title: 'CAN 2027 : La RDC finalise ses préparatifs pour accueillir la compétition',
      excerpt: 'Les stades sont prêts, les infrastructures sont en place : la RDC est prête pour la Coupe d\'Afrique des Nations.',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=400&fit=crop',
      date: '27 Juin 2026',
      readTime: '7 min',
    },
    {
      id: 2,
      category: 'Basketball',
      title: 'BAL : Les équipes africaines brillent en championnat',
      excerpt: 'La Basketball Africa League continue de révéler des talents et de populariser le sport sur le continent.',
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=400&fit=crop',
      date: '26 Juin 2026',
      readTime: '5 min',
    },
    {
      id: 3,
      category: 'Athlétisme',
      title: 'Championnats d\'Afrique : Les records tombent à Casablanca',
      excerpt: 'Les athlètes africains établissent de nouveaux records lors des championnats continentaux.',
      image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=400&fit=crop',
      date: '25 Juin 2026',
      readTime: '6 min',
    },
  ];

  const latestSport = [
    {
      id: 4,
      category: 'Football',
      title: 'Ligue des Champions : Le club congolais se qualifie pour les quarts',
      date: '27 Juin 2026',
      readTime: '4 min',
    },
    {
      id: 5,
      category: 'Athlétisme',
      title: 'Jeux Olympiques : L\'Afrique envoie sa plus grande délégation',
      date: '26 Juin 2026',
      readTime: '5 min',
    },
    {
      id: 6,
      category: 'Basketball',
      title: 'Draft NBA : Un joueur sénégalais sélectionné en premier tour',
      date: '26 Juin 2026',
      readTime: '3 min',
    },
    {
      id: 7,
      category: 'Événements',
      title: 'Marathon de Kinshasa : Inscriptions ouvertes pour l\'édition 2026',
      date: '25 Juin 2026',
      readTime: '4 min',
    },
  ];

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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-card rounded-lg p-6 sticky top-24">
              <h2 className="font-heading text-xl font-bold mb-4">Disciplines</h2>
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
            <div>
              <h2 className="font-heading text-2xl font-bold mb-6">À la une</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredSport.map((item) => (
                  <article
                    key={item.id}
                    className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
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
                        href={`/sport/${item.id}`}
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
                {latestSport.map((item) => (
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
          </div>
        </div>
      </div>
    </div>
  );
}
