import Link from 'next/link';
import { ArrowRight, Play, Radio } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { withRetry } from '@/lib/database';
import { pickCopy } from '@/lib/copy';
import { SITE_TIMEZONE } from '@/lib/article-dates';

export const revalidate = 30;

type LiveRow = {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  status: 'SCHEDULED' | 'LIVE' | 'ENDED';
  startTime: Date;
  viewerCount: number;
};

function formatLiveWhen(value: Date, locale: string) {
  const dateLocale =
    locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : 'fr-FR';
  return new Date(value).toLocaleString(dateLocale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: SITE_TIMEZONE,
  });
}

export default async function LivePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  let events: LiveRow[] = [];
  try {
    const rows = await withRetry(() =>
      prisma.liveEvent.findMany({
        orderBy: [{ status: 'asc' }, { startTime: 'desc' }],
        take: 40,
        select: {
          id: true,
          title: true,
          description: true,
          thumbnail: true,
          status: true,
          startTime: true,
          viewerCount: true,
        },
      }),
    );
    events = (rows || []) as LiveRow[];
  } catch (error) {
    console.error('[medias/live] database error:', error);
  }

  const liveNow = events.filter((event) => event.status === 'LIVE');
  const upcoming = events
    .filter((event) => event.status === 'SCHEDULED')
    .sort((a, b) => +a.startTime - +b.startTime);
  const ended = events
    .filter((event) => event.status === 'ENDED')
    .sort((a, b) => +b.startTime - +a.startTime)
    .slice(0, 8);

  const featured = liveNow[0] || upcoming[0] || null;
  const secondary = [
    ...liveNow.filter((event) => event.id !== featured?.id),
    ...upcoming.filter((event) => event.id !== featured?.id),
  ];
  const copy = {
    headline: pickCopy(locale, {
      fr: 'Diffusion en direct',
      en: 'Live broadcasts',
      es: 'Emisiones en directo',
      sw: 'Matangazo moja kwa moja',
      ln: 'Diffusion ya direct',
      rw: 'Itangazamakuru ry’ako kanya',
    }),
    lead: pickCopy(locale, {
      fr: 'Suivez les événements MalakInfo en temps réel : débats, cérémonies, sport et moments forts. Dans cet espace, vous écoutez aussi les prédications.',
      en: 'Follow MalakInfo events in real time: debates, ceremonies, sport and key moments. In this space, you can also listen to sermons.',
      es: 'Sigue los eventos de MalakInfo en tiempo real: debates, ceremonias, deporte y momentos clave. En este espacio también puedes escuchar las predicaciones.',
      sw: 'Fuatilia matukio ya MalakInfo moja kwa moja. Katika nafasi hii unaweza pia kusikiliza mahubiri.',
      ln: 'Banda ba événement ya MalakInfo na ntango ya solo. Na esika oyo, oyoka mpe ba prédication.',
      rw: 'Kurikira ibikorwa bya MalakInfo ako kanya. Muri aya mahugurwa nanone wumva ubutumwa.',
    }),
    watch: pickCopy(locale, {
      fr: 'Regarder le direct',
      en: 'Watch live',
      es: 'Ver en directo',
      sw: 'Tazama moja kwa moja',
      ln: 'Tala direct',
      rw: 'Reba ako kanya',
    }),
    back: pickCopy(locale, {
      fr: 'Médias',
      en: 'Media',
      es: 'Medios',
      sw: 'Vyombo',
      ln: 'Médias',
      rw: 'Itangazamakuru',
    }),
    onAir: pickCopy(locale, {
      fr: 'En direct',
      en: 'On air',
      es: 'En directo',
      sw: 'Moja kwa moja',
      ln: 'Na direct',
      rw: 'Ako kanya',
    }),
    upcoming: pickCopy(locale, {
      fr: 'À venir',
      en: 'Upcoming',
      es: 'Próximos',
      sw: 'Zijazo',
      ln: 'Oyo ekoya',
      rw: 'Bizaza',
    }),
    replays: pickCopy(locale, {
      fr: 'Replays',
      en: 'Replays',
      es: 'Repeticiones',
      sw: 'Rudia',
      ln: 'Ba replay',
      rw: 'Kongera',
    }),
    empty: pickCopy(locale, {
      fr: 'Aucune diffusion pour le moment. Revenez bientôt.',
      en: 'No broadcast right now. Check back soon.',
      es: 'No hay emisiones por ahora. Vuelve pronto.',
      sw: 'Hakuna matangazo sasa. Rudi baadaye.',
      ln: 'Diffusion te ezali sikoyo. Zonga noki.',
      rw: 'Nta itangazamakuru ubu. Subira vuba.',
    }),
    viewers: pickCopy(locale, {
      fr: 'spectateurs',
      en: 'viewers',
      es: 'espectadores',
      sw: 'watazamaji',
      ln: 'ba spectateur',
      rw: 'abareba',
    }),
    open: pickCopy(locale, {
      fr: 'Ouvrir',
      en: 'Open',
      es: 'Abrir',
      sw: 'Fungua',
      ln: 'Fungola',
      rw: 'Fungura',
    }),
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <section className="relative overflow-hidden bg-[#081c3d] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 12% 15%, rgba(220,38,38,0.28), transparent 50%), radial-gradient(ellipse 60% 45% at 88% 75%, rgba(212,175,55,0.18), transparent 55%), linear-gradient(155deg, #050e1c 0%, #0b3b8b 52%, #081c3d 100%)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(-14deg, transparent, transparent 22px, rgba(255,255,255,0.4) 22px, rgba(255,255,255,0.4) 23px)',
          }}
        />

        <div className="relative mx-auto flex min-h-[min(68vh,520px)] max-w-5xl flex-col justify-end px-4 pb-14 pt-20 sm:px-6 sm:pb-16 lg:px-8">
          <Link
            href={`/${locale}/medias`}
            className="mb-8 w-fit text-xs font-semibold uppercase tracking-[0.16em] text-white/55 transition-colors hover:text-[#d4af37] motion-safe:animate-[fadeInUp_0.5s_ease_both]"
          >
            ← {copy.back}
          </Link>

          <h1 className="font-heading text-4xl font-bold tracking-tight text-white motion-safe:animate-[fadeInUp_0.55s_ease_both] sm:text-5xl md:text-6xl">
            {copy.headline}
          </h1>
          <p
            className="mt-4 max-w-xl text-base leading-relaxed text-white/80 motion-safe:animate-[fadeInUp_0.55s_ease_both] sm:text-lg"
            style={{ animationDelay: '80ms' }}
          >
            {copy.lead}
          </p>

          {featured?.status === 'LIVE' ? (
            <a
              href={`#direct`}
              className="mt-8 inline-flex w-fit items-center gap-2 border-b border-red-400 pb-1 text-sm font-semibold tracking-wide text-red-300 transition-colors hover:border-white hover:text-white motion-safe:animate-[fadeInUp_0.55s_ease_both]"
              style={{ animationDelay: '200ms' }}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-70" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
              </span>
              {copy.watch}
            </a>
          ) : null}
        </div>
      </section>

      {featured ? (
        <section id="direct" className="scroll-mt-24 bg-[#050e1c]">
          <div className="motion-safe:animate-[fadeInUp_0.6s_ease_both]">
            <Link
              href={`/${locale}/medias/live/${featured.id}`}
              className="group relative block overflow-hidden"
            >
              <div className="relative aspect-[16/9] w-full max-h-[72vh]">
                {featured.thumbnail ? (
                  <img
                    src={featured.thumbnail}
                    alt={featured.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0b3b8b] to-[#081c3d]">
                    <Radio className="h-16 w-16 text-[#d4af37]/80" />
                  </div>
                )}
                {featured.status === 'LIVE' ? (
                  <p className="absolute left-4 top-4 inline-flex items-center gap-2 bg-black/55 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm sm:left-6 sm:top-6">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                    </span>
                    {copy.onAir}
                  </p>
                ) : null}
              </div>
            </Link>

            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
              {featured.status === 'LIVE' && featured.viewerCount > 0 ? (
                <p className="mb-2 text-sm text-white/60">
                  {featured.viewerCount} {copy.viewers}
                </p>
              ) : featured.status !== 'LIVE' ? (
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">
                  {copy.upcoming} · {formatLiveWhen(featured.startTime, locale)}
                </p>
              ) : null}

              <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                {featured.title}
              </h2>
              {featured.description ? (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
                  {featured.description}
                </p>
              ) : null}

              <Link
                href={`/${locale}/medias/live/${featured.id}`}
                className="mt-6 inline-flex items-center gap-2 bg-white px-6 py-3 text-sm font-semibold text-[#081c3d] transition-transform duration-200 hover:-translate-y-0.5"
              >
                <Play className="h-4 w-4 fill-current" />
                {featured.status === 'LIVE' ? copy.watch : copy.open}
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="border-b border-border bg-background px-4 py-20 text-center sm:px-6">
          <Radio className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">{copy.empty}</p>
        </section>
      )}

      {secondary.length > 0 ? (
        <section className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
          <h2 className="font-heading text-2xl font-bold text-foreground motion-safe:animate-[fadeInUp_0.55s_ease_both]">
            {copy.upcoming}
          </h2>
          <ul className="mt-8 divide-y divide-border">
            {secondary.map((event, index) => (
              <li
                key={event.id}
                className="motion-safe:animate-[fadeInUp_0.55s_ease_both]"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <Link
                  href={`/${locale}/medias/live/${event.id}`}
                  className="group flex items-center gap-4 py-5 transition-colors hover:text-primary sm:gap-5"
                >
                  <div className="relative h-20 w-32 shrink-0 overflow-hidden bg-muted sm:h-24 sm:w-40">
                    {event.thumbnail ? (
                      <img
                        src={event.thumbnail}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#081c3d]/10">
                        <Radio className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    {event.status === 'LIVE' ? (
                      <span className="absolute left-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {event.status === 'LIVE' ? (
                        <span className="text-red-600 dark:text-red-400">{copy.onAir}</span>
                      ) : (
                        formatLiveWhen(event.startTime, locale)
                      )}
                    </p>
                    <h3 className="mt-1.5 font-heading text-lg font-semibold text-foreground group-hover:text-primary sm:text-xl">
                      {event.title}
                    </h3>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {ended.length > 0 ? (
        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
            <h2 className="font-heading text-2xl font-bold text-foreground">{copy.replays}</h2>
            <ul className="mt-8 divide-y divide-border">
              {ended.map((event) => (
                <li key={event.id}>
                  <Link
                    href={`/${locale}/medias/live/${event.id}`}
                    className="group flex items-center gap-4 py-4 transition-colors hover:text-primary"
                  >
                    <div className="relative h-16 w-28 shrink-0 overflow-hidden bg-muted">
                      {event.thumbnail ? (
                        <img
                          src={event.thumbnail}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#081c3d]/10">
                          <Radio className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-foreground group-hover:text-primary">
                        {event.title}
                      </span>
                      <time className="mt-0.5 block text-sm text-muted-foreground">
                        {formatLiveWhen(event.startTime, locale)}
                      </time>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </div>
  );
}
