'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import {
  Activity,
  ArrowLeftRight,
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
import type {
  LiveMatchEvent,
  LiveScoreMatch,
  MatchDetailsData,
  MatchLineup,
  MatchLineupPlayer,
  MatchStandingEntry,
  MatchStandings,
} from '@/types/live-scores';

type LiveScoresProps = {
  locale?: string;
};

const REFRESH_INTERVAL_MS = 300_000;
const FAVORITES_STORAGE_KEY = 'malakinfo-live-match-favorites';
const favoriteSubscribers = new Set<() => void>();
type ScoresView = 'live' | 'finished';
const TEAM_SEARCH_ALIASES: Record<string, string[]> = {
  allemagne: ['germany'],
  angleterre: ['england'],
  'cote d ivoire': ['ivory coast', 'cote divoire'],
  espagne: ['spain'],
  italie: ['italy'],
  'pays bas': ['netherlands'],
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

function isLiveScoreMatch(value: unknown): value is LiveScoreMatch {
  return (
    isRecord(value) &&
    isRecord(value.fixture) &&
    typeof value.fixture.id === 'number' &&
    isNullableString(value.fixture.date) &&
    isNullableString(value.fixture.venue) &&
    isRecord(value.fixture.status) &&
    isNullableNumber(value.fixture.status.elapsed) &&
    isNullableNumber(value.fixture.status.extra) &&
    isNullableString(value.fixture.status.short) &&
    isNullableString(value.fixture.status.long) &&
    isRecord(value.league) &&
    typeof value.league.id === 'number' &&
    isNullableNumber(value.league.season) &&
    typeof value.league.name === 'string' &&
    isNullableString(value.league.logo) &&
    isNullableString(value.league.country) &&
    isNullableString(value.league.round) &&
    isRecord(value.teams) &&
    isRecord(value.teams.home) &&
    isNullableNumber(value.teams.home.id) &&
    typeof value.teams.home.name === 'string' &&
    isNullableString(value.teams.home.logo) &&
    isRecord(value.teams.away) &&
    isNullableNumber(value.teams.away.id) &&
    typeof value.teams.away.name === 'string' &&
    isNullableString(value.teams.away.logo) &&
    isRecord(value.goals) &&
    isNullableNumber(value.goals.home) &&
    isNullableNumber(value.goals.away) &&
    isRecord(value.score) &&
    (value.score.penalty === null ||
      (isRecord(value.score.penalty) &&
        isNullableNumber(value.score.penalty.home) &&
        isNullableNumber(value.score.penalty.away)))
  );
}

function isLiveMatchEvent(value: unknown): value is LiveMatchEvent {
  return (
    isRecord(value) &&
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
    isNullableString(value.grid)
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

function getPitchPositions(lineup: MatchLineup) {
  const players = lineup.startingXI.map((player, index) => {
    const grid = /^(\d+):(\d+)$/.exec(player.grid ?? '');
    const position = player.position?.toUpperCase() ?? '';
    const fallbackRow =
      position === 'G' || position === 'GK' || position.includes('GOALKEEPER')
        ? 1
        : position.startsWith('D')
          ? 2
          : position.startsWith('M')
            ? 3
            : position.startsWith('F') || position.includes('FORWARD')
              ? 4
              : 2;

    return {
      player,
      index,
      row: grid ? Number(grid[1]) : fallbackRow,
      column: grid ? Number(grid[2]) : index,
    };
  });
  const rowNumbers = players.map(({ row }) => row);
  const minRow = Math.min(...rowNumbers);
  const maxRow = Math.max(...rowNumbers);

  return players.map((entry) => {
    const rowPlayers = players
      .filter((player) => player.row === entry.row)
      .sort((a, b) => a.column - b.column || a.index - b.index);
    const positionInRow = rowPlayers.findIndex((player) => player.index === entry.index);
    const progress = maxRow === minRow ? 0.5 : (entry.row - minRow) / (maxRow - minRow);

    return {
      player: entry.player,
      top: 88 - progress * 76,
      left: ((positionInRow + 1) / (rowPlayers.length + 1)) * 100,
    };
  });
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
      return [description, context]
        .filter((value): value is string => Boolean(value))
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
  const [view, setView] = useState<ScoresView>('live');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompetition, setSelectedCompetition] = useState('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [matches, setMatches] = useState<LiveScoreMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [hasRateLimitError, setHasRateLimitError] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [selectedFixtureId, setSelectedFixtureId] = useState<number | null>(null);
  const [events, setEvents] = useState<LiveMatchEvent[]>([]);
  const [lineups, setLineups] = useState<MatchLineup[]>([]);
  const [standings, setStandings] = useState<MatchStandings | null>(null);
  const [detailsUnavailable, setDetailsUnavailable] = useState({
    lineups: false,
    standings: false,
  });
  const [activeDetailsTab, setActiveDetailsTab] = useState<'events' | 'lineups' | 'standings'>('events');
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [eventsError, setEventsError] = useState(false);
  const favoritesSnapshot = useSyncExternalStore(
    subscribeToFavorites,
    getFavoritesSnapshot,
    getServerFavoritesSnapshot,
  );
  const favoriteIds = useMemo(() => parseFavoriteIds(favoritesSnapshot), [favoritesSnapshot]);
  const competitions = useMemo(
    () => Array.from(new Set(matches.map((match) => match.league.name))).sort((a, b) => a.localeCompare(b)),
    [matches],
  );
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
        (a, b) =>
          Number(favoriteIds.includes(b.fixture.id)) - Number(favoriteIds.includes(a.fixture.id)),
      );
  }, [favoriteIds, favoritesOnly, matches, searchQuery, selectedCompetition]);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const selectedMatch = matches.find((match) => match.fixture.id === selectedFixtureId);
  const eventCommentaries = getMatchCommentaries(events, selectedMatch, english);

  useEffect(() => {
    let isMounted = true;

    async function refreshScores() {
      let isRateLimited = false;
      try {
        const endpoint =
          view === 'finished' ? '/api/live-scores?view=finished' : '/api/live-scores';
        const response = await fetch(endpoint, { cache: 'no-store' });
        if (!response.ok) {
          const errorPayload: unknown = await response.json();
          isRateLimited = isRecord(errorPayload) && errorPayload.code === 'RATE_LIMIT';
          const diagnostic =
            isRecord(errorPayload) && typeof errorPayload.diagnostic === 'string'
              ? errorPayload.diagnostic
              : `Scores API responded with HTTP ${response.status}.`;
          throw new Error(diagnostic);
        }

        const payload: unknown = await response.json();
        if (
          !isRecord(payload) ||
          !Array.isArray(payload.matches) ||
          !payload.matches.every(isLiveScoreMatch)
        ) {
          throw new Error('Scores API returned an invalid response.');
        }

        if (isMounted) {
          setMatches(payload.matches);
          setHasError(false);
          setHasRateLimitError(false);
          setUpdatedAt(new Date().toISOString());
        }
      } catch (error) {
        console.error('Unable to refresh live football scores:', error);
        if (isMounted) {
          setHasError(true);
          setHasRateLimitError(isRateLimited);
        }
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

    async function loadMatchDetails() {
      try {
        const searchParams = new URLSearchParams({ id: String(selectedFixtureId) });
        if (selectedMatch?.league.id) {
          searchParams.set('leagueId', String(selectedMatch.league.id));
        }
        if (selectedMatch?.league.season !== null && selectedMatch?.league.season !== undefined) {
          searchParams.set('season', String(selectedMatch.league.season));
        }

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
          setLineups(payload.lineups);
          setStandings(payload.standings);
          setDetailsUnavailable(payload.unavailable);
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Unable to load match details:', error);
        setEventsError(true);
      } finally {
        if (!controller.signal.aborted) setIsDetailsLoading(false);
      }
    }

    void loadMatchDetails();
    return () => controller.abort();
  }, [selectedFixtureId, selectedMatch?.league.id, selectedMatch?.league.season]);

  function openMatchDetails(fixtureId: number) {
    setEvents([]);
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
    setHasRateLimitError(false);
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

  return (
    <section
      aria-labelledby="live-scores-title"
      className="border-y border-border bg-muted/40 py-10 sm:py-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
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
                : english
                  ? 'Completed matches today'
                  : 'Matches terminés aujourd’hui'}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                ? 'Refreshes every 5 minutes'
                : 'Actualisation toutes les 5 minutes'}
          </div>
        </div>

        <div className="mb-6 inline-flex rounded-xl border border-border bg-background p-1" role="group" aria-label={english ? 'Choose matches view' : 'Choisir les matches à afficher'}>
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
            aria-pressed={view === 'finished'}
            onClick={() => changeView('finished')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              view === 'finished'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {english ? 'Finished today' : 'Terminés aujourd’hui'}
          </button>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={english ? 'Search a team or match (e.g. France vs Spain)' : 'Rechercher une équipe ou un match (ex. France vs Espagne)'}
              aria-label={english ? 'Search teams or matches' : 'Rechercher une équipe ou un match'}
              className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
            />
          </label>
          <label className="sr-only" htmlFor="live-scores-competition">
            {english ? 'Filter by competition' : 'Filtrer par compétition'}
          </label>
          <select
            id="live-scores-competition"
            value={selectedCompetition}
            onChange={(event) => setSelectedCompetition(event.target.value)}
            aria-label={english ? 'Filter by competition' : 'Filtrer par compétition'}
            className="h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
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
              {english ? 'Loading live matches' : 'Chargement des matches en direct'}
            </p>
            <ul aria-hidden="true" className="grid gap-4 md:grid-cols-2">
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
            <ul className="grid gap-4 md:grid-cols-2">
              {visibleMatches.map((match) => (
                <li key={match.fixture.id}>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => openMatchDetails(match.fixture.id)}
                      aria-label={
                        english
                          ? `View events for ${match.teams.home.name} versus ${match.teams.away.name}`
                          : `Afficher les temps forts de ${match.teams.home.name} contre ${match.teams.away.name}`
                      }
                      className="group w-full cursor-pointer rounded-xl border border-border bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:bg-card sm:p-6"
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
                          view === 'live'
                            ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {view === 'live' ? (
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                        ) : (
                          <Trophy className="h-3 w-3" aria-hidden="true" />
                        )}
                        {view === 'live'
                          ? english
                            ? 'LIVE'
                            : 'DIRECT'
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

                    {match.fixture.status.elapsed !== null && (
                      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                        {match.fixture.status.elapsed}
                        {match.fixture.status.extra !== null && match.fixture.status.extra > 0
                          ? `+${match.fixture.status.extra}`
                          : ''}
                        &apos;
                      </p>
                    )}
                    {view === 'finished' && (
                      <p className="mt-4 border-t border-border pt-3 text-center text-sm font-medium text-muted-foreground">
                        {getFinishedSummary(match, english)}
                      </p>
                    )}
                    </button>
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
                  </div>
                </li>
              ))}
            </ul>
            {hasError && (
              <p role="status" className="mt-3 text-xs text-muted-foreground">
                {hasRateLimitError
                  ? english
                    ? 'The daily API-SPORTS request quota has been reached. Scores will return when the quota resets.'
                    : 'Le quota quotidien de requêtes API-SPORTS est atteint. Les scores reviendront après son renouvellement.'
                  : english
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
            {hasRateLimitError
              ? english
                ? 'The daily API-SPORTS request quota has been reached. Scores will return when the quota resets.'
                : 'Le quota quotidien de requêtes API-SPORTS est atteint. Les scores reviendront après son renouvellement.'
              : english
                ? 'Scores are temporarily unavailable. Please try again shortly.'
                : 'Les scores ne peuvent pas être chargés pour le moment. Réessayez dans quelques instants.'}
          </p>
        ) : (
          <p className="rounded-xl border border-border bg-card px-5 py-8 text-center text-sm text-muted-foreground">
            {view === 'live'
              ? english
                ? 'No matches are currently in progress.'
                : "Aucun match n'est en cours actuellement."
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
          className="fixed inset-0 m-0 flex h-dvh max-h-dvh w-screen max-w-none items-center justify-center overflow-hidden border-0 bg-transparent p-3 text-foreground sm:p-6"
        >
          <div
            aria-hidden="true"
            onClick={() => setSelectedFixtureId(null)}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
          />
          <section className="relative z-10 mx-auto flex max-h-[85dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
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
              className="flex gap-1 overflow-x-auto border-b border-border px-4 py-2 sm:px-6"
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

            <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-6">
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
                  {selectedMatch && view === 'finished' && (
                    <section className="mb-5 rounded-xl border border-primary/20 bg-primary/5 p-4">
                      <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-primary">
                        {english ? 'How the match ended' : 'Résumé final'}
                      </h3>
                      <p className="text-sm font-medium text-foreground">
                        {getMatchEndMinute(selectedMatch, events)
                          ? `${getMatchEndMinute(selectedMatch, events)}' — `
                          : ''}
                        {getFinishedNarration(selectedMatch, english)}
                      </p>
                    </section>
                  )}
                  {events.length === 0 ? (
                    <p className="rounded-xl border border-border bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
                      {english
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
                            key={`${event.time.elapsed}-${event.time.extra ?? 0}-${event.type}-${index}`}
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
                              {kind === 'yellow-card' || kind === 'red-card' ? (
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
                                  {event.time.elapsed}
                                  {event.time.extra !== null && event.time.extra > 0
                                    ? `+${event.time.extra}`
                                    : ''}
                                  &apos;
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
                detailsUnavailable.lineups ? (
                  <p role="status" className="rounded-xl border border-border bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
                    {english
                      ? 'Lineups are temporarily unavailable for this match.'
                      : 'Les compositions sont temporairement indisponibles pour ce match.'}
                  </p>
                ) : lineups.length === 0 ? (
                  <p className="rounded-xl border border-border bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
                    {english
                      ? 'Official lineups have not been published for this match.'
                      : 'Les compositions officielles ne sont pas disponibles pour ce match.'}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {lineups.map((lineup) => (
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
                              >
                                <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-950/85 text-[11px] font-extrabold text-white shadow-md sm:h-8 sm:w-8 sm:text-xs">
                                  {player.number ?? '—'}
                                </span>
                                <span className="max-w-[4.25rem] truncate rounded bg-slate-950/70 px-1 py-0.5 text-[9px] font-semibold leading-tight text-white shadow-sm sm:max-w-[5rem] sm:text-[10px]">
                                  {player.name}
                                </span>
                              </li>
                            ))}
                          </ol>
                          <div className="mt-5">
                            <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                              {english ? 'Substitutes' : 'Remplaçants'}
                            </h4>
                            {lineup.substitutes.length > 0 ? (
                              <ol className="space-y-1.5">
                                {lineup.substitutes.map((player, index) => (
                                  <li
                                    key={player.id ?? `${player.name}-${index}`}
                                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted/50"
                                  >
                                    <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md bg-muted px-1 text-xs font-bold text-foreground">
                                      {player.number ?? '—'}
                                    </span>
                                    <span className="min-w-0 flex-1 truncate text-foreground">
                                      {player.name}
                                    </span>
                                    {player.position && (
                                      <span className="text-xs text-muted-foreground">
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
