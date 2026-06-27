import Link from 'next/link';
import { Calendar, Clock, ArrowRight, Database } from 'lucide-react';

export default function BaseDeDonneesPage() {
  const articles = [
    {
      id: 1,
      title: 'Introduction aux bases de données relationnelles',
      excerpt: 'Guide complet pour comprendre les fondamentaux des bases de données relationnelles et SQL.',
      date: '27 Juin 2026',
      readTime: '12 min',
      level: 'Débutant',
    },
    {
      id: 2,
      title: 'MongoDB vs PostgreSQL : Lequel choisir ?',
      excerpt: 'Comparaison détaillée des deux systèmes de gestion de bases de données les plus populaires.',
      date: '24 Juin 2026',
      readTime: '8 min',
      level: 'Intermédiaire',
    },
    {
      id: 3,
      title: 'Optimisation des requêtes SQL',
      excerpt: 'Techniques avancées pour améliorer les performances de vos requêtes de base de données.',
      date: '23 Juin 2026',
      readTime: '15 min',
      level: 'Avancé',
    },
    {
      id: 4,
      title: 'NoSQL : Quand et pourquoi l\'utiliser ?',
      excerpt: 'Comprendre les cas d\'utilisation des bases de données NoSQL et leurs avantages.',
      date: '22 Juin 2026',
      readTime: '10 min',
      level: 'Intermédiaire',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/science-tech" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour à Science & Tech
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Base de Données</h1>
          <p className="text-xl text-gray-200">
            Tutoriels, guides et ressources sur les systèmes de gestion de bases de données
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-primary"
            >
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-5 h-5 text-primary" />
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                  {article.level}
                </span>
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
                href={`/science-tech/base-de-donnees/${article.id}`}
                className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
              >
                Lire l'article
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
