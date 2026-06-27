import Link from 'next/link';
import { Calendar, ArrowRight, Star } from 'lucide-react';

export default function ProphetiesPage() {
  const prophecies = [
    {
      id: 1,
      title: 'Prophétie sur l\'Afrique - 1962',
      excerpt: 'Vision prophétique concernant le destin spirituel du continent africain et son réveil spirituel.',
      date: '1962',
      fulfilled: true,
    },
    {
      id: 2,
      title: 'La Chute de l\'Allemagne - 1937',
      excerpt: 'Prophétie annonçant la chute de l\'Allemagne nazie et la fin de la Seconde Guerre mondiale.',
      date: '1937',
      fulfilled: true,
    },
    {
      id: 3,
      title: 'La Venue des Sept Sceaux - 1963',
      excerpt: 'Révélation prophétique sur l\'ouverture des sept sceaux de l\'Apocalypse.',
      date: '1963',
      fulfilled: true,
    },
    {
      id: 4,
      title: 'Le Réveil de Laodicée',
      excerpt: 'Prophétie sur l\'état de l\'Église à la fin des temps et le besoin de réveil.',
      date: '1960',
      fulfilled: true,
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/religion/message-du-temps/branham" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour à William Branham
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Prophéties</h1>
          <p className="text-xl text-gray-200">
            Les prophéties de William Branham et leur accomplissement
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {prophecies.map((prophecy) => (
            <article
              key={prophecy.id}
              className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-accent"
            >
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-accent">{prophecy.date}</span>
                {prophecy.fulfilled && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                    Accomplie
                  </span>
                )}
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                {prophecy.title}
              </h3>
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {prophecy.excerpt}
              </p>
              <Link
                href={`/religion/message-du-temps/branham/propheties/${prophecy.id}`}
                className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
              >
                En savoir plus
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
