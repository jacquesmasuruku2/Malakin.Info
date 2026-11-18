'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type {
  TeamSeasonData,
  TeamSeasonMatch,
  TeamSeasonPlayer,
  TeamSeasonTransfer,
} from '@/types/team-season';

type TeamSeasonDetailsProps = {
  locale: string;
  teamId: number;
  teamLabel: string;
  leagueSlug: string | null;
  initialSeason: number | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || typeof value === 'number';
}

function isTeamSeasonPlayer(value: unknown): value is TeamSeasonPlayer {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    typeof value.name === 'string' &&
    isNullableString(value.number) &&
    isNullableString(value.position) &&
    isNullableNumber(value.age) &&
    isNullableString(value.nationality)
  );
}

function isTeamSeasonMatch(value: unknown): value is TeamSeasonMatch {
  const isSide = (side: unknown) =>
    isRecord(side) &&
    isNullableNumber(side.id) &&
    typeof side.name === 'string' &&
    isNullableString(side.logo) &&
    isNullableNumber(side.score);
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    isNullableString(value.date) &&
    (value.state === 'in' || value.state === 'post' || value.state === 'pre') &&
    isNullableString(value.detail) &&
    isSide(value.home) &&
    isSide(value.away)
  );
}

function isTeamSeasonTransfer(value: unknown): value is TeamSeasonTransfer {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    isNullableString(value.date) &&
    isNullableString(value.playerName) &&
    (value.direction === 'arrival' || value.direction === 'departure') &&
    isNullableString(value.type) &&
    isNullableString(value.amount)
  );
}

function isTeamSeasonData(value: unknown): value is TeamSeasonData {
  return (
    isRecord(value) &&
    isRecord(value.team) &&
    typeof value.team.id === 'number' &&
    typeof value.team.name === 'string' &&
    (value.team.logo === null || typeof value.team.logo === 'string') &&
    typeof value.team.isNational === 'boolean' &&
    typeof value.leagueSlug === 'string' &&
    typeof value.season === 'number' &&
    typeof value.seasonLabel === 'string' &&
    (value.coach === null || typeof value.coach === 'string') &&
    Array.isArray(value.matches) &&
    value.matches.every(isTeamSeasonMatch) &&
    Array.isArray(value.roster) &&
    value.roster.every(isTeamSeasonPlayer) &&
    Array.isArray(value.transfers) &&
    value.transfers.every(isTeamSeasonTransfer) &&
    isRecord(value.unavailable) &&
    typeof value.unavailable.matches === 'boolean' &&
    typeof value.unavailable.roster === 'boolean' &&
    typeof value.unavailable.transfers === 'boolean'
  );
}

function formatDate(value: string | null, english: boolean): string {
  if (!value) return english ? 'Date to be confirmed' : 'Date à confirmer';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return english ? 'Date to be confirmed' : 'Date à confirmer';
  return new Intl.DateTimeFormat(english ? 'en-GB' : 'fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function formatTransferType(value: string | null, english: boolean): string | null {
  if (!value) return null;
  if (english) return value;
  const knownTypes: Record<string, string> = {
    loan: 'Prêt',
    transfer: 'Transfert',
    undisclosed: 'Montant non communiqué',
    'free transfer': 'Transfert libre',
  };
  return knownTypes[value.toLowerCase()] ?? value;
}

function TeamBadge({
  name,
  logo,
}: {
  name: string;
  logo: string | null;
}) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      {logo && (
        <Image
          src={logo}
          alt=""
          width={24}
          height={24}
          className="h-6 w-6 shrink-0 object-contain"
        />
      )}
      <span className="truncate">{name}</span>
    </span>
  );
}

function MatchCard({
  match,
  english,
}: {
  match: TeamSeasonMatch;
  english: boolean;
}) {
  const hasScore =
    match.state !== 'pre' && match.home.score !== null && match.away.score !== null;
  const statusLabel =
    match.state === 'pre'
      ? english
        ? 'Scheduled'
        : 'À venir'
      : match.state === 'in'
        ? match.detail ?? (english ? 'Live' : 'En cours')
        : english
          ? match.detail ?? 'Finished'
          : 'Terminé';
  return (
    <li className="space-y-2 rounded-xl border border-border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <time dateTime={match.date ?? undefined}>{formatDate(match.date, english)}</time>
        <span>{statusLabel}</span>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 text-sm">
        <TeamBadge name={match.home.name} logo={match.home.logo} />
        <span className="font-bold tabular-nums text-foreground">
          {hasScore ? `${match.home.score} - ${match.away.score}` : '—'}
        </span>
        <span className="flex justify-end">
          <TeamBadge name={match.away.name} logo={match.away.logo} />
        </span>
      </div>
    </li>
  );
}

