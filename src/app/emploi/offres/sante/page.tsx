import Link from 'next/link';
import { Calendar, MapPin, ArrowRight, Briefcase } from 'lucide-react';

export default function EmploiSantePage() {
  const jobs = [
    {
      id: 1,
      title: 'Médecin généraliste',
      company: 'Hôpital Central de Kinshasa',
      location: 'Kinshasa, RDC',
      type: 'Temps plein',
      salary: '2,500 - 3,500 USD/mois',
      posted: '27 Juin 2026',
      urgent: true,
    },
    {
      id: 2,
      title: 'Infirmier spécialisé',
      company: 'Clinique Saint-Jean',
      location: 'Lubumbashi, RDC',
      type: 'Temps plein',
      salary: '1,200 - 1,800 USD/mois',
      posted: '26 Juin 2026',
      urgent: false,
    },
    {
      id: 3,
      title: 'Responsable qualité santé',
      company: 'Ministère de la Santé',
      location: 'Kinshasa, RDC',
      type: 'CDI',
      salary: '2,000 - 2,800 USD/mois',
      posted: '25 Juin 2026',
      urgent: false,
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/emploi" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour à Emploi
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Santé</h1>
          <p className="text-xl text-gray-200">
            Offres d'emploi dans le secteur de la santé
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-4">
          {jobs.map((job) => (
            <article
              key={job.id}
              className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-primary"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">{job.company}</span>
                </div>
                <div className="flex items-center gap-3">
                  {job.urgent && (
                    <span className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full animate-pulse">
                      Urgent
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {job.posted}
                  </span>
                </div>
              </div>
              
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                {job.title}
              </h3>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </span>
                <span>{job.type}</span>
                <span className="text-primary font-medium">{job.salary}</span>
              </div>
              
              <Link
                href={`/emploi/offres/sante/${job.id}`}
                className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
              >
                Voir l'offre
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
