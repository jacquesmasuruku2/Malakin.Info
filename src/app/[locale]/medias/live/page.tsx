import Link from 'next/link';
import { Radio, ArrowRight, Clock } from 'lucide-react';

export default function LivePage() {
  const liveStreams = [
    {
      id: 1,
      title: 'Direct : Session parlementaire spéciale',
      description: 'Suivez en direct les débats parlementaires sur les réformes constitutionnelles.',
      status: 'En cours',
      viewers: 1250,
      startedAt: '14:30',
    },
    {
      id: 2,
      title: 'Conférence de presse : Ministère de la Santé',
      description: 'Annonce importante concernant la nouvelle politique de santé publique.',
      status: 'À venir',
      scheduledFor: '16:00',
    },
    {
      id: 3,
      title: 'Concert live : Festival de musique africaine',
      description: 'Diffusion en direct du concert de clôture du festival.',
      status: 'À venir',
      scheduledFor: '20:00',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/medias" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour aux Médias
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Live</h1>
          <p className="text-xl text-gray-200">
            Diffusions en direct et événements en temps réel
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-4">
          {liveStreams.map((stream) => (
            <article
              key={stream.id}
              className={`bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 ${
                stream.status === 'En cours' ? 'border-red-500' : 'border-primary'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="w-full md:w-48 h-32 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Radio className="w-12 h-12 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {stream.status === 'En cours' ? (
                      <span className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full animate-pulse">
                        🔴 {stream.status}
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                        {stream.status}
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                    {stream.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">{stream.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {stream.status === 'En cours' ? (
                      <>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Démarré à {stream.startedAt}
                        </span>
                        <span>{stream.viewers} spectateurs</span>
                      </>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Prévu à {stream.scheduledFor}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {stream.status === 'En cours' ? (
                    <Link
                      href={`/medias/live/${stream.id}`}
                      className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    >
                      Regarder
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  ) : (
                    <button className="inline-flex items-center px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium">
                      Rappel
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
