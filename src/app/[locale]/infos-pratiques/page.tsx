import Link from 'next/link';
import { Calendar, ArrowRight, BookOpen, ListChecks, FileText, GraduationCap } from 'lucide-react';

export default function InfosPratiquesPage() {
  const categories = [
    { name: 'Guides', href: '/infos-pratiques/guides', icon: BookOpen, count: 34 },
    { name: 'Tutoriels', href: '/infos-pratiques/tutoriels', icon: FileText, count: 28 },
    { name: 'Checklists', href: '/infos-pratiques/checklists', icon: ListChecks, count: 19 },
    { name: 'Ressources Éducatives', href: '/infos-pratiques/ressources-educatives', icon: GraduationCap, count: 45 },
  ];

  const guides = [
    {
      id: 1,
      category: 'Guide',
      title: 'Comment créer votre entreprise en RDC : Guide complet 2026',
      description: 'Toutes les étapes administratives, juridiques et pratiques pour lancer votre activité.',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop',
      date: '27 Juin 2026',
      readTime: '15 min',
    },
    {
      id: 2,
      category: 'Tutoriel',
      title: 'Utiliser les services en ligne de l\'administration',
      description: 'Pas à pas pour accéder aux démarches administratives en ligne.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
      date: '26 Juin 2026',
      readTime: '10 min',
    },
    {
      id: 3,
      category: 'Checklist',
      title: 'Checklist : Préparer votre voyage en Afrique centrale',
      description: 'Documents, vaccinations, assurances : tout ce qu\'il faut préparer avant de partir.',
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop',
      date: '25 Juin 2026',
      readTime: '8 min',
    },
    {
      id: 4,
      category: 'Ressource',
      title: 'Formations professionnelles disponibles en 2026',
      description: 'Liste complète des programmes de formation et des opportunités de développement des compétences.',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop',
      date: '25 Juin 2026',
      readTime: '12 min',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold mb-4">Infos Pratiques</h1>
          <p className="text-xl text-gray-200">
            Guides, tutoriels et ressources pour vous accompagner au quotidien
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-2xl font-bold text-[#081C3D] mb-3">Des repères utiles tous les jours</h2>
          <p className="text-base leading-relaxed text-gray-700">
            Des guides pratiques, des tutoriels et des ressources pour faciliter les démarches, mieux comprendre les services publics et gagner en autonomie dans la vie quotidienne.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guides.map((guide) => (
            <article
              key={guide.id}
              className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative h-48">
                <img
                  src={guide.image}
                  alt={guide.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-4 left-4 px-3 py-1 bg-accent text-white text-xs font-medium rounded-full">
                  {guide.category}
                </span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {guide.date}
                  </span>
                  <span>{guide.readTime}</span>
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2 line-clamp-2">
                  {guide.title}
                </h3>
                <p className="text-muted-foreground line-clamp-2 mb-4">
                  {guide.description}
                </p>
                <Link
                  href={`/infos-pratiques/${guide.id}`}
                  className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
                >
                  Accéder
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
