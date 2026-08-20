import Link from 'next/link';
import { ArrowRight, Award, Mail, PenLine, Users } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function TeamPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isFrench = locale === 'fr';
  let authors: any[] = [];

  try {
    authors = await prisma.author.findMany({
      include: { _count: { select: { articles: true, media: true } } },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Team page database error:', error);
  }

  const copy = {
    title: isFrench ? 'Équipe & contributeurs' : 'Team & contributors',
    intro: isFrench ? 'Derrière chaque publication, il y a des regards, des voix et un engagement pour une information qui traverse les frontières.' : 'Behind every publication are people, voices and a commitment to information that crosses borders.',
    teamTitle: isFrench ? 'L’équipe éditoriale' : 'The editorial team',
    contributorsTitle: isFrench ? 'Contributeurs honorables' : 'Honorable contributors',
    contributorsText: isFrench ? 'Nous saluons toutes les personnes qui apportent leur expertise, leur témoignage et leur regard à la vie de MalakInfo.' : 'We honor everyone who brings expertise, testimony and perspective to MalakInfo.',
    contact: isFrench ? 'Proposer une contribution' : 'Propose a contribution',
    noAuthors: isFrench ? 'Les profils de l’équipe seront bientôt publiés.' : 'Team profiles will be published soon.',
  };

  const activeAuthors = authors.filter((author) => (author._count?.articles ?? 0) > 0);
  const teamAuthors = authors.filter((author) => /rédact|editor/i.test(author.role || ''));
  const contributorAuthors = activeAuthors.filter((author) => !teamAuthors.some((member) => member.id === author.id));

  const AuthorCard = ({ author, honorable = false }: { author: any; honorable?: boolean }) => (
    <article className="group overflow-hidden border border-[#dfe4ea] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#d4af37] hover:shadow-[0_18px_36px_rgba(8,28,61,0.1)]">
      <div className="relative h-56 overflow-hidden bg-[#e9eef4]">
        {author.imageUrl ? <img src={author.imageUrl} alt={author.imageAlt || author.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-5xl font-heading font-black text-[#0b3b8b]/30">{author.name.charAt(0).toUpperCase()}</div>}
        {honorable && <span className="absolute left-4 top-4 inline-flex items-center gap-1 bg-[#d4af37] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#081c3d]"><Award className="h-3.5 w-3.5" />{isFrench ? 'Contributeur' : 'Contributor'}</span>}
      </div>
      <div className="p-6">
        <h3 className="font-heading text-2xl font-black text-[#081c3d]">{author.name}</h3>
        <p className="mt-1 text-sm font-bold uppercase tracking-[0.12em] text-[#b88f18]">{author.role || (isFrench ? 'Contributeur éditorial' : 'Editorial contributor')}</p>
        {author.bio && <p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-600">{author.bio}</p>}
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1"><PenLine className="h-3.5 w-3.5" />{author._count?.articles ?? 0} article(s)</span>
          {author.email && <a href={`mailto:${author.email}`} aria-label={`Contacter ${author.name}`} className="text-[#0b3b8b] hover:text-[#b88f18]"><Mail className="h-4 w-4" /></a>}
        </div>
      </div>
    </article>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <section className="bg-[#081c3d] text-white"><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20"><p className="mb-4 text-[11px] font-bold uppercase tracking-[0.3em] text-[#d4af37]">MalakInfo</p><h1 className="max-w-4xl font-heading text-5xl font-black leading-[0.98] tracking-[-0.04em] sm:text-6xl lg:text-7xl">{copy.title}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-blue-100">{copy.intro}</p></div></section>
      <main className="mx-auto max-w-7xl space-y-16 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <section><div className="mb-8 flex items-end gap-4 border-b border-slate-200 pb-4"><Users className="h-7 w-7 text-[#0b3b8b]" /><div><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b88f18]">MalakInfo</p><h2 className="mt-1 font-heading text-3xl font-black text-[#081c3d]">{copy.teamTitle}</h2></div></div>{teamAuthors.length > 0 ? <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{teamAuthors.map((author) => <AuthorCard key={author.id} author={author} />)}</div> : <div className="border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">{copy.noAuthors}</div>}</section>
        <section className="border border-[#d9e1ee] bg-white p-6 sm:p-10"><div className="max-w-3xl"><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b88f18]">Reconnaissance</p><h2 className="mt-2 font-heading text-3xl font-black text-[#081c3d]">{copy.contributorsTitle}</h2><p className="mt-4 leading-7 text-slate-600">{copy.contributorsText}</p></div>{contributorAuthors.length > 0 ? <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{contributorAuthors.map((author) => <AuthorCard key={author.id} author={author} honorable />)}</div> : <div className="mt-8 border border-dashed border-slate-300 bg-[#f8f9fb] p-8 text-center text-slate-600">{copy.noAuthors}</div>}</section>
        <div className="text-center"><Link href={`/${locale}/contact`} className="inline-flex items-center gap-2 bg-[#0b3b8b] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#082a63]">{copy.contact}<ArrowRight className="h-4 w-4" /></Link></div>
      </main>
    </div>
  );
}
