import Link from 'next/link';
import { ArrowDownToLine, ArrowRight, Calendar, Image as ImageIcon, Mic, Play, Radio } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function MediasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isFrench = locale === 'fr';
  let media: any[] = [];
  let liveEvents: any[] = [];
  let radioPrograms: any[] = [];

  try {
    [media, liveEvents, radioPrograms] = await Promise.all([
      prisma.media.findMany({ orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }], take: 24 }),
      prisma.liveEvent.findMany({ where: { OR: [{ status: 'LIVE' }, { status: 'SCHEDULED' }] }, orderBy: { startTime: 'asc' }, take: 6 }),
      prisma.radioProgram.findMany({ where: { OR: [{ isLive: true }, { endTime: { gte: new Date() } }] }, orderBy: [{ isLive: 'desc' }, { startTime: 'asc' }], take: 6 }),
    ]);
  } catch (error) {
    console.error('Media page database error:', error);
  }

  const songs = media.filter((item) => ['SONG', 'MUSIC', 'AUDIO', 'PODCAST'].includes(String(item.type).toUpperCase()));
  const visualMedia = media.filter((item) => !songs.includes(item));

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <section className="bg-[#081c3d] text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[#d4af37]">MalakInfo Media</p>
          <h1 className="font-heading text-4xl font-black tracking-[-0.03em] sm:text-5xl">{isFrench ? 'Médias' : 'Media'}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">{isFrench ? 'Écoutez nos chansons, retrouvez nos programmes audio et suivez les événements diffusés en direct.' : 'Listen to our songs, explore audio programs and follow live events.'}</p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: isFrench ? 'Chansons et audio' : 'Songs and audio', href: `/${locale}/medias#chansons`, icon: Mic },
            { label: isFrench ? 'Photos' : 'Photos', href: `/${locale}/medias/photos`, icon: ImageIcon },
            { label: isFrench ? 'Vidéos' : 'Videos', href: `/${locale}/medias/videos`, icon: Play },
            { label: isFrench ? 'Diffusions en direct' : 'Live broadcasts', href: `/${locale}/medias/live`, icon: Radio },
          ].map(({ label, href, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-3 border border-slate-200 bg-white p-4 font-semibold text-[#081c3d] shadow-sm transition hover:-translate-y-1 hover:border-[#d4af37] hover:shadow-md">
              <Icon className="h-5 w-5 text-[#0b3b8b]" />{label}<ArrowRight className="ml-auto h-4 w-4 text-[#b88f18]" />
            </Link>
          ))}
        </section>

        <section id="chansons">
          <div className="mb-6 flex items-end justify-between border-b border-slate-200 pb-4">
            <div><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b88f18]">Audio</p><h2 className="mt-2 font-heading text-2xl font-black text-[#081c3d] sm:text-3xl">{isFrench ? 'Chansons à écouter' : 'Songs to listen to'}</h2></div>
            <span className="text-xs text-slate-500">{songs.length} {isFrench ? 'publiés' : 'published'}</span>
          </div>
          {songs.length === 0 ? <div className="border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-slate-600">{isFrench ? 'Aucune chanson publiée pour le moment.' : 'No songs published yet.'}</div> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{songs.map((song) => <article key={song.id} className="overflow-hidden border border-slate-200 bg-white shadow-sm"><div className="relative h-40 bg-[#0b315e]">{song.thumbnailUrl ? <img src={song.thumbnailUrl} alt={song.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><Mic className="h-12 w-12 text-[#d4af37]" /></div>}</div><div className="space-y-4 p-5"><div><h3 className="font-heading text-xl font-bold text-[#081c3d]">{song.title}</h3>{song.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{song.description}</p>}</div><audio controls preload="none" className="w-full" src={song.url}>Votre navigateur ne prend pas en charge le lecteur audio.</audio><div className="flex items-center justify-between text-xs text-slate-500"><span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(song.publishedAt).toLocaleDateString(isFrench ? 'fr-FR' : 'en-US')}</span><a href={song.url} download className="inline-flex items-center gap-1 font-bold text-[#0b3b8b] hover:text-[#b88f18]"><ArrowDownToLine className="h-4 w-4" />{isFrench ? 'Télécharger' : 'Download'}</a></div></div></article>)}</div>}
        </section>

        <section>
          <div className="mb-6 flex items-end justify-between border-b border-slate-200 pb-4"><div><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b88f18]">Live</p><h2 className="mt-2 font-heading text-2xl font-black text-[#081c3d]">{isFrench ? 'Événements en direct' : 'Live events'}</h2></div><Link href={`/${locale}/medias/live`} className="text-sm font-bold text-[#0b3b8b]">{isFrench ? 'Tout voir' : 'View all'} <ArrowRight className="inline h-4 w-4" /></Link></div>
          {liveEvents.length === 0 ? <p className="border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">{isFrench ? 'Aucun événement programmé.' : 'No scheduled events.'}</p> : <div className="grid gap-4 md:grid-cols-2">{liveEvents.map((event) => <Link key={event.id} href={`/${locale}/medias/live/${event.id}`} className="border border-slate-200 bg-white p-5 shadow-sm hover:border-[#d4af37]"><span className="text-xs font-bold uppercase tracking-[0.12em] text-red-600">{event.status === 'LIVE' ? '● EN DIRECT' : 'À VENIR'}</span><h3 className="mt-2 font-heading text-xl font-bold text-[#081c3d]">{event.title}</h3><p className="mt-2 text-sm text-slate-500">{new Date(event.startTime).toLocaleString(isFrench ? 'fr-FR' : 'en-US')}</p></Link>)}</div>}
        </section>

        {radioPrograms.length > 0 && <section><div className="mb-6 border-b border-slate-200 pb-4"><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b88f18]">Radio</p><h2 className="mt-2 font-heading text-2xl font-black text-[#081c3d]">{isFrench ? 'Programmes audio' : 'Audio programs'}</h2></div><div className="grid gap-4 md:grid-cols-2">{radioPrograms.map((program) => <div key={program.id} className="border border-slate-200 bg-white p-5"><h3 className="font-heading text-xl font-bold text-[#081c3d]">{program.title}</h3>{program.streamUrl && <audio controls preload="none" className="mt-4 w-full" src={program.streamUrl} />}</div>)}</div></section>}

        {visualMedia.length > 0 && <section><h2 className="mb-5 font-heading text-2xl font-black text-[#081c3d]">{isFrench ? 'Autres médias publiés' : 'Other published media'}</h2><div className="grid gap-4 md:grid-cols-3">{visualMedia.map((item) => <Link key={item.id} href={item.url} className="border border-slate-200 bg-white p-4 hover:border-[#d4af37]"><h3 className="font-semibold text-[#081c3d]">{item.title}</h3><p className="mt-2 text-sm text-slate-600">{item.description}</p></Link>)}</div></section>}
      </main>
    </div>
  );
}
