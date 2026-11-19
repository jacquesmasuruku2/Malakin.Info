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
const CACHE_SECONDS = 30;
const ROSTER_CACHE_SECONDS = 86_400;
const RANK_HISTORY_CACHE_SECONDS = 3_600;
const ROSTER_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer';
const LEAGUE_SLUG_PATTERN = /^[a-z0-9._-]{1,80}$/i;

type PlayerRosterInfo = {
  id: number;
  number: number | null;
  age: number | null;
  clubId: number | null;
  clubName: string | null;
  clubLogo: string | null;
};

type TeamProfile = {
  id: number | null;
  name: string;
  logo: string | null;
  league: string | null;
  countryCode: string | null;
};

type CompletedLeagueMatch = {
  date: string;
  homeTeamId: number;
  awayTeamId: number;
  homeScore: number;
  awayScore: number;
};

const LEAGUE_COUNTRY_CODES: Record<string, string> = {
  arg: 'AR',
  aus: 'AU',
  bel: 'BE',
  bra: 'BR',
  eng: 'GB',
  esp: 'ES',
  fra: 'FR',
  ger: 'DE',
  gre: 'GR',
  ita: 'IT',
  jpn: 'JP',
  kor: 'KR',
  mex: 'MX',
  ned: 'NL',
  por: 'PT',
  rus: 'RU',
  sco: 'GB',
  tur: 'TR',
  usa: 'US',
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

function getReferenceId(value: unknown, entity: 'teams' | 'leagues'): number | null {
  if (!isRecord(value)) return null;
  const id = getNumber(value.id);
  if (id !== null) return id;

  const reference = getString(value.$ref);
  const match = reference
    ? new RegExp(`/${entity}/(\\d+)(?:[/?#]|$)`).exec(reference)
    : null;
  return match ? getNumber(match[1]) : null;
}

function getLeagueCountryCode(slug: string | null): string | null {
  if (!slug) return null;
  return LEAGUE_COUNTRY_CODES[slug.split('.')[0].toLowerCase()] ?? null;
}

function parseTeamProfile(value: unknown): TeamProfile | null {
  if (!isRecord(value)) return null;
  const name = getString(value.displayName) ?? getString(value.name);
  if (!name) return null;
  const defaultLeague = isRecord(value.defaultLeague) ? value.defaultLeague : null;
  const leagueSlug =
    (defaultLeague ? getString(defaultLeague.slug) : null) ?? getString(value.leagueAbbrev);
  return {
    id: getNumber(value.id),
    name,
    logo: getLogo(value.logo) ?? getLogo(value.logos),
    league: defaultLeague
      ? getString(defaultLeague.shortName) ??
        getString(defaultLeague.abbreviation) ??
        getString(defaultLeague.name)
      : null,
    countryCode: getLeagueCountryCode(leagueSlug),
  };
}

function getPlayerAge(value: Record<string, unknown>): number | null {
  const age = getNumber(value.age);
  if (age !== null && age >= 0 && age <= 120) return Math.floor(age);

  const dateOfBirth = getString(value.dateOfBirth);
  if (!dateOfBirth) return null;
  const birthDate = new Date(dateOfBirth);
  if (!Number.isFinite(birthDate.getTime())) return null;

  const today = new Date();
  let calculatedAge = today.getUTCFullYear() - birthDate.getUTCFullYear();
  if (
    today.getUTCMonth() < birthDate.getUTCMonth() ||
    (today.getUTCMonth() === birthDate.getUTCMonth() &&
      today.getUTCDate() < birthDate.getUTCDate())
  ) {
    calculatedAge -= 1;
  }
  return calculatedAge >= 0 && calculatedAge <= 120 ? calculatedAge : null;
}

async function fetchLeagueTeamRoster(
  leagueSlug: string,
  teamId: number,
  context: string,
): Promise<Record<string, unknown> | null> {
  if (!LEAGUE_SLUG_PATTERN.test(leagueSlug) || !Number.isSafeInteger(teamId) || teamId <= 0) {
    return null;
  }

  try {
    const response = await fetch(
      `${ROSTER_URL}/${encodeURIComponent(leagueSlug)}/teams/${teamId}/roster`,
      {
        cache: 'force-cache',
        next: { revalidate: ROSTER_CACHE_SECONDS },
        signal: AbortSignal.timeout(5_000),
        headers: { Accept: 'application/json' },
      },
    );
    if (!response.ok) {
      throw new Error(`ESPN roster responded with HTTP ${response.status}.`);
    }

    const payload: unknown = await response.json();
    if (!isRecord(payload) || !Array.isArray(payload.athletes)) {
      throw new Error('ESPN returned an invalid team roster.');
    }
    return payload;
  } catch (error) {
    console.error(`Unable to load ESPN roster for ${context}:`, error);
    return null;
  }
}

async function fetchTeamProfileById(teamId: number): Promise<TeamProfile | null> {
  if (!Number.isSafeInteger(teamId) || teamId <= 0) return null;

  try {
    const response = await fetch(`${ROSTER_URL}/all/teams/${teamId}`, {
      cache: 'force-cache',
      next: { revalidate: ROSTER_CACHE_SECONDS },
      signal: AbortSignal.timeout(5_000),
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`ESPN team profile responded with HTTP ${response.status}.`);
    }

    const payload: unknown = await response.json();
    const profile = isRecord(payload) ? parseTeamProfile(payload.team) : null;
    if (!profile) throw new Error('ESPN returned an invalid team profile.');
    return profile;
  } catch (error) {
    console.error(`Unable to load ESPN club profile for team ${teamId}:`, error);
    return null;
  }
}

function parsePlayerRosterInfo(value: unknown): PlayerRosterInfo | null {
  if (!isRecord(value)) return null;
  const id = getNumber(value.id);
  if (id === null) return null;

  const defaultTeam = isRecord(value.defaultTeam) ? value.defaultTeam : null;
  return {
    id,
    number: getNumber(value.jersey) ?? getNumber(value.number),
    age: getPlayerAge(value),
    clubId: getReferenceId(value.defaultTeam, 'teams'),
    clubName: defaultTeam
      ? getString(defaultTeam.displayName) ?? getString(defaultTeam.name)
      : null,
    clubLogo: defaultTeam
      ? getLogo(defaultTeam.logo) ?? getLogo(defaultTeam.logos)
      : null,
  };
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
  const typeText = (getString(typeInfo.text) ?? '').toLowerCase();
  const text = (getString(value.text) ?? '').toLowerCase();
  const eventDescription = `${type} ${typeText} ${text}`;
  if (type.includes('substitution') || type.includes('sub')) return 'subst';
  if (type.includes('card') || text.includes('yellow card') || text.includes('red card')) {
    return 'card';
  }
  if (
    type.includes('goal') ||
    value.scoringPlay === true ||
    /(?:penalt(?:y|ies)\s+missed|missed\s+penalt(?:y|ies)|^goal(?:[!:\s]|$)|^own goal\b|^penalt(?:y|ies) (?:scored|converted)\b)/i.test(
      text,
    )
  ) {
    return 'goal';
  }
  if (/\bpenalt(?:y|ies)\b.*\b(?:saved|attempted|taken)\b/.test(eventDescription)) {
    return 'penalty-attempt';
  }
  if (
    /\bpenalt(?:y|ies)\b.*\b(?:awarded|given|won|for)\b/.test(eventDescription) ||
    /\b(?:wins?|won|awarded)\s+(?:a\s+)?penalt(?:y|ies)\b/.test(eventDescription) ||
    type.includes('penalty')
  ) {
    return 'penalty-awarded';
  }
  if (type.includes('var') || /\b(?:var|video review|video assistant referee)\b/.test(eventDescription)) {
    return 'var';
  }
  if (type === 'start-2nd-half') return 'start-2nd-half';
  if (type === 'end-regular-time') return 'end-regular-time';
  if (/\b(?:cooling|hydration|water)\s+break\b/.test(eventDescription)) {
    return 'cooling-break';
  }
  if (
    /\b(?:half[\s-]?time|full[\s-]?time|first half|second half|end of period|break|pause|intermission)\b/.test(
      eventDescription,
    )
  ) {
    return 'break';
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
  const parsedAssist = text
    ? /\bAssisted by\s+(.+?)(?:\s+following\b|[.!?]\s*$|$)/i.exec(text)?.[1]
        ?.replace(/\s*\([^)]*\)\s*$/, '')
        .trim() ?? null
    : null;
  const assist = substitution
    ? athletes[0]
    : athletes[1] ?? { id: null, name: parsedAssist };
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
          : typeText || null;

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
  const isGoal =
    /(?:penalt(?:y|ies)\s+missed|missed\s+penalt(?:y|ies)|penalt(?:y|ies)\s+(?:scored|converted))\b/.test(normalized) ||
    /^(?:own goal|goal(?:[!:\s]|$))/.test(normalized);
  const isPenaltyAwarded =
    /\bpenalt(?:y|ies)\b.*\b(?:awarded|given|won|for)\b/.test(normalized) ||
    /\b(?:wins?|won|awarded)\s+(?:a\s+)?penalt(?:y|ies)\b/.test(normalized);
  const isPenaltyAttempt =
    /\bpenalt(?:y|ies)\b.*\b(?:saved|attempted|taken)\b/.test(normalized);
  const type = isGoal
    ? 'goal'
    : isPenaltyAttempt
      ? 'penalty-attempt'
      : isPenaltyAwarded
      ? 'penalty-awarded'
      : /\b(?:red|yellow) card\b/.test(normalized)
        ? 'card'
        : /\bsubstitution\b|\breplaces\b/.test(normalized)
          ? 'subst'
          : /\b(?:var|video review|video assistant referee)\b/.test(normalized)
            ? 'var'
            : /\b(?:cooling|hydration|water)\s+break\b/.test(normalized)
              ? 'cooling-break'
              : /\b(?:half[\s-]?time|full[\s-]?time|first half|second half|end of period|break|pause|intermission)\b/.test(normalized)
                ? 'break'
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
  const eventsById = new Map<string, LiveMatchEvent>();

  keyEvents.forEach((value, index) => {
    const event = parseKeyEvent(value, index);
    if (event) eventsById.set(event.id, event);
  });

  commentary.forEach((value, index) => {
    if (!isRecord(value)) return;
    const play = isRecord(value.play) ? value.play : null;
    if (play) {
      const event = parseKeyEvent(play, index);
      if (!event) return;
      const id = getString(play.id) ?? `commentary-${getString(value.sequence) ?? index}`;
      const existing = eventsById.get(id);
      const comments = getString(value.text) ?? event.comments;
      eventsById.set(id, {
        ...(existing ?? event),
        id,
        comments,
      });
      return;
    }

    const event = parseCommentary(value, index);
    if (!event) return;
    const duplicate = Array.from(eventsById.values()).find((existing) => {
      if (
        existing.time.elapsed !== event.time.elapsed ||
        existing.time.extra !== event.time.extra ||
        existing.type !== event.type
      ) {
        return false;
      }
      if (event.type !== 'other') return true;
      const commentary = event.comments?.toLowerCase();
      return Boolean(
        commentary &&
          (existing.comments?.toLowerCase() === commentary ||
            existing.detail?.toLowerCase() === commentary),
      );
    });
    if (duplicate) {
      if (!duplicate.comments && event.comments) {
        eventsById.set(duplicate.id, { ...duplicate, comments: event.comments });
      }
      return;
    }
    eventsById.set(event.id, event);
  });

  return Array.from(eventsById.values()).sort(
    (a, b) =>
      a.time.elapsed - b.time.elapsed ||
      (a.time.extra ?? 0) - (b.time.extra ?? 0),
  );
}

function parseStatistics(value: unknown): MatchStatistic[] {
  if (!isRecord(value) || !isRecord(value.boxscore) || !Array.isArray(value.boxscore.teams)) {
    return [];
  }

  const statsBySide = new Map<
    'home' | 'away',
    Map<string, { label: string; value: string; numericValue: number | null }>
  >();
  const percentageMetrics = new Set([
    'passPct',
    'passPercentage',
    'passingAccuracy',
    'shotPct',
    'crossPct',
    'longballPct',
    'tacklePct',
  ]);
  for (const teamBox of value.boxscore.teams) {
    if (!isRecord(teamBox) || (teamBox.homeAway !== 'home' && teamBox.homeAway !== 'away')) {
      continue;
    }
    const side = teamBox.homeAway;
    const teamStats = new Map<
      string,
      { label: string; value: string; numericValue: number | null }
    >();
    if (Array.isArray(teamBox.statistics)) {
      for (const stat of teamBox.statistics) {
        if (!isRecord(stat)) continue;
        const name = getString(stat.name);
        const numericValue = getNumber(stat.value);
        const displayValue =
          getString(stat.displayValue) ??
          (numericValue === null ? null : String(numericValue));
        if (name && displayValue) {
          const parsedDisplayValue = Number.parseFloat(displayValue.replace(/,/g, ''));
          let formattedValue = displayValue;
          if (
            !displayValue.includes('%') &&
            Number.isFinite(parsedDisplayValue) &&
            (percentageMetrics.has(name) || name === 'possessionPct')
          ) {
            const percentage =
              percentageMetrics.has(name) && Math.abs(parsedDisplayValue) <= 1
                ? parsedDisplayValue * 100
                : parsedDisplayValue;
            formattedValue = `${Math.round(percentage * 10) / 10}%`;
          }
          teamStats.set(name, {
            label: getString(stat.label) ?? name,
            value: formattedValue,
            numericValue:
              numericValue ??
              (Number.isFinite(parsedDisplayValue) ? parsedDisplayValue : null),
          });
        }
      }
    }
    statsBySide.set(side, teamStats);
  }

  const passPercentageNames = ['passPct', 'passPercentage', 'passingAccuracy'];
  for (const teamStats of statsBySide.values()) {
    if (passPercentageNames.some((name) => teamStats.has(name))) continue;
    const totalPasses = teamStats.get('totalPasses')?.numericValue;
    const accuratePasses = teamStats.get('accuratePasses')?.numericValue;
    if (
      totalPasses === undefined ||
      totalPasses === null ||
      accuratePasses === undefined ||
      accuratePasses === null ||
      totalPasses <= 0 ||
      accuratePasses < 0
    ) {
      continue;
    }
    const percentage = Math.round((accuratePasses / totalPasses) * 100);
    teamStats.set('passPct', {
      label: 'Pass accuracy',
      value: `${percentage}%`,
      numericValue: percentage,
    });
  }

  const preferredMetricNames = [
    'possessionPct',
    'totalShots',
    'shotsOnTarget',
    'blockedShots',
    'wonCorners',
    'totalPasses',
    'accuratePasses',
    'passPct',
    'tackles',
    'totalTackles',
    'effectiveTackles',
    'tacklePct',
    'offsides',
    'foulsCommitted',
    'yellowCards',
    'redCards',
  ];
  const metricNames = new Set<string>();
  for (const teamStats of statsBySide.values()) {
    for (const name of teamStats.keys()) metricNames.add(name);
  }
  const orderedMetricNames = [
    ...preferredMetricNames.filter((name) => metricNames.has(name)),
    ...Array.from(metricNames).filter((name) => !preferredMetricNames.includes(name)),
  ];

  return orderedMetricNames.flatMap((name) => {
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

function calculateMatchPlayerRating(value: unknown): number | null {
  if (!Array.isArray(value)) return null;

  const stats = new Map<string, number>();
  for (const stat of value) {
    if (!isRecord(stat)) continue;
    const name = getString(stat.name);
    const statValue = getNumber(stat.value);
    if (name && statValue !== null) stats.set(name, statValue);
  }

  if ((stats.get('appearances') ?? 0) <= 0) return null;

  const rating =
    6 +
    (stats.get('totalGoals') ?? 0) * 1 +
    (stats.get('goalAssists') ?? 0) * 0.7 +
    (stats.get('shotsOnTarget') ?? 0) * 0.1 +
    (stats.get('saves') ?? 0) * 0.15 -
    (stats.get('yellowCards') ?? 0) * 0.3 -
    (stats.get('redCards') ?? 0) * 1.5 -
    (stats.get('ownGoals') ?? 0) * 1.5 -
    (stats.get('foulsCommitted') ?? 0) * 0.04 -
    (stats.get('goalsConceded') ?? 0) * 0.12;

  return Math.round(Math.min(10, Math.max(0, rating)) * 10) / 10;
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
    number:
      getNumber(value.jersey) ??
      getNumber(value.number) ??
      getNumber(value.athlete.jersey) ??
      getNumber(value.athlete.number),
    position: position
      ? getString(position.abbreviation) ?? getString(position.displayName)
      : null,
    grid: null,
    formationPlace: formationPlace !== null && formationPlace > 0 ? formationPlace : null,
    age: null,
    rating: calculateMatchPlayerRating(value.stats),
    isOnField: false,
    substituted: false,
    replacesStarterId: null,
    replacesStarterName: null,
    club: null,
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
      [...lineup.startingXI, ...lineup.substitutes].some(
        (player) => player.isOnField && matchesPlayer(player, event.player),
      ) &&
      lineup.substitutes.some(
        (player) => !player.isOnField && matchesPlayer(player, event.assist),
      );
    const teamName = event.team.name ? normalizePlayerName(event.team.name) : null;
    const lineup =
      updatedLineups.find(
        (candidate) =>
          (!teamName || normalizePlayerName(candidate.team.name) === teamName) &&
          hasPlayers(candidate),
      ) ?? updatedLineups.find(hasPlayers);
    if (!lineup) continue;

    const outgoingStartingIndex = lineup.startingXI.findIndex(
      (player) => player.isOnField && matchesPlayer(player, event.player),
    );
    const outgoingSubstituteIndex = lineup.substitutes.findIndex(
      (player) => player.isOnField && matchesPlayer(player, event.player),
    );
    const incomingIndex = lineup.substitutes.findIndex((player) =>
      !player.isOnField && matchesPlayer(player, event.assist),
    );
    if (
      (outgoingStartingIndex < 0 && outgoingSubstituteIndex < 0) ||
      incomingIndex < 0
    ) {
      continue;
    }

    const outgoing =
      outgoingStartingIndex >= 0
        ? lineup.startingXI[outgoingStartingIndex]
        : lineup.substitutes[outgoingSubstituteIndex];
    const incoming = lineup.substitutes[incomingIndex];
    const activeReplacement: MatchLineupPlayer = {
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
      isOnField: true,
      replacesStarterId:
        outgoing.replacesStarterId ??
        (outgoingStartingIndex >= 0 ? outgoing.id : null),
      replacesStarterName:
        outgoing.replacesStarterName ??
        (outgoingStartingIndex >= 0 ? outgoing.name : null),
    };
    const startingXI = lineup.startingXI.slice();
    if (outgoingStartingIndex >= 0) {
      startingXI[outgoingStartingIndex] = {
        ...outgoing,
        isOnField: false,
        substituted: true,
      };
    }
    const substitutes = lineup.substitutes.slice();
    if (outgoingSubstituteIndex >= 0) {
      substitutes[outgoingSubstituteIndex] = {
        ...outgoing,
        isOnField: false,
        substituted: true,
      };
    }
    substitutes[incomingIndex] = activeReplacement;

    updatedLineups = updatedLineups.map((candidate) =>
      candidate === lineup ? { ...candidate, startingXI, substitutes } : candidate,
    );
  }

  return updatedLineups;
}

function parseLineups(value: unknown): MatchLineup[] {
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
      const starter = entry.starter === true;
      return player
        ? [{ player: { ...player, isOnField: starter }, starter }]
        : [];
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

  return lineups;
}

async function enrichLineups(
  lineups: MatchLineup[],
  events: LiveMatchEvent[],
  leagueSlug: string | null,
): Promise<MatchLineup[]> {
  const activeLineups = applySubstitutions(lineups, events);
  if (!leagueSlug || !LEAGUE_SLUG_PATTERN.test(leagueSlug)) return activeLineups;

  const teamRosters = await Promise.all(
    activeLineups.map((lineup) =>
      lineup.team.id === null
        ? Promise.resolve(null)
        : fetchLeagueTeamRoster(leagueSlug, lineup.team.id, lineup.team.name),
    ),
  );
  const playerProfiles = teamRosters.map((roster) => {
    const profiles = new Map<number, PlayerRosterInfo>();
    if (roster && Array.isArray(roster.athletes)) {
      for (const athlete of roster.athletes) {
        const profile = parsePlayerRosterInfo(athlete);
        if (profile) profiles.set(profile.id, profile);
      }
    }

    return {
      profiles,
      isNational: roster && isRecord(roster.team) && typeof roster.team.isNational === 'boolean'
        ? roster.team.isNational
        : null,
    };
  });
  const clubProfileRequests = new Map<number, number>();

  activeLineups.forEach((lineup, index) => {
    for (const player of [...lineup.startingXI, ...lineup.substitutes]) {
      if (player.id === null) continue;
      const profile = playerProfiles[index].profiles.get(player.id);
      if (
        profile?.clubId !== null &&
        profile?.clubId !== undefined &&
        profile.clubId !== lineup.team.id
      ) {
        clubProfileRequests.set(profile.clubId, profile.clubId);
      }
    }
  });

  const clubProfiles = new Map<number, TeamProfile>();
  const clubProfileResults = await Promise.all(
    Array.from(clubProfileRequests.values()).map(async (teamId) => [
      teamId,
      await fetchTeamProfileById(teamId),
    ] as const),
  );
  for (const [teamId, profile] of clubProfileResults) {
    if (profile) clubProfiles.set(teamId, profile);
  }

  return activeLineups.map((lineup, index) => {
    const { profiles, isNational } = playerProfiles[index];
    const rosterTeam = teamRosters[index] ? parseTeamProfile(teamRosters[index].team) : null;
    const matchTeamProfile: TeamProfile | null =
      lineup.team.id === null
        ? null
        : {
            id: lineup.team.id,
            name: lineup.team.name,
            logo: lineup.team.logo ?? rosterTeam?.logo ?? null,
            league: rosterTeam?.league ?? null,
            countryCode: rosterTeam?.countryCode ?? null,
          };
    const enrichPlayer = (player: MatchLineupPlayer, showClub: boolean): MatchLineupPlayer => {
      const profile = player.id === null ? undefined : profiles.get(player.id);
      let club: TeamProfile | null = null;

      if (showClub && profile) {
        if (profile.clubId !== null && profile.clubId === lineup.team.id) {
          club = matchTeamProfile;
        } else if (profile.clubId !== null) {
          club =
            clubProfiles.get(profile.clubId) ??
            (profile.clubName
              ? {
                  id: profile.clubId,
                  name: profile.clubName,
                  logo: profile.clubLogo,
                  league: null,
                  countryCode: null,
                }
              : null);
        } else if (profile.clubName) {
          club = {
            id: profile.clubId,
            name: profile.clubName,
            logo: profile.clubLogo,
            league: null,
            countryCode: null,
          };
        } else if (isNational === false) {
          club = matchTeamProfile;
        }
      }

      return {
        ...player,
        number: player.number ?? profile?.number ?? null,
        age: profile?.age ?? null,
        club,
      };
    };

    return {
      ...lineup,
      startingXI: lineup.startingXI.map((player) => enrichPlayer(player, true)),
      substitutes: lineup.substitutes.map((player) => enrichPlayer(player, true)),
    };
  });
}

function getStandingStat(entry: Record<string, unknown>, statName: string): number | null {
  if (!Array.isArray(entry.stats)) return null;
  const stat = entry.stats.find(
    (item) =>
      isRecord(item) &&
      (item.name === statName || item.type === statName || item.abbreviation === statName),
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
      id: (team ? getReferenceId(team, 'teams') : null) ?? getNumber(value.id),
      name: teamName,
      logo: getLogo(team?.logo) ?? getLogo(value.logo),
    },
    points,
    goalsDiff,
    played: getStandingStat(value, 'gamesPlayed'),
    wins: getStandingStat(value, 'wins'),
    draws: getStandingStat(value, 'ties') ?? getStandingStat(value, 'draws'),
    losses: getStandingStat(value, 'losses'),
    goalsFor: getStandingStat(value, 'pointsFor') ?? getStandingStat(value, 'goalsFor'),
    goalsAgainst: getStandingStat(value, 'pointsAgainst') ?? getStandingStat(value, 'goalsAgainst'),
    form: null,
    rankMovement: null,
    description: null,
  };
}

function parseScoreboardMatch(value: unknown, season: number): CompletedLeagueMatch | null {
  if (!isRecord(value) || !isRecord(value.season) || getNumber(value.season.year) !== season) {
    return null;
  }
  const date = getString(value.date);
  if (!date) return null;
  const competitions = Array.isArray(value.competitions) ? value.competitions : [];
  const competition = competitions.find(isRecord);
  if (!competition) return null;
  const status = isRecord(competition.status) ? competition.status : null;
  const statusType = status && isRecord(status.type) ? status.type : null;
  if (statusType?.state !== 'post') return null;

  const competitors = Array.isArray(competition.competitors)
    ? competition.competitors.filter(isRecord)
    : [];
  const home = competitors.find((competitor) => competitor.homeAway === 'home');
  const away = competitors.find((competitor) => competitor.homeAway === 'away');
  if (!home || !away) return null;
  const homeTeam = isRecord(home.team) ? home.team : null;
  const awayTeam = isRecord(away.team) ? away.team : null;
  const homeTeamId = homeTeam ? getNumber(homeTeam.id) : null;
  const awayTeamId = awayTeam ? getNumber(awayTeam.id) : null;
  const homeScore = getNumber(home.score);
  const awayScore = getNumber(away.score);
  if (
    homeTeamId === null ||
    awayTeamId === null ||
    homeScore === null ||
    awayScore === null
  ) {
    return null;
  }
  return { date, homeTeamId, awayTeamId, homeScore, awayScore };
}

function getLatestRoundMatches(events: unknown[], season: number): CompletedLeagueMatch[] {
  const matches = events
    .map((event) => parseScoreboardMatch(event, season))
    .filter((match): match is CompletedLeagueMatch => match !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
  const latestDate = matches[0] ? Date.parse(matches[0].date) : Number.NaN;
  if (!Number.isFinite(latestDate)) return [];
  const roundWindowMs = 3 * 24 * 60 * 60 * 1000;
  return matches.filter((match) => {
    const date = Date.parse(match.date);
    return Number.isFinite(date) && latestDate - date <= roundWindowMs;
  });
}

async function fetchLatestRoundMatches(
  leagueSlug: string,
  season: number,
): Promise<CompletedLeagueMatch[]> {
  const eventLists = await Promise.all(
    [season, season + 1].map(async (year) => {
      const url = new URL(`${ROSTER_URL}/${encodeURIComponent(leagueSlug)}/scoreboard`);
      url.searchParams.set('dates', String(year));
      url.searchParams.set('limit', '1000');
      const response = await fetch(url, {
        cache: 'force-cache',
        next: { revalidate: RANK_HISTORY_CACHE_SECONDS },
        signal: AbortSignal.timeout(10_000),
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
  return getLatestRoundMatches(eventLists.flat(), season);
}

function getPreviousRanks(
  entries: MatchStandingEntry[],
  matches: CompletedLeagueMatch[],
): Map<number, number> {
  const changes = new Map<number, { points: number; goalsDiff: number }>();
  const addChange = (teamId: number, points: number, goalsDiff: number) => {
    const previous = changes.get(teamId) ?? { points: 0, goalsDiff: 0 };
    previous.points += points;
    previous.goalsDiff += goalsDiff;
    changes.set(teamId, previous);
  };

  for (const match of matches) {
    const goalDifference = match.homeScore - match.awayScore;
    addChange(
      match.homeTeamId,
      match.homeScore > match.awayScore ? 3 : match.homeScore === match.awayScore ? 1 : 0,
      goalDifference,
    );
    addChange(
      match.awayTeamId,
      match.awayScore > match.homeScore ? 3 : match.awayScore === match.homeScore ? 1 : 0,
      -goalDifference,
    );
  }

  return new Map(
    entries
      .flatMap((entry) => {
        const id = entry.team.id;
        if (id === null) return [];
        const change = changes.get(id);
        return [{
          id,
          rank: entry.rank,
          points: entry.points - (change?.points ?? 0),
          goalsDiff: entry.goalsDiff - (change?.goalsDiff ?? 0),
        }];
      })
      .sort(
        (a, b) =>
          b.points - a.points ||
          b.goalsDiff - a.goalsDiff ||
          a.rank - b.rank,
      )
      .map((entry, index) => [entry.id, index + 1]),
  );
}

function parseStandings(
  value: unknown,
  leagueSlug: string | null,
  season: number | null,
  latestRoundMatches: CompletedLeagueMatch[] = [],
): MatchStandings | null {
  if (!isRecord(value) || !Array.isArray(value.groups)) {
    return null;
  }
  const groups = value.groups.flatMap((group, index) => {
    if (!isRecord(group) || !isRecord(group.standings) || !Array.isArray(group.standings.entries)) {
      return [];
    }
    const parsedEntries = group.standings.entries
      .map(parseStandingEntry)
      .filter((entry): entry is MatchStandingEntry => entry !== null);
    const previousRanks = getPreviousRanks(parsedEntries, latestRoundMatches);
    const entries = parsedEntries.map((entry) => {
      const previousRank =
        entry.team.id === null ? undefined : previousRanks.get(entry.team.id);
      return {
        ...entry,
        rankMovement: previousRank === undefined ? null : previousRank - entry.rank,
      };
    });
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
    leagueSlug,
    season,
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
    const header = isRecord(payload.header) ? payload.header : null;
    const league = header && isRecord(header.league) ? header.league : null;
    const leagueSlug =
      getString(league?.slug) ??
      (isRecord(payload.league) ? getString(payload.league.slug) : null);
    const seasonInfo =
      header && isRecord(header.season)
        ? header.season
        : isRecord(payload.season)
          ? payload.season
          : null;
    const season = seasonInfo ? getNumber(seasonInfo.year) : null;
    const lineups = await enrichLineups(parseLineups(payload.rosters), events, leagueSlug);
    let standings = parseStandings(payload.standings, leagueSlug, season);
    if (standings && leagueSlug && season !== null) {
      try {
        const latestRoundMatches = await fetchLatestRoundMatches(leagueSlug, season);
        if (latestRoundMatches.length > 0) {
          standings = parseStandings(
            payload.standings,
            leagueSlug,
            season,
            latestRoundMatches,
          );
        }
      } catch (error) {
        console.warn(`Unable to calculate standings movement for ESPN event ${eventId}:`, error);
      }
    }

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
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=15',
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