function PlayerRow({
  player,
  showNationality,
  english,
}: {
  player: TeamSeasonPlayer;
  showNationality: boolean;
  english: boolean;
}) {
  const [nationalityVisible, setNationalityVisible] = useState(false);
  return (
    <li className="grid grid-cols-[2.5rem_minmax(0,1fr)_minmax(5rem,0.8fr)_2rem] items-center gap-3 border-b border-border/70 px-3 py-2 last:border-b-0">
      <span className="text-center text-xs font-semibold text-muted-foreground">
        {player.number ?? '—'}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{player.name}</p>
        {showNationality && (
          <div className="flex flex-wrap items-center gap-x-2">
            <button
              type="button"
              aria-expanded={nationalityVisible}
              aria-controls={`player-nationality-${player.id}`}
              onClick={() => setNationalityVisible((visible) => !visible)}
              className="text-left text-[11px] font-medium text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              {nationalityVisible
                ? english
                  ? 'Hide nationality'
                  : 'Masquer la nationalité'
                : english
                  ? 'Nationality'
                  : 'Nationalité'}
            </button>
            {nationalityVisible && (
              <span
                id={`player-nationality-${player.id}`}
                className="text-[11px] text-muted-foreground"
              >
                {player.nationality ??
                  (english ? 'Not provided' : 'Non renseignée')}
              </span>
            )}
          </div>
        )}
      </div>
      <span className="truncate text-xs text-muted-foreground">{player.position ?? '—'}</span>
      <span className="text-right text-xs text-muted-foreground">{player.age ?? '—'}</span>
    </li>
  );
}

function TransferRow({
  transfer,
  english,
}: {
  transfer: TeamSeasonTransfer;
  english: boolean;
}) {
  const type = formatTransferType(transfer.type, english);
  const amountIsType =
    transfer.amount !== null &&
    transfer.type !== null &&
    transfer.amount.toLowerCase() === transfer.type.toLowerCase();
  const amount = amountIsType ? null : transfer.amount;
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">
          {transfer.playerName ??
            (english ? 'Player name unavailable' : 'Nom du joueur indisponible')}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDate(transfer.date, english)}
          {type ? ` · ${type}` : ''}
        </p>
      </div>
      {amount && <span className="text-xs text-muted-foreground">{amount}</span>}
    </li>
  );
}

