import Link from 'next/link';
import { ArrowRight, Calendar, Radio, Video } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { withRetry } from '@/lib/database';
import RadioOnAirWidget from '@/components/RadioOnAirWidget';

export const dynamic = 'force-dynamic';

export default async function LiveBroadcastsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const now = new Date();
  let events: any[] = [];
  let radio: { name: string; description: string | null } | null = null;

  try {
    const [eventsResult, radioResult] = await Promise.all([
      withRetry(() => prisma.liveEvent.findMany({
        where: {
          OR: [
            { status: 'LIVE' },
            { status: 'SCHEDULED', startTime: { gte: now } },
          ],
        },
        orderBy: [{ status: 'asc' }, { startTime: 'asc' }],
        take: 24,
      })),
      withRetry(() => prisma.radioStation.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        select: { name: true, description: true },
      })),
    ]);
    events = eventsResult || [];
    radio = radioResult;
  } catch (error) {
    console.error('Live broadcasts page database error:', error);
  }

  const isFrench = locale === 'fr';
  const branhamLinks = [
    { label: isFrench ? 'Tous les sermons' : 'All sermons', href: `/${locale}/religion/message-du-temps/branham/sermons` },
    { label: isFrench ? 'Études bibliques' : 'Bible studies', href: `/${locale}/religion/message-du-temps/branham/etudes-bibliques` },
    { label: isFrench ? 'Prophéties' : 'Prophecies', href: `/${locale}/religion/message-du-temps/branham/propheties` },
    { label: isFrench ? 'Témoignages' : 'Testimonies', href: `/${locale}/religion/message-du-temps/branham/temoignages` },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <section className="bg-[#081c3d] text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <Link href={`/${locale}/medias/live`} className="mb-6 inline-flex text-xs font-bold uppercase tracking-[0.16em] text-[#d4af37] hover:text-white">
            ← {isFrench ? 'Diffusions et médias' : 'Broadcasts and media'}
          </Link>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#d4af37] text-[#081c3d]"><Radio className="h-6 w-6" /></div>
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[#d4af37]">MalakInfo Live</p>
              <h1 className="font-heading text-4xl font-black tracking-[-0.03em] sm:text-5xl">{isFrench ? 'Diffusion en direct' : 'Live broadcasts'}</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">
                {isFrench
                  ? 'Écoutez la radio MalakInfo, puis suivez les prédications, les enseignements de William Branham et tous les événements diffusés en ligne.'
                  : 'Listen to MalakInfo radio, then follow sermons, William Branham teachings and every event broadcast online.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#1f7a6a]">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 py-10 text-center sm:px-6 lg:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/80">Radio</p>
          <h2 className="font-heading text-2xl font-black text-white sm:text-3xl">
            {isFrench ? 'Flux radio en direct' : 'Live radio stream'}
          </h2>
          <RadioOnAirWidget
            name={radio?.name || 'Radio MalakInfo'}
            onlineLabel={isFrench ? 'en ligne' : 'on air'}
          />
          <p className="max-w-xl text-sm leading-6 text-white/85">
            {radio?.description || (isFrench
              ? 'Cliquez sur le lecteur pour lancer ou mettre en pause le direct.'
              : 'Click the player to start or pause the live stream.')}
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section>
          <div className="mb-6 flex items-end justify-between border-b border-slate-200 pb-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b88f18]">En ligne</p>
              <h2 className="mt-2 font-heading text-2xl font-black text-[#081c3d] sm:text-3xl">{isFrench ? 'Événements à regarder' : 'Events to watch'}</h2>
            </div>
            <Video className="h-7 w-7 text-[#0b3b8b]" />
          </div>

          {events.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => {
                const isLive = event.status === 'LIVE';
                return (
                  <article key={event.id} className="overflow-hidden border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                    <Link href={`/${locale}/medias/live/${event.id}`} className="block">
                      <div className="relative h-52 overflow-hidden bg-[#e8edf2]">
                        {event.thumbnail ? <img src={event.thumbnail} alt={event.title} className="h-full w-full object-cover transition duration-500 hover:scale-105" /> : <div className="flex h-full items-center justify-center"><Radio className="h-12 w-12 text-[#0b3b8b]" /></div>}
                        <span className={`absolute left-3 top-3 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white ${isLive ? 'bg-red-600' : 'bg-[#0b3b8b]'}`}>
                          {isLive ? '● EN DIRECT' : isFrench ? 'À VENIR' : 'UPCOMING'}
                        </span>
                      </div>
                    </Link>
                    <div className="p-5">
                      <h3 className="font-heading text-xl font-bold leading-tight text-[#081c3d]">{event.title}</h3>
                      {event.description && <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{event.description}</p>}
                      <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500"><Calendar className="h-4 w-4" />{new Date(event.startTime).toLocaleString(isFrench ? 'fr-FR' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                      <Link href={`/${locale}/medias/live/${event.id}`} className="mt-5 inline-flex items-center text-[11px] font-bold uppercase tracking-[0.14em] text-[#0b3b8b] hover:text-[#b88f18]">{isLive ? (isFrench ? 'Regarder maintenant' : 'Watch now') : (isFrench ? 'Voir les détails' : 'View details')}<ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-slate-600">{isFrench ? 'Aucune diffusion programmée pour le moment.' : 'No broadcasts are scheduled at the moment.'}</div>
          )}
        </section>

        <section className="border border-[#d9e1ee] bg-white p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b88f18]">William Branham</p>
              <h2 className="mt-2 font-heading text-2xl font-black text-[#081c3d]">{isFrench ? 'Prédications et enseignements' : 'Sermons and teachings'}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{isFrench ? 'Retrouvez la collection des sermons, prophéties, témoignages et études bibliques de William Branham.' : 'Explore the collection of William Branham sermons, prophecies, testimonies and Bible studies.'}</p>
            </div>
            <Link href={`/${locale}/religion/message-du-temps/branham`} className="inline-flex shrink-0 items-center justify-center bg-[#0b3b8b] px-5 py-3 text-sm font-bold text-white hover:bg-[#082a63]">{isFrench ? 'Ouvrir la collection' : 'Open collection'}<ArrowRight className="ml-2 h-4 w-4" /></Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {branhamLinks.map((item) => <Link key={item.href} href={item.href} className="border border-slate-200 px-4 py-3 text-sm font-semibold text-[#081c3d] hover:border-[#d4af37] hover:bg-[#fffaf0]">{item.label}<ArrowRight className="ml-2 inline h-4 w-4 text-[#b88f18]" /></Link>)}
          </div>
        </section>
      </main>
    </div>
  );
}
