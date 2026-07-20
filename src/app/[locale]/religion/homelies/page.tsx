import Link from 'next/link';
import { Calendar, Clock, ArrowRight, Heart } from 'lucide-react';

export default function HomeliesPage() {
  const homelies = [
    {
      id: 1,
      title: 'Homélie : L\'importance de la prière dans la vie quotidienne',
      excerpt: 'Réflexion sur le rôle central de la prière pour nourrir notre foi et notre relation avec Dieu.',
      preacher: 'Mgr. Jean-Pierre Mbemba',
      date: '27 Juin 2026',
      readTime: '8 min',
    },
    {
      id: 2,
      title: 'Homélie : La parabole du bon samaritain',
      excerpt: 'Enseignement sur l\'amour du prochain et la compassion dans notre monde moderne.',
      preacher: 'Père Antoine Mukendi',
      date: '26 Juin 2026',
      readTime: '10 min',
    },
    {
      id: 3,
      title: 'Homélie : La foi qui déplace les montagnes',
      excerpt: 'Comment une foi authentique peut transformer nos vies et notre environnement.',
      preacher: 'Père François Malonga',
      date: '25 Juin 2026',
      readTime: '9 min',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/religion" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour à Religion
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Homélies</h1>
          <p className="text-xl text-gray-200">
            Enseignements et prédications pour approfondir votre foi
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {homelies.map((homelie) => (
            <article
              key={homelie.id}
              className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-accent"
            >
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-accent">Par {homelie.preacher}</span>
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                {homelie.title}
              </h3>
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {homelie.excerpt}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {homelie.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {homelie.readTime}
                </span>
              </div>
              <Link
                href={`/religion/homelies/${homelie.id}`}
                className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
              >
                Lire l'homélie
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
