import Link from 'next/link';
import { Calendar, ArrowRight, BookOpen } from 'lucide-react';

export default function ConseilsCarrierePage() {
  const articles = [
    {
      id: 1,
      title: 'Comment rédiger un CV efficace pour le marché africain',
      excerpt: 'Conseils pratiques pour adapter votre CV aux attentes des recruteurs africains.',
      date: '26 Juin 2026',
      readTime: '8 min',
    },
    {
      id: 2,
      title: 'Les compétences les plus recherchées en 2026',
      excerpt: 'Analyse des tendances du marché de l\'emploi et des compétences en forte demande.',
      date: '25 Juin 2026',
      readTime: '6 min',
    },
    {
      id: 3,
      title: 'Réussir son entretien d\'embauche',
      excerpt: 'Préparation et astuces pour réussir vos entretiens professionnels.',
      date: '24 Juin 2026',
      readTime: '10 min',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/emploi" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour à Emploi
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Conseils Carrière</h1>
          <p className="text-xl text-gray-200">
            Guides et conseils pour développer votre carrière professionnelle
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-accent"
            >
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-accent">Guide</span>
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                {article.title}
              </h3>
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {article.excerpt}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {article.date}
                </span>
                <span>{article.readTime}</span>
              </div>
              <Link
                href={`/emploi/conseils-carriere/${article.id}`}
                className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
              >
                Lire l'article
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
