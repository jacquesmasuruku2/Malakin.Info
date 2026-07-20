import Link from 'next/link';
import { Calendar, Clock, ArrowRight, Search } from 'lucide-react';

export default function EnquetesPage() {
  const articles = [
    {
      id: 1,
      author: 'Marie Koffi',
      title: 'Enquête exclusive : Les coulisses du marché informel à Kinshasa',
      excerpt: 'Une plongée dans l\'économie informelle qui fait vivre des millions de Congolais.',
      date: '26 Juin 2026',
      readTime: '15 min',
    },
    {
      id: 2,
      author: 'Équipe Arizona',
      title: 'Enquête : L\'impact des changements climatiques sur l\'agriculture',
      excerpt: 'Comment les agriculteurs africains s\'adaptent au défi climatique.',
      date: '24 Juin 2026',
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
          <h1 className="font-heading text-4xl font-bold mb-4">Enquêtes</h1>
          <p className="text-xl text-gray-200">
            Reportages approfondis et investigations
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
                <Search className="w-5 h-5 text-primary" />
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
                href={`/blog/enquetes/${article.id}`}
                className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
              >
                Lire l'enquête
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
