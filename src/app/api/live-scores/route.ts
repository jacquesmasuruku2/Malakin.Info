import { NextResponse } from 'next/server';
import type { LiveScoreMatch } from '@/types/live-scores';

const LIVE_FIXTURES_URL = 'https://v3.football.api-sports.io/fixtures?live=all';
const CACHE_SECONDS = 900;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function nullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function nullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function parseMatch(value: unknown): LiveScoreMatch {
  if (
    !isRecord(value) ||
    !isRecord(value.fixture) ||
    typeof value.fixture.id !== 'number' ||
    !isRecord(value.fixture.status) ||
    !isRecord(value.league) ||
    typeof value.league.id !== 'number' ||
    typeof value.league.name !== 'string' ||
    !isRecord(value.teams) ||
    !isRecord(value.teams.home) ||
    typeof value.teams.home.name !== 'string' ||
    !isRecord(value.teams.away) ||
    typeof value.teams.away.name !== 'string' ||
    !isRecord(value.goals)
  ) {
    throw new Error('API-SPORTS returned an invalid live fixture.');
  }

  return {
    fixture: {
      id: value.fixture.id,
      status: {
        elapsed: nullableNumber(value.fixture.status.elapsed),
        short: nullableString(value.fixture.status.short),
        long: nullableString(value.fixture.status.long),
      },
    },
    league: {
      id: value.league.id,
      name: value.league.name,
      logo: nullableString(value.league.logo),
      country: nullableString(value.league.country),
    },
    teams: {
      home: {
        id: nullableNumber(value.teams.home.id),
        name: value.teams.home.name,
        logo: nullableString(value.teams.home.logo),
      },
      away: {
        id: nullableNumber(value.teams.away.id),
        name: value.teams.away.name,
        logo: nullableString(value.teams.away.logo),
      },
    },
    goals: {
      home: nullableNumber(value.goals.home),
      away: nullableNumber(value.goals.away),
    },
  };
}

function hasApiErrors(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (isRecord(value)) return Object.keys(value).length > 0;
  return Boolean(value);
}

function getCompetitionPriority(match: LiveScoreMatch): number {
  const competition = `${match.league.name} ${match.league.country ?? ''}`;

  if (
    match.league.country === 'World' ||
    /\b(caf|afcon|africa|african|world cup|fifa world|international)\b|coupe d['’]afrique/i.test(
      competition,
    )
  ) {
    return 0;
  }

  if (
    /\b(premier league|la liga|bundesliga|serie a|ligue 1|champions league|europa league|eredivisie|primeira liga)\b/i.test(
      competition,
    )
  ) {
    return 1;
  }

  return 2;
}

export async function GET() {
  const apiKey = process.env.APISPORTS_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'APISPORTS_KEY is not configured.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const response = await fetch(LIVE_FIXTURES_URL, {
      headers: { 'x-apisports-key': apiKey },
      next: { revalidate: CACHE_SECONDS },
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
      throw new Error('API-SPORTS returned an invalid live fixtures response.');
    }

    const matches = payload.response
      .map(parseMatch)
      .sort((a, b) => getCompetitionPriority(a) - getCompetitionPriority(b));

    return NextResponse.json(
      { matches },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=900',
        },
      },
    );
  } catch (error) {
    console.error('Live scores request failed:', error);
    return NextResponse.json(
      { error: 'Les scores sont temporairement indisponibles.' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
