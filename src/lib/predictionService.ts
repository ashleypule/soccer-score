import { predictMatch, generateMockStats, type MatchPrediction, type TeamStats } from './predictionEngine';

/**
 * Fetch team stats from API route (server-side)
 */
async function fetchTeamStatsFromAPI(teamId: number, teamName: string): Promise<any> {
  try {
    const response = await fetch(
      `/api/team-stats?teamId=${teamId}&teamName=${encodeURIComponent(teamName)}`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) {
      if (response.status === 429) {
        console.error(`❌ API Rate Limit Exceeded (429)`);
        console.error(`❌ Football-Data.org free tier: 10 requests per minute`);
        console.error(`❌ Please wait 60 seconds before trying again`);
        throw new Error('Rate limit exceeded - please wait 1 minute');
      }
      throw new Error(`Failed to fetch team stats: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching team stats for ${teamName}:`, error);
    throw error; // Re-throw to trigger fallback to mock data
  }
}

/**
 * Fetch head-to-head data from API route (server-side)
 */
async function fetchHeadToHeadFromAPI(homeTeamId: number, awayTeamId: number): Promise<any> {
  try {
    const response = await fetch(
      `/api/head-to-head?homeTeamId=${homeTeamId}&awayTeamId=${awayTeamId}`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) {
      if (response.status === 429) {
        console.warn(`⚠️ Rate limit exceeded (429). Free tier: 10 requests/minute.`);
        console.warn(`⚠️ Wait 60 seconds or predictions will continue without H2H data.`);
      }
      throw new Error(`Failed to fetch H2H data: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching head-to-head data:', error);
    return null;
  }
}

interface PredictionCache {
  [matchId: string]: {
    prediction: MatchPrediction;
    timestamp: number;
  };
}

const CACHE_KEY = 'soccer_predictions_cache';
const CACHE_DURATION = 1 * 60 * 60 * 1000; // 1 hour (reduced from 24h to get fresh predictions)

/**
 * Get predictions from cache
 */
export function getCachedPrediction(matchId: number): MatchPrediction | null {
  try {
    const cacheStr = localStorage.getItem(CACHE_KEY);
    if (!cacheStr) return null;
    
    const cache: PredictionCache = JSON.parse(cacheStr);
    const cached = cache[matchId];
    
    if (!cached) return null;
    
    // Check if cache is still valid
    const now = Date.now();
    if (now - cached.timestamp > CACHE_DURATION) {
      // Cache expired
      delete cache[matchId];
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      return null;
    }
    
    return cached.prediction;
  } catch (error) {
    console.error('Error reading prediction cache:', error);
    return null;
  }
}

/**
 * Save prediction to cache
 */
export function cachePrediction(matchId: number, prediction: MatchPrediction): void {
  try {
    const cacheStr = localStorage.getItem(CACHE_KEY);
    const cache: PredictionCache = cacheStr ? JSON.parse(cacheStr) : {};
    
    cache[matchId] = {
      prediction,
      timestamp: Date.now()
    };
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error caching prediction:', error);
  }
}

/**
 * Generate prediction for a match using real team data
 */
export async function generatePrediction(
  matchId: number,
  homeTeamName: string,
  awayTeamName: string,
  homeTeamId?: number,
  awayTeamId?: number
): Promise<MatchPrediction> {
  // Check cache first
  const cached = getCachedPrediction(matchId);
  if (cached) {
    console.log(`📦 Using cached prediction for match ${matchId}`);
    console.log(`⚠️ To get fresh prediction, clear cache in browser (localStorage)`);
    return cached;
  }
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  let homeStats: TeamStats;
  let awayStats: TeamStats;
  let h2hData: any = null;
  
  // Try to fetch real team statistics if team IDs are provided
  if (homeTeamId && awayTeamId) {
    try {
      console.log(`🔍 Fetching real-time data for ${homeTeamName} (ID: ${homeTeamId}) vs ${awayTeamName} (ID: ${awayTeamId})`);
      console.log(`⏰ Analysis time: ${new Date().toLocaleString()}`);
      
      // Fetch team stats first (required)
      const [homeData, awayData] = await Promise.all([
        fetchTeamStatsFromAPI(homeTeamId, homeTeamName),
        fetchTeamStatsFromAPI(awayTeamId, awayTeamName)
      ]);
      
      if (homeData && awayData) {
        homeStats = { ...homeData, isHome: true };
        awayStats = { ...awayData, isHome: false };
        
        // Try to fetch H2H data (optional - may fail due to rate limits)
        try {
          h2hData = await fetchHeadToHeadFromAPI(homeTeamId, awayTeamId);
        } catch (h2hError) {
          console.warn(`⚠️ Could not fetch H2H data (rate limit or error). Continuing without it.`);
          h2hData = null;
        }
        
        console.log('✅ Using COMPREHENSIVE REAL-TIME DATA:');
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`📊 ${homeTeamName} (HOME):`);
        console.log(`   Overall: ${homeData.matchesPlayed} matches | ${homeData.wins}W-${homeData.draws}D-${homeData.losses}L`);
        console.log(`   Home form: ${homeData.homeWins}W-${homeData.homeDraws}D-${homeData.homeLosses}L | Win rate: ${homeData.homeWinRate.toFixed(1)}%`);
        console.log(`   Goals: Scored ${homeData.goalsScored} (avg ${homeData.avgGoalsScored.toFixed(2)}) | Conceded ${homeData.goalsConceded} (avg ${homeData.avgGoalsConceded.toFixed(2)})`);
        console.log(`   Home attack: ${homeData.avgHomeGoalsScored.toFixed(2)} goals/match | Defense: ${homeData.avgHomeGoalsConceded.toFixed(2)} conceded/match`);
        console.log(`   Recent form (last 5): ${homeData.recentWins}W-${homeData.recentDraws}D | Form: ${homeData.recentForm.toFixed(1)}%`);
        console.log(`   Last 3 matches: ${homeData.last3Wins} wins | Scored ${homeData.last3GoalsScored} | Conceded ${homeData.last3GoalsConceded}`);
        console.log(`   Clean sheets: ${homeData.cleanSheets} (${homeData.cleanSheetRate.toFixed(1)}%)`);
        console.log(`   Goal difference: ${homeData.goalDifference > 0 ? '+' : ''}${homeData.goalDifference}`);
        
        console.log(`\n📊 ${awayTeamName} (AWAY):`);
        console.log(`   Overall: ${awayData.matchesPlayed} matches | ${awayData.wins}W-${awayData.draws}D-${awayData.losses}L`);
        console.log(`   Away form: ${awayData.awayWins}W-${awayData.awayDraws}D-${awayData.awayLosses}L | Win rate: ${awayData.awayWinRate.toFixed(1)}%`);
        console.log(`   Goals: Scored ${awayData.goalsScored} (avg ${awayData.avgGoalsScored.toFixed(2)}) | Conceded ${awayData.goalsConceded} (avg ${awayData.avgGoalsConceded.toFixed(2)})`);
        console.log(`   Away attack: ${awayData.avgAwayGoalsScored.toFixed(2)} goals/match | Defense: ${awayData.avgAwayGoalsConceded.toFixed(2)} conceded/match`);
        console.log(`   Recent form (last 5): ${awayData.recentWins}W-${awayData.recentDraws}D | Form: ${awayData.recentForm.toFixed(1)}%`);
        console.log(`   Last 3 matches: ${awayData.last3Wins} wins | Scored ${awayData.last3GoalsScored} | Conceded ${awayData.last3GoalsConceded}`);
        console.log(`   Clean sheets: ${awayData.cleanSheets} (${awayData.cleanSheetRate.toFixed(1)}%)`);
        console.log(`   Goal difference: ${awayData.goalDifference > 0 ? '+' : ''}${awayData.goalDifference}`);
        
        if (h2hData && h2hData.matchesPlayed > 0) {
          console.log(`\n🤝 HEAD-TO-HEAD HISTORY:`);
          console.log(`   Matches: ${h2hData.matchesPlayed} | ${homeTeamName}: ${h2hData.homeWins} | ${awayTeamName}: ${h2hData.awayWins} | Draws: ${h2hData.draws}`);
          console.log(`   Average goals: ${h2hData.avgGoals.toFixed(2)} | BTTS: ${h2hData.bttsPercentage.toFixed(1)}%`);
        } else {
          console.log(`\n🤝 HEAD-TO-HEAD: Not available (API rate limit or no recent history)`);
        }
        
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      } else {
        throw new Error('Failed to fetch real stats');
      }
    } catch (error: any) {
      // Check if it's a rate limit error
      if (error.message?.includes('Rate limit exceeded')) {
        console.error('🚫 ═══════════════════════════════════════════');
        console.error('🚫 API RATE LIMIT EXCEEDED');
        console.error('🚫 ═══════════════════════════════════════════');
        console.error('⏳ Football-Data.org free tier: 10 requests/minute');
        console.error('⏳ Please wait 60 seconds before trying again');
        console.error('💡 Tip: Click predictions one at a time to avoid limits');
        console.error('🚫 ═══════════════════════════════════════════');
        throw new Error('⏳ API rate limit exceeded. Please wait 1 minute before generating more predictions.');
      }
      
      console.warn('⚠️ Falling back to mock stats:', error.message || error);
      // Fallback to mock stats if real data fetch fails
      homeStats = generateMockStats(homeTeamName, true);
      awayStats = generateMockStats(awayTeamName, false);
    }
  } else {
    // Use mock stats if team IDs not provided
    console.log('⚠️ Using mock statistics (team IDs not provided)');
    homeStats = generateMockStats(homeTeamName, true);
    awayStats = generateMockStats(awayTeamName, false);
  }
  
  // Generate prediction with comprehensive data including head-to-head
  const prediction = predictMatch(homeStats, awayStats, h2hData);
  
  // Enhance prediction with formatted team stats for display
  if (homeStats && awayStats && (homeStats as any).matchesPlayed) {
    prediction.teamStats = {
      home: {
        name: homeTeamName,
        matchesPlayed: (homeStats as any).matchesPlayed || 0,
        record: `${(homeStats as any).wins || 0}W-${(homeStats as any).draws || 0}D-${(homeStats as any).losses || 0}L`,
        homeRecord: `${(homeStats as any).homeWins || 0}W-${(homeStats as any).homeDraws || 0}D-${(homeStats as any).homeLosses || 0}L`,
        homeWinRate: (homeStats as any).homeWinRate || 0,
        goals: `${(homeStats as any).goalsScored || 0} scored, ${(homeStats as any).goalsConceded || 0} conceded`,
        avgGoals: `${((homeStats as any).avgGoalsScored || 0).toFixed(2)} scored, ${((homeStats as any).avgGoalsConceded || 0).toFixed(2)} conceded`,
        homeAvgGoals: `${((homeStats as any).avgHomeGoalsScored || 0).toFixed(2)} scored, ${((homeStats as any).avgHomeGoalsConceded || 0).toFixed(2)} conceded`,
        recentForm: `${(homeStats as any).recentWins || 0}W-${(homeStats as any).recentDraws || 0}D | ${((homeStats as any).recentForm || 0).toFixed(1)}%`,
        last3: `${(homeStats as any).last3Wins || 0} wins, ${(homeStats as any).last3GoalsScored || 0} scored, ${(homeStats as any).last3GoalsConceded || 0} conceded`,
        cleanSheets: `${(homeStats as any).cleanSheets || 0} (${((homeStats as any).cleanSheetRate || 0).toFixed(1)}%)`,
        goalDifference: `${(homeStats as any).goalDifference > 0 ? '+' : ''}${(homeStats as any).goalDifference || 0}`,
      },
      away: {
        name: awayTeamName,
        matchesPlayed: (awayStats as any).matchesPlayed || 0,
        record: `${(awayStats as any).wins || 0}W-${(awayStats as any).draws || 0}D-${(awayStats as any).losses || 0}L`,
        awayRecord: `${(awayStats as any).awayWins || 0}W-${(awayStats as any).awayDraws || 0}D-${(awayStats as any).awayLosses || 0}L`,
        awayWinRate: (awayStats as any).awayWinRate || 0,
        goals: `${(awayStats as any).goalsScored || 0} scored, ${(awayStats as any).goalsConceded || 0} conceded`,
        avgGoals: `${((awayStats as any).avgGoalsScored || 0).toFixed(2)} scored, ${((awayStats as any).avgGoalsConceded || 0).toFixed(2)} conceded`,
        awayAvgGoals: `${((awayStats as any).avgAwayGoalsScored || 0).toFixed(2)} scored, ${((awayStats as any).avgAwayGoalsConceded || 0).toFixed(2)} conceded`,
        recentForm: `${(awayStats as any).recentWins || 0}W-${(awayStats as any).recentDraws || 0}D | ${((awayStats as any).recentForm || 0).toFixed(1)}%`,
        last3: `${(awayStats as any).last3Wins || 0} wins, ${(awayStats as any).last3GoalsScored || 0} scored, ${(awayStats as any).last3GoalsConceded || 0} conceded`,
        cleanSheets: `${(awayStats as any).cleanSheets || 0} (${((awayStats as any).cleanSheetRate || 0).toFixed(1)}%)`,
        goalDifference: `${(awayStats as any).goalDifference > 0 ? '+' : ''}${(awayStats as any).goalDifference || 0}`,
      },
    };
  }
  
  // Add H2H data if available
  if (h2hData && h2hData.matchesPlayed > 0) {
    prediction.h2hData = {
      matchesPlayed: h2hData.matchesPlayed,
      distribution: `${homeTeamName}: ${h2hData.homeWins} | ${awayTeamName}: ${h2hData.awayWins} | Draws: ${h2hData.draws}`,
      avgGoals: h2hData.avgGoals,
      bttsPercentage: h2hData.bttsPercentage,
    };
  }
  
  console.log(`\n🎯 PREDICTION GENERATED:`);
  console.log(`   Winner: ${prediction.winner.prediction} (${prediction.winner.confidence}%)`);
  console.log(`   Scoreline: ${prediction.scoreline.home}-${prediction.scoreline.away}`);
  console.log(`   BTTS: ${prediction.btts.prediction} | Over/Under: ${prediction.overUnder.prediction}`);
  console.log(`   Overall confidence: ${prediction.overallConfidence}%\n`);
  
  // Cache the result
  cachePrediction(matchId, prediction);
  
  return prediction;
}

/**
 * Clear all cached predictions
 */
export function clearPredictionCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Error clearing prediction cache:', error);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { count: number; oldestTimestamp: number | null } {
  try {
    const cacheStr = localStorage.getItem(CACHE_KEY);
    if (!cacheStr) return { count: 0, oldestTimestamp: null };
    
    const cache: PredictionCache = JSON.parse(cacheStr);
    const entries = Object.values(cache);
    
    if (entries.length === 0) return { count: 0, oldestTimestamp: null };
    
    const oldestTimestamp = Math.min(...entries.map(e => e.timestamp));
    
    return {
      count: entries.length,
      oldestTimestamp
    };
  } catch (error) {
    return { count: 0, oldestTimestamp: null };
  }
}
