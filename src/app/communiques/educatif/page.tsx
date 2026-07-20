import Link from 'next/link';
import { Calendar, ArrowRight, GraduationCap } from 'lucide-react';

export default function EducatifPage() {
  const communiques = [
    {
      id: 1,
      organization: 'Université de Kinshasa',
      title: 'Ouverture des inscriptions pour l\'année académique 2026-2027',
      excerpt: 'Les modalités d\'inscription et les nouvelles formations disponibles pour la rentrée prochaine.',
      date: '25 Juin 2026',
      urgent: false,
    },
    {
      id: 2,
      organization: 'Ministère de l\'Éducation',
      title: 'Nouveau programme d\'enseignement numérique',
      excerpt: 'Lancement du programme national pour digitaliser l\'enseignement primaire et secondaire.',
      date: '24 Juin 2026',
      urgent: false,
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/communiques" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour aux Communiqués
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Éducatif</h1>
          <p className="text-xl text-gray-200">
            Communications des établissements éducatifs et institutions académiques
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-4">
          {communiques.map((communique) => (
            <article
              key={communique.id}
              className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-accent"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium text-muted-foreground">{communique.organization}</span>
                </div>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {communique.date}
                </span>
              </div>
              
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                {communique.title}
              </h3>
              
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {communique.excerpt}
              </p>
              
              <Link
                href={`/communiques/educatif/${communique.id}`}
                className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
              >
                Lire le communiqué complet
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
