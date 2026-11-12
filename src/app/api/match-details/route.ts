import { NextResponse } from 'next/server';
import type {
  LiveMatchEvent,
  MatchLineup,
  MatchLineupPlayer,
  MatchStandingEntry,
  MatchStandings,
} from '@/types/live-scores';

const API_BASE_URL = 'https://v3.football.api-sports.io';
const CACHE_SECONDS = 900;
const STANDINGS_CACHE_SECONDS = 3600;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function nullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function nullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function getPersonName(value: unknown): string | null {
  return isRecord(value) ? nullableString(value.name) : null;
}

function hasApiErrors(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (isRecord(value)) return Object.keys(value).length > 0;
  return Boolean(value);
}

async function fetchApiResponse(
  url: string,
  apiKey: string,
  revalidate: number,
): Promise<unknown[]> {
  const response = await fetch(url, {
    headers: { 'x-apisports-key': apiKey },
    next: { revalidate },
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`API-SPORTS responded with HTTP ${response.status}.`);
  }

  const payload: unknown = await response.json();
  if (
    !isRecord(payload) ||
    hasApiErrors(payload.errors) ||
    !Array.isArray(payload.response)
  ) {
    throw new Error('API-SPORTS returned an invalid response.');
  }
  return payload.response;
}

function parseEvent(value: unknown): LiveMatchEvent {
  if (
    !isRecord(value) ||
    !isRecord(value.time) ||
    typeof value.time.elapsed !== 'number' ||
    !Number.isFinite(value.time.elapsed) ||
    typeof value.type !== 'string'
  ) {
    throw new Error('API-SPORTS returned an invalid match event.');
  }

  return {
    time: {
      elapsed: value.time.elapsed,
      extra: nullableNumber(value.time.extra),
    },
    team: { name: getPersonName(value.team) },
    player: {
      id: isRecord(value.player) ? nullableNumber(value.player.id) : null,
      name: getPersonName(value.player),
    },
    assist: {
      id: isRecord(value.assist) ? nullableNumber(value.assist.id) : null,
      name: getPersonName(value.assist),
    },
    type: value.type,
    detail: nullableString(value.detail),
    comments: nullableString(value.comments),
  };
}

function parseLineupPlayer(value: unknown): MatchLineupPlayer {
  if (!isRecord(value) || !isRecord(value.player) || typeof value.player.name !== 'string') {
    throw new Error('API-SPORTS returned an invalid lineup player.');
  }

  return {
    id: nullableNumber(value.player.id),
    name: value.player.name,
    number: nullableNumber(value.player.number),
    position: nullableString(value.player.pos),
    grid: nullableString(value.player.grid),
  };
}

function parseLineup(value: unknown): MatchLineup {
  if (
    !isRecord(value) ||
    !isRecord(value.team) ||
    typeof value.team.name !== 'string' ||
    !Array.isArray(value.startXI) ||
    !Array.isArray(value.substitutes)
  ) {
    throw new Error('API-SPORTS returned an invalid team lineup.');
  }

  return {
    team: {
      id: nullableNumber(value.team.id),
      name: value.team.name,
      logo: nullableString(value.team.logo),
    },
    formation: nullableString(value.formation),
    startingXI: value.startXI.map(parseLineupPlayer),
    substitutes: value.substitutes.map(parseLineupPlayer),
    coach: getPersonName(value.coach),
  };
}

function parseStandingEntry(value: unknown): MatchStandingEntry {
  if (
    !isRecord(value) ||
    typeof value.rank !== 'number' ||
    !isRecord(value.team) ||
    typeof value.team.name !== 'string' ||
    typeof value.points !== 'number' ||
    typeof value.goalsDiff !== 'number'
  ) {
    throw new Error('API-SPORTS returned an invalid standings entry.');
  }

  const all = isRecord(value.all) ? value.all : null;
  return {
    rank: value.rank,
    team: {
      id: nullableNumber(value.team.id),
      name: value.team.name,
      logo: nullableString(value.team.logo),
    },
    points: value.points,
    goalsDiff: value.goalsDiff,
    played: all ? nullableNumber(all.played) : null,
    form: nullableString(value.form),
    description: nullableString(value.description),
  };
}

