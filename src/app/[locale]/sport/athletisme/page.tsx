import Link from 'next/link';
import { Calendar, Clock, ArrowRight, Activity } from 'lucide-react';

export default function AthletismePage() {
  const articles = [
    {
      id: 1,
      title: 'Championnats d\'Afrique : Les records tombent',
      excerpt: 'Les athlètes africains réalisent des performances exceptionnelles lors des championnats.',
      image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=400&fit=crop',
      date: '26 Juin 2026',
      readTime: '5 min',
    },
    {
      id: 2,
      title: 'Jeux Olympiques : L\'Afrique en force',
      excerpt: 'Préparation des athlètes africains pour les prochains Jeux Olympiques.',
      image: 'https://images.unsplash.com/photo-1461896836934- voices-athletics?w=800&h=400&fit=crop',
      date: '25 Juin 2026',
      readTime: '6 min',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/sport" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour à Sport
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Athlétisme</h1>
          <p className="text-xl text-gray-200">
            Actualité athlétique africaine et internationale
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative h-48">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-primary/90 text-white text-xs font-medium rounded-full flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Athlétisme
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {article.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {article.readTime}
                  </span>
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-muted-foreground line-clamp-2 mb-4">
                  {article.excerpt}
                </p>
                <Link
                  href={`/sport/athletisme/${article.id}`}
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
