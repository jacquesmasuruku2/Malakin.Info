import { NextResponse } from 'next/server';
import type { ESPNMatchState, ESPNScoreboardMatch } from '@/types/live-scores';

const SCOREBOARD_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard';
const SEARCH_URL = 'https://site.api.espn.com/apis/common/v3/search';
const ESPN_SITE_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer';
const CACHE_SECONDS = 60;
const TEAM_SEARCH_ALIASES: Record<string, string> = {
  rdc: 'Congo DR',
  'dr congo': 'Congo DR',
  'republique democratique du congo': 'Congo DR',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function getNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  if (isRecord(value)) return getNumber(value.value) ?? getNumber(value.displayValue);
  return null;
}

function getLogo(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    for (const logo of value) {
      if (isRecord(logo)) {
        const href = getString(logo.href) ?? getString(logo.url);
        if (href) return href;
      }
    }
  }
  if (isRecord(value)) return getString(value.href) ?? getString(value.url);
  return null;
}

function getTeam(value: unknown): ESPNScoreboardMatch['homeTeam'] | null {
  if (!isRecord(value) || !isRecord(value.team)) return null;
  const team = value.team;
  const name = getString(team.displayName) ?? getString(team.name);
  if (!name) return null;

  const id = getNumber(team.id) ?? getNumber(value.id);
  return {
    id,
    name,
    logo: getLogo(team.logo) ?? getLogo(team.logos),
    score: getNumber(value.score),
  };
}

