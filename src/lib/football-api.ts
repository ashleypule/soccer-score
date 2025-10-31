import { Match, Team, League } from './types';

const API_BASE_URL = 'https://api.football-data.org/v4';
const API_KEY = process.env.FOOTBALL_DATA_API_KEY || '';

// Free tier supports these major leagues
export const SUPPORTED_LEAGUES = {
  PREMIER_LEAGUE: 'PL',      // Premier League
  PRIMERA_DIVISION: 'PD',    // La Liga
  SERIE_A: 'SA',             // Serie A
  BUNDESLIGA: 'BL1',         // Bundesliga
  LIGUE_1: 'FL1',            // Ligue 1
  EREDIVISIE: 'DED',         // Eredivisie
  CHAMPIONSHIP: 'ELC',       // Championship
  PRIMEIRA_LIGA: 'PPL',      // Primeira Liga
  BRAZILIAN_SERIE_A: 'BSA',  // Brasileirão
  WORLD_CUP: 'WC',           // World Cup
  EUROPEAN_CHAMPIONSHIP: 'EC', // European Championship
  CHAMPIONS_LEAGUE: 'CL',    // Champions League
};

interface FootballDataMatch {
  id: number;
  utcDate: string;
  status: string;
  matchday: number;
  stage: string;
  score: {
    fullTime: {
      home: number | null;
      away: number | null;
    };
  };
  homeTeam: {
    id: number;
    name: string;
    crest: string;
  };
  awayTeam: {
    id: number;
    name: string;
    crest: string;
  };
  competition: {
    id: number;
    name: string;
    code: string;
  };
}

interface FootballDataCompetition {
  id: number;
  name: string;
  code: string;
  emblem: string;
}

function mapStatus(status: string): 'Finished' | 'Ongoing' | 'Scheduled' {
  switch (status) {
    case 'FINISHED':
    case 'AWARDED':
      return 'Finished';
    case 'IN_PLAY':
    case 'PAUSED':
    case 'LIVE':
      return 'Ongoing';
    case 'SCHEDULED':
    case 'TIMED':
    default:
      return 'Scheduled';
  }
}

function mapMatch(match: FootballDataMatch): Match {
  return {
    id: match.id,
    league: {
      id: match.competition.id,
      name: match.competition.name,
      code: match.competition.code,
    },
    round: match.stage === 'REGULAR_SEASON' 
      ? `Matchday ${match.matchday}` 
      : match.stage.replace(/_/g, ' '),
    date: match.utcDate,
    status: mapStatus(match.status) as any,
    teams: {
      home: {
        id: match.homeTeam.id,
        name: match.homeTeam.name,
        logo: match.homeTeam.crest,
      },
      away: {
        id: match.awayTeam.id,
        name: match.awayTeam.name,
        logo: match.awayTeam.crest,
      },
    },
    score: {
      home: match.score.fullTime.home,
      away: match.score.fullTime.away,
    },
  };
}

async function fetchFromAPI(endpoint: string): Promise<any> {
  // Validate API key is available
  if (!API_KEY) {
    console.error('❌ FOOTBALL_DATA_API_KEY is not configured');
    throw new Error('API key not configured. Please set FOOTBALL_DATA_API_KEY environment variable.');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'X-Auth-Token': API_KEY,
    },
    next: { revalidate: 60 }, // Cache for 1 minute
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized: Invalid API key');
    }
    if (response.status === 429) {
      throw new Error('API rate limit exceeded. Please try again later.');
    }
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function fetchAllMatches(dateFrom?: string, dateTo?: string): Promise<Match[]> {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);

    const data = await fetchFromAPI(`/matches?${params.toString()}`);
    
    if (!data.matches || data.matches.length === 0) {
      return [];
    }

    return data.matches.map(mapMatch);
  } catch (error) {
    console.error('Error fetching matches:', error);
    throw error;
  }
}

export async function fetchMatchesByCompetition(
  competitionCode: string,
  dateFrom?: string,
  dateTo?: string
): Promise<Match[]> {
  try {
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);

    const data = await fetchFromAPI(
      `/competitions/${competitionCode}/matches?${params.toString()}`
    );
    
    if (!data.matches || data.matches.length === 0) {
      return [];
    }

    return data.matches.map(mapMatch);
  } catch (error) {
    console.error(`Error fetching matches for ${competitionCode}:`, error);
    return [];
  }
}

