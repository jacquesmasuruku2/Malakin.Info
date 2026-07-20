import Link from 'next/link';
import { Calendar, Clock, ArrowRight, Globe } from 'lucide-react';

export default function NatureEnvironnementPage() {
  const articles = [
    {
      id: 1,
      title: 'La géographie de l\'Afrique : Un continent aux multiples facettes',
      excerpt: 'Découverte des paysages, climats et écosystèmes qui font la richesse naturelle de l\'Afrique.',
      date: '25 Juin 2026',
      readTime: '15 min',
      level: 'Général',
    },
    {
      id: 2,
      title: 'Le changement climatique en Afrique : Impacts et solutions',
      excerpt: 'Analyse des effets du réchauffement climatique sur le continent africain.',
      date: '22 Juin 2026',
      readTime: '11 min',
      level: 'Intermédiaire',
    },
    {
      id: 3,
      title: 'La biodiversité africaine : Un patrimoine à préserver',
      excerpt: 'Exploration de la richesse faunistique et floristique du continent africain.',
      date: '20 Juin 2026',
      readTime: '13 min',
      level: 'Général',
    },
    {
      id: 4,
      title: 'Les grands fleuves d\'Afrique : Le Nil, le Congo et le Niger',
      excerpt: 'Étude géographique et environnementale des principaux fleuves africains.',
      date: '19 Juin 2026',
      readTime: '10 min',
      level: 'Intermédiaire',
    },
    {
      id: 5,
      title: 'Le désert du Sahara : Écosystème et défis environnementaux',
      excerpt: 'Comprendre le plus grand désert chaud du monde et ses enjeux écologiques.',
      date: '18 Juin 2026',
      readTime: '12 min',
      level: 'Intermédiaire',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/science-tech" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour à Science & Tech
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Nature & Environnement</h1>
          <p className="text-xl text-gray-200">
            Géographie, environnement et écologie du continent africain
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-primary"
            >
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-5 h-5 text-primary" />
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                  {article.level}
                </span>
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
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {article.readTime}
                </span>
              </div>
              <Link
                href={`/science-tech/nature-environnement/${article.id}`}
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
