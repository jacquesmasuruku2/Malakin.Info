import Link from 'next/link';
import { Calendar, Clock, ArrowRight, Database, BarChart3, Globe } from 'lucide-react';

export default function ScienceTechPage() {
  const categories = [
    { name: 'Base de Données', href: '/science-tech/base-de-donnees', icon: Database, count: 24 },
    { name: 'Analyse de Données', href: '/science-tech/analyse-de-donnees', icon: BarChart3, count: 18 },
    { name: 'Nature & Environnement', href: '/science-tech/nature-environnement', icon: Globe, count: 32 },
  ];

  const featured = [
    {
      id: 1,
      category: 'Base de Données',
      title: 'Introduction aux bases de données relationnelles',
      excerpt: 'Guide complet pour comprendre les fondamentaux des bases de données relationnelles et SQL.',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop',
      date: '27 Juin 2026',
      readTime: '12 min',
    },
    {
      id: 2,
      category: 'Analyse de Données',
      title: 'L\'analyse de données au service du développement africain',
      excerpt: 'Comment la data science peut contribuer au développement économique et social du continent.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
      date: '26 Juin 2026',
      readTime: '10 min',
    },
    {
      id: 3,
      category: 'Nature & Environnement',
      title: 'La géographie de l\'Afrique : Un continent aux multiples facettes',
      excerpt: 'Découverte des paysages, climats et écosystèmes qui font la richesse naturelle de l\'Afrique.',
      image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&h=400&fit=crop',
      date: '25 Juin 2026',
      readTime: '15 min',
    },
  ];

  const latest = [
    {
      id: 4,
      category: 'Base de Données',
      title: 'MongoDB vs PostgreSQL : Lequel choisir ?',
      excerpt: 'Comparaison détaillée des deux systèmes de gestion de bases de données les plus populaires.',
      date: '24 Juin 2026',
      readTime: '8 min',
    },
    {
      id: 5,
      category: 'Analyse de Données',
      title: 'Les outils d\'analyse de données open source',
      excerpt: 'Présentation des meilleurs outils gratuits pour l\'analyse de données.',
      date: '23 Juin 2026',
      readTime: '7 min',
    },
    {
      id: 6,
      category: 'Nature & Environnement',
      title: 'Le changement climatique en Afrique : Impacts et solutions',
      excerpt: 'Analyse des effets du réchauffement climatique sur le continent africain.',
      date: '22 Juin 2026',
      readTime: '11 min',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold mb-4">Science & Tech</h1>
          <p className="text-xl text-gray-200">
            Base de données, analyse de données et environnement
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-card rounded-lg p-6 sticky top-24">
              <h2 className="font-heading text-xl font-bold mb-4">Catégories</h2>
              <ul className="space-y-0">
                {categories.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <li key={category.name}>
                      <Link
                        href={category.href}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-primary" />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
                          {category.count}
                        </span>
                      </Link>
                      {index < categories.length - 1 && (
                        <div className="h-px bg-border my-2"></div>
                      )}
                    </li>
                  );
                })}
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
                    className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-48">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4 px-3 py-1 bg-primary/90 text-white text-xs font-medium rounded">
                        {item.category}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {item.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {item.readTime}
                        </span>
                      </div>
                      <h3 className="font-heading text-xl font-semibold text-foreground mb-2 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground line-clamp-2 mb-4">
                        {item.excerpt}
                      </p>
                      <Link
                        href={`/science-tech/${item.category.toLowerCase().replace(' & ', '-').replace(' ', '-')}/${item.id}`}
                        className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
                      >
                        Lire la suite
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold mb-6">Derniers articles</h2>
              <div className="space-y-4">
                {latest.map((item) => (
                  <article
                    key={item.id}
                    className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-primary"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-2 mb-4">
                      {item.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                        href={`/science-tech/${item.category.toLowerCase().replace(' & ', '-').replace(' ', '-')}/${item.id}`}
                        className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
                      >
                        Lire
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </div>
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
