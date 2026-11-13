import { NextResponse } from 'next/server';
import type {
  LiveMatchEvent,
  MatchLineup,
  MatchLineupPlayer,
  MatchStandingEntry,
  MatchStandings,
  MatchStatistic,
} from '@/types/live-scores';

const SUMMARY_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/all/summary';
const CACHE_SECONDS = 60;

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
  return null;
}

function getLogo(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (!Array.isArray(value)) return null;

  for (const item of value) {
    if (isRecord(item)) {
      const href = getString(item.href) ?? getString(item.url);
      if (href) return href;
    }
  }
  return null;
}

function getClock(value: unknown): { displayMinute: string; elapsed: number; extra: number | null } {
  const clock = isRecord(value) ? value : {};
  const displayMinute = getString(clock.displayValue) ?? '';
  const match = /(\d+)(?:\s*['′]?\s*\+\s*(\d+))?/.exec(displayMinute);
  const elapsed = match ? Number(match[1]) : Math.floor((getNumber(clock.value) ?? 0) / 60);
  return {
    displayMinute: displayMinute || `${elapsed}'`,
    elapsed,
    extra: match?.[2] ? Number(match[2]) : null,
  };
}

function getAthlete(value: unknown): { id: number | null; name: string | null } {
  const athlete = isRecord(value) && isRecord(value.athlete) ? value.athlete : value;
  if (!isRecord(athlete)) return { id: null, name: null };
  return {
    id: getNumber(athlete.id),
    name: getString(athlete.displayName) ?? getString(athlete.fullName) ?? getString(athlete.name),
  };
}

function getEventType(value: Record<string, unknown>): string {
  const typeInfo = isRecord(value.type) ? value.type : {};
  const type = (getString(typeInfo.type) ?? getString(typeInfo.text) ?? '').toLowerCase();
  const text = (getString(value.text) ?? '').toLowerCase();
  if (
    type.includes('goal') ||
    type.includes('penalty') ||
    text.includes('penalty missed') ||
    value.scoringPlay === true
  ) {
    return 'goal';
  }
  if (type.includes('substitution') || type.includes('sub')) return 'subst';
  if (type.includes('card') || text.includes('yellow card') || text.includes('red card')) {
    return 'card';
  }
  return type || 'other';
}

function parseKeyEvent(value: unknown, index: number): LiveMatchEvent | null {
  if (!isRecord(value)) return null;
  const clock = getClock(value.clock);
  const typeInfo = isRecord(value.type) ? value.type : {};
  const typeText = getString(typeInfo.text) ?? '';
  const type = getEventType(value);
  const text = getString(value.text);
  const participants = Array.isArray(value.participants) ? value.participants : [];
  const athletesInvolved = Array.isArray(value.athletesInvolved) ? value.athletesInvolved : [];
  const athletes = (participants.length > 0 ? participants : athletesInvolved).map(getAthlete);
  const substitution = type === 'subst';
  const player = substitution ? athletes[1] : athletes[0];
  const assist = substitution ? athletes[0] : athletes[1];
  const eventId = getString(value.id) ?? String(index);
  const team = isRecord(value.team)
    ? getString(value.team.displayName) ?? getString(value.team.name)
    : null;
  const typeDescription =
    type === 'goal'
      ? text?.toLowerCase().includes('penalty missed') ||
        typeText.toLowerCase().includes('missed penalty')
        ? 'Penalty missed'
        : value.penaltyKick === true || text?.toLowerCase().includes('penalty')
          ? 'Penalty'
          : value.ownGoal === true || text?.toLowerCase().includes('own goal')
            ? 'Own Goal'
            : null
      : type === 'card'
        ? typeText || (text?.toLowerCase().includes('red card') ? 'Red Card' : 'Yellow Card')
        : type === 'subst'
          ? 'Substitution'
          : typeText || text;

  return {
    id: eventId,
    displayMinute: clock.displayMinute,
    time: { elapsed: clock.elapsed, extra: clock.extra },
    team: { name: team },
    player: { id: player?.id ?? null, name: player?.name ?? null },
    assist: { id: assist?.id ?? null, name: assist?.name ?? null },
    type,
    detail: typeDescription,
    comments: text,
  };
}

function parseCommentary(value: unknown, index: number): LiveMatchEvent | null {
  if (!isRecord(value)) return null;
  const clock = getClock(value.time);
  const text = getString(value.text);
  if (!text) return null;
  const normalized = text.toLowerCase();
  const type = normalized.includes('goal')
    ? 'goal'
    : normalized.includes('red card') || normalized.includes('yellow card')
      ? 'card'
      : normalized.includes('substitution')
        ? 'subst'
        : 'other';

  return {
    id: `commentary-${getString(value.sequence) ?? index}`,
    displayMinute: clock.displayMinute,
    time: { elapsed: clock.elapsed, extra: clock.extra },
    team: { name: null },
    player: { id: null, name: null },
    assist: { id: null, name: null },
    type,
    detail: type === 'goal' ? null : type === 'card' ? text : type === 'subst' ? 'Substitution' : text,
    comments: text,
  };
}

function parseEvents(payload: Record<string, unknown>): LiveMatchEvent[] {
  const keyEvents = Array.isArray(payload.keyEvents) ? payload.keyEvents : [];
  const commentary = Array.isArray(payload.commentary) ? payload.commentary : [];
  const source = keyEvents.length > 0 ? keyEvents : commentary;
  const events = source
    .map((event, index) =>
      keyEvents.length > 0
        ? parseKeyEvent(event, index)
        : parseCommentary(event, index),
    )
    .filter((event): event is LiveMatchEvent => event !== null);

  return events.sort(
    (a, b) =>
      a.time.elapsed - b.time.elapsed ||
      (a.time.extra ?? 0) - (b.time.extra ?? 0),
  );
}

function parseStatistics(value: unknown): MatchStatistic[] {
  if (!isRecord(value) || !isRecord(value.boxscore) || !Array.isArray(value.boxscore.teams)) {
    return [];
  }

  const statsBySide = new Map<'home' | 'away', Map<string, { label: string; value: string }>>();
  for (const teamBox of value.boxscore.teams) {
    if (!isRecord(teamBox) || (teamBox.homeAway !== 'home' && teamBox.homeAway !== 'away')) {
      continue;
    }
    const side = teamBox.homeAway;
    const teamStats = new Map<string, { label: string; value: string }>();
    if (Array.isArray(teamBox.statistics)) {
      for (const stat of teamBox.statistics) {
        if (!isRecord(stat)) continue;
        const name = getString(stat.name);
        const displayValue = getString(stat.displayValue);
        if (name && displayValue) {
          teamStats.set(name, {
            label: getString(stat.label) ?? name,
            value: displayValue,
          });
        }
      }
    }
    statsBySide.set(side, teamStats);
  }

  const metricNames = [
    'possessionPct',
    'shotsOnTarget',
    'totalShots',
    'wonCorners',
    'foulsCommitted',
    'yellowCards',
    'redCards',
  ];

  return metricNames.flatMap((name) => {
    const home = statsBySide.get('home')?.get(name);
    const away = statsBySide.get('away')?.get(name);
    if (!home && !away) return [];
    return [{
      name,
      label: home?.label ?? away?.label ?? name,
      home: home?.value ?? null,
      away: away?.value ?? null,
    }];
  });
}

function parseLineupPlayer(value: unknown): MatchLineupPlayer | null {
  if (!isRecord(value) || !isRecord(value.athlete)) return null;
  const name =
    getString(value.athlete.displayName) ??
    getString(value.athlete.fullName) ??
    getString(value.athlete.name);
  if (!name) return null;
  const position = isRecord(value.position) ? value.position : null;

  const formationPlace = getNumber(value.formationPlace);

  return {
    id: getNumber(value.athlete.id),
    name,
    number: getNumber(value.jersey),
    position: position
      ? getString(position.abbreviation) ?? getString(position.displayName)
      : null,
    grid: null,
    formationPlace: formationPlace !== null && formationPlace > 0 ? formationPlace : null,
  };
}

function normalizePlayerName(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
}

function matchesPlayer(
  lineupPlayer: MatchLineupPlayer,
  eventPlayer: LiveMatchEvent['player'],
): boolean {
  if (lineupPlayer.id !== null && eventPlayer.id !== null) {
    return lineupPlayer.id === eventPlayer.id;
  }
  return (
    eventPlayer.name !== null &&
    normalizePlayerName(lineupPlayer.name) === normalizePlayerName(eventPlayer.name)
  );
}

function applySubstitutions(
  lineups: MatchLineup[],
  events: LiveMatchEvent[],
): MatchLineup[] {
  let updatedLineups = lineups;

  for (const event of events) {
    if (event.type !== 'subst' || (!event.player.id && !event.player.name) ||
      (!event.assist.id && !event.assist.name)) {
      continue;
    }

    const hasPlayers = (lineup: MatchLineup) =>
      lineup.startingXI.some((player) => matchesPlayer(player, event.player)) &&
      lineup.substitutes.some((player) => matchesPlayer(player, event.assist));
    const teamName = event.team.name ? normalizePlayerName(event.team.name) : null;
    const lineup =
      updatedLineups.find(
        (candidate) =>
          (!teamName || normalizePlayerName(candidate.team.name) === teamName) &&
          hasPlayers(candidate),
      ) ?? updatedLineups.find(hasPlayers);
    if (!lineup) continue;

    const outgoingIndex = lineup.startingXI.findIndex((player) =>
      matchesPlayer(player, event.player),
    );
    const incomingIndex = lineup.substitutes.findIndex((player) =>
      matchesPlayer(player, event.assist),
    );
    if (outgoingIndex < 0 || incomingIndex < 0) continue;

    const outgoing = lineup.startingXI[outgoingIndex];
    const incoming = lineup.substitutes[incomingIndex];
    const replacement: MatchLineupPlayer = {
      ...incoming,
      position:
        incoming.position && incoming.position.toUpperCase() !== 'SUB'
          ? incoming.position
          : outgoing.position,
      grid: incoming.grid ?? outgoing.grid,
      formationPlace:
        incoming.formationPlace !== null && incoming.formationPlace > 0
          ? incoming.formationPlace
          : outgoing.formationPlace,
    };
    const startingXI = lineup.startingXI.slice();
    startingXI[outgoingIndex] = replacement;
    const substitutes = lineup.substitutes.slice();
    substitutes[incomingIndex] = outgoing;

    updatedLineups = updatedLineups.map((candidate) =>
      candidate === lineup ? { ...candidate, startingXI, substitutes } : candidate,
    );
  }

  return updatedLineups;
}

function parseLineups(value: unknown, events: LiveMatchEvent[]): MatchLineup[] {
  if (!Array.isArray(value)) return [];
  const lineups = value.flatMap((teamRoster) => {
    if (!isRecord(teamRoster) || !isRecord(teamRoster.team) || !Array.isArray(teamRoster.roster)) {
      return [];
    }
    const teamName =
      getString(teamRoster.team.displayName) ??
      getString(teamRoster.team.name);
    if (!teamName) return [];

    const rosterPlayers = teamRoster.roster.flatMap((entry) => {
      if (!isRecord(entry)) return [];
      const player = parseLineupPlayer(entry);
      return player ? [{ player, starter: entry.starter === true }] : [];
    });
    const startingXI = rosterPlayers
      .filter((entry) => entry.starter)
      .map((entry) => entry.player);
    const substitutes = rosterPlayers
      .filter((entry) => !entry.starter)
      .map((entry) => entry.player);

    if (startingXI.length === 0) return [];

    return [{
      team: {
        id: getNumber(teamRoster.team.id),
        name: teamName,
        logo: getLogo(teamRoster.team.logo) ?? getLogo(teamRoster.team.logos),
      },
      formation: getString(teamRoster.formation),
      startingXI,
      substitutes,
      coach: null,
    }];
  });

  return applySubstitutions(lineups, events);
}

function getStandingStat(entry: Record<string, unknown>, statName: string): number | null {
  if (!Array.isArray(entry.stats)) return null;
  const stat = entry.stats.find(
    (item) => isRecord(item) && (item.name === statName || item.type === statName),
  );
  return isRecord(stat) ? getNumber(stat.value) : null;
}

function parseStandingEntry(value: unknown): MatchStandingEntry | null {
  if (!isRecord(value)) return null;
  const team = isRecord(value.team) ? value.team : null;
  const teamName = typeof value.team === 'string'
    ? value.team
    : team
      ? getString(team.displayName) ?? getString(team.name)
      : null;
  if (!teamName) return null;
  const rank = getStandingStat(value, 'rank');
  const points = getStandingStat(value, 'points');
  const goalsDiff = getStandingStat(value, 'pointDifferential');
  if (rank === null || points === null || goalsDiff === null) return null;

  return {
    rank,
    team: {
      id: getNumber(team?.id) ?? getNumber(value.id),
      name: teamName,
      logo: getLogo(team?.logo) ?? getLogo(value.logo),
    },
    points,
    goalsDiff,
    played: getStandingStat(value, 'gamesPlayed'),
    form: null,
    description: null,
  };
}

function parseStandings(value: unknown): MatchStandings | null {
  if (!isRecord(value) || !Array.isArray(value.groups)) {
    return null;
  }
  const groups = value.groups.flatMap((group, index) => {
    if (!isRecord(group) || !isRecord(group.standings) || !Array.isArray(group.standings.entries)) {
      return [];
    }
    const entries = group.standings.entries
      .map(parseStandingEntry)
      .filter((entry): entry is MatchStandingEntry => entry !== null);
    if (entries.length === 0) return [];
    return [{
      name: getString(group.header) ?? getString(group.conferenceHeader) ?? `Group ${index + 1}`,
      entries,
    }];
  });
  if (groups.length === 0) return null;

  const header = getString(value.header) ?? 'Classement';
  return {
    league: header.replace(/\s+standings$/i, ''),
    groups,
  };
}

export async function GET(request: Request) {
  const eventId = new URL(request.url).searchParams.get('id');
  if (!eventId || !/^\d+$/.test(eventId) || !Number.isSafeInteger(Number(eventId))) {
    return NextResponse.json(
      { error: 'A valid ESPN event id is required.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const url = new URL(SUMMARY_URL);
    url.searchParams.set('event', eventId);
    const response = await fetch(url, {
      cache: 'force-cache',
      next: { revalidate: CACHE_SECONDS },
      signal: AbortSignal.timeout(15_000),
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`ESPN match summary responded with HTTP ${response.status}.`);
    }

    const payload: unknown = await response.json();
    if (!isRecord(payload)) throw new Error('ESPN returned an invalid match summary.');
    const events = parseEvents(payload);
    const statistics = parseStatistics(payload);
    const lineups = parseLineups(payload.rosters, events);
    const standings = parseStandings(payload.standings);

    return NextResponse.json(
      {
        events,
        statistics,
        lineups,
        standings,
        unavailable: {
          lineups: !Array.isArray(payload.rosters) || payload.rosters.length === 0,
          standings: standings === null,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      },
    );
  } catch (error) {
    console.error('ESPN match summary request failed:', error);
    return NextResponse.json(
      { error: 'Les données du match sont temporairement indisponibles.' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
