import Link from 'next/link';
import { ArrowRight, Calendar, Play } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function VideosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  let videos: any[] = [];

  try {
    videos = await prisma.media.findMany({
      where: { type: { in: ['VIDEO', 'video', 'VIDÉO', 'vidéo'] } },
      orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
      take: 24,
    });
  } catch (error) {
    console.error('Videos page database error:', error);
  }

  const isFrench = locale === 'fr';
  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <section className="bg-[#081c3d] text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <Link href={`/${locale}/medias`} className="mb-6 inline-flex text-xs font-bold uppercase tracking-[0.16em] text-[#d4af37] hover:text-white">← {isFrench ? 'Retour aux médias' : 'Back to media'}</Link>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[#d4af37]">MalakInfo Media</p>
          <h1 className="font-heading text-4xl font-black sm:text-5xl">{isFrench ? 'Vidéos' : 'Videos'}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">{isFrench ? 'Reportages, documentaires et interviews publiés par notre équipe.' : 'Reports, documentaries and interviews published by our team.'}</p>
        </div>
      </section>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {videos.length === 0 ? <div className="border border-dashed border-slate-300 bg-white px-6 py-20 text-center text-slate-600">{isFrench ? 'Aucune vidéo publiée pour le moment.' : 'No videos have been published yet.'}</div> : <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{videos.map((video) => <article key={video.id} className="overflow-hidden border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#d4af37] hover:shadow-lg"><div className="relative h-56 bg-[#081c3d]">{video.thumbnailUrl ? <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><Play className="h-14 w-14 text-[#d4af37]" /></div>}<span className="absolute left-3 top-3 bg-[#0b3b8b] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">{isFrench ? 'Vidéo' : 'Video'}</span></div><div className="p-5"><div className="flex items-center gap-2 text-xs text-slate-500"><Calendar className="h-4 w-4" />{new Date(video.publishedAt).toLocaleDateString(isFrench ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</div><h2 className="mt-3 font-heading text-2xl font-bold leading-tight text-[#081c3d]">{video.title}</h2>{video.description && <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{video.description}</p>}<video controls preload="metadata" poster={video.thumbnailUrl || undefined} src={video.url} className="mt-5 w-full bg-black">{isFrench ? 'Votre navigateur ne prend pas en charge la vidéo.' : 'Your browser does not support video playback.'}</video><a href={video.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center text-[11px] font-bold uppercase tracking-[0.14em] text-[#0b3b8b] hover:text-[#b88f18]">{isFrench ? 'Ouvrir la vidéo' : 'Open video'}<ArrowRight className="ml-2 h-4 w-4" /></a></div></article>)}</div>}
      </main>
    </div>
  );
}
