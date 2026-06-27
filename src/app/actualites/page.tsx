import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

export default function ActualitesPage() {
  const categories = [
    { name: 'Politique', href: '/actualites/politique', count: 45 },
    { name: 'Économie', href: '/actualites/economie', count: 32 },
    { name: 'Société', href: '/actualites/societe', count: 28 },
    { name: 'Santé', href: '/actualites/sante', count: 19 },
    { name: 'Sécurité', href: '/actualites/securite', count: 15 },
    { name: 'Environnement', href: '/actualites/environnement', count: 22 },
  ];

  const news = [
    {
      id: 1,
      category: 'Politique',
      title: 'Sommet de l\'Union Africaine : Les dirigeants s\'engagent pour une intégration économique renforcée',
      excerpt: 'Les chefs d\'État africains ont adopté une déclaration historique visant à faciliter les échanges commerciaux intra-africains.',
      image: 'https://images.unsplash.com/photo-1541872703-74c5963631df?w=800&h=400&fit=crop',
      date: '27 Juin 2026',
      readTime: '5 min',
    },
    {
      id: 2,
      category: 'Économie',
      title: 'Le secteur technologique africain attire 2 milliards de dollars d\'investissements',
      excerpt: 'Les startups africaines continuent de séduire les investisseurs internationaux malgré le contexte économique mondial.',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=400&fit=crop',
      date: '26 Juin 2026',
      readTime: '4 min',
    },
    {
      id: 3,
      category: 'Santé',
      title: 'Nouvelle initiative de vaccination contre le paludisme en Afrique centrale',
      excerpt: 'L\'OMS lance un programme massif de vaccination dans cinq pays de la région pour réduire la mortalité infantile.',
      image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&h=400&fit=crop',
      date: '25 Juin 2026',
      readTime: '6 min',
    },
    {
      id: 4,
      category: 'Société',
      title: 'Festival de cinéma africain : Les talents locaux à l\'honneur',
      excerpt: 'Le festival met en lumière les créateurs africains et leur contribution à l\'industrie cinématographique mondiale.',
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=400&fit=crop',
      date: '27 Juin 2026',
      readTime: '3 min',
    },
    {
      id: 5,
      category: 'Environnement',
      title: 'Reboisement : Un million d\'arbres plantés au Congo',
      excerpt: 'Une initiative ambitieuse pour lutter contre le déforestation et préserver la biodiversité de la région.',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop',
      date: '26 Juin 2026',
      readTime: '5 min',
    },
    {
      id: 6,
      category: 'Sécurité',
      title: 'Coopération régionale pour la lutte contre le terrorisme',
      excerpt: 'Les pays de la région renforcent leur collaboration pour sécuriser les frontières et lutter contre les groupes armés.',
      image: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=400&fit=crop',
      date: '25 Juin 2026',
      readTime: '6 min',
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold mb-4">Actualités</h1>
          <p className="text-xl text-gray-200">
            Suivez l'actualité africaine et internationale en temps réel
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-card rounded-lg p-6 sticky top-24">
              <h2 className="font-heading text-xl font-bold mb-4">Catégories</h2>
              <ul className="space-y-0">
                {categories.map((category, index) => (
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
                    {index < categories.length - 1 && (
                      <div className="h-px bg-border my-2"></div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {news.map((item) => (
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
                    <span className="absolute top-4 left-4 px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
                      {item.category}
                    </span>
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
                      href={`/actualites/${item.id}`}
                      className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
                    >
                      Lire la suite
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <nav className="flex items-center gap-2">
                <button className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  Précédent
                </button>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
                  1
                </button>
                <button className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  2
                </button>
                <button className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  3
                </button>
                <button className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  Suivant
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
