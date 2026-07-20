import Link from 'next/link';
import { Calendar, Clock, ArrowRight, BarChart3 } from 'lucide-react';

export default function AnalyseDeDonneesPage() {
  const articles = [
    {
      id: 1,
      title: 'L\'analyse de données au service du développement africain',
      excerpt: 'Comment la data science peut contribuer au développement économique et social du continent.',
      date: '26 Juin 2026',
      readTime: '10 min',
      level: 'Intermédiaire',
    },
    {
      id: 2,
      title: 'Les outils d\'analyse de données open source',
      excerpt: 'Présentation des meilleurs outils gratuits pour l\'analyse de données.',
      date: '23 Juin 2026',
      readTime: '7 min',
      level: 'Débutant',
    },
    {
      id: 3,
      title: 'Introduction à Python pour la data science',
      excerpt: 'Guide pour débuter avec Python et les bibliothèques essentielles de data science.',
      date: '21 Juin 2026',
      readTime: '15 min',
      level: 'Débutant',
    },
    {
      id: 4,
      title: 'Visualisation de données avec Python',
      excerpt: 'Créer des visualisations efficaces avec Matplotlib et Seaborn.',
      date: '20 Juin 2026',
      readTime: '12 min',
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
          <h1 className="font-heading text-4xl font-bold mb-4">Analyse de Données</h1>
          <p className="text-xl text-gray-200">
            Articles et tutoriels sur l'analyse de données, la data science et les statistiques
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-accent"
            >
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-5 h-5 text-accent" />
                <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-medium rounded">
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
                href={`/science-tech/analyse-de-donnees/${article.id}`}
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
