import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

export default function EconomiePage() {
  const news = [
    {
      id: 1,
      title: 'Le secteur technologique africain attire 2 milliards de dollars d\'investissements',
      excerpt: 'Les startups africaines continuent de séduire les investisseurs internationaux malgré le contexte économique mondial.',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=400&fit=crop',
      date: '26 Juin 2026',
      readTime: '4 min',
    },
    {
      id: 2,
      title: 'Zone de libre-échange continentale : Premier bilan positif',
      excerpt: 'Un an après sa mise en œuvre, la ZLECAf montre déjà des résultats encourageants pour le commerce intra-africain.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
      date: '25 Juin 2026',
      readTime: '6 min',
    },
    {
      id: 3,
      title: 'Finance verte : L\'Afrique s\'engage pour un développement durable',
      excerpt: 'Les banques africaines augmentent leurs investissements dans les projets écologiques et durables.',
      image: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=400&fit=crop',
      date: '24 Juin 2026',
      readTime: '5 min',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/actualites" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour aux actualités
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Économie</h1>
          <p className="text-xl text-gray-200">
            Actualité économique, finance et business en Afrique
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {news.map((item) => (
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
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {item.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {item.readTime}
                  </span>
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2 line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground line-clamp-2 mb-4">
                  {item.excerpt}
                </p>
                <Link
                  href={`/actualites/economie/${item.id}`}
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
    </div>
  );
}
