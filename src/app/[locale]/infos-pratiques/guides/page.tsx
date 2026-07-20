import Link from 'next/link';
import { Calendar, Clock, ArrowRight, Book } from 'lucide-react';

export default function GuidesPage() {
  const guides = [
    {
      id: 1,
      title: 'Guide complet pour créer une entreprise en RDC',
      excerpt: 'Toutes les étapes et démarches administratives pour lancer votre activité.',
      date: '26 Juin 2026',
      readTime: '15 min',
      category: 'Entrepreneuriat',
    },
    {
      id: 2,
      title: 'Guide des formalités administratives pour les étrangers',
      excerpt: 'Tout ce qu\'il faut savoir sur les visas, permis de séjour et formalités.',
      date: '25 Juin 2026',
      readTime: '12 min',
      category: 'Administration',
    },
    {
      id: 3,
      title: 'Guide de santé : Prévenir les maladies tropicales',
      excerpt: 'Conseils et précautions pour rester en bonne santé en Afrique.',
      date: '24 Juin 2026',
      readTime: '10 min',
      category: 'Santé',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/infos-pratiques" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour aux Infos Pratiques
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Guides</h1>
          <p className="text-xl text-gray-200">
            Guides pratiques pour faciliter votre quotidien
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guides.map((guide) => (
            <article
              key={guide.id}
              className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-primary"
            >
              <div className="flex items-center gap-2 mb-3">
                <Book className="w-5 h-5 text-primary" />
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  {guide.category}
                </span>
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                {guide.title}
              </h3>
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {guide.excerpt}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {guide.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {guide.readTime}
                </span>
              </div>
              <Link
                href={`/infos-pratiques/guides/${guide.id}`}
                className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
              >
                Lire le guide
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
