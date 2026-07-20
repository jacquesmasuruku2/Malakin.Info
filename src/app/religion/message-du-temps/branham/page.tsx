import Link from 'next/link';
import { Calendar, Clock, ArrowRight, Book } from 'lucide-react';

export default function BranhamPage() {
  const categories = [
    { name: 'Sermons', href: '/religion/message-du-temps/branham/sermons', count: 45 },
    { name: 'Prophéties', href: '/religion/message-du-temps/branham/propheties', count: 32 },
    { name: 'Témoignages', href: '/religion/message-du-temps/branham/temoignages', count: 28 },
    { name: 'Études Bibliques', href: '/religion/message-du-temps/branham/etudes-bibliques', count: 40 },
  ];

  const featured = [
    {
      id: 1,
      category: 'Sermon',
      title: 'La Venue du Messie - Sermon du 25 Décembre 1965',
      excerpt: 'Message prophétique sur la venue du Seigneur et la fin des temps.',
      date: '27 Juin 2026',
      readTime: '15 min',
    },
    {
      id: 2,
      category: 'Prophétie',
      title: 'Prophétie sur l\'Afrique - 1962',
      excerpt: 'Vision prophétique concernant le destin spirituel du continent africain.',
      date: '26 Juin 2026',
      readTime: '10 min',
    },
    {
      id: 3,
      category: 'Étude Biblique',
      title: 'L\'Apocalypse et les Sept Sceaux',
      excerpt: 'Étude approfondie du livre de l\'Apocalypse et des sept sceaux.',
      date: '25 Juin 2026',
      readTime: '20 min',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/religion" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour à Religion
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">William Branham</h1>
          <p className="text-xl text-gray-200">
            Sermons, prophéties et enseignements du prophète William Branham
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-card rounded-lg p-6 sticky top-24">
              <h2 className="font-heading text-xl font-bold mb-4">Catégories</h2>
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category.name}>
                    <Link
                      href={category.href}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <span className="font-medium">{category.name}</span>
                      <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="lg:col-span-3 space-y-8">
            <div>
              <h2 className="font-heading text-2xl font-bold mb-6">À la une</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featured.map((item) => (
                  <article
                    key={item.id}
                    className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-primary"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Book className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-primary">{item.category}</span>
                    </div>
                    <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {item.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {item.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {item.readTime}
                      </span>
                    </div>
                    <Link
                      href={`/religion/message-du-temps/branham/${item.id}`}
                      className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
                    >
                      Lire
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
