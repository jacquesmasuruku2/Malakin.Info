import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

export default function PolitiquePage() {
  const news = [
    {
      id: 1,
      title: 'Sommet de l\'Union Africaine : Les dirigeants s\'engagent pour une intégration économique renforcée',
      excerpt: 'Les chefs d\'État africains ont adopté une déclaration historique visant à faciliter les échanges commerciaux intra-africains.',
      image: 'https://images.unsplash.com/photo-1541872703-74c5963631df?w=800&h=400&fit=crop',
      date: '27 Juin 2026',
      readTime: '5 min',
    },
    {
      id: 2,
      title: 'Élections présidentielles 2026 : Le paysage politique en mutation',
      excerpt: 'Analyse des enjeux et des candidats pour les prochaines élections dans plusieurs pays africains.',
      image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=400&fit=crop',
      date: '26 Juin 2026',
      readTime: '7 min',
    },
    {
      id: 3,
      title: 'Réforme constitutionnelle : Le débat s\'intensifie',
      excerpt: 'Les partis d\'opposition et la majorité s\'affrontent sur les propositions de réforme constitutionnelle.',
      image: 'https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=800&h=400&fit=crop',
      date: '25 Juin 2026',
      readTime: '6 min',
    },
    {
      id: 4,
      title: 'Diplomatie africaine : Nouveaux partenariats stratégiques',
      excerpt: 'L\'Afrique renforce ses liens avec l\'Asie et l\'Europe dans un contexte géopolitique changeant.',
      image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=400&fit=crop',
      date: '24 Juin 2026',
      readTime: '8 min',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/actualites" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour aux actualités
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Politique</h1>
          <p className="text-xl text-gray-200">
            Toute l'actualité politique africaine et internationale
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
                <Link href={`/actualites/politique/${item.id}`}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
                  />
                </Link>
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
                  href={`/actualites/politique/${item.id}`}
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
