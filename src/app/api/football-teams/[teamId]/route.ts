import { NextResponse } from 'next/server';
import type {
  TeamSeasonMatch,
  TeamSeasonPlayer,
  TeamSeasonTransfer,
} from '@/types/team-season';

const ESPN_SITE_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer';
const ESPN_CORE_URL = 'https://sports.core.api.espn.com/v2/sports/soccer';
const CACHE_SECONDS = 3_600;
const LEAGUE_SLUG_PATTERN = /^[a-z0-9._-]{1,80}$/i;

type ESPNTransfer = {
  athleteId: number;
  date: string | null;
  fromTeamId: number | null;
  toTeamId: number | null;
  type: string | null;
  amount: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function getString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function getNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (isRecord(value)) return getNumber(value.value) ?? getNumber(value.displayValue);
  return null;
}

function getLogo(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      if (!isRecord(item)) continue;
      const href = getString(item.href) ?? getString(item.url);
      if (href) return href;
    }
  }
  if (isRecord(value)) return getString(value.href) ?? getString(value.url);
  return null;
}

async function fetchESPNObject(url: string, context: string): Promise<Record<string, unknown>> {
  const response = await fetch(url, {
    cache: 'force-cache',
    next: { revalidate: CACHE_SECONDS },
    signal: AbortSignal.timeout(10_000),
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`ESPN ${context} responded with HTTP ${response.status}.`);
  }

  const payload: unknown = await response.json();
  if (!isRecord(payload)) throw new Error(`ESPN returned an invalid ${context} response.`);
  return payload;
}

async function fetchTeamSeasonMatches(
  leagueSlug: string,
  teamId: number,
  season: number,
): Promise<TeamSeasonMatch[]> {
  const calendarYears = [season, season + 1];
  const eventLists = await Promise.all(
    calendarYears.map(async (year) => {
      const payload = await fetchESPNObject(
        `${ESPN_SITE_URL}/${encodeURIComponent(leagueSlug)}/scoreboard?dates=${year}&limit=1000`,
        'season schedule',
      );
      const events = payload.events;
      if (!isUnknownArray(events)) {
        throw new Error('ESPN returned an invalid season schedule response.');
      }
      return events;
    }),
  );
  const matches = new Map<number, TeamSeasonMatch>();

  for (const events of eventLists) {
    for (const event of events) {
      if (!isRecord(event) || !isRecord(event.season) || getNumber(event.season.year) !== season) {
        continue;
      }
      const match = parseScheduleEvent(event);
      if (match && (match.home.id === teamId || match.away.id === teamId)) {
        matches.set(match.id, match);
      }
    }
  }

  return Array.from(matches.values()).sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
}

function getRosterUrl(
  leagueSlug: string,
  teamId: number,
  season: number | null,
): string {
  const url = new URL(
    `${ESPN_SITE_URL}/${encodeURIComponent(leagueSlug)}/teams/${teamId}/roster`,
  );
  if (season !== null) url.searchParams.set('season', String(season));
  return url.toString();
}

function parseRoster(value: unknown): TeamSeasonPlayer[] | null {
  if (!isRecord(value) || !Array.isArray(value.athletes)) return null;
  return value.athletes.flatMap((athlete): TeamSeasonPlayer[] => {
    if (!isRecord(athlete)) return [];
    const id = getNumber(athlete.id);
    const name =
      getString(athlete.displayName) ??
      getString(athlete.fullName) ??
      getString(athlete.name);
    if (id === null || !name) return [];

    const position = isRecord(athlete.position) ? athlete.position : null;
    const citizenship = isRecord(athlete.citizenship)
      ? getString(athlete.citizenship.displayName) ?? getString(athlete.citizenship.name)
      : getString(athlete.citizenship);
    return [{
      id,
      name,
      number:
        getString(athlete.jersey) ??
        getString(athlete.number) ??
        getNumber(athlete.jersey)?.toString() ??
        getNumber(athlete.number)?.toString() ??
        null,
      position: position
        ? getString(position.displayName) ?? getString(position.abbreviation)
        : null,
      age: getNumber(athlete.age),
      nationality: citizenship,
    }];
  });
}

