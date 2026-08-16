import Link from 'next/link';
import { Calendar, ArrowRight, Briefcase, GraduationCap, Heart, Building, FileText } from 'lucide-react';

export default function EmploiPage() {
  const categories = [
    { name: 'Santé', href: '/emploi/offres/sante', icon: Heart, count: 45 },
    { name: 'Éducation', href: '/emploi/offres/education', icon: GraduationCap, count: 67 },
    { name: 'Technologie', href: '/emploi/offres/technologie', icon: Briefcase, count: 89 },
    { name: 'Finance', href: '/emploi/offres/finance', icon: Building, count: 34 },
    { name: 'Gouvernance', href: '/emploi/offres/gouvernance', icon: FileText, count: 23 },
    { name: 'ONG Humanitaire', href: '/emploi/offres/ong-humanitaire', icon: Heart, count: 56 },
  ];

  const featuredJobs = [
    {
      id: 1,
      category: 'Technologie',
      company: 'TechStart Africa',
      title: 'Développeur Full Stack Senior',
      location: 'Kinshasa, RDC',
      type: 'Temps plein',
      salary: '3,000 - 5,000 USD',
      description: 'Nous recherchons un développeur expérimenté pour rejoindre notre équipe en pleine croissance.',
      posted: '27 Juin 2026',
      urgent: true,
    },
    {
      id: 2,
      category: 'Santé',
      company: 'Hôpital Général de Kinshasa',
      title: 'Médecin Généraliste',
      location: 'Kinshasa, RDC',
      type: 'Temps plein',
      salary: '2,500 - 4,000 USD',
      description: 'Recrutement de médecins généralistes pour renforcer notre équipe médicale.',
      posted: '26 Juin 2026',
      urgent: true,
    },
    {
      id: 3,
      category: 'Éducation',
      company: 'Université de Lubumbashi',
      title: 'Professeur de Droit',
      location: 'Lubumbashi, RDC',
      type: 'Temps partiel',
      salary: '1,500 - 2,500 USD',
      description: 'L\'université recherche un professeur pour le département de droit.',
      posted: '25 Juin 2026',
      urgent: false,
    },
  ];

  const latestJobs = [
    {
      id: 4,
      category: 'Finance',
      company: 'Banque Commerciale',
      title: 'Analyste Financier',
      location: 'Kinshasa',
      posted: '27 Juin 2026',
    },
    {
      id: 5,
      category: 'ONG Humanitaire',
      company: 'UNICEF',
      title: 'Coordinateur de Projet',
      location: 'Goma',
      posted: '26 Juin 2026',
    },
    {
      id: 6,
      category: 'Gouvernance',
      company: 'Ministère de l\'Économie',
      title: 'Conseiller en Politique Économique',
      location: 'Kinshasa',
      posted: '26 Juin 2026',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold mb-4">Emploi</h1>
          <p className="text-xl text-gray-200">
            Offres d\'emploi, conseils carrière et bourses : trouvez votre opportunité en Afrique
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-2xl font-bold text-[#081C3D] mb-3">Les opportunités qui ouvrent des chemins</h2>
          <p className="text-base leading-relaxed text-gray-700">
            Trouvez ici les offres, les conseils et les perspectives qui peuvent faire la différence dans votre parcours professionnel et votre développement en Afrique.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-8">
            <div>
              <h2 className="font-heading text-2xl font-bold mb-6">Offres en vedette</h2>
              <div className="space-y-4">
                {featuredJobs.map((job) => (
                  <article
                    key={job.id}
                    className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-primary"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                          {job.category}
                        </span>
                        {job.urgent && (
                          <span className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full animate-pulse">
                            Urgent
                          </span>
                        )}
                      </div>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {job.posted}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">{job.company}</p>
                    
                    <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                      {job.title}
                    </h3>
                    
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {job.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {job.type}
                      </span>
                      <span>{job.salary}</span>
                    </div>
                    
                    <Link
                      href={`/emploi/${job.id}`}
                      className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
                    >
                      Postuler
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </article>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold mb-6">Dernières offres</h2>
              <div className="space-y-4">
                {latestJobs.map((job) => (
                  <article
                    key={job.id}
                    className="flex gap-4 p-4 bg-card rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded mb-2">
                        {job.category}
                      </span>
                      <h3 className="font-heading font-semibold text-foreground mb-1">
                        {job.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">{job.company}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {job.posted}
                        </span>
                        <span>{job.location}</span>
                      </div>
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