export async function fetchMatchesFromAllLeagues(
  dateFrom?: string,
  dateTo?: string
): Promise<Match[]> {
  try {
    // Fetch matches from all supported leagues in parallel
    const leagueCodes = Object.values(SUPPORTED_LEAGUES);
    
    const allMatchesPromises = leagueCodes.map(code =>
      fetchMatchesByCompetition(code, dateFrom, dateTo).catch(err => {
        console.warn(`Failed to fetch ${code}:`, err);
        return [];
      })
    );

    const allMatchesArrays = await Promise.all(allMatchesPromises);
    const allMatches = allMatchesArrays.flat();

    // Sort by date descending (most recent first)
    return allMatches.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error('Error fetching matches from all leagues:', error);
    throw error;
  }
}

export async function fetchLeagues(): Promise<League[]> {
  try {
    const data = await fetchFromAPI('/competitions');
    
    if (!data.competitions) {
      return [];
    }

    // Filter for supported leagues
    const supportedCodes = Object.values(SUPPORTED_LEAGUES);
    return data.competitions
      .filter((comp: FootballDataCompetition) => 
        supportedCodes.includes(comp.code)
      )
      .map((comp: FootballDataCompetition) => ({
        id: comp.id,
        name: comp.name,
      }));
  } catch (error) {
    console.error('Error fetching leagues:', error);
    return [];
  }
}

export async function fetchLiveMatches(): Promise<Match[]> {
  try {
    // Fetch matches from today
    const today = new Date().toISOString().split('T')[0];
    const matches = await fetchAllMatches(today, today);
    
    // Filter for live matches only
    return matches.filter(match => match.status === 'Ongoing');
  } catch (error) {
    console.error('Error fetching live matches:', error);
    return [];
  }
}

/**
 * Fetch comprehensive team statistics by analyzing recent matches with detailed breakdowns
 */
