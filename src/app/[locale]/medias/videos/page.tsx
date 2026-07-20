import Link from 'next/link';
import { Calendar, Play, ArrowRight } from 'lucide-react';

export default function VideosPage() {
  const videos = [
    {
      id: 1,
      title: 'Reportage exclusif : Le quotidien des entrepreneurs africains',
      description: 'Découvrez les défis et les succès des startups qui transforment le continent.',
      thumbnail: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=400&fit=crop',
      duration: '12:34',
      date: '27 Juin 2026',
    },
    {
      id: 2,
      title: 'Documentaire : L\'histoire de la musique africaine',
      description: 'Un voyage à travers les époques et les styles musicaux qui ont façonné l\'Afrique.',
      thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
      duration: '45:20',
      date: '26 Juin 2026',
    },
    {
      id: 3,
      title: 'Interview exclusive : Le Président sur l\'avenir du continent',
      description: 'Entretien avec le président sur les défis et les opportunités de l\'Afrique.',
      thumbnail: 'https://images.unsplash.com/photo-1541872703-74c5963631df?w=800&h=400&fit=crop',
      duration: '28:15',
      date: '25 Juin 2026',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/medias" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour aux Médias
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Vidéos</h1>
          <p className="text-xl text-gray-200">
            Reportages, documentaires et interviews en vidéo
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map((video) => (
            <article
              key={video.id}
              className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative h-48">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/70 text-white text-xs rounded">
                  {video.duration}
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Calendar className="w-4 h-4" />
                  {video.date}
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                  {video.title}
                </h3>
                <p className="text-muted-foreground line-clamp-2 mb-4">
                  {video.description}
                </p>
                <Link
                  href={`/medias/videos/${video.id}`}
                  className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
                >
                  Regarder
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
