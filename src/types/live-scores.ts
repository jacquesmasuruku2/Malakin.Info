export type LiveScoreMatch = {
  fixture: {
    id: number;
    status: {
      elapsed: number | null;
      short: string | null;
      long: string | null;
    };
  };
  league: {
    id: number;
    name: string;
    logo: string | null;
    country: string | null;
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
};
