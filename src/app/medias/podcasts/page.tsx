import Link from 'next/link';
import { Calendar, Play, ArrowRight, Mic } from 'lucide-react';

export default function PodcastsPage() {
  const podcasts = [
    {
      id: 1,
      title: 'Interview exclusive : Le futur de l\'éducation en Afrique',
      description: 'Notre invité discute des innovations éducatives et des défis à relever.',
      thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&h=400&fit=crop',
      duration: '45:20',
      date: '25 Juin 2026',
      episode: 'Épisode 42',
    },
    {
      id: 2,
      title: 'Débat : La place de l\'Afrique dans l\'économie mondiale',
      description: 'Experts économiques analysent le rôle croissant du continent sur la scène internationale.',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
      duration: '38:15',
      date: '24 Juin 2026',
      episode: 'Épisode 41',
    },
    {
      id: 3,
      title: 'Culture : Les nouveaux talents du cinéma africain',
      description: 'Rencontre avec des réalisateurs qui réinventent le 7ème art africain.',
      thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=400&fit=crop',
      duration: '52:30',
      date: '23 Juin 2026',
      episode: 'Épisode 40',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/medias" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour aux Médias
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Podcasts</h1>
          <p className="text-xl text-gray-200">
            Interviews, débats et analyses audio à écouter
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {podcasts.map((podcast) => (
            <article
              key={podcast.id}
              className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative h-48">
                <img
                  src={podcast.thumbnail}
                  alt={podcast.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/70 text-white text-xs rounded">
                  {podcast.duration}
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Mic className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">{podcast.episode}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Calendar className="w-4 h-4" />
                  {podcast.date}
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                  {podcast.title}
                </h3>
                <p className="text-muted-foreground line-clamp-2 mb-4">
                  {podcast.description}
                </p>
                <Link
                  href={`/medias/podcasts/${podcast.id}`}
                  className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
                >
                  Écouter
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
