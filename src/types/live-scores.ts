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
    name: string | null;
  };
  assist: {
    name: string | null;
  };
  type: string;
  detail: string | null;
  comments: string | null;
};
