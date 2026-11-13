'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import {
  Activity,
  ArrowLeftRight,
  ChevronDown,
  CircleAlert,
  CircleDot,
  Clock3,
  LoaderCircle,
  Pin,
  RefreshCw,
  Search,
  Star,
  Trophy,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { authFetch } from '@/lib/client-auth';
import { enableFootballMatchNotifications } from '@/lib/match-notification-client';
import { useAccountUser } from '@/lib/use-account-user';
import type {
  ESPNScoreboardMatch,
  LiveMatchEvent,
  LiveScoreMatch,
  MatchDetailsData,
  MatchLineup,
  MatchLineupPlayer,
  MatchStandingEntry,
  MatchStandings,
  MatchStatistic,
} from '@/types/live-scores';

type LiveScoresProps = {
  locale?: string;
};

const REFRESH_INTERVAL_MS = 60_000;
const FAVORITES_STORAGE_KEY = 'malakinfo-live-match-favorites';
const favoriteSubscribers = new Set<() => void>();
type ScoresView = 'live' | 'upcoming' | 'finished';
type FollowedFootballTeam = {
  espnTeamId: string;
  name: string;
  logo: string | null;
};
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
    typeof value.isOnField === 'boolean' &&
    typeof value.substituted === 'boolean' &&
    (value.club === null ||
      (isRecord(value.club) &&
        isNullableNumber(value.club.id) &&
        typeof value.club.name === 'string' &&
        isNullableString(value.club.logo)))
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
    isNullableString(value.form) &&
    isNullableString(value.description)
  );
}

function isMatchStandings(value: unknown): value is MatchStandings {
  return (
    isRecord(value) &&
    typeof value.league === 'string' &&
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

type MatchEventKind = 'goal' | 'missed-penalty' | 'yellow-card' | 'red-card' | 'substitution' | 'other';

function getMatchEventKind(event: LiveMatchEvent): MatchEventKind {
  const type = event.type.toLowerCase();
  const detail = event.detail?.toLowerCase() ?? '';

  if (type === 'goal' && detail.includes('missed penalty')) return 'missed-penalty';
  if (type === 'goal') return 'goal';
  if (type === 'card') {
    return detail.includes('red') || detail.includes('second yellow')
      ? 'red-card'
      : 'yellow-card';
  }
  if (type === 'subst' || type === 'substitution') return 'substitution';
  return 'other';
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
      const cardComment = sourceComment?.toLowerCase() === 'foul'
        ? english
          ? 'For a foul.'
          : 'Pour une faute.'
        : sourceComment?.toLowerCase() === 'dissent'
          ? english
            ? 'For dissent.'
            : 'Pour contestation.'
          : sourceComment;
      return [base, cardComment]
        .filter((value): value is string => Boolean(value))
        .filter((value, index, values) => values.indexOf(value) === index)
        .join(' ');
    }
    return event.comments?.trim() || null;
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
): Array<string | null> {
  let homeGoals = 0;
  let awayGoals = 0;

  return events.map((event) => {
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
      const scoringHome = event.team.name === match.teams.home.name;
      const scoringAway = event.team.name === match.teams.away.name;
      if (scoringHome || scoringAway) {
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
      }
    }

    return getEventCommentary(event, kind, english, scoreAfterGoal);
  });
}