export async function fetchTeamStats(teamId: number, teamName: string): Promise<any> {
  try {
    // Fetch recent matches for the team (last 90 days for comprehensive analysis)
    const dateTo = new Date().toISOString().split('T')[0];
    const dateFrom = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    console.log(`📊 Fetching comprehensive stats for ${teamName} (ID: ${teamId})`);
    
    const response = await fetch(`${API_BASE_URL}/teams/${teamId}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`, {
      headers: {
        'X-Auth-Token': API_KEY,
      },
      next: { revalidate: 1800 }, // Cache for 30 minutes for real-time accuracy
    });

    if (!response.ok) {
      console.warn(`Failed to fetch stats for team ${teamId}`);
      return null;
    }

    const data = await response.json();
    const allMatches = data.matches || [];
    const finishedMatches = allMatches.filter((m: any) => m.status === 'FINISHED');
    
    if (finishedMatches.length === 0) {
      console.warn(`No finished matches found for ${teamName}`);
      return null;
    }
    
    // SEPARATE HOME AND AWAY PERFORMANCE
    const homeMatches: any[] = [];
    const awayMatches: any[] = [];
    
    finishedMatches.forEach((match: any) => {
      if (match.homeTeam.id === teamId) {
        homeMatches.push(match);
      } else {
        awayMatches.push(match);
      }
    });
    
    // Calculate overall statistics
    let wins = 0, draws = 0, losses = 0;
    let goalsScored = 0, goalsConceded = 0;
    let cleanSheets = 0, failedToScore = 0;
    
    // Home statistics
    let homeWins = 0, homeDraws = 0, homeLosses = 0;
    let homeGoalsScored = 0, homeGoalsConceded = 0;
    
    // Away statistics  
    let awayWins = 0, awayDraws = 0, awayLosses = 0;
    let awayGoalsScored = 0, awayGoalsConceded = 0;
    
    // Recent form (last 5 matches) - weighted heavily
    const recentMatches = finishedMatches.slice(-5);
    let recentWins = 0, recentDraws = 0;
    let recentGoalsScored = 0, recentGoalsConceded = 0;
    
    // Last 3 matches (most recent - highest weight)
    const last3Matches = finishedMatches.slice(-3);
    let last3Wins = 0, last3GoalsScored = 0, last3GoalsConceded = 0;
    
    // Process all matches
    finishedMatches.forEach((match: any) => {
      const isHome = match.homeTeam.id === teamId;
      const teamScore = isHome ? match.score.fullTime.home : match.score.fullTime.away;
      const opponentScore = isHome ? match.score.fullTime.away : match.score.fullTime.home;
      
      if (teamScore !== null && opponentScore !== null) {
        goalsScored += teamScore;
        goalsConceded += opponentScore;
        
        if (teamScore > opponentScore) wins++;
        else if (teamScore === opponentScore) draws++;
        else losses++;
        
        if (opponentScore === 0) cleanSheets++;
        if (teamScore === 0) failedToScore++;
        
        // Home/Away breakdown
        if (isHome) {
          homeGoalsScored += teamScore;
          homeGoalsConceded += opponentScore;
          if (teamScore > opponentScore) homeWins++;
          else if (teamScore === opponentScore) homeDraws++;
          else homeLosses++;
        } else {
          awayGoalsScored += teamScore;
          awayGoalsConceded += opponentScore;
          if (teamScore > opponentScore) awayWins++;
          else if (teamScore === opponentScore) awayDraws++;
          else awayLosses++;
        }
      }
    });
    
    // Process recent form (last 5)
    recentMatches.forEach((match: any) => {
      const isHome = match.homeTeam.id === teamId;
      const teamScore = isHome ? match.score.fullTime.home : match.score.fullTime.away;
      const opponentScore = isHome ? match.score.fullTime.away : match.score.fullTime.home;
      
      if (teamScore !== null && opponentScore !== null) {
        recentGoalsScored += teamScore;
        recentGoalsConceded += opponentScore;
        if (teamScore > opponentScore) recentWins++;
        else if (teamScore === opponentScore) recentDraws++;
      }
    });
    
    // Process last 3 matches (highest weight)
    last3Matches.forEach((match: any) => {
      const isHome = match.homeTeam.id === teamId;
      const teamScore = isHome ? match.score.fullTime.home : match.score.fullTime.away;
      const opponentScore = isHome ? match.score.fullTime.away : match.score.fullTime.home;
      
      if (teamScore !== null && opponentScore !== null) {
        last3GoalsScored += teamScore;
        last3GoalsConceded += opponentScore;
        if (teamScore > opponentScore) last3Wins++;
      }
    });
    
    const matchesPlayed = finishedMatches.length;
    const homeMatchesPlayed = homeMatches.length || 1;
    const awayMatchesPlayed = awayMatches.length || 1;
    
    const stats = {
      teamName,
      matchesPlayed,
      
      // Overall stats
      wins,
      draws,
      losses,
      goalsScored,
      goalsConceded,
      cleanSheets,
      failedToScore,
      
      // Home performance
      homeWins,
      homeDraws,
      homeLosses,
      homeGoalsScored,
      homeGoalsConceded,
      homeWinRate: (homeWins / homeMatchesPlayed) * 100,
      
      // Away performance
      awayWins,
      awayDraws,
      awayLosses,
      awayGoalsScored,
      awayGoalsConceded,
      awayWinRate: (awayWins / awayMatchesPlayed) * 100,
      
      // Averages
      avgGoalsScored: goalsScored / matchesPlayed,
      avgGoalsConceded: goalsConceded / matchesPlayed,
      avgHomeGoalsScored: homeGoalsScored / homeMatchesPlayed,
      avgHomeGoalsConceded: homeGoalsConceded / homeMatchesPlayed,
      avgAwayGoalsScored: awayGoalsScored / awayMatchesPlayed,
      avgAwayGoalsConceded: awayGoalsConceded / awayMatchesPlayed,
      
      // Recent form (last 5 matches)
      recentWins,
      recentDraws,
      recentGoalsScored,
      recentGoalsConceded,
      recentForm: ((recentWins * 3 + recentDraws) / (recentMatches.length * 3)) * 100,
      
      // Last 3 matches (most recent)
      last3Wins,
      last3GoalsScored,
      last3GoalsConceded,
      last3Form: (last3Wins / last3Matches.length) * 100,
      
      // Defensive/Offensive strength
      cleanSheetRate: (cleanSheets / matchesPlayed) * 100,
      failedToScoreRate: (failedToScore / matchesPlayed) * 100,
      
      // Scoring consistency
      scoringConsistency: ((matchesPlayed - failedToScore) / matchesPlayed) * 100,
      
      // Goal difference
      goalDifference: goalsScored - goalsConceded,
      homeGoalDifference: homeGoalsScored - homeGoalsConceded,
      awayGoalDifference: awayGoalsScored - awayGoalsConceded,
      
      // Win rates
      winRate: (wins / matchesPlayed) * 100,
      
      // Estimates for corners and cards (API doesn't provide)
      avgCornersFor: 5 + Math.random() * 2,
      avgCornersAgainst: 5 + Math.random() * 2,
      avgYellowCards: 2 + Math.random(),
      avgRedCards: 0.1 + Math.random() * 0.2,
      
      // Raw data for further analysis
      allMatches: finishedMatches,
      homeMatchesCount: homeMatchesPlayed,
      awayMatchesCount: awayMatchesPlayed,
    };
    
    console.log(`✅ ${teamName} stats: ${matchesPlayed} matches | W:${wins} D:${draws} L:${losses} | GF:${goalsScored} GA:${goalsConceded} | Recent form: ${stats.recentForm.toFixed(1)}%`);
    
    return stats;
  } catch (error) {
    console.error(`Error fetching team stats for ${teamName}:`, error);
    return null;
  }
}