export default function TeamSeasonDetails({
  locale,
  teamId,
  teamLabel,
  leagueSlug,
  initialSeason,
}: TeamSeasonDetailsProps) {
  const english = locale === 'en';
  const [seasonOverride, setSeasonOverride] = useState(
    initialSeason === null ? '' : String(initialSeason),
  );
  const [data, setData] = useState<TeamSeasonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const selectedSeason = seasonOverride || (data ? String(data.season) : '');

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (leagueSlug) params.set('league', leagueSlug);
    if (seasonOverride) params.set('season', seasonOverride);
    const query = params.toString();

    void (async () => {
      try {
        const response = await fetch(
          `/api/football-teams/${teamId}${query ? `?${query}` : ''}`,
          { signal: controller.signal },
        );
        const payload: unknown = await response.json();
        if (!response.ok) {
          const message =
            isRecord(payload) && typeof payload.error === 'string'
              ? payload.error
              : english
                ? 'Unable to load this team.'
                : 'Impossible de charger cette équipe.';
          throw new Error(message);
        }
        if (!isTeamSeasonData(payload)) {
          throw new Error(
            english
              ? 'The team data response is invalid.'
              : 'La réponse des données de l’équipe est invalide.',
          );
        }
        setData(payload);
      } catch (requestError) {
        if (controller.signal.aborted) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : english
              ? 'Unable to load this team.'
              : 'Impossible de charger cette équipe.',
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [english, leagueSlug, seasonOverride, teamId]);

  const seasonAnchor = data?.season ?? initialSeason ?? new Date().getUTCFullYear();
  const seasonOptions = Array.from({ length: 21 }, (_, index) => seasonAnchor - index);
  if (selectedSeason && !seasonOptions.includes(Number(selectedSeason))) {
    seasonOptions.unshift(Number(selectedSeason));
  }

  const playedMatches = data?.matches.filter((match) => match.state === 'post') ?? [];
  const liveMatches = data?.matches.filter((match) => match.state === 'in') ?? [];
  const upcomingMatches = data?.matches.filter((match) => match.state === 'pre') ?? [];
  const arrivals = data?.transfers.filter((transfer) => transfer.direction === 'arrival') ?? [];
  const departures = data?.transfers.filter((transfer) => transfer.direction === 'departure') ?? [];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href={`/${locale}/matches-en-direct`}
          className="text-sm font-medium text-primary hover:underline"
        >
          {english ? '← Live matches' : '← Matchs en direct'}
        </Link>
      </div>

      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          {data?.team.logo && (
            <Image
              src={data.team.logo}
              alt=""
              width={56}
              height={56}
              className="h-14 w-14 shrink-0 object-contain"
            />
          )}
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">
              {data?.seasonLabel ?? (english ? 'Team season' : 'Saison de l’équipe')}
            </p>
            <h1 className="truncate text-2xl font-bold text-foreground sm:text-3xl">
              {data?.team.name ?? teamLabel}
            </h1>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <span>{english ? 'Season' : 'Saison'}</span>
          <select
            value={selectedSeason}
            onChange={(event) => {
              setLoading(true);
              setData(null);
              setError(null);
              setSeasonOverride(event.target.value);
            }}
            className="rounded-lg border border-border bg-background px-3 py-2"
          >
            {!selectedSeason && (
              <option value="">{english ? 'Current season' : 'Saison en cours'}</option>
            )}
            {seasonOptions.map((season) => (
              <option key={season} value={season}>
                {season}-{String(season + 1).slice(-2)}
              </option>
            ))}
          </select>
        </label>
      </header>

      {loading && (
        <p role="status" className="mb-6 rounded-xl border border-border bg-muted/40 p-4 text-sm">
          {english ? 'Loading team season…' : 'Chargement de la saison de l’équipe…'}
        </p>
      )}
      {error && (
        <p role="alert" className="mb-6 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </p>
      )}

      {data && (
        <div className="space-y-8">
          <section aria-labelledby="team-fixtures-heading" className="space-y-4">
            <h2 id="team-fixtures-heading" className="text-xl font-bold text-foreground">
              {english ? 'Matches' : 'Matchs'}
            </h2>
            {data.unavailable.matches ? (
              <p role="status" className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                {english ? 'The schedule is temporarily unavailable.' : 'Le calendrier est temporairement indisponible.'}
              </p>
            ) : (
              <div className="grid gap-4 lg:grid-cols-3">
                {[
                  {
                    title: english ? 'Played' : 'Joués',
                    matches: playedMatches,
                  },
                  {
                    title: english ? 'In progress' : 'En cours',
                    matches: liveMatches,
                  },
                  {
                    title: english ? 'Upcoming' : 'À venir',
                    matches: upcomingMatches,
                  },
                ].map((group) => (
                  <section key={group.title} className="space-y-3">
                    <h3 className="font-semibold text-foreground">{group.title}</h3>
                    {group.matches.length > 0 ? (
                      <ul className="space-y-2">
                        {group.matches.map((match) => (
                          <MatchCard key={match.id} match={match} english={english} />
                        ))}
                      </ul>
                    ) : (
                      <p className="rounded-xl border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                        {english ? 'No matches listed.' : 'Aucun match indiqué.'}
                      </p>
                    )}
                  </section>
                ))}
              </div>
            )}
          </section>

          <section aria-labelledby="team-squad-heading" className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="team-squad-heading" className="text-xl font-bold text-foreground">
                {english ? 'Season squad' : 'Effectif de la saison'}
              </h2>
              {data.coach && (
                <p className="text-sm text-muted-foreground">
                  {english ? 'Coach:' : 'Entraîneur :'} {data.coach}
                </p>
              )}
            </div>
            {data.unavailable.roster ? (
              <p role="status" className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                {english ? 'The squad is temporarily unavailable.' : 'L’effectif est temporairement indisponible.'}
              </p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border">
                <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_minmax(5rem,0.8fr)_2rem] gap-3 bg-muted/40 px-3 py-2 text-xs font-semibold text-muted-foreground">
                  <span className="text-center">#</span>
                  <span>{english ? 'Player' : 'Joueur'}</span>
                  <span>{english ? 'Position' : 'Poste'}</span>
                  <span className="text-right">{english ? 'Age' : 'Âge'}</span>
                </div>
                <ul>
                  {data.roster.map((player) => (
                    <PlayerRow
                      key={player.id}
                      player={player}
                      showNationality={!data.team.isNational}
                      english={english}
                    />
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section aria-labelledby="team-transfers-heading" className="space-y-4">
            <h2 id="team-transfers-heading" className="text-xl font-bold text-foreground">
              {english ? 'Transfers' : 'Mercato'}
            </h2>
            {data.unavailable.transfers ? (
              <p role="status" className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                {english ? 'Transfer information is temporarily unavailable.' : 'Les informations du mercato sont temporairement indisponibles.'}
              </p>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  {english
                    ? 'Movements are shown when recorded by ESPN for this season.'
                    : 'Les mouvements affichés sont ceux enregistrés par ESPN pour cette saison.'}
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      title: english ? 'Arrivals' : 'Nouveaux venus',
                      transfers: arrivals,
                    },
                    {
                      title: english ? 'Departures' : 'Départs',
                      transfers: departures,
                    },
                  ].map((group) => (
                    <section key={group.title} className="space-y-3">
                      <h3 className="font-semibold text-foreground">{group.title}</h3>
                      {group.transfers.length > 0 ? (
                        <ul className="space-y-2">
                          {group.transfers.map((transfer) => (
                            <TransferRow
                              key={transfer.id}
                              transfer={transfer}
                              english={english}
                            />
                          ))}
                        </ul>
                      ) : (
                        <p className="rounded-xl border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                          {english ? 'No movements listed.' : 'Aucun mouvement indiqué.'}
                        </p>
                      )}
                    </section>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
