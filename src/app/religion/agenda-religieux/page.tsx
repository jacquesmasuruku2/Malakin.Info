import Link from 'next/link';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';

export default function AgendaReligieuxPage() {
  const events = [
    {
      id: 1,
      title: 'Messe spéciale Fête Nationale',
      description: 'Célébration solennelle pour la fête nationale avec participation des autorités.',
      date: '30 Juin 2026',
      time: '10:00',
      location: 'Cathédrale Notre-Dame, Kinshasa',
      type: 'Messe',
    },
    {
      id: 2,
      title: 'Conférence sur la vie spirituelle',
      description: 'Conférence animée par Mgr. Jean-Pierre sur la croissance spirituelle.',
      date: '5 Juillet 2026',
      time: '15:00',
      location: 'Centre Paroissial Saint-Pierre',
      type: 'Conférence',
    },
    {
      id: 3,
      title: 'Concert de musique sacrée',
      description: 'Concert exceptionnel de la chorale gospel de la cathédrale.',
      date: '10 Juillet 2026',
      time: '18:00',
      location: 'Église Sainte-Anne',
      type: 'Concert',
    },
    {
      id: 4,
      title: 'Retraite spirituelle de fin de semaine',
      description: 'Week-end de retraite pour approfondir sa foi et se ressourcer.',
      date: '15-16 Juillet 2026',
      time: '09:00',
      location: 'Maison de Retraite Saint-Joseph',
      type: 'Retraite',
    },
    {
      id: 5,
      title: 'Journée mondiale de la jeunesse',
      description: 'Célébration de la jeunesse catholique avec activités et prières.',
      date: '20 Juillet 2026',
      time: '14:00',
      location: 'Paroisse Saint-François',
      type: 'Célébration',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/religion" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour à Religion
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Agenda Religieux</h1>
          <p className="text-xl text-gray-200">
            Messes, conférences, concerts et événements spirituels à venir
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-4">
          {events.map((event) => (
            <article
              key={event.id}
              className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-primary"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="w-24 h-24 bg-primary/10 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-xs text-primary font-medium">
                    {event.date.split(' ')[0]}
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {event.date.split(' ')[1].slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                      {event.type}
                    </span>
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                    {event.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">{event.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {event.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {event.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
