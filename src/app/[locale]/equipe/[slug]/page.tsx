import Link from 'next/link';
import { ArrowLeft, ArrowRight, Calendar, Mail, PenLine } from 'lucide-react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ContributorProfilePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const isFrench = locale === 'fr';
  const author = await prisma.author.findUnique({
    where: { slug },
    include: {
      articles: { include: { category: true }, orderBy: { publishedAt: 'desc' } },
      media: { orderBy: { publishedAt: 'desc' } },
    },
  });

  if (!author) notFound();

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <section className="bg-[#081c3d] text-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <Link href={`/${locale}/equipe`} className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#d4af37] hover:text-white"><ArrowLeft className="h-4 w-4" />{isFrench ? 'Retour à l’équipe' : 'Back to team'}</Link>
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
            <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-[#d4af37] bg-[#e9eef4] text-5xl font-heading font-black text-[#0b3b8b]/40 sm:h-40 sm:w-40">
              {author.imageUrl ? <img src={author.imageUrl} alt={author.imageAlt || author.name} className="h-full w-full object-cover" /> : author.name.charAt(0).toUpperCase()}
            </div>
            <div><p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#d4af37]">MalakInfo</p><h1 className="mt-3 font-heading text-4xl font-black tracking-[-0.03em] sm:text-6xl">{author.name}</h1><p className="mt-3 text-sm font-bold uppercase tracking-[0.14em] text-blue-100">{author.role || (isFrench ? 'Contributeur éditorial' : 'Editorial contributor')}</p></div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-5xl space-y-12 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section className="grid gap-8 md:grid-cols-[1fr_280px]">
          <div className="border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b88f18]">{isFrench ? 'À propos' : 'About'}</p><h2 className="mt-2 font-heading text-3xl font-black text-[#081c3d]">{isFrench ? 'Son regard et son engagement' : 'Perspective and commitment'}</h2><p className="mt-5 whitespace-pre-line text-base leading-8 text-slate-600">{author.bio || (isFrench ? 'La biographie de ce contributeur sera bientôt publiée.' : 'This contributor biography will be published soon.')}</p></div>
          <aside className="border border-[#d9e1ee] bg-[#fffaf0] p-6"><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b88f18]">{isFrench ? 'Contribution' : 'Contribution'}</p><div className="mt-5 space-y-4 text-sm text-[#081c3d]"><p className="flex items-center gap-2"><PenLine className="h-4 w-4 text-[#0b3b8b]" />{author.articles.length} article(s)</p><p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-[#0b3b8b]" />{author.media.length} média(s)</p>{author.email && <a href={`mailto:${author.email}`} className="flex items-center gap-2 font-semibold text-[#0b3b8b] hover:text-[#b88f18]"><Mail className="h-4 w-4" />Contacter</a>}</div></aside>
        </section>

        <section><div className="mb-6 flex items-end justify-between border-b border-slate-200 pb-4"><div><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b88f18]">MalakInfo</p><h2 className="mt-2 font-heading text-3xl font-black text-[#081c3d]">{isFrench ? 'Ses contributions' : 'Contributions'}</h2></div><span className="text-xs text-slate-500">{author.articles.length}</span></div>{author.articles.length === 0 ? <div className="border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">{isFrench ? 'Aucune contribution publiée pour le moment.' : 'No published contributions yet.'}</div> : <div className="space-y-4">{author.articles.map((article) => <Link key={article.id} href={`/${locale}/${article.slug}`} className="group flex flex-col gap-5 border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#d4af37] sm:flex-row"><div className="h-32 w-full shrink-0 overflow-hidden bg-[#e9eef4] sm:w-48">{article.mainImageUrl && <img src={article.mainImageUrl} alt={article.title} className="h-full w-full object-cover transition group-hover:scale-105" />}</div><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#b88f18]">{article.category?.title || 'MalakInfo'}</p><h3 className="mt-2 font-heading text-2xl font-bold leading-tight text-[#081c3d] group-hover:text-[#b88f18]">{article.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{article.excerpt}</p><p className="mt-3 text-xs text-slate-500">{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(isFrench ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}<ArrowRight className="ml-2 inline h-4 w-4" /></p></div></Link>)}</div>}</section>
      </main>
    </div>
  );
}
