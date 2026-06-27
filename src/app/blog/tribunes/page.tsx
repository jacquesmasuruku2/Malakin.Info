import Link from 'next/link';
import { Calendar, Clock, ArrowRight, PenTool } from 'lucide-react';

export default function TribunesPage() {
  const articles = [
    {
      id: 1,
      author: 'Jean Dupont',
      title: 'L\'avenir du journalisme en Afrique à l\'ère numérique',
      excerpt: 'Analyse des défis et des opportunités pour la presse africaine face à la transformation numérique.',
      date: '27 Juin 2026',
      readTime: '8 min',
    },
    {
      id: 2,
      author: 'Marie Koffi',
      title: 'La démocratie en Afrique : Entre espoirs et défis',
      excerpt: 'Réflexion sur l\'état de la démocratie dans les pays africains et les perspectives d\'avenir.',
      date: '26 Juin 2026',
      readTime: '10 min',
    },
    {
      id: 3,
      author: 'Ahmed Benali',
      title: 'L\'intégration régionale : Un impératif pour l\'Afrique',
      excerpt: 'Pourquoi l\'intégration économique et politique est cruciale pour le développement du continent.',
      date: '25 Juin 2026',
      readTime: '12 min',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/blog" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour au Blog
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Tribunes</h1>
          <p className="text-xl text-gray-200">
            Opinions et analyses de nos experts
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-primary"
            >
              <div className="flex items-center gap-2 mb-3">
                <PenTool className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">Par {article.author}</span>
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                {article.title}
              </h3>
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {article.excerpt}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {article.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {article.readTime}
                </span>
              </div>
              <Link
                href={`/blog/tribunes/${article.id}`}
                className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
              >
                Lire la tribune
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
