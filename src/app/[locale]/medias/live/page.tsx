'use client';

import Link from 'next/link';
import { Radio, ArrowRight, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LiveEvent {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  streamUrl: string | null;
  youtubeUrl: string | null;
  status: 'SCHEDULED' | 'LIVE' | 'ENDED';
  startTime: Date;
  endTime: Date | null;
  viewerCount: number;
  isFeatured: boolean;
  category?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function LivePage() {
  const [liveStreams, setLiveStreams] = useState<LiveEvent[]>([]);
  const [activeCategory, setActiveCategory] = useState<'all' | 'religion' | 'sport' | 'other'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLiveEvents() {
      try {
        const response = await fetch('/api/live');
        if (!response.ok) throw new Error('Failed to fetch live events');
        const data = await response.json();
        setLiveStreams(data);
      } catch (err) {
        setError('Erreur lors du chargement des événements live');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchLiveEvents();
  }, []);

  const filteredLiveStreams = liveStreams.filter((stream) => {
    if (activeCategory === 'all') return true;
    const categoryLabel = stream.category?.toLowerCase() || '';
    if (activeCategory === 'religion') {
      return categoryLabel.includes('religion') || categoryLabel.includes('religieux');
    }
    if (activeCategory === 'sport') {
      return categoryLabel.includes('sport');
    }
    return categoryLabel !== '' && !categoryLabel.includes('sport') && !categoryLabel.includes('religion');
  });

  function formatStatus(status: string): string {
    switch (status) {
      case 'LIVE': return 'En cours';
      case 'SCHEDULED': return 'À venir';
      case 'ENDED': return 'Terminé';
      default: return status;
    }
  }

  function formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  if (loading) {
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
          <div className="text-center">Chargement...</div>
        </div>
      </div>
    );
  }

  if (error) {
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
          <div className="text-center text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  if (liveStreams.length === 0) {
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
          <div className="text-center text-muted-foreground">
            Aucune diffusion en direct actuellement.
          </div>
        </div>
      </div>
    );
  }

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
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-2 rounded-full text-sm font-medium ${activeCategory === 'all' ? 'bg-primary text-white' : 'bg-muted'}`}
          >
            Tous
          </button>
          <button
            onClick={() => setActiveCategory('religion')}
            className={`px-3 py-2 rounded-full text-sm font-medium ${activeCategory === 'religion' ? 'bg-primary text-white' : 'bg-muted'}`}
          >
            Religion
          </button>
          <button
            onClick={() => setActiveCategory('sport')}
            className={`px-3 py-2 rounded-full text-sm font-medium ${activeCategory === 'sport' ? 'bg-primary text-white' : 'bg-muted'}`}
          >
            Sport
          </button>
          <button
            onClick={() => setActiveCategory('other')}
            className={`px-3 py-2 rounded-full text-sm font-medium ${activeCategory === 'other' ? 'bg-primary text-white' : 'bg-muted'}`}
          >
            Autres
          </button>
        </div>
        <div className="space-y-4">
          {filteredLiveStreams.map((stream) => (
            <article
              key={stream.id}
              className={`bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 ${
                stream.status === 'LIVE' ? 'border-red-500' : 'border-primary'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                {stream.thumbnail ? (
                  <img
                    src={stream.thumbnail}
                    alt={stream.title}
                    className="w-full md:w-48 h-32 object-cover rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-full md:w-48 h-32 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Radio className="w-12 h-12 text-primary" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {stream.status === 'LIVE' ? (
                      <span className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full animate-pulse">
                        🔴 {formatStatus(stream.status)}
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                        {formatStatus(stream.status)}
                      </span>
                    )}
                    {stream.category ? (
                      <span className="px-3 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                        {stream.category}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                    {stream.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">{stream.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {stream.status === 'LIVE' ? (
                      <>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Démarré à {formatTime(stream.startTime)}
                        </span>
                        <span>{stream.viewerCount} spectateurs</span>
                      </>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(stream.startTime)} à {formatTime(stream.startTime)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {stream.status === 'LIVE' ? (
                    <Link
                      href={`/medias/live/${stream.id}`}
                      className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    >
                      Regarder
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  ) : stream.status === 'SCHEDULED' ? (
                    <button className="inline-flex items-center px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium">
                      Rappel
                    </button>
                  ) : (
                    <Link
                      href={`/medias/live/${stream.id}`}
                      className="inline-flex items-center px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium"
                    >
                      Voir le replay
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
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
