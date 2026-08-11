'use client';

import Link from 'next/link';
import { ArrowLeft, Play, Clock, Eye } from 'lucide-react';
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
  createdAt: Date;
  updatedAt: Date;
}

export default function LiveEventPage({ params }: { params: Promise<{ id: string }> }) {
  const [event, setEvent] = useState<LiveEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [sessionId] = useState(() => {
    // Generate a unique session ID for this viewer
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  });

  useEffect(() => {
    async function fetchEvent() {
      try {
        const resolvedParams = await params;
        setId(resolvedParams.id);
        const response = await fetch(`/api/live/${resolvedParams.id}`);
        if (!response.ok) throw new Error('Failed to fetch live event');
        const data = await response.json();
        setEvent(data);

        // Join the live event if it's live
        if (data.status === 'LIVE') {
          await fetch(`/api/live/${resolvedParams.id}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
          });
        }
      } catch (err) {
        setError('Erreur lors du chargement de l\'événement');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [params, sessionId]);

  // Heartbeat to keep viewer count accurate
  useEffect(() => {
    if (!id || !event || event.status !== 'LIVE') return;

    const heartbeatInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/live/${id}/heartbeat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });
        if (response.ok) {
          const data = await response.json();
          setEvent(prev => prev ? { ...prev, viewerCount: data.viewerCount } : null);
        }
      } catch (err) {
        console.error('Heartbeat error:', err);
      }
    }, 30000); // Send heartbeat every 30 seconds

    return () => clearInterval(heartbeatInterval);
  }, [id, event, sessionId]);

  function formatStatus(status: string): string {
    switch (status) {
      case 'LIVE': return 'En cours';
      case 'SCHEDULED': return 'À venir';
      case 'ENDED': return 'Terminé';
      default: return status;
    }
  }

  function formatDateTime(date: Date): string {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getVideoUrl(): string | null {
    if (event?.status === 'LIVE' || event?.status === 'ENDED') {
      return event?.streamUrl || event?.youtubeUrl || null;
    }
    return null;
  }

  if (loading) {
    return (
      <div className="flex flex-col">
        <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/medias/live" className="text-gray-300 hover:text-white mb-4 inline-block">
              ← Retour aux Lives
            </Link>
            <h1 className="font-heading text-4xl font-bold mb-4">Chargement...</h1>
          </div>
        </section>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex flex-col">
        <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/medias/live" className="text-gray-300 hover:text-white mb-4 inline-block">
              ← Retour aux Lives
            </Link>
            <h1 className="font-heading text-4xl font-bold mb-4">Erreur</h1>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-red-500">{error || 'Événement non trouvé'}</div>
        </div>
      </div>
    );
  }

  const videoUrl = getVideoUrl();

  if (!id) {
    return (
      <div className="flex flex-col">
        <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/medias/live" className="text-gray-300 hover:text-white mb-4 inline-block">
              ← Retour aux Lives
            </Link>
            <h1 className="font-heading text-4xl font-bold mb-4">Chargement...</h1>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/medias/live" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour aux Lives
          </Link>
          <div className="flex items-center gap-3 mb-4">
            {event.status === 'LIVE' && (
              <span className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full animate-pulse">
                🔴 {formatStatus(event.status)}
              </span>
            )}
            {event.status === 'SCHEDULED' && (
              <span className="px-3 py-1 bg-primary/20 text-white text-sm font-medium rounded-full">
                {formatStatus(event.status)}
              </span>
            )}
            {event.status === 'ENDED' && (
              <span className="px-3 py-1 bg-gray-500 text-white text-sm font-medium rounded-full">
                {formatStatus(event.status)}
              </span>
            )}
          </div>
          <h1 className="font-heading text-4xl font-bold mb-4">{event.title}</h1>
          <p className="text-xl text-gray-200">{event.description}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {videoUrl ? (
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                {event.youtubeUrl ? (
                  <iframe
                    src={event.youtubeUrl.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                ) : (
                  <video
                    src={event.streamUrl || undefined}
                    controls
                    autoPlay={event.status === 'LIVE'}
                    className="w-full h-full"
                  />
                )}
              </div>
            ) : (
              <div className="aspect-video bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-16 h-16 text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {event.status === 'SCHEDULED'
                      ? 'La diffusion n\'a pas encore commencé'
                      : 'Aucune vidéo disponible'}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6">
              <h2 className="font-heading text-2xl font-semibold mb-4">À propos de cet événement</h2>
              <p className="text-muted-foreground">{event.description}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <h3 className="font-heading text-lg font-semibold mb-4">Informations</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Début</p>
                    <p className="font-medium">{formatDateTime(event.startTime)}</p>
                  </div>
                </div>
                {event.endTime && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Fin</p>
                      <p className="font-medium">{formatDateTime(event.endTime)}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Spectateurs</p>
                    <p className="font-medium">{event.viewerCount}</p>
                  </div>
                </div>
              </div>
            </div>

            {event.status === 'LIVE' && (
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-6">
                <h3 className="font-heading text-lg font-semibold mb-2 text-red-500">
                  🔴 En direct
                </h3>
                <p className="text-sm text-muted-foreground">
                  Cet événement est actuellement en cours de diffusion.
                </p>
              </div>
            )}

            {event.status === 'SCHEDULED' && (
              <div className="bg-primary/10 border border-primary rounded-lg p-6">
                <h3 className="font-heading text-lg font-semibold mb-2 text-primary">
                  À venir
                </h3>
                <p className="text-sm text-muted-foreground">
                  Cet événement débutera le {formatDateTime(event.startTime)}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