function parseStandings(response: unknown[]): MatchStandings | null {
  if (response.length === 0) return null;
  const first = response[0];
  if (!isRecord(first) || !isRecord(first.league) || !Array.isArray(first.league.standings)) {
    return null;
  }

  const groups = first.league.standings
    .map((group) => {
      if (!Array.isArray(group)) {
        throw new Error('API-SPORTS returned an invalid standings group.');
      }
      const entries = group.map(parseStandingEntry);
      const firstEntry = group[0];
      return {
        name: isRecord(firstEntry) ? nullableString(firstEntry.group) : null,
        entries,
      };
    })
    .filter((group) => group.entries.length > 0);

  if (typeof first.league.name !== 'string' || groups.length === 0) return null;
  return { league: first.league.name, groups };
}

function getOptionalResult<T>(
  result: PromiseSettledResult<T>,
  source: 'lineups' | 'standings',
): { value: T | null; unavailable: boolean } {
  if (result.status === 'fulfilled') {
    return { value: result.value, unavailable: false };
  }

  console.error(`API-SPORTS ${source} request failed:`, result.reason);
  return { value: null, unavailable: true };
}

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const fixtureId = searchParams.get('fixtureId') ?? searchParams.get('id');
  const leagueId = searchParams.get('leagueId');
  const season = searchParams.get('season');

  if (!fixtureId || !/^[1-9]\d*$/.test(fixtureId) || !Number.isSafeInteger(Number(fixtureId))) {
    return NextResponse.json(
      { error: 'A valid fixtureId is required.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  if (
    (leagueId && (!/^[1-9]\d*$/.test(leagueId) || !Number.isSafeInteger(Number(leagueId)))) ||
    (season && (!/^\d{4}$/.test(season) || !Number.isSafeInteger(Number(season))))
  ) {
    return NextResponse.json(
      { error: 'A valid leagueId and season are required.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const apiKey = process.env.APISPORTS_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'APISPORTS_KEY is not configured.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const eventsUrl = `${API_BASE_URL}/fixtures/events?fixture=${encodeURIComponent(fixtureId)}`;
    const lineupsUrl = `${API_BASE_URL}/fixtures/lineups?fixture=${encodeURIComponent(fixtureId)}`;
    const standingsRequest =
      leagueId && season
        ? fetchApiResponse(
            `${API_BASE_URL}/standings?league=${encodeURIComponent(leagueId)}&season=${encodeURIComponent(season)}`,
            apiKey,
            STANDINGS_CACHE_SECONDS,
          ).then(parseStandings)
        : Promise.resolve(null);

    const [eventsResult, lineupsResult, standingsResult] = await Promise.allSettled([
      fetchApiResponse(eventsUrl, apiKey, CACHE_SECONDS).then((response) =>
        response.map(parseEvent).sort(
          (a, b) =>
            a.time.elapsed - b.time.elapsed ||
            (a.time.extra ?? 0) - (b.time.extra ?? 0),
        ),
      ),
      fetchApiResponse(lineupsUrl, apiKey, CACHE_SECONDS).then((response) =>
        response.map(parseLineup),
      ),
      standingsRequest,
    ]);

    if (eventsResult.status === 'rejected') throw eventsResult.reason;
    const lineups = getOptionalResult(lineupsResult, 'lineups');
    const standings = getOptionalResult(standingsResult, 'standings');

    return NextResponse.json(
      {
        events: eventsResult.value,
        lineups: lineups.value ?? [],
        standings: standings.value,
        unavailable: {
          lineups: lineups.unavailable,
          standings: standings.unavailable,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=900',
        },
      },
    );
  } catch (error) {
    console.error('Match details request failed:', error);
    return NextResponse.json(
      { error: 'Les données du match sont temporairement indisponibles.' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
