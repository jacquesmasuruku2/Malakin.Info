import Link from 'next/link';
import { Calendar, ArrowRight, GraduationCap } from 'lucide-react';

export default function BoursesStagesPage() {
  const opportunities = [
    {
      id: 1,
      title: 'Bourse d\'excellence pour études en Europe',
      organization: 'Commission Européenne',
      deadline: '15 Juillet 2026',
      type: 'Bourse',
      field: 'Tous domaines',
    },
    {
      id: 2,
      title: 'Stage en journalisme à Arizona.info',
      organization: 'Arizona.info',
      deadline: '30 Juin 2026',
      type: 'Stage',
      field: 'Journalisme',
    },
    {
      id: 3,
      title: 'Programme de mentorat pour jeunes entrepreneurs',
      organization: 'Banque Mondiale',
      deadline: '10 Août 2026',
      type: 'Programme',
      field: 'Entrepreneuriat',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/emploi" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour à Emploi
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Bourses & Stages</h1>
          <p className="text-xl text-gray-200">
            Opportunités de formation et de développement professionnel
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-4">
          {opportunities.map((opportunity) => (
            <article
              key={opportunity.id}
              className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-primary"
            >
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-5 h-5 text-primary" />
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  {opportunity.type}
                </span>
              </div>
              
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                {opportunity.title}
              </h3>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="font-medium text-foreground">{opportunity.organization}</span>
                <span>•</span>
                <span>{opportunity.field}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Deadline : {opportunity.deadline}
                </span>
                <Link
                  href={`/emploi/bourses-stages/${opportunity.id}`}
                  className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
                >
                  En savoir plus
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
