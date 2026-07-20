import Link from 'next/link';
import { Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';

export default function EtudesBibliquesPage() {
  const studies = [
    {
      id: 1,
      title: 'L\'Apocalypse et les Sept Sceaux',
      excerpt: 'Étude approfondie du livre de l\'Apocalypse et des sept sceaux.',
      date: '1963',
      readTime: '45 min',
    },
    {
      id: 2,
      title: 'La Genèse et les Origines',
      excerpt: 'Étude sur le livre de la Genèse et les origines de l\'humanité.',
      date: '1961',
      readTime: '30 min',
    },
    {
      id: 3,
      title: 'Les Épîtres de Paul',
      excerpt: 'Analyse des épîtres pauliniennes et leur application moderne.',
      date: '1962',
      readTime: '35 min',
    },
    {
      id: 4,
      title: 'Les Paraboles de Jésus',
      excerpt: 'Explication des paraboles de Jésus et leur signification spirituelle.',
      date: '1964',
      readTime: '40 min',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/religion/message-du-temps/branham" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour à William Branham
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Études Bibliques</h1>
          <p className="text-xl text-gray-200">
            Études approfondies de la Bible et enseignements doctrinaux
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {studies.map((study) => (
            <article
              key={study.id}
              className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-accent"
            >
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-accent">{study.date}</span>
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                {study.title}
              </h3>
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {study.excerpt}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {study.readTime}
                </span>
              </div>
              <Link
                href={`/religion/message-du-temps/branham/etudes-bibliques/${study.id}`}
                className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
              >
                Lire l\'étude
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
