export interface Team {
  id: number;
  name: string;
  logo: string;
}

export interface League {
  id: number;
  name: string;
  code?: string;
}

export interface Match {
  id: number;
  league: League;
  round: string;
  date: string;
  status: 'Finished' | 'Ongoing' | 'Scheduled' | 'IN_PLAY' | 'PAUSED' | 'TIMED' | 'LIVE';
  teams: {
    home: Team;
    away: Team;
  };
  score: {
    home: number | null;
    away: number | null;
  };
}

export interface TeamStats {
  goals: number;
  conceded: number;
  wins: number;
  draws: number;
  losses: number;
  homeWins?: number;
  awayWins?: number;
  form: string[];
  recentGoals: number[];
  cleanSheets: number;
}

export interface MatchPrediction {
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  predictions: {
    winner: {
      team: string;
      confidence: number;
    };
    btts: {
      prediction: boolean;
      confidence: number;
    };
    overUnder: {
      line: number;
      prediction: 'over' | 'under';
      confidence: number;
    };
    scoreline: {
      home: number;
      away: number;
      confidence: number;
    };
    corners: {
      total: number;
      confidence: number;
    };
    bookings: {
      total: number;
      confidence: number;
    };
    combo: {
      prediction: string;
      confidence: number;
    };
  };
  generatedAt: string;
}
