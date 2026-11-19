import { NextResponse } from 'next/server';
import type {
  ESPNMatchState,
  ESPNScoreboardMatch,
  LiveScoreCompetitionOption,
  SoccerContinent,
} from '@/types/live-scores';

const SCOREBOARD_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard';
const SEARCH_URL = 'https://site.api.espn.com/apis/common/v3/search';
const ESPN_SITE_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer';
const CACHE_SECONDS = 60;
const TEAM_SEARCH_ALIASES: Record<string, string> = {
  rdc: 'Congo DR',
  'dr congo': 'Congo DR',
  'republique democratique du congo': 'Congo DR',
  senegal: 'Senegal',
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
  if (typeof value === 'string') return getString(value);
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
    id:
      (competitionInfo && getNumber(competitionInfo.id)) ??
      (eventLeague && getNumber(eventLeague.id)) ??
      (leagueId ? Number(leagueId[1]) : null),
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
    competitionStatus && isRecord(competitionStatus.type)
      ? competitionStatus.type
      : eventStatus && isRecord(eventStatus.type)
        ? eventStatus.type
        : null;
  const rawState = statusType ? getString(statusType.state) : null;
  const state: ESPNMatchState | null =
    rawState === 'in' || rawState === 'post' || rawState === 'pre'
      ? rawState
      : statusType?.completed === true
        ? 'post'
        : null;
  if (!state) return null;
  const displayClock =
    getString(competitionStatus?.displayClock) ?? getString(eventStatus?.displayClock);
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

function getCompetitionContinent(
  slug: string | null,
  name: string,
): SoccerContinent {
  const normalizedSlug = slug?.toLowerCase() ?? '';
  const normalizedName = normalizeSearch(name);
  const prefix = normalizedSlug.split('.')[0];

  if (
    prefix === 'caf' ||
    /\b(africa|african|caf|afcon)\b/.test(normalizedName)
  ) {
    return 'africa';
  }
  if (
    prefix === 'afc' ||
    /\b(asia|asian|afc|japan|korea|china|india|australia)\b/.test(normalizedName)
  ) {
    return prefix === 'ofc' || /\b(australia|new zealand|oceania)\b/.test(normalizedName)
      ? 'oceania'
      : 'asia';
  }
  if (
    prefix === 'conmebol' ||
    /\b(conmebol|south america|libertadores|sudamericana|brazil|brasileir|argentina|uruguay|chile|colombia|ecuador|paraguay|peru|bolivia)\b/.test(
      normalizedName,
    )
  ) {
    return 'south-america';
  }
  if (
    prefix === 'uefa' ||
    /\b(uefa|europe|england|premier league|la liga|bundesliga|italian|serie a|ligue 1|eredivisie|fa cup|copa del rey)\b/.test(
      normalizedName,
    )
  ) {
    return 'europe';
  }
  if (
    prefix === 'concacaf' ||
    /\b(concacaf|north america|caribbean|mls|liga mx|canadian premier|usl)\b/.test(
      normalizedName,
    )
  ) {
    return 'north-america';
  }
  if (
    prefix === 'ofc' ||
    /\b(oceania|new zealand|a league)\b/.test(normalizedName)
  ) {
    return 'oceania';
  }
  if (
    prefix === 'fifa' ||
    prefix === 'global' ||
    /\b(fifa|international|friendly|world cup)\b/.test(normalizedName)
  ) {
    return 'international';
  }
  return 'other';
}

function getCompetitionOption(value: unknown): LiveScoreCompetitionOption | null {
  if (!isRecord(value)) return null;
  const match = parseScoreboardEvent(value);
  if (!match || match.league.id === null) return null;

  const competition = Array.isArray(value.competitions)
    ? value.competitions.find(isRecord)
    : null;
  const competitionLeague =
    competition && isRecord(competition.league) ? competition.league : null;
  const eventLeague = isRecord(value.league) ? value.league : null;
  const league = eventLeague ?? competitionLeague;
  const slug =
    (league && (getString(league.slug) ?? getString(league.midsizeName))) ?? null;

  return {
    id: match.league.id,
    name: match.league.name,
    continent: getCompetitionContinent(slug, match.league.name),
  };
}

function getCompetitionOptions(values: unknown[]): LiveScoreCompetitionOption[] {
  const options = new Map<number, LiveScoreCompetitionOption>();
  for (const value of values) {
    const option = getCompetitionOption(value);
    if (option) options.set(option.id, option);
  }
  return Array.from(options.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function getKinshasaMonth(offset = 0): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Kinshasa',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(new Date());
  const dateParts = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const date = new Date(
    Date.UTC(Number(dateParts.year), Number(dateParts.month) - 1 + offset, 1),
  );
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function getKinshasaYear(date: Date): number {
  const year = new Intl.DateTimeFormat('en', {
    timeZone: 'Africa/Kinshasa',
    year: 'numeric',
  }).format(date);
  return Number(year);
}

function isUpcomingMonth(value: string): boolean {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return false;
  return value >= getKinshasaMonth() && value <= getKinshasaMonth(11);
}

function getMatchKinshasaMonth(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Kinshasa',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(date);
  const dateParts = Object.fromEntries(parts.map(({ type, value: part }) => [type, part]));
  return `${dateParts.year}-${dateParts.month}`;
}

async function getLeagueSlug(leagueId: number, leagueName: string): Promise<string> {
  const searchUrl = new URL(SEARCH_URL);
  searchUrl.searchParams.set('query', leagueName);
  searchUrl.searchParams.set('limit', '50');

  const response = await fetch(searchUrl, {
    cache: 'force-cache',
    next: { revalidate: CACHE_SECONDS },
    signal: AbortSignal.timeout(15_000),
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`ESPN league search responded with HTTP ${response.status}.`);
  }

  const payload: unknown = await response.json();
  if (!isRecord(payload) || !Array.isArray(payload.items)) {
    throw new Error('ESPN returned an invalid league search response.');
  }

  const league = payload.items.find(
    (item): item is Record<string, unknown> =>
      isRecord(item) &&
      item.type === 'league' &&
      item.sport === 'soccer' &&
      getNumber(item.id) === leagueId,
  );
  const slug = league
    ? getString(league.defaultLeagueSlug) ?? getString(league.slug)
    : null;
  if (!slug || !/^[a-z0-9._-]{1,80}$/i.test(slug)) {
    throw new Error(`ESPN could not resolve a schedule for league ${leagueId}.`);
  }

  return slug;
}

async function getUpcomingLeagueMatches(
  leagueId: number,
  leagueName: string,
  month: string | null,
  rangeDays: 7 | 30 | null,
): Promise<ESPNScoreboardMatch[]> {
  const leagueSlug = await getLeagueSlug(leagueId, leagueName);
  const now = new Date();
  const endDate = rangeDays
    ? new Date(now.getTime() + rangeDays * 24 * 60 * 60 * 1000)
    : null;
  const firstYear = month
    ? Number(month.slice(0, 4))
    : getKinshasaYear(now);
  const years = endDate
    ? Array.from(
        new Set([firstYear, getKinshasaYear(endDate)]),
      )
    : [firstYear];
  const eventLists = await Promise.all(
    years.map(async (year) => {
      const scheduleUrl = new URL(
        `${ESPN_SITE_URL}/${encodeURIComponent(leagueSlug)}/scoreboard`,
      );
      scheduleUrl.searchParams.set('dates', String(year));
      scheduleUrl.searchParams.set('limit', '1000');

      const response = await fetch(scheduleUrl, {
        cache: 'force-cache',
        next: { revalidate: CACHE_SECONDS },
        signal: AbortSignal.timeout(15_000),
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`ESPN league schedule responded with HTTP ${response.status}.`);
      }

      const payload: unknown = await response.json();
      if (!isRecord(payload) || !Array.isArray(payload.events)) {
        throw new Error('ESPN returned an invalid league schedule response.');
      }
      return payload.events;
    }),
  );
  const events = eventLists.flat();
  return events
    .map(parseScoreboardEvent)
    .filter((match): match is ESPNScoreboardMatch => {
      if (
        !match ||
        match.status.state !== 'pre' ||
        match.league.id !== leagueId
      ) {
        return false;
      }
      if (month) return getMatchKinshasaMonth(match.date) === month;
      if (!rangeDays || !match.date || !endDate) return false;

      const kickoffTime = new Date(match.date).getTime();
      return kickoffTime >= now.getTime() && kickoffTime <= endDate.getTime();
    })
    .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
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

async function getTeamSchedule(
  query: string,
): Promise<{
  matches: ESPNScoreboardMatch[];
  teamName: string;
  competitions: LiveScoreCompetitionOption[];
} | null> {
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
  const competitionOptions = new Map<number, LiveScoreCompetitionOption>();
  let successfulSchedules = 0;
  for (const result of scheduleResults) {
    if (result.status === 'rejected') {
      console.warn('An ESPN team schedule could not be loaded:', result.reason);
      continue;
    }
    successfulSchedules += 1;
    for (const event of result.value) {
      const competition = getCompetitionOption(event);
      if (competition) competitionOptions.set(competition.id, competition);
      const match = parseScoreboardEvent(event);
      if (
        match &&
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
  return {
    matches,
    teamName,
    competitions: Array.from(competitionOptions.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
  };
}

async function getTeamHistory(
  query: string,
): Promise<{ matches: ESPNScoreboardMatch[]; teamName: string } | null> {
  const schedule = await getTeamSchedule(query);
  if (!schedule) return null;

  return {
    teamName: schedule.teamName,
    matches: schedule.matches.filter((match) => match.status.state === 'post'),
  };
}

async function getUpcomingTeamMatches(
  query: string,
  month: string | null,
  rangeDays: 7 | 30 | null,
): Promise<{
  matches: ESPNScoreboardMatch[];
  teamName: string;
  competitions: LiveScoreCompetitionOption[];
} | null> {
  const schedule = await getTeamSchedule(query);
  if (!schedule) return null;

  const now = new Date();
  const endDate = rangeDays
    ? new Date(now.getTime() + rangeDays * 24 * 60 * 60 * 1000)
    : null;
  const matches = schedule.matches
    .filter((match) => {
      if (match.status.state !== 'pre' || !match.date) return false;
      if (month) return getMatchKinshasaMonth(match.date) === month;
      if (!rangeDays || !endDate) return false;

      const kickoffTime = new Date(match.date).getTime();
      return kickoffTime >= now.getTime() && kickoffTime <= endDate.getTime();
    })
    .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));

  return {
    matches,
    teamName: schedule.teamName,
    competitions: schedule.competitions,
  };
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
  const view = searchParams.get('view') ?? 'live';
  if (!['live', 'upcoming', 'finished'].includes(view)) {
    return NextResponse.json(
      { error: 'view must be live, upcoming, or finished.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }
  const finishedOnly = view === 'finished';
  const upcomingOnly = view === 'upcoming';
  const teamQuery =
    finishedOnly || upcomingOnly ? searchParams.get('team')?.trim() ?? '' : '';
  const upcomingTeamSearch = upcomingOnly && teamQuery.length >= 3;
  const competitionIdParam = searchParams.get('competitionId');
  const competitionName = searchParams.get('competitionName')?.trim() ?? '';
  const upcomingMonth = searchParams.get('month');
  const upcomingRangeDaysParam = searchParams.get('rangeDays');
  const upcomingRangeDays =
    upcomingRangeDaysParam === null ? null : Number(upcomingRangeDaysParam);
  const daysAgoParam = searchParams.get('daysAgo') ?? '0';
  const daysAgo = Number(daysAgoParam);
  const rangeDaysParam = searchParams.get('rangeDays');
  const rangeDays = rangeDaysParam === null ? null : Number(rangeDaysParam);
  const competitionId =
    competitionIdParam === null ? null : Number(competitionIdParam);
  const hasUpcomingScheduleFilter =
    upcomingOnly &&
    !upcomingTeamSearch &&
    (competitionIdParam !== null || competitionName !== '' || upcomingMonth !== null);
  const hasUpcomingRange =
    upcomingOnly &&
    !upcomingTeamSearch &&
    upcomingRangeDaysParam !== null;
  const hasValidUpcomingTeamPeriod =
    upcomingMonth === null
      ? [7, 30].includes(upcomingRangeDays ?? 0)
      : isUpcomingMonth(upcomingMonth) && upcomingRangeDaysParam === null;
  if (upcomingTeamSearch && !hasValidUpcomingTeamPeriod) {
    return NextResponse.json(
      { error: 'A valid upcoming month or a 7- or 30-day range is required.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }
  if (
    (hasUpcomingScheduleFilter || hasUpcomingRange) &&
    (!Number.isSafeInteger(competitionId) ||
      competitionId === null ||
      competitionId <= 0 ||
      competitionName.length === 0 ||
      competitionName.length > 80 ||
      (upcomingMonth === null
        ? ![7, 30].includes(upcomingRangeDays ?? 0)
        : !isUpcomingMonth(upcomingMonth)) ||
      (upcomingMonth !== null && upcomingRangeDaysParam !== null))
  ) {
    return NextResponse.json(
      {
        error:
          'A valid competition and either a month within the next 12 months or a 7- or 30-day range are required.',
      },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }
  if (
    finishedOnly &&
    (rangeDays !== null
      ? ![7, 30].includes(rangeDays)
      : ![0, 1, 2].includes(daysAgo))
  ) {
    return NextResponse.json(
      { error: 'Finished matches support daysAgo 0, 1, or 2, or rangeDays 7 or 30.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }
  if (teamQuery.length > 80) {
    return NextResponse.json(
      { error: 'Team search must be 80 characters or fewer.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const scoreboardUrls: URL[] = [];
  if (finishedOnly) {
    if (rangeDays !== null) {
      for (let daysBack = rangeDays - 1; daysBack >= 0; daysBack -= 1) {
        const dailyUrl = new URL(SCOREBOARD_URL);
        dailyUrl.searchParams.set('dates', getKinshasaDate(daysBack));
        dailyUrl.searchParams.set('limit', '1000');
        scoreboardUrls.push(dailyUrl);
      }
    } else {
      const dailyUrl = new URL(SCOREBOARD_URL);
      dailyUrl.searchParams.set('dates', getKinshasaDate(daysAgo));
      scoreboardUrls.push(dailyUrl);
    }
  } else {
    scoreboardUrls.push(new URL(SCOREBOARD_URL));
  }

  try {
    if (upcomingTeamSearch) {
      const teamSchedule = await getUpcomingTeamMatches(
        teamQuery,
        upcomingMonth,
        upcomingRangeDays === 7 || upcomingRangeDays === 30
          ? upcomingRangeDays
          : null,
      );
      if (!teamSchedule) {
        return NextResponse.json(
          { code: 'TEAM_NOT_FOUND', error: 'The requested soccer team was not found.' },
          { status: 404, headers: { 'Cache-Control': 'no-store' } },
        );
      }
      return NextResponse.json(
        teamSchedule,
        {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
          },
        },
      );
    }

    if (
      (hasUpcomingScheduleFilter || hasUpcomingRange) &&
      competitionId !== null &&
      (upcomingMonth !== null || upcomingRangeDays !== null)
    ) {
      const matches = await getUpcomingLeagueMatches(
        competitionId,
        competitionName,
        upcomingMonth,
        upcomingRangeDays === 7 || upcomingRangeDays === 30
          ? upcomingRangeDays
          : null,
      );
      return NextResponse.json(
        { matches },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
          },
        },
      );
    }

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

    const eventLists = await Promise.all(
      scoreboardUrls.map(async (url) => {
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
        return payload.events;
      }),
    );
    const rawEvents = eventLists.flat();
    const events = rawEvents
      .map(parseScoreboardEvent)
      .filter((match): match is ESPNScoreboardMatch => match !== null);
    const competitions = upcomingOnly ? getCompetitionOptions(rawEvents) : null;
    const ignoredCount = rawEvents.length - events.length;
    if (ignoredCount > 0) {
      console.warn(`Ignored ${ignoredCount} ESPN scoreboard events with incomplete data.`);
    }

    const matches = events
      .filter((match) =>
        finishedOnly
          ? match.status.state === 'post'
          : upcomingOnly
            ? match.status.state === 'pre'
            : match.status.state === 'in',
      )
      .sort(
        (a, b) =>
          getCompetitionPriority(a) - getCompetitionPriority(b) ||
          (finishedOnly
            ? (b.date ?? '').localeCompare(a.date ?? '')
            : (a.date ?? '').localeCompare(b.date ?? '')),
      );

    return NextResponse.json(
      competitions ? { matches, competitions } : { matches },
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