function parseTeam(value: unknown): TeamSeasonMatch['home'] | null {
  if (!isRecord(value) || !isRecord(value.team)) return null;
  const team = value.team;
  const id = getNumber(team.id) ?? getNumber(value.id);
  const name = getString(team.displayName) ?? getString(team.name);
  if (!name) return null;
  return {
    id,
    name,
    logo: getLogo(team.logo) ?? getLogo(team.logos),
    score: getNumber(value.score),
  };
}

function parseScheduleEvent(value: unknown): TeamSeasonMatch | null {
  if (!isRecord(value)) return null;
  const id = getNumber(value.id);
  const competitions = Array.isArray(value.competitions) ? value.competitions : [];
  const competition = competitions.find(isRecord);
  if (id === null || !Number.isSafeInteger(id) || !competition) return null;

  const competitors = Array.isArray(competition.competitors)
    ? competition.competitors.filter(isRecord)
    : [];
  const homeSource = competitors.find((competitor) => competitor.homeAway === 'home');
  const awaySource = competitors.find((competitor) => competitor.homeAway === 'away');
  if (!homeSource || !awaySource) return null;

  const home = parseTeam(homeSource);
  const away = parseTeam(awaySource);
  if (!home || !away) return null;

  const eventStatus = isRecord(value.status) ? value.status : null;
  const competitionStatus = isRecord(competition.status) ? competition.status : eventStatus;
  const statusType =
    competitionStatus && isRecord(competitionStatus.type)
      ? competitionStatus.type
      : eventStatus && isRecord(eventStatus.type)
        ? eventStatus.type
        : null;
  const rawState = statusType ? getString(statusType.state) : null;
  const state: TeamSeasonMatch['state'] | null =
    rawState === 'in' || rawState === 'post' || rawState === 'pre'
      ? rawState
      : statusType?.completed === true
        ? 'post'
        : null;
  if (!state) return null;

  return {
    id,
    date: getString(value.date) ?? getString(competition.date),
    state,
    detail: statusType
      ? getString(statusType.shortDetail) ??
        getString(statusType.detail) ??
        getString(statusType.description)
      : null,
    home,
    away,
  };
}

function getReferenceId(value: unknown, entity: 'athletes' | 'teams'): number | null {
  if (!isRecord(value)) return null;
  const directId = getNumber(value.id);
  if (directId !== null) return directId;
  const reference = getString(value.$ref);
  const match = reference
    ? new RegExp(`/${entity}/(\\d+)(?:[/?#]|$)`).exec(reference)
    : null;
  return match ? getNumber(match[1]) : null;
}

function parseTransaction(value: unknown): ESPNTransfer | null {
  if (!isRecord(value)) return null;
  const athleteId = getReferenceId(value.athlete, 'athletes');
  if (athleteId === null) return null;
  const amount = getString(value.displayAmount) ?? getNumber(value.amount)?.toString() ?? null;
  return {
    athleteId,
    date: getString(value.date),
    fromTeamId: getReferenceId(value.from, 'teams'),
    toTeamId: getReferenceId(value.to, 'teams'),
    type: getString(value.type),
    amount,
  };
}

async function fetchTransactions(
  leagueSlug: string,
  teamId: number,
  season: number,
): Promise<ESPNTransfer[]> {
  const url = new URL(
    `${ESPN_CORE_URL}/leagues/${encodeURIComponent(leagueSlug)}/seasons/${season}/teams/${teamId}/transactions`,
  );
  url.searchParams.set('lang', 'en');
  url.searchParams.set('region', 'us');
  url.searchParams.set('limit', '100');

  const firstPage = await fetchESPNObject(url.toString(), 'team transfers');
  if (!Array.isArray(firstPage.items)) {
    throw new Error('ESPN returned an invalid team transfers response.');
  }

  const pageCount = Math.max(1, Math.floor(getNumber(firstPage.pageCount) ?? 1));
  if (pageCount > 10) throw new Error('ESPN returned too many pages of team transfers.');
  const pages = [firstPage];
  if (pageCount > 1) {
    const remainingPages = await Promise.all(
      Array.from({ length: pageCount - 1 }, async (_, index) => {
        const pageUrl = new URL(url);
        pageUrl.searchParams.set('page', String(index + 2));
        return fetchESPNObject(pageUrl.toString(), 'team transfers');
      }),
    );
    pages.push(...remainingPages);
  }

  return pages.flatMap((page) =>
    Array.isArray(page.items)
      ? page.items
          .map(parseTransaction)
          .filter((transaction): transaction is ESPNTransfer => transaction !== null)
      : [],
  );
}

