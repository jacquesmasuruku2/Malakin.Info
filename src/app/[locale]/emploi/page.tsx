import Link from 'next/link';
import { ArrowRight, Briefcase, Calendar, MapPin } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { withRetry } from '@/lib/database';

export const revalidate = 60;

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatDate(value: Date | string, locale: string) {
  return new Date(value).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function EmploiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isFrench = locale === 'fr';

  const jobOffers =
    (await withRetry(() =>
      prisma.jobOffer.findMany({
        where: { publishedAt: { lte: new Date() } },
        orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
        take: 40,
      })
    )) || [];

  const heroImage =
    jobOffers.find((job) => job.imageUrl)?.imageUrl ||
    'https://media.malakinfo.com/images_blogs/Kinshasa.png';

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <section className="relative isolate overflow-hidden bg-[#081c3d] text-white">
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center opacity-35"
          style={{ backgroundImage: `url(${heroImage})` }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(120deg,rgba(8,28,61,0.96)_12%,rgba(11,59,139,0.78)_58%,rgba(8,28,61,0.88)_100%)]"
          aria-hidden
        />
        <div
          className="absolute -right-16 top-10 h-64 w-64 rounded-full bg-[#d4af37]/15 blur-3xl motion-safe:animate-[pulse_7s_ease-in-out_infinite]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.28em] text-[#d4af37]">
            MalakInfo Emploi
          </p>
          <h1 className="font-heading text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            {isFrench ? 'Emploi' : 'Careers'}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-blue-100/90 sm:text-lg">
            {isFrench
              ? 'Opportunités éditoriales et professionnelles publiées par MalakInfo.'
              : 'Editorial and professional opportunities published by MalakInfo.'}
          </p>
          <a
            href="#offres"
            className="mt-8 inline-flex items-center gap-2 border border-[#d4af37]/70 bg-[#d4af37] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#081c3d] transition hover:bg-white"
          >
            {isFrench ? 'Voir les offres' : 'Browse openings'}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <main id="offres" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-10 flex flex-col gap-3 border-b border-[#081c3d]/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#0b3b8b]">
              {isFrench ? 'Ouvertures' : 'Openings'}
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold text-[#081c3d] sm:text-4xl">
              {isFrench ? 'Offres d’emploi' : 'Job offers'}
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            {jobOffers.length === 0
              ? isFrench
                ? 'Aucune offre pour le moment'
                : 'No openings yet'
              : isFrench
                ? `${jobOffers.length} offre${jobOffers.length > 1 ? 's' : ''} publiée${jobOffers.length > 1 ? 's' : ''}`
                : `${jobOffers.length} opening${jobOffers.length > 1 ? 's' : ''}`}
          </p>
        </div>

        {jobOffers.length === 0 ? (
          <div className="border border-dashed border-slate-300 bg-white/70 px-6 py-20 text-center text-slate-600">
            {isFrench
              ? 'Aucune offre d’emploi disponible pour le moment. Revenez bientôt.'
              : 'No job offers are available right now. Check back soon.'}
          </div>
        ) : (
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {jobOffers.map((job, index) => {
              const excerpt = stripHtml(job.description || '').slice(0, 140);
              const href = `/${locale}/emploi/${job.slug}`;

              return (
                <article
                  key={job.id}
                  className="group motion-safe:animate-[fadeInUp_0.55s_ease_both]"
                  style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
                >
                  <Link href={href} className="block">
                    <div className="relative mb-4 aspect-[16/10] overflow-hidden bg-[#081c3d]">
                      {job.imageUrl ? (
                        <img
                          src={job.imageUrl}
                          alt=""
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,0.28),transparent_45%),linear-gradient(160deg,#0b3b8b,#081c3d)]">
                          <Briefcase className="h-10 w-10 text-[#d4af37]" />
                        </div>
                      )}
                      {job.featured ? (
                        <span className="absolute bottom-3 left-3 bg-[#d4af37] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#081c3d]">
                          {isFrench ? 'Vedette' : 'Featured'}
                        </span>
                      ) : null}
                    </div>

                    <span className="mb-2 inline-block bg-[#0b3b8b] px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                      {job.type}
                    </span>

                    <time
                      dateTime={new Date(job.publishedAt).toISOString()}
                      className="mb-1.5 flex items-center gap-1.5 text-xs text-slate-500"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(job.publishedAt, locale)}
                    </time>

                    <h3 className="font-heading text-[1.25rem] font-bold leading-snug text-[#081c3d] transition-colors group-hover:text-[#0b3b8b]">
                      {job.title}
                    </h3>

                    {excerpt ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                        {excerpt}
                        {excerpt.length >= 140 ? '…' : ''}
                      </p>
                    ) : null}

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      {job.location ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.location}
                        </span>
                      ) : null}
                      {job.salary ? <span>{job.salary}</span> : null}
                    </div>

                    <span className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0b3b8b] transition group-hover:gap-3 group-hover:text-[#b88f18]">
                      {isFrench ? 'Voir l’offre' : 'View opening'}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
