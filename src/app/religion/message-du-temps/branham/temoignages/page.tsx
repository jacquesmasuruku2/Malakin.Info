import Link from 'next/link';
import { Calendar, ArrowRight, Heart } from 'lucide-react';

export default function TemoignagesPage() {
  const testimonies = [
    {
      id: 1,
      title: 'Guérison miraculeuse - Témoignage de Marie K.',
      excerpt: 'Témoignage de guérison suite à la prière pendant une campagne de William Branham.',
      date: '1955',
      location: 'Durban, Afrique du Sud',
    },
    {
      id: 2,
      title: 'Conversion radicales - Témoignage de Jean M.',
      excerpt: 'Comment la vie de cet homme a été transformée par l\'écoute des sermons.',
      date: '1960',
      location: 'Kinshasa, RDC',
    },
    {
      id: 3,
      title: 'Vision et révélation - Témoignage de Pierre L.',
      excerpt: 'Expérience personnelle de vision divine lors d\'une réunion de prière.',
      date: '1962',
      location: 'Lagos, Nigeria',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/religion/message-du-temps/branham" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour à William Branham
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Témoignages</h1>
          <p className="text-xl text-gray-200">
            Témoignages de guérisons, conversions et expériences spirituelles
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonies.map((testimony) => (
            <article
              key={testimony.id}
              className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-primary"
            >
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">{testimony.date}</span>
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                {testimony.title}
              </h3>
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {testimony.excerpt}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {testimony.location}
                </span>
              </div>
              <Link
                href={`/religion/message-du-temps/branham/temoignages/${testimony.id}`}
                className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
              >
                Lire le témoignage
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
