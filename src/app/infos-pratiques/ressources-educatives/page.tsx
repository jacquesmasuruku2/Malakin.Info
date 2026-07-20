import Link from 'next/link';
import { Calendar, ArrowRight, Download } from 'lucide-react';

export default function RessourcesEducativesPage() {
  const resources = [
    {
      id: 1,
      title: 'Modèle de CV professionnel',
      description: 'Template de CV optimisé pour le marché africain.',
      type: 'PDF',
      size: '245 KB',
      downloads: 1250,
      date: '26 Juin 2026',
    },
    {
      id: 2,
      title: 'Checklist démarrage entreprise',
      description: 'Liste complète des étapes pour lancer votre activité.',
      type: 'PDF',
      size: '180 KB',
      downloads: 890,
      date: '25 Juin 2026',
    },
    {
      id: 3,
      title: 'Guide des impôts 2026',
      description: 'Documentation complète sur la fiscalité en RDC.',
      type: 'PDF',
      size: '1.2 MB',
      downloads: 2100,
      date: '24 Juin 2026',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/infos-pratiques" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour aux Infos Pratiques
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Ressources Éducatives</h1>
          <p className="text-xl text-gray-200">
            Documents et téléchargements utiles
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources.map((resource) => (
            <article
              key={resource.id}
              className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-primary"
            >
              <div className="flex items-center gap-2 mb-3">
                <Download className="w-5 h-5 text-primary" />
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  {resource.type}
                </span>
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                {resource.title}
              </h3>
              <p className="text-muted-foreground mb-4">
                {resource.description}
              </p>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <span>{resource.size}</span>
                <span>{resource.downloads} téléchargements</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {resource.date}
                </span>
                <Link
                  href={`/infos-pratiques/ressources-educatives/${resource.id}`}
                  className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
                >
                  Télécharger
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
