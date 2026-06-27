import Link from 'next/link';
import { Calendar, ArrowRight, FileText, Building, Church, Heart, GraduationCap } from 'lucide-react';

export default function CommuniquesPage() {
  const categories = [
    { name: 'Gouvernement', href: '/communiques/gouvernement', icon: Building, count: 67 },
    { name: 'Religieux', href: '/communiques/religieux', icon: Church, count: 34 },
    { name: 'ONG', href: '/communiques/ong', icon: Heart, count: 45 },
    { name: 'Éducatif', href: '/communiques/educatif', icon: GraduationCap, count: 28 },
  ];

  const communiques = [
    {
      id: 1,
      category: 'Gouvernement',
      organization: 'Ministère de la Santé',
      title: 'Lancement du programme national de vaccination 2026-2030',
      excerpt: 'Le gouvernement annonce un plan ambitieux pour améliorer la couverture vaccinale dans tout le pays.',
      date: '27 Juin 2026',
      urgent: true,
    },
    {
      id: 2,
      category: 'Religieux',
      organization: 'Conférence Épiscopale',
      title: 'Message de Paix pour la fête nationale',
      excerpt: 'Les évêques appellent à l\'unité et à la réconciliation nationale à l\'occasion des festivités.',
      date: '26 Juin 2026',
      urgent: false,
    },
    {
      id: 3,
      category: 'ONG',
      organization: 'UNICEF RDC',
      title: 'Rapport annuel sur la protection de l\'enfance',
      excerpt: 'Bilan des actions menées en 2025 et perspectives pour l\'année 2026 en faveur des enfants.',
      date: '26 Juin 2026',
      urgent: false,
    },
    {
      id: 4,
      category: 'Éducatif',
      organization: 'Université de Kinshasa',
      title: 'Ouverture des inscriptions pour l\'année académique 2026-2027',
      excerpt: 'Les modalités d\'inscription et les nouvelles formations disponibles pour la rentrée prochaine.',
      date: '25 Juin 2026',
      urgent: false,
    },
    {
      id: 5,
      category: 'Gouvernement',
      organization: 'Ministère de l\'Économie',
      title: 'Nouvelles mesures fiscales pour les PME',
      excerpt: 'Présentation des dispositions du nouveau code des impôts applicable aux petites et moyennes entreprises.',
      date: '25 Juin 2026',
      urgent: true,
    },
    {
      id: 6,
      category: 'ONG',
      organization: 'Croix-Rouge',
      title: 'Appel aux dons pour les victimes des inondations',
      excerpt: 'Situation critique dans l\'est du pays : organisation lance une campagne d\'urgence.',
      date: '24 Juin 2026',
      urgent: true,
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold mb-4">Communiqués</h1>
          <p className="text-xl text-gray-200">
            Communications officielles du gouvernement, institutions religieuses, ONG et secteur éducatif
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

          <div className="lg:col-span-3">
            <div className="space-y-4">
              {communiques.map((communique) => (
                <article
                  key={communique.id}
                  className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-primary"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                        {communique.category}
                      </span>
                      {communique.urgent && (
                        <span className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full animate-pulse">
                          Urgent
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {communique.date}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">{communique.organization}</p>
                  
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                    {communique.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {communique.excerpt}
                  </p>
                  
                  <Link
                    href={`/communiques/${communique.id}`}
                    className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
                  >
                    Lire le communiqué complet
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </article>
              ))}
            </div>

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
