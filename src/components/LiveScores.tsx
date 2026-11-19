'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ChevronDown,
  CircleAlert,
  CircleDot,
  Clock3,
  LoaderCircle,
  Pin,
  RefreshCw,
  Search,
  Share2,
  Star,
  Trophy,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { authFetch } from '@/lib/client-auth';
import { enableFootballMatchNotifications } from '@/lib/match-notification-client';
import { useAccountUser } from '@/lib/use-account-user';
import type {
  ESPNScoreboardMatch,
  LiveScoreCompetitionOption,
  LiveMatchEvent,
  LiveScoreMatch,
  MatchDetailsData,
  MatchLineup,
  MatchLineupPlayer,
  MatchStandingEntry,
  MatchStandings,
  MatchStatistic,
  SoccerContinent,
} from '@/types/live-scores';

type LiveScoresProps = {
  locale?: string;
  initialMatchId?: number;
  initialDetailsTab?: 'events' | 'statistics' | 'lineups' | 'standings';
  initialMatchLabel?: string;
  initialMatchKey?: string;
};

type MatchDetailsTab = 'events' | 'statistics' | 'lineups' | 'standings';

const REFRESH_INTERVAL_MS = 60_000;
const MATCH_DETAILS_REFRESH_INTERVAL_MS = 30_000;
const UPCOMING_MONTH_COUNT = 12;
const FAVORITES_STORAGE_KEY = 'malakinfo-live-match-favorites';
const favoriteSubscribers = new Set<() => void>();
type ScoresView = 'live' | 'upcoming' | 'finished';
type FinishedDateFilter = 0 | 1 | 2 | 'week' | 'month';
type FollowedFootballTeam = {
  espnTeamId: string;
  name: string;
  logo: string | null;
};
function createMatchShareKey(
  match: LiveScoreMatch | undefined,
  fixtureId: number,
  initialMatchKey?: string,
) {
  const teams = match
    ? `${match.teams.home.name}-vs-${match.teams.away.name}`
    : initialMatchKey
        ?.replace(/[-_]\d+$/, '')
        .replace(/[-_]+$/, '');
  if (!teams || /^\d+$/.test(teams)) return String(fixtureId);
  const slug = teams
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return slug ? `${slug}-${fixtureId}` : String(fixtureId);
}

function getMatchDetailsPath(
  locale: string,
  match: LiveScoreMatch | undefined,
  fixtureId: number,
  tab: Exclude<MatchDetailsTab, 'events'>,
  initialMatchKey?: string,
) {
  const key = createMatchShareKey(match, fixtureId, initialMatchKey);
  const section =
    tab === 'lineups'
      ? locale === 'en'
        ? 'lineups'
        : 'composition'
      : tab === 'statistics'
        ? locale === 'en'
          ? 'statistics'
          : 'statistiques'
        : locale === 'en'
          ? 'standings'
          : 'classement';
  return `/${locale}/matches-en-direct/${key}/${section}`;
}

function getTeamSeasonPath(
  locale: string,
  team: MatchStandingEntry['team'],
  standings: MatchStandings,
  matchSeason: number | null,
): string | null {
  if (team.id === null) return null;
  const slug = team.name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const section = locale === 'en' ? 'teams' : 'equipes';
  const params = new URLSearchParams();
  if (standings.leagueSlug) params.set('league', standings.leagueSlug);
  const season = matchSeason ?? standings.season;
  if (season !== null) params.set('season', String(season));
  const query = params.toString();
  return `/${locale}/matches-en-direct/${section}/${slug}-${team.id}${query ? `?${query}` : ''}`;
}

function getMatchRoundLabel(round: string, english: boolean): string {
  const normalized = round
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  const matchday = normalized.match(
    /(?:matchday|match day|round|week|journee|day|regular season)\s*[-:#]?\s*(\d+)/,
  );
  if (matchday) return `${english ? 'Matchday' : 'Journée'} ${matchday[1]}`;

  const group = round.trim().match(/^group\s+(.+)$/i);
  if (group) return `${english ? 'Group' : 'Groupe'} ${group[1]}`;
  return round.trim();
}

const TEAM_SEARCH_ALIASES: Record<string, string[]> = {
  allemagne: ['germany'],
  angleterre: ['england'],
  'cote d ivoire': ['ivory coast', 'cote divoire'],
  espagne: ['spain'],
  italie: ['italy'],
  'pays bas': ['netherlands'],
  'dr congo': ['congo dr'],
  'republique democratique du congo': ['dr congo', 'congo dr'],
  rdc: ['dr congo', 'congo dr'],
};

function getFavoritesSnapshot(): string {
  return window.localStorage.getItem(FAVORITES_STORAGE_KEY) ?? '[]';
}

function getServerFavoritesSnapshot(): string {
  return '[]';
}

function subscribeToFavorites(onChange: () => void): () => void {
  favoriteSubscribers.add(onChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key === FAVORITES_STORAGE_KEY) onChange();
  };
  window.addEventListener('storage', onStorage);

  return () => {
    favoriteSubscribers.delete(onChange);
    window.removeEventListener('storage', onStorage);
  };
}

function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
}

function matchesTeamSearch(teamName: string, query: string): boolean {
  const normalizedTeam = normalizeSearch(teamName);
  const aliases = TEAM_SEARCH_ALIASES[query] ?? [];
  return normalizedTeam.includes(query) || aliases.some((alias) => normalizedTeam.includes(alias));
}

function parseFavoriteIds(snapshot: string): number[] {
  try {
    const stored: unknown = JSON.parse(snapshot);
    if (!Array.isArray(stored) || !stored.every((id) => Number.isSafeInteger(id) && id > 0)) {
      throw new Error('Stored live match favorites are invalid.');
    }
    return stored;
  } catch (error) {
    console.error('Unable to read saved live match favorites:', error);
    return [];
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || (typeof value === 'number' && Number.isFinite(value));
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

const SOCCER_CONTINENTS: SoccerContinent[] = [
  'africa',
  'asia',
  'europe',
  'north-america',
  'south-america',
  'oceania',
  'international',
  'other',
];

function isSoccerContinent(value: unknown): value is SoccerContinent {
  return (
    typeof value === 'string' &&
    SOCCER_CONTINENTS.some((continent) => continent === value)
  );
}

function isLiveScoreCompetitionOption(
  value: unknown,
): value is LiveScoreCompetitionOption {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    Number.isSafeInteger(value.id) &&
    value.id > 0 &&
    typeof value.name === 'string' &&
    isSoccerContinent(value.continent)
  );
}

function isFollowedFootballTeam(value: unknown): value is FollowedFootballTeam {
  return (
    isRecord(value) &&
    typeof value.espnTeamId === 'string' &&
    typeof value.name === 'string' &&
    isNullableString(value.logo)
  );
}

function isESPNScoreboardMatch(value: unknown): value is ESPNScoreboardMatch {
  return (
    isRecord(value) &&
    isRecord(value.league) &&
    typeof value.id === 'number' &&
    isNullableString(value.date) &&
    isNullableString(value.venue) &&
    isNullableNumber(value.league.id) &&
    isNullableNumber(value.league.season) &&
    typeof value.league.name === 'string' &&
    isNullableString(value.league.logo) &&
    isNullableString(value.league.round) &&
    isRecord(value.status) &&
    (value.status.state === 'in' || value.status.state === 'post' || value.status.state === 'pre') &&
    isNullableString(value.status.displayClock) &&
    isNullableString(value.status.shortDetail) &&
    isNullableString(value.status.detail) &&
    isNullableNumber(value.status.elapsed) &&
    isNullableNumber(value.status.extra) &&
    isRecord(value.homeTeam) &&
    isNullableNumber(value.homeTeam.id) &&
    typeof value.homeTeam.name === 'string' &&
    isNullableString(value.homeTeam.logo) &&
    isNullableNumber(value.homeTeam.score) &&
    isRecord(value.awayTeam) &&
    isNullableNumber(value.awayTeam.id) &&
    typeof value.awayTeam.name === 'string' &&
    isNullableString(value.awayTeam.logo) &&
    isNullableNumber(value.awayTeam.score)
  );
}

function toLiveScoreMatch(match: ESPNScoreboardMatch): LiveScoreMatch {
  const short =
    match.status.state === 'in'
      ? 'LIVE'
      : match.status.state === 'pre'
        ? 'NS'
        : /penalt/i.test(match.status.detail ?? '')
          ? 'PEN'
          : /extra time|after extra time|aet/i.test(match.status.detail ?? '')
            ? 'AET'
            : 'FT';

  return {
    fixture: {
      id: match.id,
      date: match.date,
      venue: match.venue,
      status: {
        elapsed: match.status.elapsed,
        extra: match.status.extra,
        short,
        long: match.status.detail ?? match.status.shortDetail,
      },
    },
    league: {
      id: match.league.id ?? 0,
      season: match.league.season,
      name: match.league.name,
      logo: match.league.logo,
      country: null,
      round: match.league.round,
    },
    teams: {
      home: {
        id: match.homeTeam.id,
        name: match.homeTeam.name,
        logo: match.homeTeam.logo,
      },
      away: {
        id: match.awayTeam.id,
        name: match.awayTeam.name,
        logo: match.awayTeam.logo,
      },
    },
    goals: {
      home: match.homeTeam.score,
      away: match.awayTeam.score,
    },
    score: { penalty: null },
    state: match.status.state,
    displayClock: match.status.displayClock,
  };
}

function getKickoffLabel(date: string | null, english: boolean): string {
  const kickoff = date ? new Date(date) : null;
  if (!kickoff || !Number.isFinite(kickoff.getTime())) {
    return english ? 'Time unavailable' : 'Heure indisponible';
  }

  const formatted = new Intl.DateTimeFormat(english ? 'en-GB' : 'fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Kinshasa',
  }).format(kickoff);
  return english ? `${formatted} (Kinshasa time)` : `${formatted} (heure de Kinshasa)`;
}

function getStartedAtLabel(date: string | null, english: boolean): string {
  const kickoff = date ? new Date(date) : null;
  if (!kickoff || !Number.isFinite(kickoff.getTime())) {
    return english ? 'Time unavailable' : 'Heure indisponible';
  }

  const locale = english ? 'en-GB' : 'fr-FR';
  const time = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Kinshasa',
  }).format(kickoff);
  const formattedTime = english ? time : time.replace(':', 'h');
  const offset =
    new Intl.DateTimeFormat(locale, {
      timeZone: 'Africa/Kinshasa',
      timeZoneName: 'shortOffset',
    })
      .formatToParts(kickoff)
      .find((part) => part.type === 'timeZoneName')
      ?.value.replace(/^UTC/, 'GMT') ?? 'GMT+1';

  return `${formattedTime} (${offset})`;
}

