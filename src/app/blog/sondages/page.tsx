import Link from 'next/link';
import { Calendar, ArrowRight, BarChart3 } from 'lucide-react';

export default function SondagesPage() {
  const polls = [
    {
      id: 1,
      title: 'Sondage : Les Africains et leur confiance dans les médias',
      description: 'Résultats de notre enquête sur la confiance des citoyens africains envers les médias.',
      date: '27 Juin 2026',
      participants: 5420,
      status: 'Publié',
    },
    {
      id: 2,
      title: 'Sondage : Les priorités des jeunes africains',
      description: 'Ce qui importe le plus pour la jeunesse africaine en 2026.',
      date: '20 Juin 2026',
      participants: 3890,
      status: 'Publié',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/blog" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour au Blog
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Sondages</h1>
          <p className="text-xl text-gray-200">
            Enquêtes d'opinion et analyses statistiques
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          {polls.map((poll) => (
            <article
              key={poll.id}
              className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-accent"
            >
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-5 h-5 text-accent" />
                <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full">
                  {poll.status}
                </span>
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                {poll.title}
              </h3>
              <p className="text-muted-foreground mb-4">
                {poll.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {poll.date}
                  </span>
                  <span>{poll.participants} participants</span>
                </div>
                <Link
                  href={`/blog/sondages/${poll.id}`}
                  className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
                >
                  Voir les résultats
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
