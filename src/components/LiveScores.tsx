'use client';

import { useEffect, useState } from 'react';
import { Activity, Clock3, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import type { LiveScoreMatch } from '@/types/live-scores';

type LiveScoresProps = {
  locale?: string;
};

const REFRESH_INTERVAL_MS = 300_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || (typeof value === 'number' && Number.isFinite(value));
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function isLiveScoreMatch(value: unknown): value is LiveScoreMatch {
  return (
    isRecord(value) &&
    isRecord(value.fixture) &&
    typeof value.fixture.id === 'number' &&
    isRecord(value.fixture.status) &&
    isNullableNumber(value.fixture.status.elapsed) &&
    isNullableString(value.fixture.status.short) &&
    isNullableString(value.fixture.status.long) &&
    isRecord(value.league) &&
    typeof value.league.id === 'number' &&
    typeof value.league.name === 'string' &&
    isNullableString(value.league.logo) &&
    isNullableString(value.league.country) &&
    isRecord(value.teams) &&
    isRecord(value.teams.home) &&
    isNullableNumber(value.teams.home.id) &&
    typeof value.teams.home.name === 'string' &&
    isNullableString(value.teams.home.logo) &&
    isRecord(value.teams.away) &&
    isNullableNumber(value.teams.away.id) &&
    typeof value.teams.away.name === 'string' &&
    isNullableString(value.teams.away.logo) &&
    isRecord(value.goals) &&
    isNullableNumber(value.goals.home) &&
    isNullableNumber(value.goals.away)
  );
}

export default function LiveScores({ locale = 'fr' }: LiveScoresProps) {
  const english = locale === 'en';
  const [matches, setMatches] = useState<LiveScoreMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function refreshScores() {
      try {
        const response = await fetch('/api/live-scores', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Scores API responded with HTTP ${response.status}.`);
        }

        const payload: unknown = await response.json();
        if (
          !isRecord(payload) ||
          !Array.isArray(payload.matches) ||
          !payload.matches.every(isLiveScoreMatch)
        ) {
          throw new Error('Scores API returned an invalid response.');
        }

        if (isMounted) {
          setMatches(payload.matches);
          setHasError(false);
          setUpdatedAt(new Date().toISOString());
        }
      } catch (error) {
        console.error('Unable to refresh live football scores:', error);
        if (isMounted) setHasError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void refreshScores();
    const intervalId = window.setInterval(refreshScores, REFRESH_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <section
      aria-labelledby="live-scores-title"
      className="border-y border-border bg-muted/40 py-10 sm:py-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
              <Activity className="h-4 w-4" aria-hidden="true" />
              Football
            </p>
            <h1
              id="live-scores-title"
              className="font-heading text-2xl font-bold text-foreground sm:text-3xl"
            >
              {english ? 'Live matches' : 'Matches en direct'}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            {updatedAt
              ? `${english ? 'Updated at' : 'Actualisé à'} ${new Date(updatedAt).toLocaleTimeString(
                  english ? 'en-US' : 'fr-FR',
                  {
                    hour: '2-digit',
                    minute: '2-digit',
                  },
                )}`
              : english
                ? 'Refreshes every 5 minutes'
                : 'Actualisation toutes les 5 minutes'}
          </div>
        </div>

        {isLoading ? (
          <>
            <p role="status" className="sr-only">
              {english ? 'Loading live matches' : 'Chargement des matches en direct'}
            </p>
            <ul aria-hidden="true" className="grid gap-4 md:grid-cols-2">
              {[0, 1, 2, 3].map((item) => (
                <li
                  key={item}
                  className="animate-pulse rounded-xl border border-border bg-white p-5 shadow-sm dark:bg-card sm:p-6"
                >
                  <div className="mb-5 h-4 w-2/5 rounded bg-muted" />
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div className="h-10 w-2/5 rounded bg-muted" />
                    <div className="h-8 w-16 rounded bg-muted" />
                    <div className="h-10 w-2/5 rounded bg-muted" />
                  </div>
                  <div className="h-3 w-1/4 rounded bg-muted" />
                </li>
              ))}
            </ul>
          </>
        ) : matches.length > 0 ? (
          <>
            <ul className="grid gap-4 md:grid-cols-2">
              {matches.map((match) => (
                <li
                  key={match.fixture.id}
                  className="rounded-xl border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:bg-card sm:p-6"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      {match.league.logo && (
                        <Image
                          src={match.league.logo}
                          alt=""
                          width={32}
                          height={32}
                          className="h-8 w-8 shrink-0 object-contain"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {match.league.name}
                        </p>
                        {match.league.country && (
                          <p className="truncate text-xs text-muted-foreground">
                            {match.league.country}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-red-700 dark:bg-red-950/50 dark:text-red-300">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                      {english ? 'LIVE' : 'DIRECT'}
                    </span>
                  </div>

                  <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4">
                    <div className="flex min-w-0 flex-col items-center gap-2 text-center">
                      {match.teams.home.logo && (
                        <Image
                          src={match.teams.home.logo}
                          alt=""
                          width={48}
                          height={48}
                          className="h-10 w-10 object-contain sm:h-12 sm:w-12"
                        />
                      )}
                      <h2 className="break-words text-sm font-semibold text-foreground sm:text-base">
                        {match.teams.home.name}
                      </h2>
                    </div>
                    <p
                      className="whitespace-nowrap font-heading text-2xl font-bold tabular-nums text-primary sm:text-3xl"
                      aria-label={
                        english
                          ? `Score: ${match.goals.home ?? 'unavailable'} to ${match.goals.away ?? 'unavailable'}`
                          : `Score : ${match.goals.home ?? 'non disponible'} à ${match.goals.away ?? 'non disponible'}`
                      }
                    >
                      {match.goals.home ?? '–'}{' '}
                      <span className="text-muted-foreground">:</span>{' '}
                      {match.goals.away ?? '–'}
                    </p>
                    <div className="flex min-w-0 flex-col items-center gap-2 text-center">
                      {match.teams.away.logo && (
                        <Image
                          src={match.teams.away.logo}
                          alt=""
                          width={48}
                          height={48}
                          className="h-10 w-10 object-contain sm:h-12 sm:w-12"
                        />
                      )}
                      <h2 className="break-words text-sm font-semibold text-foreground sm:text-base">
                        {match.teams.away.name}
                      </h2>
                    </div>
                  </div>

                  {match.fixture.status.elapsed !== null && (
                    <p className="mt-4 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                      {match.fixture.status.elapsed}&apos;
                    </p>
                  )}
                </li>
              ))}
            </ul>
            {hasError && (
              <p role="status" className="mt-3 text-xs text-muted-foreground">
                {english
                  ? 'Refresh failed. Showing the latest available scores.'
                  : "L'actualisation a échoué. Les derniers scores disponibles sont affichés."}
              </p>
            )}
          </>
        ) : hasError ? (
          <p
            role="status"
            className="rounded-xl border border-border bg-card px-5 py-8 text-center text-sm text-muted-foreground"
          >
            {english
              ? 'Scores are temporarily unavailable. Please try again shortly.'
              : 'Les scores ne peuvent pas être chargés pour le moment. Réessayez dans quelques instants.'}
          </p>
        ) : (
          <p className="rounded-xl border border-border bg-card px-5 py-8 text-center text-sm text-muted-foreground">
            {english ? 'No matches are currently in progress.' : "Aucun match n'est en cours actuellement."}
          </p>
        )}
      </div>
    </section>
  );
}