async function resolveTransferNames(
  ids: number[],
  names: Map<number, string>,
): Promise<void> {
  const missingIds = ids.filter((id) => !names.has(id));
  for (let index = 0; index < missingIds.length; index += 8) {
    const batch = missingIds.slice(index, index + 8);
    await Promise.all(
      batch.map(async (id) => {
        try {
          const athlete = await fetchESPNObject(
            `${ESPN_CORE_URL}/athletes/${id}?lang=en&region=us`,
            `athlete profile ${id}`,
          );
          const name =
            getString(athlete.displayName) ??
            getString(athlete.fullName) ??
            getString(athlete.name);
          if (name) names.set(id, name);
        } catch (error) {
          console.warn(`Unable to resolve ESPN athlete ${id}:`, error);
        }
      }),
    );
  }
}

function getCoach(value: unknown): string | null {
  if (!isRecord(value)) return null;
  return getString(value.displayName) ?? getString(value.fullName) ?? getString(value.name);
}

function getTeamName(value: unknown): string | null {
  if (!isRecord(value)) return null;
  return getString(value.displayName) ?? getString(value.name);
}

export async function GET(
  request: Request,
  context: RouteContext<'/api/football-teams/[teamId]'>,
) {
  const { teamId: rawTeamId } = await context.params;
  if (!/^\d{1,12}$/.test(rawTeamId)) {
    return NextResponse.json({ error: 'A valid ESPN team id is required.' }, { status: 400 });
  }
  const teamId = Number(rawTeamId);
  if (!Number.isSafeInteger(teamId) || teamId <= 0) {
    return NextResponse.json({ error: 'A valid ESPN team id is required.' }, { status: 400 });
  }

  const searchParams = new URL(request.url).searchParams;
  const requestedLeagueSlug = searchParams.get('league')?.trim() ?? '';
  if (requestedLeagueSlug && !LEAGUE_SLUG_PATTERN.test(requestedLeagueSlug)) {
    return NextResponse.json({ error: 'A valid ESPN league slug is required.' }, { status: 400 });
  }
  const rawSeason = searchParams.get('season')?.trim();
  const requestedSeason = rawSeason && /^\d{4}$/.test(rawSeason) ? Number(rawSeason) : null;
  if (
    rawSeason &&
    (requestedSeason === null ||
      requestedSeason < 1900 ||
      requestedSeason > new Date().getUTCFullYear() + 1)
  ) {
    return NextResponse.json({ error: 'A valid season year is required.' }, { status: 400 });
  }

  try {
    let profile: Record<string, unknown> | null = null;
    try {
      profile = await fetchESPNObject(
        `${ESPN_SITE_URL}/all/teams/${teamId}`,
        'team profile',
      );
    } catch (error) {
      if (!requestedLeagueSlug) throw error;
      console.warn(`Unable to load the ESPN profile for team ${teamId}:`, error);
    }

    const profileTeam = profile && isRecord(profile.team) ? profile.team : null;
    const defaultLeague =
      profileTeam && isRecord(profileTeam.defaultLeague)
        ? profileTeam.defaultLeague
        : null;
    const defaultLeagueSlug = defaultLeague ? getString(defaultLeague.slug) : null;
    const leagueSlug =
      requestedLeagueSlug ||
      (defaultLeagueSlug && LEAGUE_SLUG_PATTERN.test(defaultLeagueSlug)
        ? defaultLeagueSlug
        : '');
    if (!leagueSlug) {
      throw new Error(`ESPN did not provide a league for team ${teamId}.`);
    }
    const transferLeagueSlug =
      defaultLeagueSlug && LEAGUE_SLUG_PATTERN.test(defaultLeagueSlug)
        ? defaultLeagueSlug
        : leagueSlug;

    let rosterPayload: Record<string, unknown> | null = null;
    try {
      rosterPayload = await fetchESPNObject(
        getRosterUrl(leagueSlug, teamId, requestedSeason),
        'team roster',
      );
    } catch (error) {
      if (requestedSeason === null) throw error;
      console.error(`Unable to load ESPN roster for team ${teamId}:`, error);
    }

    const season =
      requestedSeason ??
      (rosterPayload && isRecord(rosterPayload.season)
        ? getNumber(rosterPayload.season.year)
        : null);
    if (season === null) {
      throw new Error(`ESPN did not provide a season for team ${teamId}.`);
    }

    const [matchesResult, transfersResult, previousRosterResult] = await Promise.allSettled([
      fetchTeamSeasonMatches(leagueSlug, teamId, season),
      fetchTransactions(transferLeagueSlug, teamId, season),
      season > 1900
        ? fetchESPNObject(getRosterUrl(leagueSlug, teamId, season - 1), 'previous team roster')
        : Promise.resolve(null),
    ]);

    if (matchesResult.status === 'rejected') {
      console.error(`Unable to load ESPN schedule for team ${teamId}:`, matchesResult.reason);
    }
    if (transfersResult.status === 'rejected') {
      console.error(`Unable to load ESPN transfers for team ${teamId}:`, transfersResult.reason);
    }
    if (previousRosterResult.status === 'rejected') {
      console.warn(`Unable to load the previous ESPN roster for team ${teamId}:`, previousRosterResult.reason);
    }

    const roster = rosterPayload ? parseRoster(rosterPayload) : null;
    const previousRoster =
      previousRosterResult.status === 'fulfilled' && previousRosterResult.value
        ? parseRoster(previousRosterResult.value)
        : null;
    const names = new Map<number, string>();
    for (const player of [...(roster ?? []), ...(previousRoster ?? [])]) {
      names.set(player.id, player.name);
    }

    const transactions =
      transfersResult.status === 'fulfilled' ? transfersResult.value : [];
    const relevantTransactions = transactions.filter(
      (transaction) =>
        transaction.toTeamId === teamId || transaction.fromTeamId === teamId,
    );
    await resolveTransferNames(
      Array.from(new Set(relevantTransactions.map((transaction) => transaction.athleteId))),
      names,
    );

    const transfers: TeamSeasonTransfer[] = relevantTransactions
      .flatMap((transaction) => {
        const direction: TeamSeasonTransfer['direction'] | null =
          transaction.toTeamId === teamId
            ? 'arrival'
            : transaction.fromTeamId === teamId
              ? 'departure'
              : null;
        if (!direction) return [];
        return [{
          id: `${transaction.date ?? 'undated'}-${transaction.athleteId}-${direction}`,
          date: transaction.date,
          playerName: names.get(transaction.athleteId) ?? null,
          direction,
          type: transaction.type,
          amount: transaction.amount,
        }];
      })
      .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));

    const matches = matchesResult.status === 'fulfilled' ? matchesResult.value : [];

    const rosterTeam = rosterPayload && isRecord(rosterPayload.team) ? rosterPayload.team : null;
    const teamName =
      getTeamName(rosterTeam) ??
      getTeamName(profileTeam);
    if (!teamName) throw new Error(`ESPN did not provide a name for team ${teamId}.`);

    return NextResponse.json(
      {
        team: {
          id: teamId,
          name: teamName,
          logo:
            getLogo(rosterTeam?.logo) ??
            getLogo(profileTeam?.logo) ??
            getLogo(profileTeam?.logos),
          isNational:
            typeof rosterTeam?.isNational === 'boolean'
              ? rosterTeam.isNational
              : profileTeam && typeof profileTeam.isNational === 'boolean'
                ? profileTeam.isNational
                : false,
        },
        leagueSlug,
        season,
        seasonLabel:
          (rosterPayload && isRecord(rosterPayload.season)
            ? getString(rosterPayload.season.displayName)
            : null) ??
          String(season),
        coach: getCoach(rosterPayload?.coach),
        matches,
        roster: roster ?? [],
        transfers,
        unavailable: {
          matches: matchesResult.status === 'rejected',
          roster: roster === null || roster.length === 0,
          transfers: transfersResult.status === 'rejected',
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
        },
      },
    );
  } catch (error) {
    console.error('ESPN team season request failed:', error);
    return NextResponse.json(
      { error: 'Les données de cette équipe sont temporairement indisponibles.' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
