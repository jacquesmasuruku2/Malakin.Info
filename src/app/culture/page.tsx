import Link from 'next/link';
import { Calendar, ArrowRight, Music, Film, Palette, TrendingUp } from 'lucide-react';

export default function CulturePage() {
  const categories = [
    { name: 'Musique', href: '/culture/musique', icon: Music, count: 78 },
    { name: 'Cinéma', href: '/culture/cinema', icon: Film, count: 45 },
    { name: 'Arts', href: '/culture/arts', icon: Palette, count: 56 },
    { name: 'Tendances', href: '/culture/tendances', icon: TrendingUp, count: 34 },
  ];

  const featuredCulture = [
    {
      id: 1,
      category: 'Musique',
      title: 'Festival de musique africaine : Les étoiles montantes du continent',
      excerpt: 'Découverte des nouveaux talents qui réinventent la musique africaine et la propagent sur la scène internationale.',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
      date: '27 Juin 2026',
      readTime: '6 min',
    },
    {
      id: 2,
      category: 'Cinéma',
      title: 'Nollywood : L\'industrie cinématographique africaine en pleine expansion',
      excerpt: 'Analyse de la croissance spectaculaire du cinéma nigérian et son influence sur le continent.',
      image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=400&fit=crop',
      date: '26 Juin 2026',
      readTime: '8 min',
    },
    {
      id: 3,
      category: 'Arts',
      title: 'Exposition : Les artistes contemporains de Kinshasa',
      excerpt: 'Une rétrospective des œuvres des artistes qui redéfinissent l\'art africain moderne.',
      image: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800&h=400&fit=crop',
      date: '25 Juin 2026',
      readTime: '5 min',
    },
  ];

  const latestCulture = [
    {
      id: 4,
      category: 'Tendances',
      title: 'La mode africaine s\'invite aux défilés parisiens',
      date: '27 Juin 2026',
      readTime: '4 min',
    },
    {
      id: 5,
      category: 'Musique',
      title: 'Album : Le nouveau disque de l\'artiste congolais fait sensation',
      date: '26 Juin 2026',
      readTime: '3 min',
    },
    {
      id: 6,
      category: 'Cinéma',
      title: 'Sélection officielle : Trois films africains au festival de Cannes',
      date: '26 Juin 2026',
      readTime: '5 min',
    },
    {
      id: 7,
      category: 'Arts',
      title: 'Street art : Les fresques qui transforment les villes africaines',
      date: '25 Juin 2026',
      readTime: '4 min',
    },
  ];

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
            <div>
              <h2 className="font-heading text-2xl font-bold mb-6">À la une</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredCulture.map((item) => (
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
                      <span className="absolute top-4 left-4 px-3 py-1 bg-accent text-white text-xs font-medium rounded-full">
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
                        href={`/culture/${item.id}`}
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
                {latestCulture.map((item) => (
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
          </div>
        </div>
      </div>
    </div>
  );
}