function parseClock(displayClock: string | null): { elapsed: number | null; extra: number | null } {
  if (!displayClock) return { elapsed: null, extra: null };
  const match = /(\d+)(?:\s*['′]?\s*\+\s*(\d+))?/.exec(displayClock);
  if (!match) return { elapsed: null, extra: null };
  return {
    elapsed: Number(match[1]),
    extra: match[2] ? Number(match[2]) : null,
  };
}

function getLeagueDetails(
  event: Record<string, unknown>,
  competition: Record<string, unknown>,
): { id: number | null; name: string; round: string | null; logo: string | null } {
  const note = getString(competition.altGameNote);
  const noteParts = note?.split(',').map((part) => part.trim()).filter(Boolean) ?? [];
  const notes = Array.isArray(competition.notes) ? competition.notes : [];
  const firstNote = notes.find(isRecord);
  const competitionInfo = isRecord(competition.league) ? competition.league : null;
  const eventLeague = isRecord(event.league) ? event.league : null;
  const name =
    (competitionInfo && getString(competitionInfo.name)) ??
    (eventLeague && getString(eventLeague.name)) ??
    (firstNote && getString(firstNote.headline)) ??
    noteParts[0] ??
    'Football';
  const groupName = isRecord(competition.group) ? getString(competition.group.name) : null;
  const uid = getString(event.uid) ?? getString(competition.uid) ?? '';
  const leagueId = /~l:(\d+)/.exec(uid);
  return {
    id: leagueId ? Number(leagueId[1]) : null,
    name,
    round: groupName ?? (noteParts.length > 1 ? noteParts.slice(1).join(', ') : null),
    logo:
      (competitionInfo && (getLogo(competitionInfo.logo) ?? getLogo(competitionInfo.logos))) ??
      (eventLeague && (getLogo(eventLeague.logo) ?? getLogo(eventLeague.logos))) ??
      getLogo(competition.logos),
  };
}

function parseScoreboardEvent(value: unknown): ESPNScoreboardMatch | null {
  if (!isRecord(value)) return null;
  const id = getNumber(value.id);
  const competitions = Array.isArray(value.competitions) ? value.competitions : [];
  const competition = competitions.find(isRecord);
  if (id === null || !Number.isSafeInteger(id) || !competition) return null;

  const competitors = Array.isArray(competition.competitors)
    ? competition.competitors.filter(isRecord)
    : [];
  const homeSource =
    competitors.find((competitor) => competitor.homeAway === 'home') ?? competitors[0];
  const awaySource =
    competitors.find((competitor) => competitor.homeAway === 'away') ?? competitors[1];
  if (!homeSource || !awaySource) return null;

  const homeTeam = getTeam(homeSource);
  const awayTeam = getTeam(awaySource);
  if (!homeTeam || !awayTeam) return null;

  const eventStatus = isRecord(value.status) ? value.status : null;
  const competitionStatus = isRecord(competition.status) ? competition.status : eventStatus;
  const statusType =
    competitionStatus && isRecord(competitionStatus.type) ? competitionStatus.type : null;
  const rawState = statusType ? getString(statusType.state) : null;
  const state: ESPNMatchState =
    rawState === 'in' || rawState === 'post' || rawState === 'pre'
      ? rawState
      : statusType?.completed === true
        ? 'post'
        : 'pre';
  const displayClock = competitionStatus
    ? getString(competitionStatus.displayClock)
    : null;
  const clock = state === 'pre' ? { elapsed: null, extra: null } : parseClock(displayClock);
  const league = getLeagueDetails(value, competition);
  const season = isRecord(value.season) ? getNumber(value.season.year) : null;

  return {
    id,
    date: getString(value.date) ?? (competitionStatus ? getString(competitionStatus.date) : null),
    venue: isRecord(competition.venue)
      ? getString(competition.venue.fullName) ?? getString(competition.venue.displayName)
      : isRecord(value.venue)
        ? getString(value.venue.displayName)
        : null,
    league: { ...league, season },
    status: {
      state,
      displayClock,
      shortDetail: statusType ? getString(statusType.shortDetail) : null,
      detail: statusType
        ? getString(statusType.detail) ?? getString(statusType.description)
        : null,
      elapsed: clock.elapsed,
      extra: clock.extra,
    },
    homeTeam,
    awayTeam,
  };
}

function getCompetitionPriority(match: ESPNScoreboardMatch): number {
  const league = match.league.name.toLowerCase();
  if (/\b(caf|can|afcon|africa|african cup)\b/.test(league)) return 0;
  if (/\b(world cup|international|fifa|uefa nations|euro)\b/.test(league)) return 1;
  if (/\b(champions league|premier league|la liga|bundesliga|serie a|ligue 1|europa league)\b/.test(league)) {
    return 2;
  }
  return 3;
}

function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
}

async function getTeamHistory(
  query: string,
): Promise<{ matches: ESPNScoreboardMatch[]; teamName: string } | null> {
  const normalizedQuery = normalizeSearch(query);
  const searchTerm = TEAM_SEARCH_ALIASES[normalizedQuery] ?? query;
  const searchUrl = new URL(SEARCH_URL);
  searchUrl.searchParams.set('query', searchTerm);
  searchUrl.searchParams.set('limit', '20');

  const searchResponse = await fetch(searchUrl, {
    cache: 'force-cache',
    next: { revalidate: CACHE_SECONDS },
    signal: AbortSignal.timeout(15_000),
    headers: { Accept: 'application/json' },
  });
  if (!searchResponse.ok) {
    throw new Error(`ESPN team search responded with HTTP ${searchResponse.status}.`);
  }
  const searchPayload: unknown = await searchResponse.json();
  if (!isRecord(searchPayload) || !Array.isArray(searchPayload.items)) {
    throw new Error('ESPN returned an invalid team search response.');
  }

  const candidates = searchPayload.items.filter(
    (item): item is Record<string, unknown> =>
      isRecord(item) && item.type === 'team' && item.sport === 'soccer',
  );
  const normalizedSearchTerm = normalizeSearch(searchTerm);
  const selectedTeam = candidates.find((candidate) => {
    const name = getString(candidate.displayName) ?? getString(candidate.name);
    if (!name) return false;
    const normalizedName = normalizeSearch(name);
    return normalizedName.includes(normalizedSearchTerm) || normalizedSearchTerm.includes(normalizedName);
  });
  if (!selectedTeam) return null;

  const teamId = getNumber(selectedTeam.id);
  const teamName = getString(selectedTeam.displayName) ?? getString(selectedTeam.name);
  if (teamId === null || !Number.isSafeInteger(teamId) || !teamName) return null;

  const leagueSlug =
    getString(selectedTeam.defaultLeagueSlug) ?? getString(selectedTeam.league);
  const scheduleUrls = new Set([
    `${ESPN_SITE_URL}/all/teams/${teamId}/schedule`,
  ]);
  if (leagueSlug && /^[a-z0-9._-]+$/i.test(leagueSlug)) {
    scheduleUrls.add(`${ESPN_SITE_URL}/${leagueSlug}/teams/${teamId}/schedule`);
  }

  const scheduleResults = await Promise.allSettled(
    Array.from(scheduleUrls, async (url) => {
      const response = await fetch(url, {
        cache: 'force-cache',
        next: { revalidate: CACHE_SECONDS },
        signal: AbortSignal.timeout(15_000),
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`ESPN team schedule responded with HTTP ${response.status}.`);
      }
      const payload: unknown = await response.json();
      if (!isRecord(payload) || !Array.isArray(payload.events)) {
        throw new Error('ESPN returned an invalid team schedule response.');
      }
      return payload.events;
    }),
  );

  const matchById = new Map<number, ESPNScoreboardMatch>();
  let successfulSchedules = 0;
  for (const result of scheduleResults) {
    if (result.status === 'rejected') {
      console.warn('An ESPN team schedule could not be loaded:', result.reason);
      continue;
    }
    successfulSchedules += 1;
    for (const event of result.value) {
      const match = parseScoreboardEvent(event);
      if (
        match &&
        match.status.state === 'post' &&
        (match.homeTeam.id === teamId || match.awayTeam.id === teamId)
      ) {
        matchById.set(match.id, match);
      }
    }
  }
  if (successfulSchedules === 0) {
    throw new Error('No ESPN team schedule could be loaded.');
  }

  const matches = Array.from(matchById.values())
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
  return { matches, teamName };
}

function getKinshasaDate(daysAgo: number): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Kinshasa',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const dateParts = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const date = new Date(
    Date.UTC(Number(dateParts.year), Number(dateParts.month) - 1, Number(dateParts.day) - daysAgo),
  );
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${date.getUTCFullYear()}${month}${day}`;
}

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const finishedOnly = searchParams.get('view') === 'finished';
  const teamQuery = finishedOnly ? searchParams.get('team')?.trim() ?? '' : '';
  const daysAgoParam = searchParams.get('daysAgo') ?? '0';
  const daysAgo = Number(daysAgoParam);
  if (finishedOnly && ![0, 1, 2].includes(daysAgo)) {
    return NextResponse.json(
      { error: 'daysAgo must be 0, 1, or 2.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }
  if (teamQuery.length > 80) {
    return NextResponse.json(
      { error: 'Team search must be 80 characters or fewer.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const url = new URL(SCOREBOARD_URL);
  if (finishedOnly) url.searchParams.set('dates', getKinshasaDate(daysAgo));

  try {
    if (teamQuery.length >= 3) {
      const teamHistory = await getTeamHistory(teamQuery);
      if (teamHistory) {
        return NextResponse.json(
          teamHistory,
          {
            headers: {
              'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
            },
          },
        );
      }
    }

    const response = await fetch(url, {
      cache: 'force-cache',
      next: { revalidate: CACHE_SECONDS },
      signal: AbortSignal.timeout(15_000),
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`ESPN scoreboard responded with HTTP ${response.status}.`);
    }

    const payload: unknown = await response.json();
    if (!isRecord(payload) || !Array.isArray(payload.events)) {
      throw new Error('ESPN returned an invalid scoreboard response.');
    }

    const events = payload.events
      .map(parseScoreboardEvent)
      .filter((match): match is ESPNScoreboardMatch => match !== null);
    const ignoredCount = payload.events.length - events.length;
    if (ignoredCount > 0) {
      console.warn(`Ignored ${ignoredCount} ESPN scoreboard events with incomplete data.`);
    }

    const matches = events
      .filter((match) =>
        finishedOnly ? match.status.state === 'post' : match.status.state !== 'post',
      )
      .sort(
        (a, b) =>
          getCompetitionPriority(a) - getCompetitionPriority(b) ||
          (a.date ?? '').localeCompare(b.date ?? ''),
      );

    return NextResponse.json(
      { matches },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      },
    );
  } catch (error) {
    console.error('ESPN scoreboard request failed:', error);
    return NextResponse.json(
      { error: 'Les scores sont temporairement indisponibles.' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