function hasMatchStarted(match: LiveScoreMatch): boolean {
  if (match.state === 'in') return true;
  if (match.state !== 'post') return false;
  return !/(cancel|postpon|suspend|abandon|void)/i.test(
    `${match.fixture.status.short ?? ''} ${match.fixture.status.long ?? ''}`,
  );
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

function formatMonthLabel(month: string, english: boolean): string {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Intl.DateTimeFormat(english ? 'en-US' : 'fr-FR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, monthNumber - 1, 1)));
}

function getLiveMinute(match: LiveScoreMatch): string | null {
  if (match.state !== 'in') return null;
  const { elapsed, extra } = match.fixture.status;
  if (elapsed === null) return match.displayClock;
  return `${elapsed}${extra !== null && extra > 0 ? `+${extra}` : ''}′`;
}

function isLiveMatchEvent(value: unknown): value is LiveMatchEvent {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.displayMinute === 'string' &&
    isRecord(value.time) &&
    typeof value.time.elapsed === 'number' &&
    isNullableNumber(value.time.extra) &&
    isRecord(value.team) &&
    isNullableString(value.team.name) &&
    isRecord(value.player) &&
    isNullableNumber(value.player.id) &&
    isNullableString(value.player.name) &&
    isRecord(value.assist) &&
    isNullableNumber(value.assist.id) &&
    isNullableString(value.assist.name) &&
    typeof value.type === 'string' &&
    isNullableString(value.detail) &&
    isNullableString(value.comments)
  );
}

function isMatchLineupPlayer(value: unknown): value is MatchLineupPlayer {
  return (
    isRecord(value) &&
    isNullableNumber(value.id) &&
    typeof value.name === 'string' &&
    isNullableNumber(value.number) &&
    isNullableString(value.position) &&
    isNullableString(value.grid) &&
    isNullableNumber(value.formationPlace) &&
    isNullableNumber(value.age) &&
    isNullableNumber(value.rating) &&
    typeof value.isOnField === 'boolean' &&
    typeof value.substituted === 'boolean' &&
    isNullableNumber(value.replacesStarterId) &&
    isNullableString(value.replacesStarterName) &&
    (value.club === null ||
      (isRecord(value.club) &&
        isNullableNumber(value.club.id) &&
        typeof value.club.name === 'string' &&
        isNullableString(value.club.logo) &&
        isNullableString(value.club.league) &&
        isNullableString(value.club.countryCode)))
  );
}

function isMatchLineup(value: unknown): value is MatchLineup {
  return (
    isRecord(value) &&
    isRecord(value.team) &&
    isNullableNumber(value.team.id) &&
    typeof value.team.name === 'string' &&
    isNullableString(value.team.logo) &&
    isNullableString(value.formation) &&
    Array.isArray(value.startingXI) &&
    value.startingXI.every(isMatchLineupPlayer) &&
    Array.isArray(value.substitutes) &&
    value.substitutes.every(isMatchLineupPlayer) &&
    isNullableString(value.coach)
  );
}

function isMatchStandingEntry(value: unknown): value is MatchStandingEntry {
  return (
    isRecord(value) &&
    typeof value.rank === 'number' &&
    isRecord(value.team) &&
    isNullableNumber(value.team.id) &&
    typeof value.team.name === 'string' &&
    isNullableString(value.team.logo) &&
    typeof value.points === 'number' &&
    typeof value.goalsDiff === 'number' &&
    isNullableNumber(value.played) &&
    isNullableNumber(value.wins) &&
    isNullableNumber(value.draws) &&
    isNullableNumber(value.losses) &&
    isNullableNumber(value.goalsFor) &&
    isNullableNumber(value.goalsAgainst) &&
    isNullableString(value.form) &&
    isNullableNumber(value.rankMovement) &&
    isNullableString(value.description)
  );
}

function isMatchStandings(value: unknown): value is MatchStandings {
  return (
    isRecord(value) &&
    typeof value.league === 'string' &&
    isNullableString(value.leagueSlug) &&
    isNullableNumber(value.season) &&
    Array.isArray(value.groups) &&
    value.groups.every(
      (group) =>
        isRecord(group) &&
        isNullableString(group.name) &&
        Array.isArray(group.entries) &&
        group.entries.every(isMatchStandingEntry),
    )
  );
}

function isMatchDetailsData(value: unknown): value is MatchDetailsData {
  return (
    isRecord(value) &&
    Array.isArray(value.events) &&
    value.events.every(isLiveMatchEvent) &&
    Array.isArray(value.statistics) &&
    value.statistics.every(
      (stat) =>
        isRecord(stat) &&
        typeof stat.name === 'string' &&
        typeof stat.label === 'string' &&
        isNullableString(stat.home) &&
        isNullableString(stat.away),
    ) &&
    Array.isArray(value.lineups) &&
    value.lineups.every(isMatchLineup) &&
    (value.standings === null || isMatchStandings(value.standings)) &&
    isRecord(value.unavailable) &&
    typeof value.unavailable.lineups === 'boolean' &&
    typeof value.unavailable.standings === 'boolean'
  );
}

function getJerseyNumber(
  lineups: MatchLineup[],
  playerId: number | null,
  playerName: string | null,
): number | null {
  const players = lineups.flatMap((lineup) => [...lineup.startingXI, ...lineup.substitutes]);
  const playerById =
    playerId === null ? undefined : players.find((player) => player.id === playerId);
  const playerByName =
    playerName === null
      ? undefined
      : players.find(
          (player) => normalizeSearch(player.name) === normalizeSearch(playerName),
        );
  return playerById?.number ?? playerByName?.number ?? null;
}

type PitchLine =
  | 'goalkeeper'
  | 'defense'
  | 'midfield'
  | 'attackingMidfield'
  | 'attack'
  | 'unknown';

function getPitchLine(position: string | null): PitchLine {
  const normalized = position?.toUpperCase().replace(/[^A-Z]/g, '') ?? '';
  if (
    normalized === 'G' ||
    normalized === 'GK' ||
    normalized.includes('GOALKEEPER')
  ) {
    return 'goalkeeper';
  }
  if (/^(AM|CAM)/.test(normalized)) {
    return 'attackingMidfield';
  }
  if (/^(DM|CDM|CM|LM|RM|MF|M)/.test(normalized) || normalized.includes('MIDFIELDER')) {
    return 'midfield';
  }
  if (/^(CB|CD|LB|RB|LWB|RWB|WB|DF|D)/.test(normalized) || normalized.includes('DEFENDER')) {
    return 'defense';
  }
  if (/^(CF|ST|LF|RF|LW|RW|FW|F|SS|WG)/.test(normalized) || /FORWARD|STRIKER/.test(normalized)) {
    return 'attack';
  }
  return 'unknown';
}

function getPitchSide(position: string | null): number {
  const normalized = position?.toUpperCase() ?? '';
  if (normalized.startsWith('L')) return 0;
  if (normalized.endsWith('-L') || normalized.endsWith(' L')) return 1;
  if (normalized.endsWith('-R') || normalized.endsWith(' R')) return 2;
  if (normalized.startsWith('R')) return 3;
  return 1.5;
}

function getPitchPositions(lineup: MatchLineup) {
  const players = lineup.startingXI.map((player, index) => ({
    player,
    index,
    grid: /^(\d+):(\d+)$/.exec(player.grid ?? ''),
  }));

  if (players.length > 0 && players.every(({ grid }) => grid !== null)) {
    const rowNumbers = players.map(({ grid }) => Number(grid![1]));
    const minRow = Math.min(...rowNumbers);
    const maxRow = Math.max(...rowNumbers);

    return players.map((entry) => {
      const rowPlayers = players
        .filter((candidate) => Number(candidate.grid![1]) === Number(entry.grid![1]))
        .sort(
          (a, b) =>
            Number(a.grid![2]) - Number(b.grid![2]) ||
            a.index - b.index,
        );
      const positionInRow = rowPlayers.findIndex((candidate) => candidate.index === entry.index);
      const progress = maxRow === minRow
        ? 0.5
        : (Number(entry.grid![1]) - minRow) / (maxRow - minRow);

      return {
        player: entry.player,
        top: 88 - progress * 76,
        left: ((positionInRow + 1) / (rowPlayers.length + 1)) * 100,
      };
    });
  }

  const topByLine: Record<PitchLine, number> = {
    attack: 16,
    attackingMidfield: 31,
    midfield: 50,
    unknown: 56,
    defense: 70,
    goalkeeper: 88,
  };
  const groupedPlayers = new Map<PitchLine, typeof players>();
  for (const entry of players) {
    const line = getPitchLine(entry.player.position);
    const row = groupedPlayers.get(line) ?? [];
    row.push(entry);
    groupedPlayers.set(line, row);
  }

  return players.map((entry) => {
    const line = getPitchLine(entry.player.position);
    const rowPlayers = groupedPlayers.get(line) ?? [];
    const sortedRow = rowPlayers.slice().sort(
      (a, b) =>
        getPitchSide(a.player.position) - getPitchSide(b.player.position) ||
        (a.player.formationPlace ?? a.index) - (b.player.formationPlace ?? b.index) ||
        a.index - b.index,
    );
    const positionInRow = sortedRow.findIndex((candidate) => candidate.index === entry.index);

    return {
      player: entry.player,
      top: topByLine[line],
      left: ((positionInRow + 1) / (rowPlayers.length + 1)) * 100,
    };
  });
}

type LineupPlayerDisplayMode = 'name' | 'age' | 'club';

function getLineupPlayerDisplayLabel(
  player: MatchLineupPlayer,
  mode: LineupPlayerDisplayMode,
  english: boolean,
): string {
  if (mode === 'name') return player.name;
  if (mode === 'age') {
    return player.age === null
      ? '—'
      : `${player.age} ${english ? (player.age === 1 ? 'year' : 'years') : 'ans'}`;
  }
  return player.club?.name ?? (english ? 'Club unavailable' : 'Club indisponible');
}

function getCountryDisplayName(countryCode: string | null, english: boolean): string | null {
  if (!countryCode) return null;
  return (
    new Intl.DisplayNames([english ? 'en' : 'fr'], { type: 'region' }).of(countryCode) ??
    countryCode
  );
}

function getSoccerContinentLabel(
  continent: SoccerContinent,
  english: boolean,
): string {
  const labels: Record<SoccerContinent, { en: string; fr: string }> = {
    africa: { en: 'Africa', fr: 'Afrique' },
    asia: { en: 'Asia', fr: 'Asie' },
    europe: { en: 'Europe', fr: 'Europe' },
    'north-america': { en: 'North America', fr: 'Amérique du Nord' },
    'south-america': { en: 'South America', fr: 'Amérique du Sud' },
    oceania: { en: 'Oceania', fr: 'Océanie' },
    international: { en: 'International', fr: 'International' },
    other: { en: 'Other', fr: 'Autre' },
  };
  return labels[continent][english ? 'en' : 'fr'];
}

function PlayerRatingBadge({
  player,
  english,
}: {
  player: MatchLineupPlayer;
  english: boolean;
}) {
  const rating =
    player.rating === null
      ? null
      : new Intl.NumberFormat(english ? 'en-US' : 'fr-FR', {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }).format(player.rating);
  const accessibleLabel =
    rating === null
      ? english
        ? `Rating unavailable for ${player.name}; no match participation stats are available.`
        : `Note indisponible pour ${player.name} : aucune statistique de participation n’est disponible.`
      : english
        ? `MalakInfo estimated rating for ${player.name}: ${rating} out of 10.`
        : `Note estimée MalakInfo pour ${player.name} : ${rating} sur 10.`;

  return (
    <span
      className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-amber-900 dark:bg-amber-900/40 dark:text-amber-200"
      title={accessibleLabel}
      aria-label={accessibleLabel}
    >
      {rating === null ? '—/10' : `${rating}/10`}
    </span>
  );
}

function matchesEventPlayer(
  player: MatchLineupPlayer,
  eventPlayer: LiveMatchEvent['player'],
): boolean {
  if (player.id !== null && eventPlayer.id !== null) return player.id === eventPlayer.id;
  if (!eventPlayer.name) return false;

  const playerName = normalizeSearch(player.name);
  const eventName = normalizeSearch(eventPlayer.name);
  if (playerName === eventName) return true;

  const playerParts = playerName.split(/\s+/);
  const eventParts = eventName.split(/\s+/);
  const [shorterName, longerName] =
    playerParts.length <= eventParts.length
      ? [playerParts, eventParts]
      : [eventParts, playerParts];
  return shorterName.length > 1 && shorterName.every((part) => longerName.includes(part));
}

function getPlayerGoalContributions(
  player: MatchLineupPlayer,
  teamName: string,
  goalEvents: LiveMatchEvent[],
): { scored: boolean; assisted: boolean } {
  let scored = false;
  let assisted = false;
  const normalizedTeamName = normalizeSearch(teamName);

  for (const event of goalEvents) {
    const sameTeam =
      event.team.name !== null &&
      normalizeSearch(event.team.name) === normalizedTeamName;
    const scorerMatchesById =
      player.id !== null && event.player.id !== null && player.id === event.player.id;
    const assistMatchesById =
      player.id !== null && event.assist.id !== null && player.id === event.assist.id;

    if (scorerMatchesById || (sameTeam && matchesEventPlayer(player, event.player))) {
      scored = true;
    }
    if (assistMatchesById || (sameTeam && matchesEventPlayer(player, event.assist))) {
      assisted = true;
    }
  }

  return { scored, assisted };
}

function getSubstituteForStarter(
  lineup: MatchLineup,
  starter: MatchLineupPlayer,
): MatchLineupPlayer | undefined {
  return lineup.substitutes.find((player) => {
    if (!player.isOnField) return false;
    if (player.replacesStarterId !== null && starter.id !== null) {
      return player.replacesStarterId === starter.id;
    }
    return (
      player.replacesStarterName !== null &&
      normalizeSearch(player.replacesStarterName) === normalizeSearch(starter.name)
    );
  });
}

function PlayerGoalContributionMarkers({
  player,
  teamName,
  goalEvents,
  english,
}: {
  player: MatchLineupPlayer;
  teamName: string;
  goalEvents: LiveMatchEvent[];
  english: boolean;
}) {
  const { scored, assisted } = getPlayerGoalContributions(player, teamName, goalEvents);
  if (!scored && !assisted) return null;

  const scorerLabel = english ? 'Goalscorer' : 'Buteur';
  const assistLabel = english ? 'Assist provider' : 'Passeur décisif';
  const contributionLabel = [scored ? scorerLabel : null, assisted ? assistLabel : null]
    .filter((label): label is string => label !== null)
    .join(' · ');

  return (
    <span
      className="inline-flex shrink-0 items-center gap-0.5"
      title={contributionLabel}
      aria-label={contributionLabel}
    >
      {scored && (
        <span role="img" aria-label={scorerLabel}>
          ⚽
        </span>
      )}
      {assisted && (
        <span role="img" aria-label={assistLabel}>
          👟
        </span>
      )}
    </span>
  );
}

type MatchEventKind =
  | 'goal'
  | 'missed-penalty'
  | 'penalty-attempt'
  | 'penalty-awarded'
  | 'yellow-card'
  | 'red-card'
  | 'substitution'
  | 'foul'
  | 'offside'
  | 'corner-awarded'
  | 'shot-on-target'
  | 'shot-blocked'
  | 'shot-off-target'
  | 'shot-hit-woodwork'
  | 'handball'
  | 'start-delay'
  | 'end-delay'
  | 'start-2nd-half'
  | 'end-regular-time'
  | 'retired'
  | 'break'
  | 'cooling-break'
  | 'var'
  | 'other';

const EVENT_KIND_BY_TYPE = new Map<string, MatchEventKind>([
  ['foul', 'foul'],
  ['offside', 'offside'],
  ['corner-awarded', 'corner-awarded'],
  ['shot-on-target', 'shot-on-target'],
  ['shot-blocked', 'shot-blocked'],
  ['shot-off-target', 'shot-off-target'],
  ['shot-hit-woodwork', 'shot-hit-woodwork'],
  ['handball', 'handball'],
  ['start-delay', 'start-delay'],
  ['end-delay', 'end-delay'],
  ['start-2nd-half', 'start-2nd-half'],
  ['end-regular-time', 'end-regular-time'],
  ['retired', 'retired'],
]);

function getMatchEventKind(event: LiveMatchEvent): MatchEventKind {
  const type = event.type.toLowerCase();
  const detail = event.detail?.toLowerCase() ?? '';
  const commentary = `${detail} ${event.comments?.toLowerCase() ?? ''}`;

  if (/\b(?:missed penalty|penalty missed)\b/.test(commentary)) return 'missed-penalty';
  if (type === 'goal') return 'goal';
  if (
    type === 'penalty-attempt' ||
    (/\bpenalt(?:y|ies)\b/.test(commentary) &&
      /\b(?:saved|attempted|taken)\b/.test(commentary))
  ) {
    return 'penalty-attempt';
  }
  if (
    type === 'penalty-awarded' ||
    (/\bpenalt(?:y|ies)\b/.test(commentary) &&
      (/\b(?:awarded|given|won|for)\b/.test(commentary) ||
        (type === 'var' && /\bpenalty\b/.test(commentary))))
  ) {
    return 'penalty-awarded';
  }
  if (type === 'cooling-break' || /\b(?:cooling|hydration|water)\s+break\b/.test(commentary)) {
    return 'cooling-break';
  }
  if (
    type === 'break' ||
    /\b(?:half[\s-]?time|full[\s-]?time|first half|second half|end of period|break|pause|intermission)\b/.test(
      commentary,
    )
  ) {
    return 'break';
  }
  if (
    type === 'var' ||
    /\b(?:var|video review|video assistant referee)\b/.test(commentary)
  ) {
    return 'var';
  }
  if (type === 'card') {
    return /\b(?:red card|second yellow)\b/.test(commentary)
      ? 'red-card'
      : 'yellow-card';
  }
  if (type === 'subst' || type === 'substitution') return 'substitution';
  return EVENT_KIND_BY_TYPE.get(type) ?? 'other';
}

function getMatchEventTitle(
  kind: MatchEventKind,
  detail: string | null,
  eventType: string,
  commentary: string | null,
  english: boolean,
): string {
  const description = `${detail ?? ''} ${commentary ?? ''}`.toLowerCase();
  if (kind === 'goal') return english ? 'Goal' : 'But';
  if (kind === 'missed-penalty') return english ? 'Penalty missed' : 'Penalty manqué';
  if (kind === 'penalty-attempt') {
    return /\bsaved\b/.test(description)
      ? english
        ? 'Penalty saved'
        : 'Penalty arrêté'
      : english
        ? 'Penalty attempt'
        : 'Tir au but';
  }
  if (kind === 'penalty-awarded') return english ? 'Penalty awarded' : 'Penalty obtenu';
  if (kind === 'yellow-card') return english ? 'Yellow card' : 'Carton jaune';
  if (kind === 'red-card') return english ? 'Red card' : 'Carton rouge';
  if (kind === 'substitution') return english ? 'Substitution' : 'Remplacement';
  if (kind === 'cooling-break') return english ? 'Cooling break' : 'Pause fraîcheur';
  if (kind === 'var') return english ? 'VAR review' : 'Vérification VAR';

  const localizedLabels: Partial<Record<MatchEventKind, { en: string; fr: string }>> = {
    foul: { en: 'Foul', fr: 'Faute' },
    offside: { en: 'Offside', fr: 'Hors-jeu' },
    'corner-awarded': { en: 'Corner', fr: 'Corner' },
    'shot-on-target': { en: 'Shot on target', fr: 'Tir cadré' },
    'shot-blocked': { en: 'Shot blocked', fr: 'Tir bloqué' },
    'shot-off-target': { en: 'Shot off target', fr: 'Tir non cadré' },
    'shot-hit-woodwork': { en: 'Shot hits the post', fr: 'Tir sur le poteau' },
    handball: { en: 'Handball', fr: 'Main' },
    'start-delay': { en: 'Match delayed', fr: 'Match interrompu' },
    'end-delay': { en: 'Play resumes', fr: 'Reprise du match' },
    'start-2nd-half': { en: 'Second half begins', fr: 'Début de la seconde période' },
    'end-regular-time': { en: 'Full-time', fr: 'Fin du temps réglementaire' },
    retired: { en: 'Player leaves injured', fr: 'Sortie sur blessure' },
  };
  if (kind === 'break') {
    if (/\bkickoff\b/.test(description)) {
      return english ? 'Kick-off' : 'Coup d’envoi';
    }
    if (/\b(?:second half begins|start of the second half)\b/.test(description)) {
      return english ? 'Second half begins' : 'Début de la seconde période';
    }
    if (/\b(?:first half begins|start of the first half)\b/.test(description)) {
      return english ? 'First half begins' : 'Début de la première période';
    }
    if (/\b(?:half[\s-]?time|first half ends)\b/.test(description)) {
      return english ? 'Half-time' : 'Mi-temps';
    }
    if (/\b(?:full[\s-]?time|second half ends|end of match)\b/.test(description)) {
      return english ? 'Full-time' : 'Fin du match';
    }
    return detail ?? (english ? 'Match break' : 'Pause du match');
  }
  return localizedLabels[kind]?.[english ? 'en' : 'fr'] ??
    detail ??
    (eventType === 'other'
      ? english
        ? 'Match update'
        : 'Information du match'
      : eventType.replace(/[-_]+/g, ' '));
}

function getEventTeamSide(
  eventTeamName: string | null,
  match: LiveScoreMatch | undefined,
): 'home' | 'away' | null {
  if (!eventTeamName || !match) return null;
  const normalizedEventTeam = normalizeSearch(eventTeamName);
  if (normalizedEventTeam === normalizeSearch(match.teams.home.name)) return 'home';
  if (normalizedEventTeam === normalizeSearch(match.teams.away.name)) return 'away';
  return null;
}

function getGoalDetail(detail: string | null, english: boolean): string | null {
  const normalized = detail?.toLowerCase() ?? '';
  if (!normalized) return null;
  if (normalized.includes('own goal')) return english ? 'Own goal' : 'But contre son camp';
  if (normalized.includes('missed penalty')) return english ? 'Penalty missed' : 'Penalty manqué';
  if (normalized.includes('penalty')) return 'Penalty';
  if (normalized.includes('normal goal')) return null;
  return detail;
}

function getFinishedSummary(match: LiveScoreMatch, english: boolean): string {
  const homeGoals = match.goals.home;
  const awayGoals = match.goals.away;
  if (homeGoals === null || awayGoals === null) {
    return english ? 'Final score unavailable.' : 'Score final indisponible.';
  }
  if (
    match.fixture.status.short === 'PEN' &&
    match.score.penalty?.home !== null &&
    match.score.penalty?.home !== undefined &&
    match.score.penalty.away !== null &&
    match.score.penalty.away !== undefined
  ) {
    const homeWonShootout = match.score.penalty.home > match.score.penalty.away;
    const winner = homeWonShootout ? match.teams.home.name : match.teams.away.name;
    const loser = homeWonShootout ? match.teams.away.name : match.teams.home.name;
    return english
      ? `${winner} beat ${loser} after a ${match.score.penalty.home}-${match.score.penalty.away} penalty shootout (match score ${homeGoals}-${awayGoals}).`
      : `${winner} s’impose face à ${loser} aux tirs au but (${match.score.penalty.home}-${match.score.penalty.away}), après un score de ${homeGoals}-${awayGoals}.`;
  }
  if (match.fixture.status.short === 'PEN') {
    return english
      ? `The match was decided by penalties after a ${homeGoals}-${awayGoals} draw; the shootout score is unavailable.`
      : `Après un score de ${homeGoals}-${awayGoals}, le match s’est décidé aux tirs au but (détail de la séance indisponible).`;
  }
  if (homeGoals === awayGoals) {
    return english
      ? `The match ends in a ${homeGoals}-${awayGoals} draw.`
      : `Les deux équipes se quittent sur un match nul ${homeGoals}-${awayGoals}.`;
  }

  const homeWon = homeGoals > awayGoals;
  const winner = homeWon ? match.teams.home.name : match.teams.away.name;
  const loser = homeWon ? match.teams.away.name : match.teams.home.name;
  const winningScore = Math.max(homeGoals, awayGoals);
  const losingScore = Math.min(homeGoals, awayGoals);
  return english
    ? `${winner} beat ${loser} ${winningScore}-${losingScore}.`
    : `${winner} remporte le match ${winningScore}-${losingScore} face à ${loser}.`;
}

function getFinishedNarration(match: LiveScoreMatch, english: boolean): string {
  const ending = match.fixture.venue
    ? english
      ? `Full time at ${match.fixture.venue}.`
      : `C’est terminé au ${match.fixture.venue}.`
    : english
      ? 'Full time.'
      : 'C’est terminé.';
  const competitionDetails = [match.league.round, match.league.name].filter(Boolean).join(' — ');
  const context = competitionDetails
    ? english
      ? `Competition: ${match.league.name}${match.league.round ? ` — ${match.league.round}` : ''}.`
      : `Compétition : ${match.league.name}${match.league.round ? `, ${match.league.round}` : ''}.`
    : '';
  return [ending, getFinishedSummary(match, english), context].filter(Boolean).join(' ');
}

function getMatchEndMinute(match: LiveScoreMatch, events: LiveMatchEvent[]): string | null {
  const { elapsed, extra } = match.fixture.status;
  if (elapsed === null) return null;
  if (extra !== null && extra > 0) return `${elapsed}+${extra}`;

  const latestEvent = events[events.length - 1];
  if (latestEvent?.time.elapsed === elapsed && latestEvent.time.extra !== null) return null;
  return String(elapsed);
}

function getCardReason(event: LiveMatchEvent, english: boolean): string {
  const unavailable = english
    ? 'Reason not specified by ESPN.'
    : 'Motif non précisé par ESPN.';
  const comment = event.comments?.trim();
  if (!comment) return unavailable;

  const cardLabel = /\b(?:yellow|red)\s+card\b/i.exec(comment);
  let reason = cardLabel
    ? comment.slice(cardLabel.index + cardLabel[0].length)
    : comment;
  reason = reason
    .replace(/\s+at\s+\d+(?:\s*\+\s*\d+)?\s*['′]?\s*\.?$/i, '')
    .replace(/^[\s,;:—–-]+/, '')
    .trim();
  if (!reason || /^at\s+\d/i.test(reason)) return unavailable;

  const foulVictim = /\b(?:for\s+)?(?:a\s+)?foul\s+(?:by\s+.+?\s+)?(?:on|against)\s+(.+?)(?:[.!?]|$)/i.exec(
    reason,
  )?.[1]?.trim();
  if (foulVictim) {
    return english
      ? `For a foul on ${foulVictim}.`
      : `Pour une faute commise sur ${foulVictim}.`;
  }

  const normalizedReason = reason.toLowerCase();
  if (/\bfoul\b/.test(normalizedReason)) {
    return english ? 'For a foul.' : 'Pour une faute.';
  }
  if (/\bdissent\b/.test(normalizedReason)) {
    return english ? 'For dissent.' : 'Pour contestation.';
  }
  if (/\bhandball\b/.test(normalizedReason)) {
    return english ? 'For handball.' : 'Pour une main.';
  }
  if (/\bsimulation\b/.test(normalizedReason)) {
    return english ? 'For simulation.' : 'Pour simulation.';
  }
  if (/persistent infringement/.test(normalizedReason)) {
    return english
      ? 'For persistent infringement.'
      : 'Pour fautes répétées.';
  }
  if (/unsporting (?:behavior|behaviour)/.test(normalizedReason)) {
    return english
      ? 'For unsporting behavior.'
      : 'Pour comportement antisportif.';
  }

  return english
    ? `Reason reported by ESPN: ${reason.replace(/[.!?]+$/, '')}.`
    : `Motif indiqué par ESPN : ${reason.replace(/[.!?]+$/, '')}.`;
}

function getEventCommentary(
  event: LiveMatchEvent,
  kind: MatchEventKind,
  english: boolean,
  scoreAfterGoal?: {
    home: number;
    away: number;
    scoringHome: boolean;
    scoringTeam: string;
    previousHome: number;
    previousAway: number;
  },
): string | null {
  const player = event.player.name;
  const team = event.team.name;
  const sourceComment = event.comments?.trim();

  if (kind === 'missed-penalty') {
    const base = player
      ? english
        ? `${player}${team ? ` (${team})` : ''} misses the penalty.`
        : `${player}${team ? ` (${team})` : ''} manque son penalty.`
      : english
        ? 'The penalty is missed.'
        : 'Le penalty est manqué.';
    return [base, sourceComment]
      .filter((value): value is string => Boolean(value))
      .filter((value, index, values) => values.indexOf(value) === index)
      .join(' ');
  }

  if (kind === 'goal') {
    const goalDetail = getGoalDetail(event.detail, english);
    const ownGoal = goalDetail === 'Own goal' || goalDetail === 'But contre son camp';
    const penalty = goalDetail === 'Penalty';
    const description = ownGoal
      ? player && team
        ? english
          ? `${player} scores an own goal for ${team}.`
          : `But contre son camp de ${player}, au bénéfice de ${team}.`
        : goalDetail
      : player && team
        ? english
          ? penalty
            ? `${player} converts the penalty for ${team}.`
            : `${player} scores for ${team}.`
          : penalty
            ? `${player} transforme le penalty pour ${team}.`
            : `${player} marque pour ${team}.`
        : null;
    if (scoreAfterGoal) {
      const { home, away, scoringHome, scoringTeam, previousHome, previousAway } = scoreAfterGoal;
      const score = `${home}-${away}`;
      const previousLead = scoringHome ? previousHome - previousAway : previousAway - previousHome;
      const currentLead = scoringHome ? home - away : away - home;
      const context = home === away
        ? english
          ? `The score is now level at ${score}.`
          : `Le score est désormais à égalité (${score}).`
        : currentLead > 0 && previousLead <= 0
          ? english
            ? `${scoringTeam} take the lead, ${score}.`
            : `${scoringTeam} prend l’avantage (${score}).`
          : currentLead > 0
            ? english
              ? `${scoringTeam} extend their lead to ${score}.`
              : `${scoringTeam} creuse l’écart (${score}).`
            : english
              ? `${scoringTeam} reduce the deficit to ${score}.`
              : `${scoringTeam} réduit l’écart (${score}).`;
      return [description, context, sourceComment]
        .filter((value): value is string => Boolean(value))
        .filter((value, index, values) => values.indexOf(value) === index)
        .join(' ') || null;
    }
    const detailComment = sourceComment &&
      sourceComment.toLowerCase() !== event.detail?.toLowerCase() &&
      sourceComment.toLowerCase() !== goalDetail?.toLowerCase()
      ? sourceComment
      : null;
    return [description, detailComment]
      .filter((value): value is string => Boolean(value))
      .filter((value, index, values) => values.indexOf(value) === index)
      .join(' ') || null;
  }
  if (kind === 'yellow-card' || kind === 'red-card') {
    if (player && team) {
      const card = kind === 'yellow-card'
        ? english
          ? 'a yellow card'
          : 'un carton jaune'
        : english
          ? 'a red card'
          : 'un carton rouge';
      const base = english
        ? `${player} (${team}) receives ${card}.`
        : `${player} (${team}) reçoit ${card}.`;
      return `${base} ${getCardReason(event, english)}`;
    }
    return getCardReason(event, english);
  }
  if (kind === 'substitution') {
    const base = event.player.name && event.assist.name
      ? english
        ? `${event.assist.name} replaces ${event.player.name}${team ? ` for ${team}` : ''}.`
        : `${event.assist.name} remplace ${event.player.name}${team ? ` pour ${team}` : ''}.`
      : null;
    const substitutionComment = sourceComment && !/^substitution(?:\s+\d+)?$/i.test(sourceComment)
      ? sourceComment
      : null;
    return [base, substitutionComment]
      .filter((value): value is string => Boolean(value))
      .filter((value, index, values) => values.indexOf(value) === index)
      .join(' ') || null;
  }
  if (sourceComment) return sourceComment;
  if (event.type.toLowerCase() === 'var' && event.detail) {
    return english
      ? `Video review: ${event.detail}.`
      : `Vérification vidéo : ${event.detail}.`;
  }
  return null;
}

function getMatchCommentaries(
  events: LiveMatchEvent[],
  match: LiveScoreMatch | undefined,
  english: boolean,
): {
  commentaries: Array<string | null>;
  goalScores: Map<string, string>;
} {
  let homeGoals = 0;
  let awayGoals = 0;
  const commentaries: Array<string | null> = [];
  const goalScores = new Map<string, string>();

  events.forEach((event) => {
    const kind = getMatchEventKind(event);
    let scoreAfterGoal:
      | {
          home: number;
          away: number;
          scoringHome: boolean;
          scoringTeam: string;
          previousHome: number;
          previousAway: number;
        }
      | undefined;

    if (
      kind === 'goal' &&
      match &&
      !event.detail?.toLowerCase().includes('missed penalty')
    ) {
      const teamSide = getEventTeamSide(event.team.name, match);
      if (teamSide !== null) {
        const scoringHome = teamSide === 'home';
        const previousHome = homeGoals;
        const previousAway = awayGoals;
        if (scoringHome) homeGoals += 1;
        else awayGoals += 1;
        scoreAfterGoal = {
          home: homeGoals,
          away: awayGoals,
          scoringHome,
          scoringTeam: event.team.name ?? (scoringHome ? match.teams.home.name : match.teams.away.name),
          previousHome,
          previousAway,
        };
        goalScores.set(event.id, `${homeGoals}–${awayGoals}`);
      }
    }

    commentaries.push(getEventCommentary(event, kind, english, scoreAfterGoal));
  });

  return { commentaries, goalScores };
}

function MatchStatisticsPanel({
  statistics,
  homeTeamLogo,
  awayTeamLogo,
  homeTeamName,
  awayTeamName,
  english,
}: {
  statistics: MatchStatistic[];
  homeTeamLogo: string | null;
  awayTeamLogo: string | null;
  homeTeamName: string | null;
  awayTeamName: string | null;
  english: boolean;
}) {
  if (statistics.length === 0) {
    return (
      <p role="status" className="rounded-xl border border-border bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
        {english
          ? 'Detailed statistics are not available for this match yet.'
          : 'Les statistiques détaillées ne sont pas disponibles pour ce match.'}
      </p>
    );
  }

  const labels: Record<string, { en: string; fr: string }> = {
    possessionPct: { en: 'Possession', fr: 'Possession' },
    totalShots: { en: 'Shots', fr: 'Tirs' },
    shotsOnTarget: { en: 'Shots on target', fr: 'Tirs cadrés' },
    blockedShots: { en: 'Shots blocked', fr: 'Tirs bloqués' },
    wonCorners: { en: 'Corners', fr: 'Corners' },
    totalPasses: { en: 'Passes', fr: 'Passes' },
    accuratePasses: { en: 'Successful passes', fr: 'Passes réussies' },
    accurateCrosses: { en: 'Accurate crosses', fr: 'Centres réussis' },
    totalCrosses: { en: 'Crosses', fr: 'Centres' },
    totalLongBalls: { en: 'Long balls', fr: 'Longs ballons' },
    accurateLongBalls: { en: 'Accurate long balls', fr: 'Longs ballons réussis' },
    passPct: { en: 'Pass accuracy', fr: 'Passes réussies (%)' },
    passPercentage: { en: 'Pass accuracy', fr: 'Passes réussies (%)' },
    passingAccuracy: { en: 'Pass accuracy', fr: 'Passes réussies (%)' },
    shotPct: { en: 'Shots on target (%)', fr: 'Tirs cadrés (%)' },
    crossPct: { en: 'Cross accuracy', fr: 'Centres réussis (%)' },
    longballPct: { en: 'Long-ball accuracy', fr: 'Longs ballons réussis (%)' },
    tackles: { en: 'Tackles', fr: 'Tacles' },
    totalTackles: { en: 'Tackles', fr: 'Tacles' },
    effectiveTackles: { en: 'Successful tackles', fr: 'Tacles réussis' },
    tacklePct: { en: 'Tackles won (%)', fr: 'Tacles réussis (%)' },
    offsides: { en: 'Offsides', fr: 'Hors-jeu' },
    foulsCommitted: { en: 'Fouls', fr: 'Fautes' },
    yellowCards: { en: 'Yellow cards', fr: 'Cartons jaunes' },
    redCards: { en: 'Red cards', fr: 'Cartons rouges' },
    saves: { en: 'Saves', fr: 'Arrêts' },
    penaltyKickGoals: { en: 'Penalty goals', fr: 'Penalties marqués' },
    penaltyKickShots: { en: 'Penalties taken', fr: 'Penalties tentés' },
    clearances: { en: 'Clearances', fr: 'Dégagements' },
    totalClearance: { en: 'Clearances', fr: 'Dégagements' },
    effectiveClearance: { en: 'Effective clearances', fr: 'Dégagements réussis' },
    interceptions: { en: 'Interceptions', fr: 'Interceptions' },
  };
  const lowerIsBetter = new Set([
    'offsides',
    'foulsCommitted',
    'yellowCards',
    'redCards',
  ]);

  return (
    <section className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-b border-border px-3 py-3 sm:px-5">
        <div className="flex min-w-0 items-center justify-start">
          {homeTeamLogo && (
            <Image
              src={homeTeamLogo}
              alt={homeTeamName ?? (english ? 'Home team' : 'Équipe à domicile')}
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
            />
          )}
        </div>
        <h3 className="text-center text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground sm:text-xs">
          {english ? 'Team statistics' : 'Statistiques de l’équipe'}
        </h3>
        <div className="flex min-w-0 items-center justify-end">
          {awayTeamLogo && (
            <Image
              src={awayTeamLogo}
              alt={awayTeamName ?? (english ? 'Away team' : 'Équipe visiteuse')}
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
            />
          )}
        </div>
      </div>
      <dl className="divide-y divide-border/70 px-2 sm:px-4">
        {statistics.map((stat) => {
          const homeValue = Number.parseFloat(stat.home ?? '');
          const awayValue = Number.parseFloat(stat.away ?? '');
          const comparable = Number.isFinite(homeValue) && Number.isFinite(awayValue);
          const lowerIsBetterMetric = lowerIsBetter.has(stat.name);
          const homeHasAdvantage =
            comparable &&
            (lowerIsBetterMetric ? homeValue < awayValue : homeValue > awayValue);
          const awayHasAdvantage =
            comparable &&
            (lowerIsBetterMetric ? awayValue < homeValue : awayValue > homeValue);
          const label = labels[stat.name]?.[english ? 'en' : 'fr'] ?? stat.label;

          return (
            <div
              key={stat.name}
              className="grid grid-cols-[minmax(2.5rem,1fr)_minmax(0,2fr)_minmax(2.5rem,1fr)] items-center gap-2 py-3 text-sm"
            >
              <dd className="justify-self-start">
                <span
                  className={`inline-flex min-w-9 justify-center rounded-full px-2 py-1 font-bold tabular-nums ${
                    homeHasAdvantage
                      ? lowerIsBetterMetric
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 text-white'
                      : 'text-foreground'
                  }`}
                >
                  {stat.home ?? '—'}
                </span>
              </dd>
              <dt className="text-center text-xs font-semibold leading-tight text-muted-foreground sm:text-sm">
                {label}
              </dt>
              <dd className="justify-self-end">
                <span
                  className={`inline-flex min-w-9 justify-center rounded-full px-2 py-1 font-bold tabular-nums ${
                    awayHasAdvantage
                      ? lowerIsBetterMetric
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 text-white'
                      : 'text-foreground'
                  }`}
                >
                  {stat.away ?? '—'}
                </span>
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

export default function LiveScores({
  locale = 'fr',
  initialMatchId,
  initialDetailsTab = 'events',
  initialMatchLabel,
  initialMatchKey,
}: LiveScoresProps) {
  const english = locale === 'en';
  const { user, ready: accountReady } = useAccountUser();
  const [view, setView] = useState<ScoresView>('live');
  const [hasLiveMatches, setHasLiveMatches] = useState(false);
  const [finishedDateFilter, setFinishedDateFilter] = useState<FinishedDateFilter>(0);
  const [upcomingDateFilter, setUpcomingDateFilter] = useState('7days');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [teamHistoryName, setTeamHistoryName] = useState<string | null>(null);
  const [upcomingTeamName, setUpcomingTeamName] = useState<string | null>(null);
  const [upcomingTeamNotFound, setUpcomingTeamNotFound] = useState(false);
  const [teamHistoryVisibleCount, setTeamHistoryVisibleCount] = useState(5);
  const [matchesVisibleCount, setMatchesVisibleCount] = useState(40);
  const [selectedCompetition, setSelectedCompetition] = useState('all');
  const [selectedContinent, setSelectedContinent] = useState('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [matches, setMatches] = useState<LiveScoreMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedFixtureId, setSelectedFixtureId] = useState<number | null>(
    initialMatchId ?? null,
  );
  const [competitionNames, setCompetitionNames] = useState<Record<string, string>>({});
  const [upcomingCompetitions, setUpcomingCompetitions] = useState<
    LiveScoreCompetitionOption[]
  >([]);
  const [events, setEvents] = useState<LiveMatchEvent[]>([]);
  const [statistics, setStatistics] = useState<MatchStatistic[]>([]);
  const [lineups, setLineups] = useState<MatchLineup[]>([]);
  const [standings, setStandings] = useState<MatchStandings | null>(null);
  const [detailsUnavailable, setDetailsUnavailable] = useState({
    lineups: false,
    standings: false,
  });
  const [activeDetailsTab, setActiveDetailsTab] = useState<
    MatchDetailsTab
  >(initialDetailsTab);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [lineupPlayerDisplayMode, setLineupPlayerDisplayMode] =
    useState<LineupPlayerDisplayMode>('name');
  const [selectedPitchClub, setSelectedPitchClub] = useState<{
    lineupKey: string;
    playerKey: string;
    club: NonNullable<MatchLineupPlayer['club']>;
  } | null>(null);
  const [showPlayerRatings, setShowPlayerRatings] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [eventsError, setEventsError] = useState(false);
  const [savedFollowedTeams, setSavedFollowedTeams] = useState<FollowedFootballTeam[]>([]);
  const [followedTeamsOwnerId, setFollowedTeamsOwnerId] = useState<string | null>(null);
  const [followedTeamsLoadedForUserId, setFollowedTeamsLoadedForUserId] = useState<string | null>(null);
  const [teamFavoriteActionId, setTeamFavoriteActionId] = useState<string | null>(null);
  const [teamFavoriteError, setTeamFavoriteError] = useState<string | null>(null);
  const currentUserId = user?.id ? String(user.id) : null;
  const followedTeams =
    currentUserId && followedTeamsOwnerId === currentUserId ? savedFollowedTeams : [];
  const followedTeamsLoading = Boolean(
    accountReady &&
      currentUserId &&
      followedTeamsLoadedForUserId !== currentUserId,
  );
  useEffect(() => {
    const nextSearchQuery = searchQuery.trim();
    const timeoutId = window.setTimeout(
      () => {
        setDebouncedSearchQuery(nextSearchQuery);
        const isTeamSearch = (query: string) => {
          const normalized = normalizeSearch(query);
          return normalized.length >= 3 && !/\s+(?:vs\.?|contre)\s+/.test(normalized);
        };
        if (
          nextSearchQuery !== debouncedSearchQuery &&
          (view === 'finished' ||
            (view === 'upcoming' &&
              (isTeamSearch(nextSearchQuery) || isTeamSearch(debouncedSearchQuery))))
        ) {
          setIsLoading(true);
          setHasError(false);
        }
      },
      400,
    );
    return () => window.clearTimeout(timeoutId);
  }, [debouncedSearchQuery, searchQuery, view]);

  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus();
  }, [isSearchOpen]);

  const favoritesSnapshot = useSyncExternalStore(
    subscribeToFavorites,
    getFavoritesSnapshot,
    getServerFavoritesSnapshot,
  );
  useEffect(() => {
    if (!accountReady || !currentUserId) return;

    const controller = new AbortController();

    async function loadFollowedTeams() {
      try {
        const response = await authFetch('/api/user/match-teams', {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? 'Reconnectez-vous pour synchroniser vos équipes favorites.'
              : 'Impossible de charger les équipes suivies.',
          );
        }

        const payload: unknown = await response.json();
        if (
          !isRecord(payload) ||
          !Array.isArray(payload.teams) ||
          !payload.teams.every(isFollowedFootballTeam)
        ) {
          throw new Error('La réponse des équipes suivies est invalide.');
        }
        if (!controller.signal.aborted) {
          setSavedFollowedTeams(payload.teams);
          setFollowedTeamsOwnerId(currentUserId);
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Unable to load football team favorites:', error);
        setTeamFavoriteError(
          error instanceof Error
            ? error.message
            : 'Impossible de charger les équipes suivies.',
        );
      } finally {
        if (!controller.signal.aborted) setFollowedTeamsLoadedForUserId(currentUserId);
      }
    }

    void loadFollowedTeams();
    return () => controller.abort();
  }, [accountReady, currentUserId]);

  const favoriteIds = useMemo(() => parseFavoriteIds(favoritesSnapshot), [favoritesSnapshot]);
  const competitions = useMemo(
    () => Object.entries(competitionNames).sort(([, a], [, b]) => a.localeCompare(b)),
    [competitionNames],
  );
  const availableUpcomingContinents = useMemo(
    () =>
      Array.from(new Set(upcomingCompetitions.map((competition) => competition.continent))).sort(),
    [upcomingCompetitions],
  );
  const visibleUpcomingCompetitions = useMemo(
    () =>
      upcomingCompetitions.filter(
        (competition) =>
          selectedContinent === 'all' ||
          competition.continent === selectedContinent,
      ),
    [selectedContinent, upcomingCompetitions],
  );
  const upcomingCompetitionContinents = useMemo(
    () =>
      new Map(
        upcomingCompetitions.map((competition) => [
          competition.id,
          competition.continent,
        ]),
      ),
    [upcomingCompetitions],
  );
  const upcomingMonths = useMemo(
    () =>
      Array.from({ length: UPCOMING_MONTH_COUNT }, (_, offset) =>
        getKinshasaMonth(offset),
      ),
    [],
  );
  const normalizedDebouncedSearch = normalizeSearch(debouncedSearchQuery);
  const isMatchupSearch = /\s+(?:vs\.?|contre)\s+/.test(normalizedDebouncedSearch);
  const teamHistoryQuery =
    view === 'finished' && normalizedDebouncedSearch.length >= 3 && !isMatchupSearch
      ? debouncedSearchQuery
      : null;
  const upcomingTeamQuery =
    view === 'upcoming' && normalizedDebouncedSearch.length >= 3 && !isMatchupSearch
      ? debouncedSearchQuery
      : null;
  const visibleMatches = useMemo(() => {
    const normalizedQuery = normalizeSearch(searchQuery);
    const versusParts = normalizedQuery.split(/\s+(?:vs\.?|contre)\s+/).filter(Boolean);

    return matches
      .filter((match) => {
        const home = normalizeSearch(match.teams.home.name);
        const away = normalizeSearch(match.teams.away.name);
        const matchSearch = !normalizedQuery
          ? true
          : versusParts.length === 2
            ? (home.includes(versusParts[0]) && away.includes(versusParts[1])) ||
              (home.includes(versusParts[1]) && away.includes(versusParts[0])) ||
              (matchesTeamSearch(match.teams.home.name, versusParts[0]) &&
                matchesTeamSearch(match.teams.away.name, versusParts[1])) ||
              (matchesTeamSearch(match.teams.home.name, versusParts[1]) &&
                matchesTeamSearch(match.teams.away.name, versusParts[0]))
            : matchesTeamSearch(match.teams.home.name, normalizedQuery) ||
              matchesTeamSearch(match.teams.away.name, normalizedQuery) ||
              normalizeSearch(match.league.name).includes(normalizedQuery);

        return (
          matchSearch &&
          (selectedCompetition === 'all' ||
            String(match.league.id) === selectedCompetition) &&
          (view !== 'upcoming' ||
            selectedContinent === 'all' ||
            upcomingCompetitionContinents.get(match.league.id) === selectedContinent) &&
          (!favoritesOnly || favoriteIds.includes(match.fixture.id))
        );
      })
      .sort(
        (a, b) => teamHistoryName
          ? (b.fixture.date ?? '').localeCompare(a.fixture.date ?? '')
          : Number(favoriteIds.includes(b.fixture.id)) -
            Number(favoriteIds.includes(a.fixture.id)),
      );
  }, [
    favoriteIds,
    favoritesOnly,
    matches,
    searchQuery,
    selectedCompetition,
    selectedContinent,
    teamHistoryName,
    upcomingCompetitionContinents,
    view,
  ]);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const selectedMatch = matches.find((match) => match.fixture.id === selectedFixtureId);
  const homeLineup = selectedMatch
    ? lineups.find(
        (lineup) =>
          normalizeSearch(lineup.team.name) ===
          normalizeSearch(selectedMatch.teams.home.name),
      )
    : lineups[0];
  const awayLineup = selectedMatch
    ? lineups.find(
        (lineup) =>
          normalizeSearch(lineup.team.name) ===
          normalizeSearch(selectedMatch.teams.away.name),
      )
    : lineups[1];
  const homeTeamLogo =
    selectedMatch?.teams.home.logo ?? homeLineup?.team.logo ?? null;
  const awayTeamLogo =
    selectedMatch?.teams.away.logo ?? awayLineup?.team.logo ?? null;
  const isSelectedPreMatch =
    selectedMatch?.state === 'pre' ||
    (selectedMatch === undefined && initialMatchId === selectedFixtureId);
  const preMatchLineups = isSelectedPreMatch
    ? lineups.filter((lineup) => lineup.startingXI.length >= 11)
    : [];
  const lineupsToDisplay = isSelectedPreMatch ? preMatchLineups : lineups;
  const { commentaries: eventCommentaries, goalScores: eventGoalScores } =
    getMatchCommentaries(events, selectedMatch, english);
  const goalEvents = useMemo(
    () => events.filter((event) => getMatchEventKind(event) === 'goal'),
    [events],
  );
  const matchesToRender = visibleMatches.slice(
    0,
    teamHistoryName ? teamHistoryVisibleCount : matchesVisibleCount,
  );
  const finishedDateLabel =
    typeof finishedDateFilter === 'number'
      ? finishedDateFilter === 0
        ? english
          ? 'today'
          : 'aujourd’hui'
        : finishedDateFilter === 1
          ? english
            ? 'yesterday'
            : 'hier'
          : english
            ? 'two days ago'
            : 'avant-hier'
      : finishedDateFilter === 'week'
        ? english
          ? 'in the last 7 days'
          : 'des 7 derniers jours'
        : english
          ? 'in the last 30 days'
          : 'des 30 derniers jours';

  const upcomingCompetitionId =
    view === 'upcoming' && selectedCompetition !== 'all'
      ? selectedCompetition
      : null;
  const upcomingCompetitionName = upcomingCompetitionId
    ? competitionNames[upcomingCompetitionId] ?? null
    : null;
  const upcomingMonthToLoad =
    /^\d{4}-(0[1-9]|1[0-2])$/.test(upcomingDateFilter)
      ? upcomingDateFilter
      : null;
  const upcomingRangeDaysToLoad =
    upcomingDateFilter === '7days'
      ? 7
      : upcomingDateFilter === '30days'
        ? 30
        : null;

  useEffect(() => {
    let isMounted = true;

    async function refreshScores() {
      let changingViewOrFilter = false;

      try {
        const searchParams = new URLSearchParams();
        if (view === 'finished') {
          searchParams.set('view', 'finished');
          if (finishedDateFilter === 'week') {
            searchParams.set('rangeDays', '7');
          } else if (finishedDateFilter === 'month') {
            searchParams.set('rangeDays', '30');
          } else {
            searchParams.set('daysAgo', String(finishedDateFilter));
          }
          if (teamHistoryQuery) searchParams.set('team', teamHistoryQuery);
        }
        if (view === 'upcoming') {
          searchParams.set('view', 'upcoming');
          if (upcomingTeamQuery) {
            searchParams.set('team', upcomingTeamQuery);
            if (upcomingMonthToLoad) {
              searchParams.set('month', upcomingMonthToLoad);
            } else if (upcomingRangeDaysToLoad !== null) {
              searchParams.set('rangeDays', String(upcomingRangeDaysToLoad));
            }
          } else if (
            upcomingCompetitionId &&
            upcomingCompetitionName
          ) {
            searchParams.set('competitionId', upcomingCompetitionId);
            searchParams.set('competitionName', upcomingCompetitionName);
            if (upcomingMonthToLoad) {
              searchParams.set('month', upcomingMonthToLoad);
            } else if (upcomingRangeDaysToLoad !== null) {
              searchParams.set('rangeDays', String(upcomingRangeDaysToLoad));
            }
          }
        }
        const endpoint =
          view === 'live' ? '/api/live-scores' : `/api/live-scores?${searchParams.toString()}`;
        const response = await fetch(endpoint, { cache: 'no-store' });
        if (!response.ok) {
          const errorPayload: unknown = await response.json().catch(() => null);
          if (
            upcomingTeamQuery &&
            response.status === 404 &&
            isRecord(errorPayload) &&
            errorPayload.code === 'TEAM_NOT_FOUND'
          ) {
            if (isMounted) {
              setMatches([]);
              setUpcomingTeamName(null);
              setUpcomingTeamNotFound(true);
              setUpcomingCompetitions([]);
              setSelectedContinent('all');
              setSelectedCompetition('all');
              setHasError(false);
            }
            return;
          }
          throw new Error(`Scores API responded with HTTP ${response.status}.`);
        }

        const payload: unknown = await response.json();
        if (
          !isRecord(payload) ||
          !Array.isArray(payload.matches) ||
          !payload.matches.every(isESPNScoreboardMatch) ||
          (payload.competitions !== undefined &&
            (!Array.isArray(payload.competitions) ||
              !payload.competitions.every(isLiveScoreCompetitionOption)))
        ) {
          throw new Error('Scores API returned an invalid response.');
        }
        if (!isMounted) return;
        const responseCompetitions =
          Array.isArray(payload.competitions) &&
          payload.competitions.every(isLiveScoreCompetitionOption)
            ? payload.competitions
            : null;

        if (view === 'live' && payload.matches.length === 0) {
          setHasLiveMatches(false);
          setMatches([]);
          setTeamHistoryName(null);
          setUpcomingTeamName(null);
          setUpcomingTeamNotFound(false);
          setIsLoading(true);
          changingViewOrFilter = true;
          setView('upcoming');
          return;
        }

        if (
          view === 'finished' &&
          !teamHistoryQuery &&
          typeof finishedDateFilter === 'number' &&
          finishedDateFilter < 2 &&
          payload.matches.length === 0
        ) {
          const nextDateFilter: 1 | 2 = finishedDateFilter === 0 ? 1 : 2;
          changingViewOrFilter = true;
          setMatches([]);
          setHasError(false);
          setIsLoading(true);
          setUpdatedAt(null);
          setFinishedDateFilter(nextDateFilter);
          return;
        }

        const nextMatches = payload.matches.map(toLiveScoreMatch);
        setMatches(nextMatches);
        if (view === 'upcoming' && responseCompetitions !== null) {
          setUpcomingCompetitions(responseCompetitions);
        }
        setCompetitionNames((current) => {
          let next = current;
          for (const match of nextMatches) {
            const id = String(match.league.id);
            if (match.league.id <= 0 || next[id] === match.league.name) continue;
            if (next === current) next = { ...current };
            next[id] = match.league.name;
          }
          for (const competition of responseCompetitions ?? []) {
            const id = String(competition.id);
            if (next[id] === competition.name) continue;
            if (next === current) next = { ...current };
            next[id] = competition.name;
          }
          return next;
        });
        setTeamHistoryName(
          view === 'finished' && typeof payload.teamName === 'string'
            ? payload.teamName
            : null,
        );
        setUpcomingTeamName(
          view === 'upcoming' && typeof payload.teamName === 'string'
            ? payload.teamName
            : null,
        );
        setUpcomingTeamNotFound(false);
        if (view === 'live') setHasLiveMatches(true);
        setHasError(false);
        setUpdatedAt(new Date().toISOString());
      } catch (error) {
        console.error('Unable to refresh live football scores:', error);
        if (isMounted) {
          setHasError(true);
          if (view === 'live') setHasLiveMatches(false);
        }
      } finally {
        if (isMounted && !changingViewOrFilter) setIsLoading(false);
      }
    }

    void refreshScores();
    const intervalId = window.setInterval(refreshScores, REFRESH_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [
    finishedDateFilter,
    teamHistoryQuery,
    upcomingTeamQuery,
    upcomingCompetitionId,
    upcomingCompetitionName,
    upcomingMonthToLoad,
    upcomingRangeDaysToLoad,
    view,
  ]);

  useEffect(() => {
    if (view === 'live') return;

    let isMounted = true;

    async function checkLiveMatches() {
      try {
        const response = await fetch('/api/live-scores', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Live scores API responded with HTTP ${response.status}.`);
        }

        const payload: unknown = await response.json();
        if (
          !isRecord(payload) ||
          !Array.isArray(payload.matches) ||
          !payload.matches.every(isESPNScoreboardMatch)
        ) {
          throw new Error('Live scores API returned an invalid response.');
        }

        if (isMounted) setHasLiveMatches(payload.matches.length > 0);
      } catch (error) {
        if (isMounted) {
          console.error('Unable to check for live football matches:', error);
          setHasLiveMatches(false);
        }
      }
    }

    void checkLiveMatches();
    const intervalId = window.setInterval(checkLiveMatches, REFRESH_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [view]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (selectedFixtureId === null || !dialog || dialog.open) return;

    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [selectedFixtureId]);

  useEffect(() => {
    if (selectedFixtureId === null) return;

    const controller = new AbortController();
    let hasLoadedDetails = false;
    let hasCompletedInitialRequest = false;
    let isRequestInFlight = false;

    async function loadMatchDetails() {
      if (isRequestInFlight) return;
      isRequestInFlight = true;

      try {
        const searchParams = new URLSearchParams({ id: String(selectedFixtureId) });
        const response = await fetch(`/api/match-details?${searchParams.toString()}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Match details API responded with HTTP ${response.status}.`);
        }

        const payload: unknown = await response.json();
        if (!isMatchDetailsData(payload)) {
          throw new Error('Match details API returned an invalid response.');
        }

        if (!controller.signal.aborted) {
          setEvents(payload.events);
          setStatistics(payload.statistics);
          setLineups(payload.lineups);
          setStandings(payload.standings);
          setDetailsUnavailable(payload.unavailable);
          setEventsError(false);
          hasLoadedDetails = true;
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Unable to load match details:', error);
        if (!hasLoadedDetails) setEventsError(true);
      } finally {
        isRequestInFlight = false;
        if (!controller.signal.aborted && !hasCompletedInitialRequest) {
          hasCompletedInitialRequest = true;
          setIsDetailsLoading(false);
        }
      }
    }

    void loadMatchDetails();
    const intervalId = window.setInterval(
      loadMatchDetails,
      MATCH_DETAILS_REFRESH_INTERVAL_MS,
    );

    return () => {
      controller.abort();
      window.clearInterval(intervalId);
    };
  }, [selectedFixtureId]);

  useEffect(() => {
    function syncDetailsFromHistory() {
      const path = window.location.pathname;
      const detailsRoute = path.match(
        /\/matches-en-direct\/([^/]+)\/(composition|lineups|classement|standings|statistiques|statistics)\/?$/,
      );

      if (detailsRoute) {
        const [, matchKey, section] = detailsRoute;
        const tab: MatchDetailsTab =
          section === 'composition' || section === 'lineups'
            ? 'lineups'
            : section === 'statistiques' || section === 'statistics'
              ? 'statistics'
              : 'standings';
        setActiveDetailsTab(tab);
        const idMatch = /(?:^|[-_])(\d+)$/.exec(matchKey);
        const fixtureId = idMatch ? Number(idMatch[1]) : Number(matchKey);
        if (Number.isSafeInteger(fixtureId) && fixtureId > 0) {
          if (selectedFixtureId !== fixtureId) setIsDetailsLoading(true);
          setSelectedFixtureId(fixtureId);
        }
      } else if (/\/matches-en-direct\/?$/.test(path)) {
        setActiveDetailsTab('events');
      } else {
        setSelectedFixtureId(null);
      }

      setShareMessage(null);
    }

    window.addEventListener('popstate', syncDetailsFromHistory);
    return () => window.removeEventListener('popstate', syncDetailsFromHistory);
  }, [selectedFixtureId]);

  function openMatchDetails(fixtureId: number) {
    setEvents([]);
    setStatistics([]);
    setLineups([]);
    setStandings(null);
    setDetailsUnavailable({ lineups: false, standings: false });
    setEventsError(false);
    setActiveDetailsTab('events');
    setShareMessage(null);
    setSelectedPitchClub(null);
    setIsDetailsLoading(true);
    setSelectedFixtureId(fixtureId);
  }

  function selectDetailsTab(tab: MatchDetailsTab) {
    setActiveDetailsTab(tab);
    setShareMessage(null);
    if (selectedFixtureId === null) return;

    const path =
      tab === 'events'
        ? `/${locale}/matches-en-direct`
        : getMatchDetailsPath(
            locale,
            selectedMatch,
            selectedFixtureId,
            tab,
            initialMatchKey,
          );
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  }

  function closeMatchDetails() {
    setSelectedFixtureId(null);
    setShareMessage(null);
    if (/\/matches-en-direct\/[^/]+\/(composition|lineups|classement|standings|statistiques|statistics)\/?$/.test(window.location.pathname)) {
      window.history.replaceState(null, '', `/${locale}/matches-en-direct`);
    }
  }

  async function shareSelectedDetails() {
    if (selectedFixtureId === null || activeDetailsTab === 'events') return;
    const shareUrl = new URL(
      getMatchDetailsPath(
        locale,
        selectedMatch,
        selectedFixtureId,
        activeDetailsTab === 'lineups' ? 'lineups' : 'standings',
        initialMatchKey,
      ),
      window.location.origin,
    ).toString();
    const title =
      selectedMatch
        ? `${selectedMatch.teams.home.name} – ${selectedMatch.teams.away.name}`
        : initialMatchLabel ?? `Match ${selectedFixtureId}`;

    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title, url: shareUrl });
        setShareMessage(
          english ? 'Match link shared.' : 'Lien du match partagé.',
        );
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      setShareMessage(
        english ? 'Share link copied.' : 'Lien de partage copié.',
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      console.error('Unable to share match details:', error);
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareMessage(
          english ? 'Share link copied.' : 'Lien de partage copié.',
        );
      } catch (clipboardError) {
        console.error('Unable to copy match share link:', clipboardError);
        setShareMessage(
          english
            ? 'Unable to share this match link.'
            : 'Impossible de partager le lien de ce match.',
        );
      }
    }
  }

  function changeView(nextView: ScoresView) {
    if (nextView === view) return;
    setMatches([]);
    setHasError(false);
    setTeamHistoryName(null);
    setUpcomingTeamName(null);
    setUpcomingTeamNotFound(false);
    setTeamHistoryVisibleCount(5);
    setMatchesVisibleCount(40);
    setIsLoading(true);
    setUpdatedAt(null);
    setView(nextView);
  }

  function toggleFavorite(fixtureId: number) {
    const nextFavorites = new Set(favoriteIds);
    if (nextFavorites.has(fixtureId)) nextFavorites.delete(fixtureId);
    else nextFavorites.add(fixtureId);

    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(nextFavorites)));
    favoriteSubscribers.forEach((subscriber) => subscriber());
  }

  async function toggleTeamFavorite(team: {
    id: number | null;
    name: string;
    logo: string | null;
  }) {
    if (!user?.id || team.id === null) return;

    const espnTeamId = String(team.id);
    const isFollowed = followedTeams.some((item) => item.espnTeamId === espnTeamId);
    setTeamFavoriteActionId(espnTeamId);
    setTeamFavoriteError(null);

    try {
      if (!isFollowed) await enableFootballMatchNotifications();

      const response = await authFetch(
        isFollowed
          ? `/api/user/match-teams?teamId=${encodeURIComponent(espnTeamId)}`
          : '/api/user/match-teams',
        {
          method: isFollowed ? 'DELETE' : 'POST',
          ...(isFollowed
            ? {}
            : {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  espnTeamId,
                  name: team.name,
                  logo: team.logo,
                }),
              }),
        },
      );
      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);
        const message =
          isRecord(body) && typeof body.error === 'string'
            ? body.error
            : 'Impossible de mettre à jour cette équipe favorite.';
        throw new Error(message);
      }

      setSavedFollowedTeams((current) =>
        isFollowed
          ? current.filter((item) => item.espnTeamId !== espnTeamId)
          : [{ espnTeamId, name: team.name, logo: team.logo }, ...current],
      );
      setFollowedTeamsOwnerId(String(user.id));
    } catch (error) {
      console.error('Unable to update a followed football team:', error);
      setTeamFavoriteError(
        error instanceof Error
          ? error.message
          : english
            ? 'Could not update this favorite team.'
            : 'Impossible de mettre à jour cette équipe favorite.',
      );
    } finally {
      setTeamFavoriteActionId(null);
    }
  }

  return (
    <section
      aria-labelledby="live-scores-title"
      className="w-full min-w-0 border-y border-border bg-muted/40 py-10 sm:py-12"
    >
      <div className="mx-auto w-full min-w-0 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex min-w-0 flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
              <Activity className="h-4 w-4" aria-hidden="true" />
              Football
            </p>
            <h1
              id="live-scores-title"
              className="font-heading text-2xl font-bold text-foreground sm:text-3xl"
            >
              {view === 'live'
                ? english
                  ? 'Live matches'
                  : 'Matches en direct'
                : view === 'upcoming'
                  ? english
                    ? 'Upcoming matches'
                    : 'Matches à venir'
                  : teamHistoryName
                    ? english
                      ? `Last five matches: ${teamHistoryName}`
                      : `5 derniers matches de ${teamHistoryName}`
                    : english
                      ? `Completed matches ${finishedDateLabel}`
                      : `Matches terminés ${finishedDateLabel}`}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {english
                ? 'Follow live football scores, upcoming fixtures and recent match results on MalakInfo.'
                : 'Suivez les scores de football en direct, les matches à venir et les résultats récents sur MalakInfo.'}
            </p>
          </div>
          <div className="flex max-w-full items-center gap-2 text-xs text-muted-foreground">
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
                ? 'Refreshes every minute'
                : 'Actualisation toutes les minutes'}
          </div>
        </div>

        <div className="mb-6 inline-flex max-w-full flex-wrap rounded-xl border border-border bg-background p-1" role="group" aria-label={english ? 'Choose matches view' : 'Choisir les matches à afficher'}>
          <button
            type="button"
            aria-pressed={view === 'live'}
            disabled={!hasLiveMatches}
            title={
              !hasLiveMatches
                ? english
                  ? 'Available when a match is in progress'
                  : 'Disponible lorsqu’au moins un match est en cours'
                : undefined
            }
            onClick={() => changeView('live')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm ${
              view === 'live'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {english ? 'Live' : 'En direct'}
          </button>
          <button
            type="button"
            aria-pressed={view === 'upcoming'}
            onClick={() => changeView('upcoming')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:text-sm ${
              view === 'upcoming'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {english ? 'Upcoming' : 'À venir'}
          </button>
          <button
            type="button"
            aria-pressed={view === 'finished'}
            onClick={() => changeView('finished')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:text-sm ${
              view === 'finished'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {english ? 'Finished' : 'Terminés'}
          </button>
        </div>

        {accountReady && user?.id && (
          <p className="mb-4 text-sm text-muted-foreground">
            {english
              ? 'Follow a team with its star to receive a Push reminder about 30 minutes before kickoff. Browser notification permission is required.'
              : 'Ajoutez une équipe avec son étoile pour recevoir un rappel Push environ 30 minutes avant le coup d’envoi. L’autorisation des notifications du navigateur est requise.'}
          </p>
        )}

        <div className="mb-6 flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <button
              type="button"
              aria-expanded={isSearchOpen}
              aria-label={
                isSearchOpen
                  ? english
                    ? 'Close match search'
                    : 'Fermer la recherche de matches'
                  : english
                    ? 'Search teams or matches'
                    : 'Rechercher une équipe ou un match'
              }
              onClick={() => {
                if (isSearchOpen) {
                  setSearchQuery('');
                  setDebouncedSearchQuery('');
                  setTeamHistoryName(null);
                  setUpcomingTeamName(null);
                  setUpcomingTeamNotFound(false);
                }
                setIsSearchOpen((open) => !open);
              }}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {isSearchOpen ? (
                <X className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Search className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
            {isSearchOpen && (
              <label className="relative min-w-0 flex-1">
                <input
                  ref={searchInputRef}
                  id="live-scores-search"
                  type="search"
                  value={searchQuery}
                  onChange={(event) => {
                    const nextQuery = event.target.value;
                    setTeamHistoryName(null);
                    setUpcomingTeamName(null);
                    setUpcomingTeamNotFound(false);
                    setTeamHistoryVisibleCount(5);
                    setMatchesVisibleCount(40);
                    if (view === 'upcoming') {
                      setSelectedCompetition('all');
                      if (normalizeSearch(nextQuery).length >= 3) {
                        setUpcomingCompetitions([]);
                        setSelectedContinent('all');
                      }
                    }
                    setSearchQuery(nextQuery);
                  }}
                  placeholder={
                    view === 'upcoming'
                      ? english
                        ? 'Search a team (e.g. DR Congo or Senegal)'
                        : 'Rechercher une équipe (ex. RDC ou Sénégal)'
                      : english
                        ? 'Search a team or match (e.g. France vs Spain)'
                        : 'Rechercher une équipe ou un match (ex. France vs Espagne)'
                  }
                  aria-label={
                    view === 'upcoming'
                      ? english
                        ? 'Search an upcoming team fixture'
                        : 'Rechercher le programme à venir d’une équipe'
                      : english
                        ? 'Search teams or matches'
                        : 'Rechercher une équipe ou un match'
                  }
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
                />
              </label>
            )}
          </div>
          {view === 'finished' && !teamHistoryName && (
            <>
              <label className="sr-only" htmlFor="live-scores-finished-day">
                {english ? 'Filter finished matches by date' : 'Filtrer les matches terminés par date'}
              </label>
              <select
                id="live-scores-finished-day"
                value={finishedDateFilter}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  const filter: FinishedDateFilter =
                    value === 'week'
                      ? 'week'
                      : value === 'month'
                        ? 'month'
                        : value === '2'
                          ? 2
                          : value === '1'
                            ? 1
                            : 0;
                  setMatches([]);
                  setHasError(false);
                  setIsLoading(true);
                  setUpdatedAt(null);
                  setSelectedCompetition('all');
                  setMatchesVisibleCount(40);
                  setFinishedDateFilter(filter);
                }}
                aria-label={english ? 'Filter finished matches by date' : 'Filtrer les matches terminés par date'}
                className="h-11 w-full min-w-0 max-w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary sm:w-auto"
              >
                <option value="0">{english ? 'Today' : 'Aujourd’hui'}</option>
                <option value="1">{english ? 'Yesterday' : 'Hier'}</option>
                <option value="2">{english ? 'Two days ago' : 'Avant-hier'}</option>
                <option value="week">{english ? 'Past 7 days' : '7 derniers jours'}</option>
                <option value="month">{english ? 'Past 30 days' : '30 derniers jours'}</option>
              </select>
            </>
          )}
          {view === 'upcoming' && (
            <>
              <label className="sr-only" htmlFor="live-scores-upcoming-period">
                {english ? 'Choose an upcoming date range' : 'Choisir une période de matches à venir'}
              </label>
              <select
                id="live-scores-upcoming-period"
                value={upcomingDateFilter}
                disabled={selectedCompetition === 'all' && !isSearchOpen}
                onChange={(event) => {
                  setMatches([]);
                  setHasError(false);
                  setIsLoading(true);
                  setUpdatedAt(null);
                  setUpcomingTeamName(null);
                  setUpcomingTeamNotFound(false);
                  setMatchesVisibleCount(40);
                  setUpcomingDateFilter(event.currentTarget.value);
                }}
                aria-label={english ? 'Choose an upcoming date range' : 'Choisir une période de matches à venir'}
                className="h-11 w-full min-w-0 max-w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                <option value="7days">{english ? 'Next 7 days' : '7 prochains jours'}</option>
                <option value="30days">{english ? 'Next 30 days' : '30 prochains jours'}</option>
                {upcomingMonths.map((month) => (
                  <option key={month} value={month}>
                    {formatMonthLabel(month, english)}
                  </option>
                ))}
              </select>
            </>
          )}
          {view === 'upcoming' && (
            <>
              <label className="sr-only" htmlFor="live-scores-continent">
                {english ? 'Filter by continent' : 'Filtrer par continent'}
              </label>
              <select
                id="live-scores-continent"
                value={selectedContinent}
                onChange={(event) => {
                  setSelectedContinent(event.currentTarget.value);
                  setSelectedCompetition('all');
                  setMatchesVisibleCount(40);
                }}
                aria-label={english ? 'Filter by continent' : 'Filtrer par continent'}
                className="h-11 w-full min-w-0 max-w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary sm:w-auto"
              >
                <option value="all">{english ? 'All continents' : 'Tous les continents'}</option>
                {availableUpcomingContinents.map((continent) => (
                  <option key={continent} value={continent}>
                    {getSoccerContinentLabel(continent, english)}
                  </option>
                ))}
              </select>
            </>
          )}
          <label className="sr-only" htmlFor="live-scores-competition">
            {english ? 'Filter by competition' : 'Filtrer par compétition'}
          </label>
          <select
            id="live-scores-competition"
            value={selectedCompetition}
            onChange={(event) => {
              const nextCompetition = event.currentTarget.value;
              setSelectedCompetition(nextCompetition);
              if (view === 'upcoming') {
                setMatches([]);
                setHasError(false);
                setIsLoading(true);
                setUpdatedAt(null);
                setMatchesVisibleCount(40);
              }
            }}
            aria-label={english ? 'Filter by competition' : 'Filtrer par compétition'}
            className="h-11 w-full min-w-0 max-w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary sm:w-auto"
          >
            <option value="all">{english ? 'All competitions' : 'Toutes les compétitions'}</option>
            {view === 'upcoming'
              ? visibleUpcomingCompetitions.map(({ id, name }) => (
                  <option key={id} value={String(id)}>
                    {name}
                  </option>
                ))
              : competitions.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
          </select>
          <button
            type="button"
            aria-pressed={favoritesOnly}
            onClick={() => setFavoritesOnly((current) => !current)}
            className={`inline-flex h-11 w-full min-w-0 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:w-auto ${
              favoritesOnly
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-foreground hover:bg-muted'
            }`}
          >
            <Pin className="h-4 w-4" aria-hidden="true" />
            {english ? 'Favorites' : 'Favoris'}
          </button>
        </div>

        {view === 'upcoming' && selectedCompetition === 'all' && (
          <p className="-mt-3 mb-6 text-sm text-muted-foreground">
            {english
              ? 'Choose a competition or search for a team to browse upcoming fixtures by date.'
              : 'Choisissez un championnat ou recherchez une équipe pour consulter son programme par date.'}
          </p>
        )}

        {isLoading ? (
          <>
            <p role="status" className="sr-only">
              {english ? 'Loading matches' : 'Chargement des matches'}
            </p>
            <ul aria-hidden="true" className="grid min-w-0 gap-4 md:grid-cols-2">
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
        ) : visibleMatches.length > 0 ? (
          <>
            <ul className="grid min-w-0 gap-4 md:grid-cols-2">
              {matchesToRender.map((match) => {
                const matchHasStarted = hasMatchStarted(match);
                const kickoffLabel = matchHasStarted
                  ? getStartedAtLabel(match.fixture.date, english)
                  : getKickoffLabel(match.fixture.date, english);
                const liveMinute = getLiveMinute(match);
                const homeIsFollowed = followedTeams.some(
                  (team) => team.espnTeamId === String(match.teams.home.id),
                );
                const awayIsFollowed = followedTeams.some(
                  (team) => team.espnTeamId === String(match.teams.away.id),
                );

                return (
                <li key={match.fixture.id} className="min-w-0">
                    <article className="relative min-w-0 overflow-hidden rounded-xl border border-border bg-white shadow-sm dark:bg-card">
                    <button
                      type="button"
                      onClick={() => openMatchDetails(match.fixture.id)}
                      aria-label={
                        english
                          ? `View events for ${match.teams.home.name} versus ${match.teams.away.name}`
                          : `Afficher les temps forts de ${match.teams.home.name} contre ${match.teams.away.name}`
                      }
                      className="group w-full min-w-0 cursor-pointer p-5 text-left transition-colors hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:p-6"
                    >
                    <div className="mb-4 flex min-w-0 flex-col gap-2 pl-10 lg:flex-row lg:items-center lg:justify-between lg:gap-3">
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
                          <p className="break-words text-xs font-semibold leading-snug text-foreground sm:text-sm">
                            {match.league.name}
                          </p>
                          {match.league.country && (
                            <p className="break-words text-[11px] leading-snug text-muted-foreground sm:text-xs">
                              {match.league.country}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center self-start rounded-full font-bold uppercase tracking-wide lg:self-auto ${
                          match.state === 'in'
                            ? 'gap-1.5 px-2.5 py-1 text-xs bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                            : match.state === 'pre'
                              ? 'gap-1 px-2 py-0.5 text-[10px] sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-xs bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                              : 'gap-1.5 px-2.5 py-1 text-xs bg-muted text-muted-foreground'
                        }`}
                      >
                        {match.state === 'in' ? (
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                        ) : (
                          match.state === 'pre' ? (
                            <Clock3 className="h-2.5 w-2.5 sm:h-3 sm:w-3" aria-hidden="true" />
                          ) : (
                            <Trophy className="h-3 w-3" aria-hidden="true" />
                          )
                        )}
                        {match.state === 'in'
                          ? english
                            ? 'LIVE'
                            : 'DIRECT'
                          : match.state === 'pre'
                            ? english
                              ? 'UPCOMING'
                              : 'À VENIR'
                          : match.fixture.status.short === 'AET'
                            ? english
                              ? 'After extra time'
                              : 'Après prolongation'
                            : match.fixture.status.short === 'PEN'
                              ? english
                                ? 'After penalties'
                                : 'Aux tirs au but'
                              : english
                                ? 'Finished'
                                : 'Terminé'}
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

                    <p className="mt-4 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-center text-xs font-medium text-muted-foreground">
                      <Clock3 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>
                        {matchHasStarted
                          ? english
                            ? 'Started at'
                            : 'Lancé à'
                          : english
                            ? 'Kick-off:'
                            : 'Coup d’envoi :'}{' '}
                        {kickoffLabel}
                      </span>
                      {liveMinute && (
                        <span className="font-bold text-red-600 dark:text-red-400">
                          · {english ? 'Minute' : 'Minute'} {liveMinute}
                        </span>
                      )}
                    </p>
                    {view === 'finished' && (
                      <p className="mt-4 border-t border-border pt-3 text-center text-sm font-medium text-muted-foreground">
                        {getFinishedSummary(match, english)}
                      </p>
                    )}
                    </button>
                    {accountReady && user?.id && (
                      <div className="grid grid-cols-2 gap-2 border-t border-border bg-background/70 p-2">
                        {[
                          { team: match.teams.home, isFollowed: homeIsFollowed },
                          { team: match.teams.away, isFollowed: awayIsFollowed },
                        ].map(({ team, isFollowed }) => (
                          <button
                            key={team.id ?? team.name}
                            type="button"
                            disabled={
                              followedTeamsLoading ||
                              team.id === null ||
                              teamFavoriteActionId !== null
                            }
                            aria-pressed={isFollowed}
                            aria-busy={teamFavoriteActionId === String(team.id)}
                            aria-label={
                              isFollowed
                                ? english
                                  ? `Stop following ${team.name} and its match reminders`
                                  : `Ne plus suivre ${team.name} ni ses rappels de match`
                                : english
                                  ? `Follow ${team.name} and get match reminders`
                                  : `Suivre ${team.name} et recevoir les rappels de match`
                            }
                            title={
                              isFollowed
                                ? english
                                  ? `Stop following ${team.name}`
                                  : `Ne plus suivre ${team.name}`
                                : english
                                  ? `Follow ${team.name}`
                                  : `Suivre ${team.name}`
                            }
                            onClick={() => void toggleTeamFavorite(team)}
                            className={`flex min-w-0 items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 ${
                              isFollowed
                                ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300'
                                : 'border-border bg-card text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <Star
                              className={`h-3.5 w-3.5 shrink-0 ${isFollowed ? 'fill-current' : ''}`}
                              aria-hidden="true"
                            />
                            <span className="min-w-0 truncate">
                              {team.name}
                              {isFollowed
                                ? english
                                  ? ' · Following'
                                  : ' · Suivie'
                                : ''}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleFavorite(match.fixture.id)}
                      aria-pressed={favoriteIds.includes(match.fixture.id)}
                      aria-label={
                        favoriteIds.includes(match.fixture.id)
                          ? english
                            ? `Remove ${match.teams.home.name} versus ${match.teams.away.name} from favorites`
                            : `Retirer ${match.teams.home.name} contre ${match.teams.away.name} des favoris`
                          : english
                            ? `Add ${match.teams.home.name} versus ${match.teams.away.name} to favorites`
                            : `Ajouter ${match.teams.home.name} contre ${match.teams.away.name} aux favoris`
                      }
                      title={english ? 'Save as favorite' : 'Enregistrer parmi les favoris'}
                      className={`absolute left-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border bg-background shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        favoriteIds.includes(match.fixture.id)
                          ? 'border-amber-300 text-amber-500'
                          : 'border-border text-muted-foreground hover:text-amber-500'
                      }`}
                    >
                      <Star
                        className={`h-4 w-4 ${favoriteIds.includes(match.fixture.id) ? 'fill-current' : ''}`}
                        aria-hidden="true"
                      />
                    </button>
                    </article>
                </li>
                );
            })}
            </ul>
            {teamFavoriteError && user?.id && (
                <p role="status" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
                  {teamFavoriteError}
                </p>
            )}
            {matchesToRender.length < visibleMatches.length && (
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    if (teamHistoryName) {
                      setTeamHistoryVisibleCount((count) =>
                        Math.min(count + 5, visibleMatches.length),
                      );
                    } else {
                      setMatchesVisibleCount((count) =>
                        Math.min(count + 40, visibleMatches.length),
                      );
                    }
                  }}
                  className="inline-flex min-h-11 max-w-full items-center justify-center whitespace-normal break-words rounded-xl border border-primary px-5 py-2.5 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {teamHistoryName
                    ? english
                      ? `View more past matches for ${teamHistoryName}`
                      : `Voir plus de matches passés de ${teamHistoryName}`
                    : english
                      ? 'Load more matches'
                      : 'Afficher plus de matches'}
                </button>
              </div>
            )}
            {hasError && (
              <p role="status" className="mt-3 text-xs text-muted-foreground">
                {english
                  ? 'Refresh failed. Showing the latest available scores.'
                  : "L'actualisation a échoué. Les derniers scores disponibles sont affichés."}
              </p>
            )}
          </>
        ) : matches.length > 0 ? (
          <p className="rounded-xl border border-border bg-card px-5 py-8 text-center text-sm text-muted-foreground">
            {favoritesOnly && favoriteIds.length === 0
              ? english
                ? 'Save a match with the star button to see it here.'
                : 'Ajoutez un match avec l’étoile pour le retrouver ici.'
              : english
                ? 'No matches match these filters.'
                : 'Aucun match ne correspond à ces filtres.'}
          </p>
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
            {view === 'live'
              ? english
                ? 'No matches are currently in progress.'
                : "Aucun match n'est en cours actuellement."
              : view === 'upcoming'
                ? upcomingTeamNotFound
                  ? english
                    ? 'This soccer team was not found. Try its official team name.'
                    : 'Cette équipe de football est introuvable. Essayez son nom officiel.'
                  : upcomingTeamName
                    ? english
                      ? `No upcoming match is scheduled for ${upcomingTeamName} in this period.`
                      : `Aucun match n’est programmé pour ${upcomingTeamName} sur cette période.`
                    : english
                      ? 'No upcoming matches.'
                      : 'Aucun match à venir pour le moment.'
                : english
                  ? `No completed matches ${finishedDateLabel}.`
                  : `Aucun match terminé ${finishedDateLabel}.`}
          </p>
        )}
      </div>

      {selectedFixtureId !== null && (
        <dialog
          ref={dialogRef}
          aria-labelledby="match-details-title"
          onCancel={(event) => {
            event.preventDefault();
            closeMatchDetails();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              closeMatchDetails();
            }
          }}
          className="fixed inset-0 m-0 flex h-dvh max-h-dvh w-full max-w-full items-center justify-center overflow-hidden border-0 bg-transparent p-0 text-foreground sm:p-6"
        >
          <div
            aria-hidden="true"
            onClick={closeMatchDetails}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
          />
          <section className="relative z-10 mx-auto flex h-dvh max-h-dvh w-full min-w-0 max-w-5xl flex-col overflow-hidden border border-border bg-background shadow-2xl sm:h-[92dvh] sm:max-h-[92dvh] sm:rounded-2xl">
            <header className="flex shrink-0 items-start justify-between gap-2 border-b border-border px-3 py-3 sm:gap-4 sm:px-6 sm:py-4">
              <div className="min-w-0">
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                  {english ? 'Match details' : 'Détails du match'}
                </p>
                <h2 id="match-details-title" className="break-words text-base font-bold leading-snug text-foreground sm:text-xl">
                  {selectedMatch
                    ? `${selectedMatch.teams.home.name} – ${selectedMatch.teams.away.name}`
                    : initialMatchLabel ?? `Match ${selectedFixtureId}`}
                </h2>
                {shareMessage && (
                  <p role="status" className="mt-1 text-xs text-muted-foreground">
                    {shareMessage}
                  </p>
                )}
                {selectedMatch && (
                  <p className="mt-1 text-sm font-semibold text-muted-foreground">
                    {selectedMatch.goals.home ?? '–'} : {selectedMatch.goals.away ?? '–'}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {activeDetailsTab !== 'events' && (
                  <button
                    type="button"
                    onClick={() => void shareSelectedDetails()}
                    aria-label={
                      english
                        ? `Share ${
                            activeDetailsTab === 'lineups'
                              ? 'lineups'
                              : activeDetailsTab === 'statistics'
                                ? 'statistics'
                                : 'standings'
                          }`
                        : `Partager ${
                            activeDetailsTab === 'lineups'
                              ? 'la composition'
                              : activeDetailsTab === 'statistics'
                                ? 'les statistiques'
                                : 'le classement'
                          }`
                    }
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border px-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Share2 className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">
                      {english ? 'Share' : 'Partager'}
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  autoFocus
                  onClick={closeMatchDetails}
                  aria-label={english ? 'Close match details' : 'Fermer les détails du match'}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </header>

            <div
              role="tablist"
              aria-label={english ? 'Match information' : 'Informations du match'}
              className="flex shrink-0 flex-wrap items-center gap-1 border-b border-border px-3 py-2 sm:px-6"
            >
              {([
                ['events', english ? 'Highlights' : 'Temps forts'],
                ['statistics', english ? 'Statistics' : 'Statistiques'],
                ['lineups', english ? 'Lineups' : 'Compositions'],
                ['standings', english ? 'Standings' : 'Classement'],
              ] as const).map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeDetailsTab === tab}
                  onClick={() => selectDetailsTab(tab)}
                  className={`min-h-8 shrink-0 whitespace-nowrap rounded-full px-1.5 py-1 text-[10px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:px-2 sm:text-xs ${
                    activeDetailsTab === tab
                      ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-inset ring-primary/25'
                      : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
              {isDetailsLoading ? (
                <div role="status" className="flex min-h-40 flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
                  <LoaderCircle className="h-7 w-7 animate-spin text-primary" aria-hidden="true" />
                  {english ? 'Loading match information…' : 'Chargement des informations du match…'}
                </div>
              ) : eventsError ? (
                <p role="alert" className="rounded-xl border border-border bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
                  {english
                    ? 'Match information is temporarily unavailable. Please try again later.'
                    : 'Les informations du match sont temporairement indisponibles. Réessayez plus tard.'}
                </p>
              ) : activeDetailsTab === 'events' ? (
                <>
                  {preMatchLineups.length > 0 && (
                    <section className="mb-5 rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-sm sm:p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-primary">
                            {english ? 'Pre-match' : 'Avant-match'}
                          </p>
                          <h3 className="text-base font-bold text-foreground">
                            {preMatchLineups.length > 1
                              ? english
                                ? 'Official lineups have been announced'
                                : 'Les compositions officielles sont publiées'
                              : english
                                ? 'An official lineup is available'
                                : 'Une composition officielle est disponible'}
                          </h3>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            {preMatchLineups.length > 1
                              ? english
                                ? 'The starting XIs are available before kick-off.'
                                : 'Les onze de départ sont consultables avant le coup d’envoi.'
                              : english
                                ? `The starting lineup for ${preMatchLineups[0].team.name} is available before kick-off.`
                                : `La composition de ${preMatchLineups[0].team.name} est consultable avant le coup d’envoi.`}
                          </p>
                          <ul className="mt-3 flex flex-wrap gap-2">
                            {preMatchLineups.map((lineup) => (
                              <li
                                key={lineup.team.id ?? lineup.team.name}
                                className="rounded-lg border border-border/70 bg-background/80 px-3 py-2 text-sm"
                              >
                                <span className="font-semibold text-foreground">{lineup.team.name}</span>
                                <span className="ml-2 text-muted-foreground">
                                  {lineup.formation ?? (english ? 'Formation pending' : 'Formation à confirmer')}
                                  {' · '}
                                  {lineup.startingXI.length} {english ? 'starters' : 'titulaires'}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <button
                          type="button"
                          onClick={() => selectDetailsTab('lineups')}
                          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:text-sm"
                        >
                          {english ? 'View lineups on the pitch' : 'Voir les compositions sur le terrain'}
                        </button>
                      </div>
                    </section>
                  )}
                  {selectedMatch && view === 'finished' && (
                    <details className="group mb-5 overflow-hidden rounded-xl border border-primary/20 bg-primary/5">
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 p-4 marker:content-none">
                        <div className="min-w-0">
                          <h3 className="text-xs font-bold uppercase tracking-wide text-primary">
                            {english ? 'How the match ended' : 'Résumé final'}
                          </h3>
                          <p className="mt-1 text-sm font-medium leading-relaxed text-foreground">
                            {getFinishedSummary(selectedMatch, english)}
                          </p>
                        </div>
                        <ChevronDown
                          className="mt-1 h-4 w-4 shrink-0 text-primary transition-transform group-open:rotate-180"
                          aria-hidden="true"
                        />
                      </summary>
                      <p className="border-t border-primary/15 px-4 py-3 text-sm leading-relaxed text-foreground">
                        {getMatchEndMinute(selectedMatch, events)
                          ? `${getMatchEndMinute(selectedMatch, events)}' — `
                          : ''}
                        {getFinishedNarration(selectedMatch, english)}
                      </p>
                    </details>
                  )}
                  {events.length === 0 ? (
                    <p className="rounded-xl border border-border bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
                      {selectedMatch?.state === 'pre'
                        ? english
                          ? 'Kick-off has not taken place yet. Match events will appear here once the game begins.'
                          : 'Le match n’a pas encore commencé. Les temps forts apparaîtront ici dès le coup d’envoi.'
                        : english
                          ? 'No events are available for this match yet.'
                          : "Aucun temps fort n'est disponible pour ce match pour le moment."}
                    </p>
                  ) : (
                    <ol className="relative space-y-5 before:absolute before:bottom-4 before:left-[15px] before:top-4 before:w-px before:bg-border">
                      {events.slice().reverse().map((event, reverseIndex) => {
                        const index = events.length - reverseIndex - 1;
                        const kind = getMatchEventKind(event);
                        const detail = kind === 'goal' ? getGoalDetail(event.detail, english) : event.detail;
                        const teamSide = getEventTeamSide(event.team.name, selectedMatch);
                        const isAwayEvent = teamSide === 'away';
                        const Icon =
                          kind === 'substitution'
                            ? ArrowUp
                            : [
                                  'break',
                                  'cooling-break',
                                  'start-delay',
                                  'end-delay',
                                  'start-2nd-half',
                                  'end-regular-time',
                                ].includes(kind)
                              ? Clock3
                              : [
                                  'other',
                                  'missed-penalty',
                                  'penalty-attempt',
                                  'penalty-awarded',
                                  'var',
                                  'retired',
                                  'handball',
                                ].includes(kind)
                              ? CircleAlert
                              : CircleDot;
                        const commentary = eventCommentaries[index];
                        const eventTitle = getMatchEventTitle(
                          kind,
                          detail,
                          event.type,
                          event.comments,
                          english,
                        );
                        const showCommentary =
                          commentary &&
                          kind !== 'substitution' &&
                          commentary.trim() !== event.detail?.trim();
                        const playerOutNumber = getJerseyNumber(
                          lineups,
                          event.player.id,
                          event.player.name,
                        );
                        const playerInNumber = getJerseyNumber(
                          lineups,
                          event.assist.id,
                          event.assist.name,
                        );

                        return (
                          <li
                            key={event.id}
                            className="relative flex gap-3"
                          >
                            <span
                              className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background ${
                                kind === 'goal'
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : kind === 'red-card'
                                    ? 'text-red-600 dark:text-red-400'
                                    : kind === 'yellow-card'
                                      ? 'text-amber-500'
                                      : kind === 'substitution'
                                        ? 'text-primary'
                                        : 'text-muted-foreground'
                              }`}
                            >
                              {kind === 'goal' ? (
                                <span role="img" aria-label={english ? 'Football' : 'Ballon'}>
                                  ⚽
                                </span>
                              ) : kind === 'yellow-card' || kind === 'red-card' ? (
                                <span
                                  className={`h-4 w-3 rounded-sm ${
                                    kind === 'red-card' ? 'bg-red-600' : 'bg-amber-400'
                                  }`}
                                />
                              ) : (
                                <Icon className="h-4 w-4" aria-hidden="true" />
                              )}
                            </span>

                            <div
                              className={`min-w-0 flex-1 rounded-xl border border-border bg-card px-4 py-3 ${
                                kind === 'goal' ? 'border-emerald-500/30 bg-emerald-500/5' : ''
                              }`}
                            >
                              <div
                                className={`mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 ${
                                  isAwayEvent ? 'justify-end text-right' : ''
                                }`}
                              >
                                <span className="text-sm font-bold text-foreground">
                                  {event.displayMinute ||
                                    `${event.time.elapsed}${
                                      event.time.extra !== null && event.time.extra > 0
                                        ? `+${event.time.extra}`
                                        : ''
                                    }'`}
                                </span>
                                {event.team.name && (
                                  <span className="text-xs text-muted-foreground">
                                    {event.team.name}
                                  </span>
                                )}
                              </div>

                              <p
                                className={`text-sm font-semibold text-foreground ${
                                  isAwayEvent ? 'text-right' : ''
                                }`}
                              >
                                {eventTitle}
                              </p>

                              {kind === 'goal' && eventGoalScores.has(event.id) && (
                                <div
                                  className={`mt-2 flex ${
                                    isAwayEvent ? 'justify-end' : 'justify-start'
                                  }`}
                                >
                                  <span className="rounded-full bg-emerald-600/10 px-2.5 py-1 text-sm font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                                    {english ? 'Score' : 'Score'}{' '}
                                    {eventGoalScores.get(event.id)}
                                  </span>
                                </div>
                              )}

                              {kind === 'substitution' ? (
                                <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                                  {event.assist.name && (
                                    <div
                                      className={`flex items-start gap-2 ${
                                        isAwayEvent ? 'sm:flex-row-reverse sm:text-right' : ''
                                      }`}
                                    >
                                      <ArrowUp
                                        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                                        aria-hidden="true"
                                      />
                                      <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                                          {english ? 'In' : 'Entrée'}
                                        </p>
                                        <p className="font-semibold text-foreground">
                                          {playerInNumber !== null ? `#${playerInNumber} ` : ''}
                                          {event.assist.name}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                  {event.player.name && (
                                    <div
                                      className={`flex items-start gap-2 ${
                                        isAwayEvent ? 'sm:flex-row-reverse sm:text-right' : ''
                                      }`}
                                    >
                                      <ArrowDown
                                        className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400"
                                        aria-hidden="true"
                                      />
                                      <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wide text-red-700 dark:text-red-400">
                                          {english ? 'Out' : 'Sortie'}
                                        </p>
                                        <p className="font-semibold text-foreground">
                                          {playerOutNumber !== null ? `#${playerOutNumber} ` : ''}
                                          {event.player.name}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                event.player.name && (
                                  <div
                                    className={`mt-2 max-w-[85%] ${
                                      isAwayEvent
                                        ? 'ml-auto text-right'
                                        : teamSide === 'home'
                                          ? 'mr-auto text-left'
                                          : 'text-left'
                                    }`}
                                  >
                                    <p className="text-base font-bold text-foreground">
                                      {event.player.name}
                                    </p>
                                    {kind === 'goal' && event.team.name && (
                                      <p className="text-xs font-medium text-muted-foreground">
                                        {event.team.name}
                                      </p>
                                    )}
                                  </div>
                                )
                              )}

                              {kind === 'goal' && detail && (
                                <p className={`mt-1 text-xs font-medium text-primary ${isAwayEvent ? 'text-right' : ''}`}>
                                  {detail}
                                </p>
                              )}
                              {kind === 'goal' && event.assist.name && (
                                <p className={`mt-1 text-xs text-muted-foreground ${isAwayEvent ? 'text-right' : ''}`}>
                                  {english ? 'Assist:' : 'Passe décisive :'} {event.assist.name}
                                </p>
                              )}
                              {showCommentary && (
                                <p className="mt-2 rounded-lg bg-muted/60 px-3 py-2 text-sm leading-relaxed text-foreground">
                                  {commentary}
                                </p>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </>
              ) : activeDetailsTab === 'statistics' ? (
                <MatchStatisticsPanel
                  statistics={statistics}
                  homeTeamLogo={homeTeamLogo}
                  awayTeamLogo={awayTeamLogo}
                  homeTeamName={
                    selectedMatch?.teams.home.name ?? homeLineup?.team.name ?? null
                  }
                  awayTeamName={
                    selectedMatch?.teams.away.name ?? awayLineup?.team.name ?? null
                  }
                  english={english}
                />
              ) : activeDetailsTab === 'lineups' ? (
                isSelectedPreMatch && preMatchLineups.length === 0 ? (
                  <p role="status" className="rounded-xl border border-border bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
                    {english
                      ? 'The complete official lineups have not been announced yet. They will appear here as soon as they are available.'
                      : 'Les compositions officielles complètes ne sont pas encore publiées. Elles apparaîtront ici dès leur annonce.'}
                  </p>
                ) : detailsUnavailable.lineups && selectedMatch?.state !== 'pre' ? (
                  <p role="status" className="rounded-xl border border-border bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
                    {english
                      ? 'Lineups are temporarily unavailable for this match.'
                      : 'Les compositions sont temporairement indisponibles pour ce match.'}
                  </p>
                ) : lineupsToDisplay.length === 0 ? (
                  <p className="rounded-xl border border-border bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
                    {selectedMatch?.state === 'pre'
                      ? english
                        ? 'Official lineups have not been published yet. They will appear here as soon as they are announced.'
                        : 'Les compositions officielles ne sont pas encore publiées. Elles apparaîtront ici dès leur annonce.'
                      : english
                        ? 'Official lineups are not available for this match.'
                        : 'Les compositions officielles ne sont pas disponibles pour ce match.'}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {isSelectedPreMatch && preMatchLineups.length > 0 && (
                      <p
                        role="status"
                        className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-semibold text-foreground"
                      >
                        {english
                          ? 'Official lineups are published and available before kick-off.'
                          : 'Les compositions officielles sont publiées et consultables avant le coup d’envoi.'}
                      </p>
                    )}
                    <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                      {english
                        ? 'Lineups and substitutions use ESPN match data and refresh every 30 seconds. ESPN does not provide live player-tracking coordinates.'
                        : 'Les compositions et remplacements suivent les données ESPN et sont actualisés toutes les 30 secondes. ESPN ne fournit pas les coordonnées de déplacement des joueurs en direct.'}
                    </p>
                    <div className="space-y-2">
                      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs font-semibold text-muted-foreground">
                          {english ? 'Show players as' : 'Afficher les joueurs par'}
                        </p>
                        <div
                          role="group"
                          aria-label={
                            english
                              ? 'Choose player information and ratings to display'
                              : 'Choisir les informations et les notes des joueurs à afficher'
                          }
                          className="grid w-full grid-cols-2 gap-1 rounded-xl border border-border bg-muted/40 p-1 sm:inline-flex sm:w-auto sm:flex-wrap"
                        >
                          {(['name', 'age', 'club'] as const).map((mode) => (
                            <button
                              key={mode}
                              type="button"
                              aria-pressed={lineupPlayerDisplayMode === mode}
                              onClick={() => setLineupPlayerDisplayMode(mode)}
                              className={`w-full rounded-lg px-2 py-2 text-center text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:w-auto sm:px-3 sm:py-1.5 ${
                                lineupPlayerDisplayMode === mode
                                  ? 'bg-primary text-primary-foreground'
                                  : 'text-muted-foreground hover:bg-background hover:text-foreground'
                              }`}
                            >
                              {mode === 'name'
                                ? english
                                  ? 'Name'
                                  : 'Nom'
                                : mode === 'age'
                                  ? english
                                    ? 'Age'
                                    : 'Âge'
                                  : english
                                    ? 'Club'
                                    : 'Club'}
                            </button>
                          ))}
                          <button
                            type="button"
                            aria-pressed={showPlayerRatings}
                            onClick={() => setShowPlayerRatings((shown) => !shown)}
                            className={`w-full rounded-lg px-2 py-2 text-center text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:w-auto sm:px-3 sm:py-1.5 ${
                              showPlayerRatings
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-background hover:text-foreground'
                            }`}
                          >
                            {english ? 'Ratings /10' : 'Notes /10'}
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {english
                          ? 'Player ages and club details are shown when ESPN provides them.'
                          : 'L’âge et le club des joueurs sont affichés lorsque ces données sont disponibles chez ESPN.'}
                      </p>
                      {showPlayerRatings && (
                        <p role="status" className="text-xs text-muted-foreground">
                          {english
                            ? 'Ratings are MalakInfo estimates based on available ESPN match statistics. Players without recorded match participation show no rating.'
                            : 'Les notes sont des estimations MalakInfo calculées à partir des statistiques de match ESPN disponibles. Les joueurs sans participation enregistrée n’ont pas encore de note.'}
                        </p>
                      )}
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2">
                    {lineupsToDisplay.map((lineup) => (
                      <section
                        key={lineup.team.id ?? lineup.team.name}
                        className="overflow-hidden rounded-xl border border-border bg-card"
                      >
                        <header className="flex items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-3">
                          <div className="flex min-w-0 items-center gap-2">
                            {lineup.team.logo && (
                              <Image
                                src={lineup.team.logo}
                                alt=""
                                width={28}
                                height={28}
                                className="h-7 w-7 object-contain"
                              />
                            )}
                            <h3 className="truncate font-semibold text-foreground">{lineup.team.name}</h3>
                          </div>
                          {lineup.formation && (
                            <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                              {lineup.formation}
                            </span>
                          )}
                        </header>
                        <div className="p-4 sm:p-5">
                          <h4 className="mb-3 text-center text-xs font-bold uppercase tracking-wide text-muted-foreground">
                            {english ? 'Starting XI' : 'Onze de départ'}
                          </h4>
                          <p className="mb-3 text-center text-[11px] text-muted-foreground">
                            <span aria-hidden="true">⚽</span>{' '}
                            {english ? 'Goalscorer' : 'Buteur'}
                            <span aria-hidden="true"> · </span>
                            <span aria-hidden="true">👟</span>{' '}
                            {english ? 'Assist provider' : 'Passeur décisif'}
                          </p>
                          <ol
                            aria-label={`${english ? 'Starting XI' : 'Onze de départ'} — ${lineup.team.name}`}
                            className="relative mx-auto aspect-[4/5] w-full max-w-[24rem] overflow-hidden rounded-xl border-2 border-white/80 bg-emerald-700 shadow-inner"
                            style={{
                              backgroundImage:
                                'repeating-linear-gradient(0deg, transparent 0, transparent 12.5%, rgba(255,255,255,.035) 12.5%, rgba(255,255,255,.035) 25%)',
                            }}
                          >
                            <li
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-[3%] rounded-sm border border-white/70"
                            />
                            <li
                              aria-hidden="true"
                              className="pointer-events-none absolute left-[3%] right-[3%] top-1/2 border-t border-white/70"
                            />
                            <li
                              aria-hidden="true"
                              className="pointer-events-none absolute left-1/2 top-1/2 h-[22%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70"
                            />
                            <li
                              aria-hidden="true"
                              className="pointer-events-none absolute left-[24%] right-[24%] top-[3%] h-[15%] border border-t-0 border-white/70"
                            />
                            <li
                              aria-hidden="true"
                              className="pointer-events-none absolute left-[36%] right-[36%] top-[3%] h-[7%] border border-t-0 border-white/70"
                            />
                            <li
                              aria-hidden="true"
                              className="pointer-events-none absolute bottom-[3%] left-[24%] right-[24%] h-[15%] border border-b-0 border-white/70"
                            />
                            <li
                              aria-hidden="true"
                              className="pointer-events-none absolute bottom-[3%] left-[36%] right-[36%] h-[7%] border border-b-0 border-white/70"
                            />
                            {getPitchPositions(lineup).map(({ player, top, left }, index) => {
                              const replacement = getSubstituteForStarter(lineup, player);
                              const replacementContributions = replacement
                                ? getPlayerGoalContributions(
                                    replacement,
                                    lineup.team.name,
                                    goalEvents,
                                  )
                                : null;
                              const replacementScored =
                                replacementContributions?.scored ?? false;
                              const replacementAssisted =
                                replacementContributions?.assisted ?? false;
                              const lineupKey = String(lineup.team.id ?? lineup.team.name);
                              const playerKey = `${lineupKey}:${player.id ?? `${player.name}-${index}`}`;
                              const playerClub = player.club;
                              const isClubSelected =
                                selectedPitchClub?.lineupKey === lineupKey &&
                                selectedPitchClub.playerKey === playerKey;

                              return (
                                <li
                                  key={player.id ?? `${player.name}-${index}`}
                                  className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5 text-center"
                                  style={{ top: `${top}%`, left: `${left}%` }}
                                  aria-label={`${player.number !== null ? `#${player.number} ` : ''}${player.name}${player.position ? `, ${player.position}` : ''}${lineupPlayerDisplayMode === 'name' ? '' : `, ${getLineupPlayerDisplayLabel(player, lineupPlayerDisplayMode, english)}`}${player.substituted ? (english ? ', substituted off' : ', remplacé') : ''}`}
                                  title={`${player.name}${player.position ? ` — ${player.position}` : ''}${lineupPlayerDisplayMode === 'name' ? '' : ` — ${getLineupPlayerDisplayLabel(player, lineupPlayerDisplayMode, english)}`}${player.substituted ? (english ? ' — Substituted off' : ' — Remplacé') : ''}`}
                                >
                                  <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-950/85 text-[11px] font-extrabold text-white shadow-md sm:h-8 sm:w-8 sm:text-xs">
                                    {player.number ?? '—'}
                                  </span>
                                  {player.position && (
                                    <span className="rounded bg-slate-950/70 px-1 py-0.5 text-[8px] font-bold leading-none text-emerald-100 shadow-sm">
                                      {player.position}
                                    </span>
                                  )}
                                  <span className="inline-flex max-w-[5rem] items-center gap-1 rounded bg-slate-950/70 px-1 py-0.5 text-[9px] font-semibold leading-tight text-white shadow-sm sm:max-w-[6rem] sm:text-[10px]">
                                    {lineupPlayerDisplayMode === 'club' ? (
                                      playerClub ? (
                                        <button
                                          type="button"
                                          aria-expanded={isClubSelected}
                                          aria-label={
                                            english
                                              ? `Show ${playerClub.name} club details`
                                              : `Afficher les détails du club ${playerClub.name}`
                                          }
                                          title={
                                            english
                                              ? `Show ${playerClub.name} club details`
                                              : `Afficher les détails du club ${playerClub.name}`
                                          }
                                          onClick={() =>
                                            setSelectedPitchClub((current) =>
                                              current?.playerKey === playerKey
                                                ? null
                                                : {
                                                    lineupKey,
                                                    playerKey,
                                                    club: playerClub,
                                                  },
                                            )
                                          }
                                          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 p-1 transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                        >
                                          {playerClub.logo ? (
                                            <Image
                                              src={playerClub.logo}
                                              alt=""
                                              width={20}
                                              height={20}
                                              className="h-full w-full object-contain"
                                            />
                                          ) : (
                                            <span aria-hidden="true" className="text-[10px] font-bold">
                                              {playerClub.name.slice(0, 1)}
                                            </span>
                                          )}
                                        </button>
                                      ) : (
                                        <span
                                          title={english ? 'Club unavailable' : 'Club indisponible'}
                                          aria-hidden="true"
                                        >
                                          —
                                        </span>
                                      )
                                    ) : (
                                      <span className="min-w-0 truncate">
                                        {getLineupPlayerDisplayLabel(
                                          player,
                                          lineupPlayerDisplayMode,
                                          english,
                                        )}
                                      </span>
                                    )}
                                    <PlayerGoalContributionMarkers
                                      player={player}
                                      teamName={lineup.team.name}
                                      goalEvents={goalEvents}
                                      english={english}
                                    />
                                    {showPlayerRatings && (
                                      <PlayerRatingBadge player={player} english={english} />
                                    )}
                                    {player.substituted && (
                                      <span
                                        className="shrink-0 font-bold text-amber-300"
                                        aria-hidden="true"
                                      >
                                        ↔
                                      </span>
                                    )}
                                  </span>
                                  {replacement &&
                                    (showPlayerRatings ||
                                      replacementScored ||
                                      replacementAssisted) && (
                                      <span className="inline-flex max-w-[5rem] items-center gap-1 rounded bg-slate-950/80 px-1 py-0.5 text-[8px] font-semibold leading-tight text-white shadow-sm sm:max-w-[6rem] sm:text-[9px]">
                                        <span className="min-w-0 truncate">
                                          {replacement.name}
                                        </span>
                                        <PlayerGoalContributionMarkers
                                          player={replacement}
                                          teamName={lineup.team.name}
                                          goalEvents={goalEvents}
                                          english={english}
                                        />
                                        {showPlayerRatings && (
                                          <PlayerRatingBadge
                                            player={replacement}
                                            english={english}
                                          />
                                        )}
                                      </span>
                                    )}
                                </li>
                              );
                            })}
                            {lineupPlayerDisplayMode === 'club' &&
                              selectedPitchClub?.lineupKey ===
                                String(lineup.team.id ?? lineup.team.name) && (
                                  <li className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/50 p-3">
                                    <div
                                      aria-label={
                                        english
                                          ? `${selectedPitchClub.club.name} club details`
                                          : `Détails du club ${selectedPitchClub.club.name}`
                                      }
                                      className="flex w-full max-w-[18rem] items-center gap-3 rounded-xl border border-white/20 bg-slate-950/95 p-3 text-left text-white shadow-xl"
                                    >
                                      {selectedPitchClub.club.logo && (
                                        <Image
                                          src={selectedPitchClub.club.logo}
                                          alt=""
                                          width={40}
                                          height={40}
                                          className="h-10 w-10 shrink-0 object-contain"
                                        />
                                      )}
                                      <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-bold">
                                          {selectedPitchClub.club.name}
                                        </p>
                                        <p className="mt-0.5 text-xs text-white/75">
                                          {[
                                            selectedPitchClub.club.league,
                                            getCountryDisplayName(
                                              selectedPitchClub.club.countryCode,
                                              english,
                                            ),
                                          ]
                                            .filter(Boolean)
                                            .join(' · ') ||
                                            (english
                                              ? 'League details unavailable'
                                              : 'Détails de la ligue indisponibles')}
                                        </p>
                                      </div>
                                      <button
                                        type="button"
                                        aria-label={
                                          english
                                            ? 'Close club details'
                                            : 'Fermer les détails du club'
                                        }
                                        onClick={() => setSelectedPitchClub(null)}
                                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/75 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                      >
                                        <X aria-hidden="true" className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </li>
                                )}
                          </ol>
                          <div className="mt-5">
                            <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                              {english ? 'Starting players' : 'Joueurs titulaires'}
                            </h4>
                            <ol className="grid gap-1.5 sm:grid-cols-2">
                              {lineup.startingXI.map((player, index) => (
                                <li
                                  key={player.id ?? `${player.name}-${index}`}
                                  className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted/50"
                                >
                                  <span className="inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-md bg-muted px-1 text-xs font-bold text-foreground">
                                    {player.number ?? '—'}
                                  </span>
                                  <span
                                    className="inline-flex min-w-0 flex-1 items-center gap-1.5 break-words leading-snug text-foreground"
                                    aria-label={`${player.name}${lineupPlayerDisplayMode === 'name' ? '' : `, ${getLineupPlayerDisplayLabel(player, lineupPlayerDisplayMode, english)}`}`}
                                    title={player.name}
                                  >
                                    {lineupPlayerDisplayMode === 'club' && player.club?.logo && (
                                      <Image
                                        src={player.club.logo}
                                        alt=""
                                        width={18}
                                        height={18}
                                        className="h-[18px] w-[18px] shrink-0 object-contain"
                                      />
                                    )}
                                    <span className="min-w-0 break-words">
                                      {getLineupPlayerDisplayLabel(
                                        player,
                                        lineupPlayerDisplayMode,
                                        english,
                                      )}
                                    </span>
                                    <PlayerGoalContributionMarkers
                                      player={player}
                                      teamName={lineup.team.name}
                                      goalEvents={goalEvents}
                                      english={english}
                                    />
                                    {showPlayerRatings && (
                                      <PlayerRatingBadge player={player} english={english} />
                                    )}
                                  </span>
                                  {player.substituted && (
                                    <span
                                      className="shrink-0 text-xs font-bold text-amber-600 dark:text-amber-400"
                                      title={english ? 'Substituted off' : 'A été remplacé'}
                                      aria-label={english ? 'Substituted off' : 'A été remplacé'}
                                    >
                                      ↔
                                    </span>
                                  )}
                                  {player.position && (
                                    <span className="shrink-0 text-xs text-muted-foreground">
                                      {player.position}
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ol>
                          </div>
                          <div className="mt-5">
                            <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                              {english ? 'Substitutes' : 'Remplaçants'}
                            </h4>
                            {lineup.substitutes.length > 0 ? (
                              <ol className="space-y-1.5">
                                {lineup.substitutes.map((player, index) => (
                                  <li
                                    key={player.id ?? `${player.name}-${index}`}
                                    className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted/50"
                                  >
                                    <span className="inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-md bg-muted px-1 text-xs font-bold text-foreground">
                                      {player.number ?? '—'}
                                    </span>
                                    <span
                                      className="inline-flex min-w-0 flex-1 items-center gap-1.5 text-foreground"
                                      title={player.name}
                                      aria-label={`${player.name}${lineupPlayerDisplayMode === 'name' ? '' : `, ${getLineupPlayerDisplayLabel(player, lineupPlayerDisplayMode, english)}`}`}
                                    >
                                      {lineupPlayerDisplayMode === 'club' && player.club?.logo && (
                                        <Image
                                          src={player.club.logo}
                                          alt=""
                                          width={18}
                                          height={18}
                                          className="h-[18px] w-[18px] shrink-0 object-contain"
                                        />
                                      )}
                                      <span className="min-w-0 truncate">
                                        {getLineupPlayerDisplayLabel(
                                          player,
                                          lineupPlayerDisplayMode,
                                          english,
                                        )}
                                      </span>
                                      <PlayerGoalContributionMarkers
                                        player={player}
                                        teamName={lineup.team.name}
                                        goalEvents={goalEvents}
                                        english={english}
                                      />
                                      {showPlayerRatings && (
                                        <PlayerRatingBadge player={player} english={english} />
                                      )}
                                    </span>
                                    {player.isOnField && (
                                      <span className="shrink-0 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                                        {english ? 'On field' : 'Sur le terrain'}
                                      </span>
                                    )}
                                    {player.substituted && (
                                      <span className="shrink-0 text-[10px] font-semibold text-muted-foreground">
                                        {english ? 'Substituted' : 'Remplacé'}
                                      </span>
                                    )}
                                    {player.position && (
                                      <span className="shrink-0 text-xs text-muted-foreground">
                                        {player.position}
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ol>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                {english ? 'No substitutes listed.' : 'Aucun remplaçant indiqué.'}
                              </p>
                            )}
                            {lineup.coach && (
                              <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
                                {english ? 'Coach:' : 'Entraîneur :'} {lineup.coach}
                              </p>
                            )}
                          </div>
                        </div>
                      </section>
                    ))}
                    </div>
                  </div>
                )
              ) : detailsUnavailable.standings ? (
                <p role="status" className="rounded-xl border border-border bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
                  {english
                    ? 'Standings are temporarily unavailable.'
                    : 'Le classement est temporairement indisponible.'}
                </p>
              ) : !standings ? (
                <p className="rounded-xl border border-border bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
                  {english
                    ? 'No standings are available for this competition.'
                    : 'Aucun classement n’est disponible pour cette compétition.'}
                </p>
              ) : (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <h3 className="break-words text-base font-semibold text-foreground sm:text-lg">
                      {standings.league}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {standings.season !== null && (
                        <span className="rounded-full border border-border px-2 py-1">
                          {english ? 'Season' : 'Saison'} {standings.season}
                        </span>
                      )}
                      {selectedMatch?.league.round && (
                        <span className="rounded-full border border-border px-2 py-1">
                          {getMatchRoundLabel(selectedMatch.league.round, english)}
                        </span>
                      )}
                    </div>
                  </div>
                  {standings.groups.map((group, groupIndex) => (
                    <section key={group.name ?? groupIndex} className="rounded-xl border border-border">
                      {group.name && (
                        <h4 className="border-b border-border bg-muted/40 px-3 py-2 text-sm font-semibold text-foreground">
                          {group.name}
                        </h4>
                      )}
                      <p className="px-3 py-2 text-[10px] text-muted-foreground sm:hidden">
                        {english
                          ? 'Swipe horizontally to see all standings.'
                          : 'Faites défiler horizontalement pour voir tout le classement.'}
                      </p>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[49rem] table-fixed text-left text-xs">
                          <thead className="bg-muted/30 text-muted-foreground">
                            <tr>
                              <th className="sticky left-0 z-20 w-[10rem] min-w-[10rem] bg-muted px-3 py-2 font-semibold sm:w-[14rem] sm:min-w-[14rem]">
                                {english ? 'Team' : 'Équipe'}
                              </th>
                              <th title={english ? 'Matches played' : 'Matchs joués'} className="px-2 py-2 text-center font-semibold">
                                {english ? 'P' : 'MJ'}
                              </th>
                              <th title={english ? 'Wins' : 'Victoires'} className="px-2 py-2 text-center font-semibold">
                                {english ? 'W' : 'V'}
                              </th>
                              <th title={english ? 'Draws' : 'Nuls'} className="px-2 py-2 text-center font-semibold">
                                {english ? 'D' : 'N'}
                              </th>
                              <th title={english ? 'Losses' : 'Défaites'} className="px-2 py-2 text-center font-semibold">
                                {english ? 'L' : 'D'}
                              </th>
                              <th title={english ? 'Goals for' : 'Buts pour'} className="px-2 py-2 text-center font-semibold">
                                {english ? 'GF' : 'BP'}
                              </th>
                              <th title={english ? 'Goals against' : 'Buts contre'} className="px-2 py-2 text-center font-semibold">
                                {english ? 'GA' : 'BC'}
                              </th>
                              <th title={english ? 'Goal difference' : 'Différence de buts'} className="px-2 py-2 text-center font-semibold">
                                {english ? 'GD' : 'DB'}
                              </th>
                              <th title={english ? 'Points' : 'Points'} className="px-2 py-2 text-center font-semibold">
                                Pts
                              </th>
                              <th className="px-3 py-2 text-center font-semibold">
                                {english ? 'Trend' : 'Tendance'}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {group.entries.map((entry) => {
                              const isMatchTeam =
                                entry.team.id !== null &&
                                (entry.team.id === selectedMatch?.teams.home.id ||
                                  entry.team.id === selectedMatch?.teams.away.id);
                              const teamHref = getTeamSeasonPath(
                                locale,
                                entry.team,
                                standings,
                                selectedMatch?.league.season ?? null,
                              );
                              const teamContent = (
                                <span className="flex min-w-0 items-center gap-2">
                                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-foreground">
                                    {entry.rank}
                                  </span>
                                  {entry.team.logo && (
                                    <Image
                                      src={entry.team.logo}
                                      alt=""
                                      width={20}
                                      height={20}
                                      className="h-5 w-5 shrink-0 object-contain"
                                    />
                                  )}
                                  <span className="min-w-0 break-words leading-tight text-foreground">
                                    {entry.team.name}
                                  </span>
                                </span>
                              );
                              return (
                                <tr
                                  key={entry.team.id ?? `${groupIndex}-${entry.rank}-${entry.team.name}`}
                                  className={isMatchTeam ? 'bg-primary/5 font-semibold' : ''}
                                >
                                  <td
                                    className={`sticky left-0 z-10 w-[10rem] min-w-[10rem] max-w-[10rem] border-r border-border/70 px-3 py-2 sm:w-[14rem] sm:min-w-[14rem] sm:max-w-[14rem] ${
                                      isMatchTeam ? 'bg-primary/10' : 'bg-card'
                                    }`}
                                  >
                                    {teamHref ? (
                                      <Link
                                        href={teamHref}
                                        prefetch={false}
                                        title={entry.team.name}
                                        className="block rounded-sm hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                                      >
                                        {teamContent}
                                      </Link>
                                    ) : (
                                      teamContent
                                    )}
                                  </td>
                                  <td className="px-2 py-2 text-center text-muted-foreground">
                                    {entry.played ?? '—'}
                                  </td>
                                  <td className="px-2 py-2 text-center text-muted-foreground">
                                    {entry.wins ?? '—'}
                                  </td>
                                  <td className="px-2 py-2 text-center text-muted-foreground">
                                    {entry.draws ?? '—'}
                                  </td>
                                  <td className="px-2 py-2 text-center text-muted-foreground">
                                    {entry.losses ?? '—'}
                                  </td>
                                  <td className="px-2 py-2 text-center text-muted-foreground">
                                    {entry.goalsFor ?? '—'}
                                  </td>
                                  <td className="px-2 py-2 text-center text-muted-foreground">
                                    {entry.goalsAgainst ?? '—'}
                                  </td>
                                  <td className="px-2 py-2 text-center text-muted-foreground">
                                    {entry.goalsDiff > 0 ? `+${entry.goalsDiff}` : entry.goalsDiff}
                                  </td>
                                  <td className="px-2 py-2 text-center font-bold text-foreground">
                                    {entry.points}
                                  </td>
                                  <td className="px-3 py-2 text-center text-muted-foreground">
                                    {entry.rankMovement === 0 ? (
                                      <span
                                        aria-label={
                                          english ? 'No rank change' : 'Aucun changement de rang'
                                        }
                                        className="inline-flex items-center text-muted-foreground"
                                      >
                                        <ArrowRight aria-hidden="true" className="h-4 w-4" />
                                      </span>
                                    ) : entry.rankMovement !== null ? (
                                      <span
                                        aria-label={
                                          entry.rankMovement > 0
                                            ? english
                                              ? `Up ${entry.rankMovement} ${entry.rankMovement === 1 ? 'place' : 'places'}`
                                              : `Remonte de ${entry.rankMovement} ${entry.rankMovement === 1 ? 'place' : 'places'}`
                                            : english
                                              ? `Down ${Math.abs(entry.rankMovement)} ${Math.abs(entry.rankMovement) === 1 ? 'place' : 'places'}`
                                              : `Recule de ${Math.abs(entry.rankMovement)} ${Math.abs(entry.rankMovement) === 1 ? 'place' : 'places'}`
                                        }
                                        className={`inline-flex items-center gap-1 font-semibold ${
                                          entry.rankMovement > 0
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-red-600 dark:text-red-400'
                                        }`}
                                      >
                                        {entry.rankMovement > 0 ? (
                                          <ArrowUp aria-hidden="true" className="h-4 w-4" />
                                        ) : (
                                          <ArrowDown aria-hidden="true" className="h-4 w-4" />
                                        )}
                                        {Math.abs(entry.rankMovement)}
                                      </span>
                                    ) : (
                                      entry.form ?? '—'
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </div>
          </section>
        </dialog>
      )}
    </section>
  );
}
