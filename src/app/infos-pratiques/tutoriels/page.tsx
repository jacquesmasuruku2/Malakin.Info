import Link from 'next/link';
import { Calendar, Clock, ArrowRight, PlayCircle } from 'lucide-react';

export default function TutorielsPage() {
  const tutorials = [
    {
      id: 1,
      title: 'Comment utiliser les services bancaires en ligne',
      excerpt: 'Tutoriel étape par étape pour gérer vos finances en toute sécurité.',
      date: '26 Juin 2026',
      readTime: '8 min',
      type: 'Vidéo',
    },
    {
      id: 2,
      title: 'Créer un compte email professionnel',
      excerpt: 'Guide pour configurer votre adresse email professionnelle.',
      date: '25 Juin 2026',
      readTime: '5 min',
      type: 'Article',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/infos-pratiques" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour aux Infos Pratiques
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Tutoriels</h1>
          <p className="text-xl text-gray-200">
            Tutoriels pour maîtriser les outils du quotidien
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tutorials.map((tutorial) => (
            <article
              key={tutorial.id}
              className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-accent"
            >
              <div className="flex items-center gap-2 mb-3">
                <PlayCircle className="w-5 h-5 text-accent" />
                <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full">
                  {tutorial.type}
                </span>
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                {tutorial.title}
              </h3>
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {tutorial.excerpt}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {tutorial.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {tutorial.readTime}
                </span>
              </div>
              <Link
                href={`/infos-pratiques/tutoriels/${tutorial.id}`}
                className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
              >
                Suivre le tutoriel
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
