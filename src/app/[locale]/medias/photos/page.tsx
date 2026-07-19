import Link from 'next/link';
import { Calendar, ArrowRight, Image as ImageIcon } from 'lucide-react';

export default function PhotosPage() {
  const galleries = [
    {
      id: 1,
      title: 'Galerie : Festival des arts de Kinshasa 2026',
      description: 'Les plus belles images du festival qui a rassemblé des artistes de tout le continent.',
      count: 45,
      date: '26 Juin 2026',
      thumbnail: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=400&fit=crop',
    },
    {
      id: 2,
      title: 'Reportage : La vie quotidienne à Lagos',
      description: 'Clichés capturant l\'énergie et la vitalité de la plus grande ville d\'Afrique.',
      count: 32,
      date: '25 Juin 2026',
      thumbnail: 'https://images.unsplash.com/photo-1574359801655-5df1d4c7dd7b?w=800&h=400&fit=crop',
    },
    {
      id: 3,
      title: 'Nature : Les paysages spectaculaires du Kilimandjaro',
      description: 'Photographies époustouflantes de la montagne la haute d\'Afrique.',
      count: 28,
      date: '24 Juin 2026',
      thumbnail: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&h=400&fit=crop',
    },
    {
      id: 4,
      title: 'Portrait : Les visages de l\'Afrique',
      description: 'Série de portraits mettant en valeur la diversité et la beauté du continent.',
      count: 51,
      date: '23 Juin 2026',
      thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/medias" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour aux Médias
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Photos</h1>
          <p className="text-xl text-gray-200">
            Galeries photographiques et reportages visuels
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {galleries.map((gallery) => (
            <article
              key={gallery.id}
              className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative h-48">
                <img
                  src={gallery.thumbnail}
                  alt={gallery.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/70 text-white text-xs font-medium rounded">
                  {gallery.count} photos
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <ImageIcon className="w-4 h-4" />
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {gallery.date}
                  </span>
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                  {gallery.title}
                </h3>
                <p className="text-muted-foreground line-clamp-2 mb-4">
                  {gallery.description}
                </p>
                <Link
                  href={`/medias/photos/${gallery.id}`}
                  className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
                >
                  Voir la galerie
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
