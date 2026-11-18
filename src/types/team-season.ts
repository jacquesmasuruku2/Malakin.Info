export type TeamSeasonPlayer = {
  id: number;
  name: string;
  number: string | null;
  position: string | null;
  age: number | null;
  nationality: string | null;
};

export type TeamSeasonMatch = {
  id: number;
  date: string | null;
  state: 'in' | 'post' | 'pre';
  detail: string | null;
  home: {
    id: number | null;
    name: string;
    logo: string | null;
    score: number | null;
  };
  away: {
    id: number | null;
    name: string;
    logo: string | null;
    score: number | null;
  };
};

export type TeamSeasonTransfer = {
  id: string;
  date: string | null;
  playerName: string | null;
  direction: 'arrival' | 'departure';
  type: string | null;
  amount: string | null;
};

export type TeamSeasonData = {
  team: {
    id: number;
    name: string;
    logo: string | null;
    isNational: boolean;
  };
  leagueSlug: string;
  season: number;
  seasonLabel: string;
  coach: string | null;
  matches: TeamSeasonMatch[];
  roster: TeamSeasonPlayer[];
  transfers: TeamSeasonTransfer[];
  unavailable: {
    matches: boolean;
    roster: boolean;
    transfers: boolean;
  };
};
