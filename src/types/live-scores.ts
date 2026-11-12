export type LiveScoreMatch = {
  fixture: {
    id: number;
    date: string | null;
    venue: string | null;
    status: {
      elapsed: number | null;
      extra: number | null;
      short: string | null;
      long: string | null;
    };
  };
  league: {
    id: number;
    season: number | null;
    name: string;
    logo: string | null;
    country: string | null;
    round: string | null;
  };
  teams: {
    home: {
      id: number | null;
      name: string;
      logo: string | null;
    };
    away: {
      id: number | null;
      name: string;
      logo: string | null;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    penalty: {
      home: number | null;
      away: number | null;
    } | null;
  };
};

export type LiveMatchEvent = {
  time: {
    elapsed: number;
    extra: number | null;
  };
  team: {
    name: string | null;
  };
  player: {
    id: number | null;
    name: string | null;
  };
  assist: {
    id: number | null;
    name: string | null;
  };
  type: string;
  detail: string | null;
  comments: string | null;
};

export type MatchLineupPlayer = {
  id: number | null;
  name: string;
  number: number | null;
  position: string | null;
  grid: string | null;
};

export type MatchLineup = {
  team: {
    id: number | null;
    name: string;
    logo: string | null;
  };
  formation: string | null;
  startingXI: MatchLineupPlayer[];
  substitutes: MatchLineupPlayer[];
  coach: string | null;
};

export type MatchStandingEntry = {
  rank: number;
  team: {
    id: number | null;
    name: string;
    logo: string | null;
  };
  points: number;
  goalsDiff: number;
  played: number | null;
  form: string | null;
  description: string | null;
};

export type MatchStandingGroup = {
  name: string | null;
  entries: MatchStandingEntry[];
};

export type MatchStandings = {
  league: string;
  groups: MatchStandingGroup[];
};

export type MatchDetailsData = {
  events: LiveMatchEvent[];
  lineups: MatchLineup[];
  standings: MatchStandings | null;
  unavailable: {
    lineups: boolean;
    standings: boolean;
  };
};
