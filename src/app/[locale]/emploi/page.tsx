import Link from 'next/link';
import { Calendar, ArrowRight, Briefcase, GraduationCap, Heart, Building, FileText } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function EmploiPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;

  // Fetch job offers from database
  const jobOffers = await prisma.jobOffer.findMany({
    where: {
      publishedAt: {
        lte: new Date(),
      },
    },
    orderBy: {
      publishedAt: 'desc',
    },
    take: 20,
  });

  const categories = [
    { name: 'Santé', href: `/${locale}/emploi/offres/sante`, icon: Heart, count: jobOffers.filter((j: any) => j.type?.toLowerCase().includes('santé') || j.title?.toLowerCase().includes('santé')).length },
    { name: 'Éducation', href: `/${locale}/emploi/offres/education`, icon: GraduationCap, count: jobOffers.filter((j: any) => j.type?.toLowerCase().includes('éducation') || j.title?.toLowerCase().includes('enseignant') || j.title?.toLowerCase().includes('professeur')).length },
    { name: 'Technologie', href: `/${locale}/emploi/offres/technologie`, icon: Briefcase, count: jobOffers.filter((j: any) => j.type?.toLowerCase().includes('technologie') || j.title?.toLowerCase().includes('développeur') || j.title?.toLowerCase().includes('it')).length },
    { name: 'Finance', href: `/${locale}/emploi/offres/finance`, icon: Building, count: jobOffers.filter((j: any) => j.type?.toLowerCase().includes('finance') || j.title?.toLowerCase().includes('banque') || j.title?.toLowerCase().includes('financier')).length },
    { name: 'Gouvernance', href: `/${locale}/emploi/offres/gouvernance`, icon: FileText, count: jobOffers.filter((j: any) => j.type?.toLowerCase().includes('gouvernance') || j.title?.toLowerCase().includes('ministère')).length },
    { name: 'ONG Humanitaire', href: `/${locale}/emploi/offres/ong-humanitaire`, icon: Heart, count: jobOffers.filter((j: any) => j.type?.toLowerCase().includes('ong') || j.title?.toLowerCase().includes('humanitaire')).length },
  ];

  const featuredJobs = jobOffers.slice(0, 3).map((job: any) => ({
    id: job.id,
    category: job.type || 'Général',
    company: 'Entreprise',
    title: job.title,
    location: job.location || 'Non spécifié',
    type: job.type || 'Temps plein',
    salary: job.salary || 'Non spécifié',
    description: job.description || '',
    posted: job.publishedAt ? new Date(job.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
    urgent: job.featured || false,
    slug: job.slug,
  }));

  const latestJobs = jobOffers.slice(3, 8).map((job: any) => ({
    id: job.id,
    category: job.type || 'Général',
    company: 'Entreprise',
    title: job.title,
    location: job.location || 'Non spécifié',
    posted: job.publishedAt ? new Date(job.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
    slug: job.slug,
  }));

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
                {featuredJobs.length > 0 ? (
                  featuredJobs.map((job) => (
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
                        href={`/${locale}/emploi/${job.slug}`}
                        className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
                      >
                        Postuler
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </article>
                  ))
                ) : (
                  <div className="bg-card rounded-lg p-12 text-center">
                    <p className="text-muted-foreground text-lg">Aucune offre d'emploi disponible pour le moment.</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold mb-6">Dernières offres</h2>
              <div className="space-y-4">
                {latestJobs.length > 0 ? (
                  latestJobs.map((job) => (
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
                  ))
                ) : (
                  <div className="bg-card rounded-lg p-12 text-center">
                    <p className="text-muted-foreground text-lg">Aucune offre d'emploi disponible pour le moment.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
