import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

export default function SocietePage() {
  const news = [
    {
      id: 1,
      title: 'Festival de cinéma africain : Les talents locaux à l\'honneur',
      excerpt: 'Le festival met en lumière les créateurs africains et leur contribution à l\'industrie cinématographique mondiale.',
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=400&fit=crop',
      date: '27 Juin 2026',
      readTime: '3 min',
    },
    {
      id: 2,
      title: 'Éducation : Nouveau programme numérique dans les écoles',
      excerpt: 'Le ministère de l\'éducation lance un programme ambitieux pour digitaliser l\'enseignement primaire et secondaire.',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop',
      date: '26 Juin 2026',
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
          <h1 className="font-heading text-4xl font-bold mb-4">Société</h1>
          <p className="text-xl text-gray-200">
            Actualité sociale, éducation et vie quotidienne
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
                  href={`/actualites/societe/${item.id}`}
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
