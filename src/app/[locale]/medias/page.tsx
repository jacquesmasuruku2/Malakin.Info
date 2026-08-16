import Link from 'next/link';
import { Calendar, Clock, ArrowRight, Play, Image as ImageIcon, Mic, Radio } from 'lucide-react';

export default function MediasPage() {
  const categories = [
    { name: 'Photos', href: '/medias/photos', icon: ImageIcon, count: 156 },
    { name: 'Vidéos', href: '/medias/videos', icon: Play, count: 89 },
    { name: 'Podcasts', href: '/medias/podcasts', icon: Mic, count: 45 },
    { name: 'Live', href: '/medias/live', icon: Radio, count: 12 },
  ];

  const featuredMedia = [
    {
      id: 1,
      type: 'Vidéo',
      title: 'Reportage exclusif : Le quotidien des entrepreneurs africains',
      description: 'Découvrez les défis et les succès des startups qui transforment le continent.',
      thumbnail: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=450&fit=crop',
      duration: '12:34',
      date: '27 Juin 2026',
    },
    {
      id: 2,
      type: 'Photo',
      title: 'Galerie : Festival des arts de Kinshasa 2026',
      description: 'Les plus belles images du festival qui a rassemblé des artistes de tout le continent.',
      thumbnail: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=450&fit=crop',
      count: 45,
      date: '26 Juin 2026',
    },
    {
      id: 3,
      type: 'Podcast',
      title: 'Interview exclusive : Le futur de l\'éducation en Afrique',
      description: 'Notre invité discute des innovations éducatives et des défis à relever.',
      thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&h=450&fit=crop',
      duration: '45:20',
      date: '25 Juin 2026',
    },
  ];

  const latestMedia = [
    {
      id: 4,
      type: 'Vidéo',
      title: 'Conférence de presse sur la santé publique',
      duration: '8:15',
      date: '27 Juin 2026',
    },
    {
      id: 5,
      type: 'Photo',
      title: 'Match de football : Équipe nationale vs Sénégal',
      count: 32,
      date: '26 Juin 2026',
    },
    {
      id: 6,
      type: 'Podcast',
      title: 'Analyse économique : Les marchés africains',
      duration: '32:10',
      date: '26 Juin 2026',
    },
    {
      id: 7,
      type: 'Live',
      title: 'Direct : Session parlementaire spéciale',
      status: 'En cours',
      date: '27 Juin 2026',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold mb-4">Médias</h1>
          <p className="text-xl text-gray-200">
            Photos, vidéos, podcasts et directs : explorez notre contenu multimédia
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-2xl font-bold text-[#081C3D] mb-3">Le média en images et en direct</h2>
          <p className="text-base leading-relaxed text-gray-700">
            Photos, vidéos, podcasts et diffusions live pour suivre les grands événements, les portraits, les reportages et les sujets qui donnent le rythme de l’actualité.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div>
            <h2 className="font-heading text-2xl font-bold mb-6">À la une</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {featuredMedia.map((media) => (
                <article
                  key={media.id}
                  className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48">
                    <img
                      src={media.thumbnail}
                      alt={media.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-4 left-4 px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
                      {media.type}
                    </span>
                    {media.duration && (
                      <span className="absolute bottom-4 right-4 px-2 py-1 bg-black/70 text-white text-xs rounded">
                        {media.duration}
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Calendar className="w-4 h-4" />
                      {media.date}
                    </div>
                    <h3 className="font-heading text-xl font-semibold text-foreground mb-2 line-clamp-2">
                      {media.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-2 mb-4">
                      {media.description}
                    </p>
                    <Link
                      href={`/medias/${media.id}`}
                      className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
                    >
                      Voir
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            <h2 className="font-heading text-2xl font-bold mb-6">Derniers ajouts</h2>
            <div className="space-y-4">
              {latestMedia.map((media) => (
                <article
                  key={media.id}
                  className="flex items-center gap-4 p-4 bg-card rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                    {media.type === 'Vidéo' && <Play className="w-6 h-6 text-primary" />}
                    {media.type === 'Photo' && <ImageIcon className="w-6 h-6 text-primary" />}
                    {media.type === 'Podcast' && <Mic className="w-6 h-6 text-primary" />}
                    {media.type === 'Live' && <Radio className="w-6 h-6 text-red-500" />}
                  </div>
                  <div className="flex-1">
                    <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded mb-1">
                      {media.type}
                    </span>
                    {media.status === 'En cours' && (
                      <span className="inline-block ml-2 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded animate-pulse">
                        {media.status}
                      </span>
                    )}
                    <h3 className="font-heading font-semibold text-foreground mb-1">
                      {media.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {media.date}
                      </span>
                      {media.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {media.duration}
                        </span>
                      )}
                      {media.count && (
                        <span>{media.count} photos</span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
