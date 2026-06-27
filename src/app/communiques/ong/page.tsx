import Link from 'next/link';
import { Calendar, ArrowRight, Heart } from 'lucide-react';

export default function OngPage() {
  const communiques = [
    {
      id: 1,
      organization: 'UNICEF RDC',
      title: 'Rapport annuel sur la protection de l\'enfance',
      excerpt: 'Bilan des actions menées en 2025 et perspectives pour l\'année 2026 en faveur des enfants.',
      date: '26 Juin 2026',
      urgent: false,
    },
    {
      id: 2,
      organization: 'Croix-Rouge',
      title: 'Appel aux dons pour les victimes des inondations',
      excerpt: 'Situation critique dans l\'est du pays : organisation lance une campagne d\'urgence.',
      date: '24 Juin 2026',
      urgent: true,
    },
    {
      id: 3,
      organization: 'Médecins Sans Frontières',
      title: 'Nouveau centre de santé ouvert dans l\'est',
      excerpt: 'Inauguration d\'un nouveau centre médical pour améliorer l\'accès aux soins.',
      date: '23 Juin 2026',
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
          <h1 className="font-heading text-4xl font-bold mb-4">ONG</h1>
          <p className="text-xl text-gray-200">
            Communications des organisations non gouvernementales et humanitaires
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-4">
          {communiques.map((communique) => (
            <article
              key={communique.id}
              className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-primary"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">{communique.organization}</span>
                </div>
                <div className="flex items-center gap-3">
                  {communique.urgent && (
                    <span className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full animate-pulse">
                      Urgent
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {communique.date}
                  </span>
                </div>
              </div>
              
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                {communique.title}
              </h3>
              
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {communique.excerpt}
              </p>
              
              <Link
                href={`/communiques/ong/${communique.id}`}
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
