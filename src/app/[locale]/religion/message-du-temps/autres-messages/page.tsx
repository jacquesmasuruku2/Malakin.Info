import Link from 'next/link';
import { Calendar, Clock, ArrowRight, Book } from 'lucide-react';

export default function AutresMessagesPage() {
  const messages = [
    {
      id: 1,
      author: 'Smith Wigglesworth',
      title: 'La Puissance de la Foi',
      excerpt: 'Enseignements sur la foi qui déplace les montagnes et les miracles.',
      date: '27 Juin 2026',
      readTime: '12 min',
    },
    {
      id: 2,
      author: 'A.A. Allen',
      title: 'Le Réveil Spirituel',
      excerpt: 'Messages sur le besoin de réveil dans l\'Église moderne.',
      date: '26 Juin 2026',
      readTime: '15 min',
    },
    {
      id: 3,
      author: 'Kathryn Kuhlman',
      title: 'La Guérison Divine',
      excerpt: 'Témoignages et enseignements sur la guérison par la foi.',
      date: '25 Juin 2026',
      readTime: '10 min',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/religion" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour à Religion
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Autres Messages</h1>
          <p className="text-xl text-gray-200">
            Enseignements d\'autres serviteurs de Dieu et messages spirituels
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {messages.map((message) => (
            <article
              key={message.id}
              className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-primary"
            >
              <div className="flex items-center gap-2 mb-3">
                <Book className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">Par {message.author}</span>
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                {message.title}
              </h3>
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {message.excerpt}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {message.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {message.readTime}
                </span>
              </div>
              <Link
                href={`/religion/message-du-temps/autres-messages/${message.id}`}
                className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
              >
                Lire le message
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