export default function LiveScores({ locale = 'fr' }: LiveScoresProps) {
  const english = locale === 'en';
  const { user, ready: accountReady } = useAccountUser();
  const [view, setView] = useState<ScoresView>('live');
  const [finishedDaysAgo, setFinishedDaysAgo] = useState<0 | 1 | 2>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [teamHistoryName, setTeamHistoryName] = useState<string | null>(null);
  const [teamHistoryVisibleCount, setTeamHistoryVisibleCount] = useState(5);
  const [selectedCompetition, setSelectedCompetition] = useState('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [matches, setMatches] = useState<LiveScoreMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [selectedFixtureId, setSelectedFixtureId] = useState<number | null>(null);
  const [events, setEvents] = useState<LiveMatchEvent[]>([]);
  const [statistics, setStatistics] = useState<MatchStatistic[]>([]);
  const [lineups, setLineups] = useState<MatchLineup[]>([]);
  const [standings, setStandings] = useState<MatchStandings | null>(null);
  const [detailsUnavailable, setDetailsUnavailable] = useState({
    lineups: false,
    standings: false,
  });
  const [activeDetailsTab, setActiveDetailsTab] = useState<'events' | 'lineups' | 'standings'>('events');
  const [lineupPlayerDisplayMode, setLineupPlayerDisplayMode] =
    useState<LineupPlayerDisplayMode>('name');
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
        if (view === 'finished' && nextSearchQuery !== debouncedSearchQuery) {
          setIsLoading(true);
          setHasError(false);
        }
      },
      400,
    );
    return () => window.clearTimeout(timeoutId);
  }, [debouncedSearchQuery, searchQuery, view]);

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
    () => Array.from(new Set(matches.map((match) => match.league.name))).sort((a, b) => a.localeCompare(b)),
    [matches],
  );
  const normalizedDebouncedSearch = normalizeSearch(debouncedSearchQuery);
  const isMatchupSearch = /\s+(?:vs\.?|contre)\s+/.test(normalizedDebouncedSearch);
  const teamHistoryQuery =
    view === 'finished' && normalizedDebouncedSearch.length >= 3 && !isMatchupSearch
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
          (selectedCompetition === 'all' || match.league.name === selectedCompetition) &&
          (!favoritesOnly || favoriteIds.includes(match.fixture.id))
        );
      })
      .sort(
        (a, b) => teamHistoryName
          ? (b.fixture.date ?? '').localeCompare(a.fixture.date ?? '')
          : Number(favoriteIds.includes(b.fixture.id)) -
            Number(favoriteIds.includes(a.fixture.id)),
      );
  }, [favoriteIds, favoritesOnly, matches, searchQuery, selectedCompetition, teamHistoryName]);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const selectedMatch = matches.find((match) => match.fixture.id === selectedFixtureId);
  const preMatchLineups =
    selectedMatch?.state === 'pre'
      ? lineups.filter((lineup) => lineup.startingXI.length >= 11)
      : [];
  const lineupsToDisplay = selectedMatch?.state === 'pre' ? preMatchLineups : lineups;
  const eventCommentaries = getMatchCommentaries(events, selectedMatch, english);
  const matchesToRender = teamHistoryName
    ? visibleMatches.slice(0, teamHistoryVisibleCount)
    : visibleMatches;
  const finishedDateLabel =
    finishedDaysAgo === 0
      ? english
        ? 'today'
        : 'aujourd’hui'
      : finishedDaysAgo === 1
        ? english
          ? 'yesterday'
          : 'hier'
        : english
          ? 'two days ago'
          : 'avant-hier';

  useEffect(() => {
    let isMounted = true;

    async function refreshScores() {
      try {
        const searchParams = new URLSearchParams();
        if (view === 'finished') {
          searchParams.set('view', 'finished');
          searchParams.set('daysAgo', String(finishedDaysAgo));
          if (teamHistoryQuery) searchParams.set('team', teamHistoryQuery);
        }
        if (view === 'upcoming') searchParams.set('view', 'upcoming');
        const endpoint =
          view === 'live' ? '/api/live-scores' : `/api/live-scores?${searchParams.toString()}`;
        const response = await fetch(endpoint, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Scores API responded with HTTP ${response.status}.`);
        }

        const payload: unknown = await response.json();
        if (
          !isRecord(payload) ||
          !Array.isArray(payload.matches) ||
          !payload.matches.every(isESPNScoreboardMatch)
        ) {
          throw new Error('Scores API returned an invalid response.');
        }

        if (isMounted) {
          setMatches(payload.matches.map(toLiveScoreMatch));
          setTeamHistoryName(typeof payload.teamName === 'string' ? payload.teamName : null);
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
  }, [finishedDaysAgo, teamHistoryQuery, view]);

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
    const intervalId = window.setInterval(loadMatchDetails, REFRESH_INTERVAL_MS);

    return () => {
      controller.abort();
      window.clearInterval(intervalId);
    };
  }, [selectedFixtureId]);

  function openMatchDetails(fixtureId: number) {
    setEvents([]);
    setStatistics([]);
    setLineups([]);
    setStandings(null);
    setDetailsUnavailable({ lineups: false, standings: false });
    setEventsError(false);
    setActiveDetailsTab('events');
    setIsDetailsLoading(true);
    setSelectedFixtureId(fixtureId);
  }

  function changeView(nextView: ScoresView) {
    if (nextView === view) return;
    setMatches([]);
    setHasError(false);
    setTeamHistoryName(null);
    setTeamHistoryVisibleCount(5);
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
            onClick={() => changeView('live')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              view === 'live'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {english ? 'Live' : 'En direct'}
          </button>
          <button
            type="button"
            aria-pressed={view === 'upcoming'}
            onClick={() => changeView('upcoming')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              view === 'upcoming'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {english ? 'Upcoming' : 'À venir'}
          </button>
          <button
            type="button"
            aria-pressed={view === 'finished'}
            onClick={() => changeView('finished')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              view === 'finished'
                ? 'bg-primary text-primary-foreground'
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
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => {
                setTeamHistoryName(null);
                setTeamHistoryVisibleCount(5);
                setSearchQuery(event.target.value);
              }}
              placeholder={english ? 'Search a team or match (e.g. France vs Spain)' : 'Rechercher une équipe ou un match (ex. France vs Espagne)'}
              aria-label={english ? 'Search teams or matches' : 'Rechercher une équipe ou un match'}
              className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
            />
          </label>
          {view === 'finished' && !teamHistoryName && (
            <>
              <label className="sr-only" htmlFor="live-scores-finished-day">
                {english ? 'Filter finished matches by date' : 'Filtrer les matches terminés par date'}
              </label>
              <select
                id="live-scores-finished-day"
                value={finishedDaysAgo}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  const daysAgo = value === '2' ? 2 : value === '1' ? 1 : 0;
                  setMatches([]);
                  setHasError(false);
                  setIsLoading(true);
                  setUpdatedAt(null);
                  setSelectedCompetition('all');
                  setFinishedDaysAgo(daysAgo);
                }}
                aria-label={english ? 'Filter finished matches by date' : 'Filtrer les matches terminés par date'}
                className="h-11 w-full min-w-0 max-w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary sm:w-auto"
              >
                <option value={0}>{english ? 'Today' : 'Aujourd’hui'}</option>
                <option value={1}>{english ? 'Yesterday' : 'Hier'}</option>
                <option value={2}>{english ? 'Two days ago' : 'Avant-hier'}</option>
              </select>
            </>
          )}
          <label className="sr-only" htmlFor="live-scores-competition">
            {english ? 'Filter by competition' : 'Filtrer par compétition'}
          </label>
          <select
            id="live-scores-competition"
            value={selectedCompetition}
            onChange={(event) => setSelectedCompetition(event.target.value)}
            aria-label={english ? 'Filter by competition' : 'Filtrer par compétition'}
            className="h-11 w-full min-w-0 max-w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary sm:w-auto"
          >
            <option value="all">{english ? 'All competitions' : 'Toutes les compétitions'}</option>
            {competitions.map((competition) => (
              <option key={competition} value={competition}>
                {competition}
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
                const kickoffLabel = getKickoffLabel(match.fixture.date, english);
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
                    <div className="mb-4 flex items-center justify-between gap-3 pl-10">
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
                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
                          match.state === 'in'
                            ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                            : match.state === 'pre'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                              : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {match.state === 'in' ? (
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                        ) : (
                          match.state === 'pre' ? (
                            <Clock3 className="h-3 w-3" aria-hidden="true" />
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
                        {english ? 'Kick-off:' : 'Coup d’envoi :'} {kickoffLabel}
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
            {teamHistoryName && matchesToRender.length < visibleMatches.length && (
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    setTeamHistoryVisibleCount((count) =>
                      Math.min(count + 5, visibleMatches.length),
                    )
                  }
                  className="inline-flex min-h-11 max-w-full items-center justify-center whitespace-normal break-words rounded-xl border border-primary px-5 py-2.5 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {english
                    ? `View more past matches for ${teamHistoryName}`
                    : `Voir plus de matches passés de ${teamHistoryName}`}
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
                ? english
                  ? 'No upcoming matches.'
                  : 'Aucun match à venir pour le moment.'
                : english
                  ? 'No completed matches today.'
                  : "Aucun match terminé aujourd'hui."}
          </p>
        )}
      </div>

      {selectedFixtureId !== null && (
        <dialog
          ref={dialogRef}
          aria-labelledby="match-details-title"
          onCancel={(event) => {
            event.preventDefault();
            setSelectedFixtureId(null);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              setSelectedFixtureId(null);
            }
          }}
          className="fixed inset-0 m-0 flex h-dvh max-h-dvh w-full max-w-full items-center justify-center overflow-hidden border-0 bg-transparent p-3 text-foreground sm:p-6"
        >
          <div
            aria-hidden="true"
            onClick={() => setSelectedFixtureId(null)}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
          />
          <section className="relative z-10 mx-auto flex h-[92dvh] max-h-[92dvh] w-full min-w-0 max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                  {english ? 'Match details' : 'Détails du match'}
                </p>
                <h2 id="match-details-title" className="text-lg font-bold text-foreground sm:text-xl">
                  {selectedMatch
                    ? `${selectedMatch.teams.home.name} – ${selectedMatch.teams.away.name}`
                    : english
                      ? `Match ${selectedFixtureId}`
                      : `Match ${selectedFixtureId}`}
                </h2>
                {selectedMatch && (
                  <p className="mt-1 text-sm font-semibold text-muted-foreground">
                    {selectedMatch.goals.home ?? '–'} : {selectedMatch.goals.away ?? '–'}
                  </p>
                )}
              </div>
              <button
                type="button"
                autoFocus
                onClick={() => setSelectedFixtureId(null)}
                aria-label={english ? 'Close match details' : 'Fermer les détails du match'}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </header>

            <div
              role="tablist"
              aria-label={english ? 'Match information' : 'Informations du match'}
              className="flex shrink-0 gap-1 overflow-x-auto border-b border-border px-4 py-2 sm:px-6"
            >
              {([
                ['events', english ? 'Highlights' : 'Temps forts'],
                ['lineups', english ? 'Lineups' : 'Compositions'],
                ['standings', english ? 'Standings' : 'Classement'],
              ] as const).map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeDetailsTab === tab}
                  onClick={() => setActiveDetailsTab(tab)}
                  className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    activeDetailsTab === tab
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
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
                          onClick={() => setActiveDetailsTab('lineups')}
                          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        >
                          {english ? 'View lineups on the pitch' : 'Voir les compositions sur le terrain'}
                        </button>
                      </div>
                    </section>
                  )}
                  {statistics.length > 0 && (
                    <section className="mb-5 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
                      <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                        {english ? 'Match statistics' : 'Statistiques du match'}
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {statistics.map((stat) => {
                          const homeValue = Number.parseFloat(stat.home ?? '');
                          const awayValue = Number.parseFloat(stat.away ?? '');
                          const total = homeValue + awayValue;
                          const homeWidth = Number.isFinite(total) && total > 0
                            ? (homeValue / total) * 100
                            : 50;
                          const comparable = Number.isFinite(homeValue) && Number.isFinite(awayValue);
                          const tied = comparable && homeValue === awayValue;
                          const disciplineMetric = [
                            'foulsCommitted',
                            'yellowCards',
                            'redCards',
                          ].includes(stat.name);
                          const homeHasAdvantage = comparable && (
                            disciplineMetric ? homeValue < awayValue : homeValue > awayValue
                          );
                          const awayHasAdvantage = comparable && (
                            disciplineMetric ? awayValue < homeValue : awayValue > homeValue
                          );
                          const homeValueColor = !comparable || tied
                            ? 'text-foreground'
                            : homeHasAdvantage
                              ? 'text-blue-700 dark:text-blue-300'
                              : 'text-red-700 dark:text-red-300';
                          const awayValueColor = !comparable || tied
                            ? 'text-foreground'
                            : awayHasAdvantage
                              ? 'text-blue-700 dark:text-blue-300'
                              : 'text-red-700 dark:text-red-300';
                          const homeBarColor = !comparable || tied
                            ? 'bg-slate-400'
                            : homeHasAdvantage
                              ? 'bg-blue-600 dark:bg-blue-400'
                              : 'bg-red-500 dark:bg-red-400';
                          const awayBarColor = !comparable || tied
                            ? 'bg-slate-300 dark:bg-slate-700'
                            : awayHasAdvantage
                              ? 'bg-blue-600 dark:bg-blue-400'
                              : 'bg-red-500 dark:bg-red-400';
                          const cardColor =
                            stat.name === 'yellowCards'
                              ? 'bg-amber-400'
                              : stat.name === 'redCards'
                                ? 'bg-red-600'
                                : null;
                          const cardCount = (value: string | null) => {
                            const count = Number.parseInt(value ?? '', 10);
                            return Number.isFinite(count) ? Math.min(Math.max(count, 0), 5) : 0;
                          };
                          const label =
                            stat.name === 'possessionPct'
                              ? english ? 'Possession' : 'Possession'
                              : stat.name === 'shotsOnTarget'
                                ? english ? 'Shots on target' : 'Tirs cadrés'
                                : stat.name === 'totalShots'
                                  ? english ? 'Total shots' : 'Tirs'
                                  : stat.name === 'wonCorners'
                                    ? english ? 'Corners' : 'Corners'
                                    : stat.name === 'foulsCommitted'
                                      ? english ? 'Fouls' : 'Fautes'
                                      : stat.name === 'yellowCards'
                                        ? english ? 'Yellow cards' : 'Cartons jaunes'
                                        : stat.name === 'redCards'
                                          ? english ? 'Red cards' : 'Cartons rouges'
                                          : stat.label;

                          return (
                            <div key={stat.name} className="rounded-xl border border-border/80 bg-background/70 p-3">
                              <div className="mb-2 flex items-center justify-between gap-2 text-sm">
                                <span className={`flex min-w-0 items-center gap-1.5 font-bold tabular-nums ${homeValueColor}`}>
                                  {cardColor &&
                                    Array.from({ length: cardCount(stat.home) }, (_, index) => (
                                      <span
                                        key={`home-card-${index}`}
                                        aria-hidden="true"
                                        className={`h-3.5 w-2.5 rounded-[2px] ${cardColor}`}
                                      />
                                    ))}
                                  {stat.home ?? '—'}
                                </span>
                                <span className="flex items-center justify-center gap-1.5 text-center text-[11px] font-semibold leading-tight text-muted-foreground sm:text-xs">
                                  {cardColor && (
                                    <span
                                      aria-hidden="true"
                                      className={`h-3.5 w-2.5 shrink-0 rounded-[2px] ${cardColor}`}
                                    />
                                  )}
                                  {label}
                                </span>
                                <span className={`flex min-w-0 items-center justify-end gap-1 font-bold tabular-nums ${awayValueColor}`}>
                                  {cardColor &&
                                    Array.from({ length: cardCount(stat.away) }, (_, index) => (
                                      <span
                                        key={`away-card-${index}`}
                                        aria-hidden="true"
                                        className={`h-3.5 w-2.5 rounded-[2px] ${cardColor}`}
                                      />
                                    ))}
                                  {stat.away ?? '—'}
                                </span>
                              </div>
                              <div
                                aria-hidden="true"
                                className="flex h-2 overflow-hidden rounded-full bg-muted"
                              >
                                <span
                                  className={`h-full transition-[width] duration-500 ${homeBarColor}`}
                                  style={{ width: `${homeWidth}%` }}
                                />
                                <span
                                  className={`h-full transition-[width] duration-500 ${awayBarColor}`}
                                  style={{ width: `${100 - homeWidth}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
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
                        const Icon =
                          kind === 'substitution'
                            ? ArrowLeftRight
                            : kind === 'other' || kind === 'missed-penalty'
                              ? CircleAlert
                              : CircleDot;
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

                            <div className="min-w-0 flex-1 rounded-xl border border-border bg-card px-4 py-3">
                              <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
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

                              <p className="text-sm font-semibold text-foreground">
                                {kind === 'missed-penalty'
                                  ? english
                                    ? 'Penalty missed'
                                    : 'Penalty manqué'
                                  : kind === 'goal'
                                    ? english
                                      ? 'Goal'
                                      : 'But'
                                    : kind === 'yellow-card'
                                      ? english
                                        ? 'Yellow card'
                                        : 'Carton jaune'
                                      : kind === 'red-card'
                                        ? english
                                          ? 'Red card'
                                          : 'Carton rouge'
                                        : kind === 'substitution'
                                          ? english
                                            ? 'Substitution'
                                            : 'Remplacement'
                                          : detail ?? event.type}
                              </p>

                              {kind === 'substitution' ? (
                                <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                                  {event.player.name && (
                                    <p>
                                      {english ? 'Out:' : 'Sortie :'}{' '}
                                      {playerOutNumber !== null ? `#${playerOutNumber} ` : ''}
                                      {event.player.name}
                                    </p>
                                  )}
                                  {event.assist.name && (
                                    <p>
                                      {english ? 'In:' : 'Entrée :'}{' '}
                                      {playerInNumber !== null ? `#${playerInNumber} ` : ''}
                                      {event.assist.name}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                event.player.name && (
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {event.player.name}
                                  </p>
                                )
                              )}

                              {kind === 'goal' && detail && (
                                <p className="mt-1 text-xs font-medium text-primary">{detail}</p>
                              )}
                              {kind === 'goal' && event.assist.name && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {english ? 'Assist:' : 'Passe décisive :'} {event.assist.name}
                                </p>
                              )}
                              {eventCommentaries[index] && (
                                <p className="mt-2 rounded-lg bg-muted/60 px-3 py-2 text-sm leading-relaxed text-foreground">
                                  {eventCommentaries[index]}
                                </p>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </>
              ) : activeDetailsTab === 'lineups' ? (
                selectedMatch?.state === 'pre' && preMatchLineups.length === 0 ? (
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
                    <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                      {english
                        ? 'Lineups and substitutions use ESPN match data and refresh every 60 seconds. ESPN does not provide live player-tracking coordinates.'
                        : 'Les compositions et remplacements suivent les données ESPN et sont actualisés toutes les 60 secondes. ESPN ne fournit pas les coordonnées de déplacement des joueurs en direct.'}
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
                              ? 'Choose player information to display'
                              : 'Choisir les informations des joueurs à afficher'
                          }
                          className="inline-flex max-w-full flex-wrap gap-1 rounded-xl border border-border bg-muted/40 p-1"
                        >
                          {(['name', 'age', 'club'] as const).map((mode) => (
                            <button
                              key={mode}
                              type="button"
                              aria-pressed={lineupPlayerDisplayMode === mode}
                              onClick={() => setLineupPlayerDisplayMode(mode)}
                              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
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
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {english
                          ? 'Player ages and club details are shown when ESPN provides them.'
                          : 'L’âge et le club des joueurs sont affichés lorsque ces données sont disponibles chez ESPN.'}
                      </p>
                    </div>
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
                            {getPitchPositions(lineup).map(({ player, top, left }, index) => (
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
                                <span
                                  className="inline-flex max-w-[5rem] items-center gap-1 rounded bg-slate-950/70 px-1 py-0.5 text-[9px] font-semibold leading-tight text-white shadow-sm sm:max-w-[6rem] sm:text-[10px]"
                                >
                                  {lineupPlayerDisplayMode === 'club' && player.club?.logo && (
                                    <Image
                                      src={player.club.logo}
                                      alt=""
                                      width={14}
                                      height={14}
                                      className="h-3.5 w-3.5 shrink-0 object-contain"
                                    />
                                  )}
                                  <span className="min-w-0 truncate">
                                    {getLineupPlayerDisplayLabel(
                                      player,
                                      lineupPlayerDisplayMode,
                                      english,
                                    )}
                                  </span>
                                  {player.substituted && (
                                    <span className="shrink-0 font-bold text-amber-300" aria-hidden="true">
                                      ↔
                                    </span>
                                  )}
                                </span>
                              </li>
                            ))}
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
                  <h3 className="font-semibold text-foreground">{standings.league}</h3>
                  {standings.groups.map((group, groupIndex) => (
                    <section key={group.name ?? groupIndex} className="overflow-hidden rounded-xl border border-border">
                      {group.name && (
                        <h4 className="border-b border-border bg-muted/40 px-3 py-2 text-sm font-semibold text-foreground">
                          {group.name}
                        </h4>
                      )}
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[34rem] text-left text-xs">
                          <thead className="bg-muted/30 text-muted-foreground">
                            <tr>
                              <th className="px-3 py-2 font-semibold">{english ? '#' : 'Rang'}</th>
                              <th className="px-3 py-2 font-semibold">{english ? 'Team' : 'Équipe'}</th>
                              <th className="px-3 py-2 text-center font-semibold">MJ</th>
                              <th className="px-3 py-2 text-center font-semibold">+/-</th>
                              <th className="px-3 py-2 text-center font-semibold">{english ? 'Pts' : 'Pts'}</th>
                              <th className="px-3 py-2 font-semibold">{english ? 'Form' : 'Forme'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {group.entries.map((entry) => {
                              const isMatchTeam =
                                entry.team.id !== null &&
                                (entry.team.id === selectedMatch?.teams.home.id ||
                                  entry.team.id === selectedMatch?.teams.away.id);
                              return (
                                <tr
                                  key={entry.team.id ?? `${groupIndex}-${entry.rank}-${entry.team.name}`}
                                  className={isMatchTeam ? 'bg-primary/5 font-semibold' : ''}
                                >
                                  <td className="px-3 py-2 text-muted-foreground">{entry.rank}</td>
                                  <td className="px-3 py-2">
                                    <span className="flex items-center gap-2">
                                      {entry.team.logo && (
                                        <Image
                                          src={entry.team.logo}
                                          alt=""
                                          width={20}
                                          height={20}
                                          className="h-5 w-5 object-contain"
                                        />
                                      )}
                                      <span className="text-foreground">{entry.team.name}</span>
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-center text-muted-foreground">
                                    {entry.played ?? '—'}
                                  </td>
                                  <td className="px-3 py-2 text-center text-muted-foreground">
                                    {entry.goalsDiff > 0 ? `+${entry.goalsDiff}` : entry.goalsDiff}
                                  </td>
                                  <td className="px-3 py-2 text-center font-bold text-foreground">
                                    {entry.points}
                                  </td>
                                  <td className="px-3 py-2 text-muted-foreground">
                                    {entry.form ?? '—'}
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
