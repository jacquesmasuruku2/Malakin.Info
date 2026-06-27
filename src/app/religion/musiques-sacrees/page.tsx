import Link from 'next/link';
import { Calendar, Play, ArrowRight, Music } from 'lucide-react';

export default function MusiquesSacreesPage() {
  const music = [
    {
      id: 1,
      title: 'Chorale gospel : Nouvel album enregistré à Kinshasa',
      description: 'La chorale de la cathédrale présente son nouvel album de chants sacrés traditionnels.',
      duration: '45:30',
      date: '26 Juin 2026',
      tracks: 12,
    },
    {
      id: 2,
      title: 'Louange et adoration : Session live',
      description: 'Enregistrement live d\'une soirée de louange avec les meilleurs artistes gospel du pays.',
      duration: '1:15:00',
      date: '25 Juin 2026',
      tracks: 8,
    },
    {
      id: 3,
      title: 'Chants traditionnels africains',
      description: 'Collection de chants liturgiques traditionnels revisités avec des arrangements modernes.',
      duration: '38:45',
      date: '24 Juin 2026',
      tracks: 10,
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/religion" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour à Religion
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Musiques Sacrées</h1>
          <p className="text-xl text-gray-200">
            Chorales, louanges et chants liturgiques pour élever votre âme
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {music.map((item) => (
            <article
              key={item.id}
              className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-8 flex items-center justify-center">
                <Music className="w-16 h-16 text-primary" />
              </div>
              <div className="p-6">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Play className="w-4 h-4" />
                    {item.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {item.date}
                  </span>
                  <span>{item.tracks} pistes</span>
                </div>
                <Link
                  href={`/religion/musiques-sacrees/${item.id}`}
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
