import Link from 'next/link';
import { Calendar, Clock, ArrowRight, Book } from 'lucide-react';

export default function SermonsPage() {
  const sermons = [
    {
      id: 1,
      title: 'La Venue du Messie - Sermon du 25 Décembre 1965',
      excerpt: 'Message prophétique sur la venue du Seigneur et la fin des temps.',
      date: '25 Décembre 1965',
      location: 'Jeffersonville, Indiana',
      readTime: '15 min',
    },
    {
      id: 2,
      title: 'Les Sept Sceaux - Série complète',
      excerpt: 'Enseignement complet sur les sept sceaux de l\'Apocalypse.',
      date: '1963',
      location: 'Tucson, Arizona',
      readTime: '45 min',
    },
    {
      id: 3,
      title: 'Le Mariage de l\'Agneau',
      excerpt: 'Révélation sur le mariage spirituel de l\'Église avec Christ.',
      date: '1962',
      location: 'Chicago, Illinois',
      readTime: '20 min',
    },
    {
      id: 4,
      title: 'La Présence de Dieu',
      excerpt: 'Comment reconnaître et vivre dans la présence divine.',
      date: '1964',
      location: 'Los Angeles, Californie',
      readTime: '18 min',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/religion/message-du-temps/branham" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour à William Branham
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Sermons</h1>
          <p className="text-xl text-gray-200">
            Collection des sermons prophétiques de William Branham
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sermons.map((sermon) => (
            <article
              key={sermon.id}
              className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-primary"
            >
              <div className="flex items-center gap-2 mb-3">
                <Book className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">{sermon.date}</span>
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                {sermon.title}
              </h3>
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {sermon.excerpt}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {sermon.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {sermon.readTime}
                </span>
              </div>
              <Link
                href={`/religion/message-du-temps/branham/sermons/${sermon.id}`}
                className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
              >
                Lire le sermon
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