/**
 * Fetch head-to-head history between two teams
 */
export async function fetchHeadToHead(homeTeamId: number, awayTeamId: number): Promise<any> {
  try {
    console.log(`🔍 Fetching head-to-head: Team ${homeTeamId} vs Team ${awayTeamId}`);
    
    const response = await fetch(`${API_BASE_URL}/teams/${homeTeamId}/matches`, {
      headers: {
        'X-Auth-Token': API_KEY,
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.warn(`Failed to fetch h2h data`);
      return null;
    }

    const data = await response.json();
    const allMatches = data.matches || [];
    
    // Filter for matches between these two teams
    const h2hMatches = allMatches.filter((match: any) => {
      return (
        match.status === 'FINISHED' &&
        ((match.homeTeam.id === homeTeamId && match.awayTeam.id === awayTeamId) ||
         (match.homeTeam.id === awayTeamId && match.awayTeam.id === homeTeamId))
      );
    });
    
    if (h2hMatches.length === 0) {
      return null;
    }
    
    let homeWins = 0, awayWins = 0, draws = 0;
    let totalGoals = 0;
    let bttsCount = 0;
    
    h2hMatches.forEach((match: any) => {
      const homeIsHome = match.homeTeam.id === homeTeamId;
      const homeScore = homeIsHome ? match.score.fullTime.home : match.score.fullTime.away;
      const awayScore = homeIsHome ? match.score.fullTime.away : match.score.fullTime.home;
      
      if (homeScore !== null && awayScore !== null) {
        totalGoals += homeScore + awayScore;
        
        if (homeScore > awayScore) homeWins++;
        else if (awayScore > homeScore) awayWins++;
        else draws++;
        
        if (homeScore > 0 && awayScore > 0) bttsCount++;
      }
    });
    
    const h2hData = {
      matchesPlayed: h2hMatches.length,
      homeWins,
      awayWins,
      draws,
      avgGoals: totalGoals / h2hMatches.length,
      bttsPercentage: (bttsCount / h2hMatches.length) * 100,
      recentMatches: h2hMatches.slice(-3), // Last 3 h2h matches
    };
    
    console.log(`📋 H2H: ${h2hMatches.length} matches | Home wins: ${homeWins} | Away wins: ${awayWins} | Draws: ${draws}`);
    
    return h2hData;
  } catch (error) {
    console.error('Error fetching head-to-head:', error);
    return null;
  }
}

