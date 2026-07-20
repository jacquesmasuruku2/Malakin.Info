import Link from 'next/link';
import { Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';

export default function MeditationsPage() {
  const meditations = [
    {
      id: 1,
      title: 'Méditation du jour : La paix intérieure',
      excerpt: 'Un moment de calme et de réflexion pour trouver la paix au milieu des tumultes de la vie.',
      date: '27 Juin 2026',
      readTime: '5 min',
      verse: 'Philippiens 4:7',
    },
    {
      id: 2,
      title: 'Méditation : La confiance en Dieu dans les épreuves',
      excerpt: 'Comment maintenir sa foi et sa confiance même dans les moments difficiles.',
      date: '26 Juin 2026',
      readTime: '7 min',
      verse: 'Psaumes 46:1',
    },
    {
      id: 3,
      title: 'Méditation : La gratitude comme chemin de vie',
      excerpt: 'Découvrir comment la pratique de la gratitude transforme notre quotidien.',
      date: '25 Juin 2026',
      readTime: '6 min',
      verse: '1 Thessaloniciens 5:18',
    },
    {
      id: 4,
      title: 'Méditation : L\'amour inconditionnel',
      excerpt: 'Réflexion sur la nature de l\'amour véritable et comment le pratiquer au quotidien.',
      date: '24 Juin 2026',
      readTime: '8 min',
      verse: 'Jean 13:34',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/religion" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour à Religion
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Méditations</h1>
          <p className="text-xl text-gray-200">
            Moments de réflexion et de prière pour nourrir votre foi quotidienne
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {meditations.map((meditation) => (
            <article
              key={meditation.id}
              className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-primary"
            >
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">{meditation.verse}</span>
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                {meditation.title}
              </h3>
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {meditation.excerpt}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {meditation.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {meditation.readTime}
                </span>
              </div>
              <Link
                href={`/religion/meditations/${meditation.id}`}
                className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
              >
                Lire la méditation
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
