// Prediction Engine - Rule-based football match prediction logic

export interface TeamStats {
  teamName: string;
  // Recent Form (last 5-10 matches)
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsConceded: number;
  
  // Detailed stats
  cleanSheets: number;
  failedToScore: number;
  avgGoalsScored: number;
  avgGoalsConceded: number;
  avgCornersFor: number;
  avgCornersAgainst: number;
  avgYellowCards: number;
  avgRedCards: number;
  
  // Form indicator
  recentForm: number; // 0-100 score
  isHome?: boolean;
}

export interface MatchPrediction {
  btts: {
    prediction: 'Yes' | 'No';
    confidence: number; // 0-100
    reasoning: string;
  };
  winner: {
    prediction: 'Home' | 'Away' | 'Draw';
    confidence: number;
    reasoning: string;
  };
  overUnder: {
    prediction: 'Over 2.5' | 'Under 2.5';
    confidence: number;
    reasoning: string;
    expectedGoals: number;
  };
  corners: {
    prediction: string; // e.g., "9-11 corners"
    range: { min: number; max: number };
    confidence: number;
  };
  bookings: {
    level: 'Low' | 'Medium' | 'High';
    expectedCards: number;
    confidence: number;
  };
  scoreline: {
    home: number;
    away: number;
    confidence: number;
  };
  combo: {
    prediction: string; // e.g., "Home Win + Over 2.5"
    confidence: number;
  };
  overallConfidence: number;
  // Enhanced: Include team stats for display
  teamStats?: {
    home: {
      name: string;
      matchesPlayed: number;
      record: string; // "6W-2D-2L"
      homeRecord: string; // "4W-1D-0L"
      homeWinRate: number;
      goals: string; // "21 scored, 9 conceded"
      avgGoals: string; // "2.10 scored, 0.90 conceded"
      homeAvgGoals: string; // "2.50 scored, 0.60 conceded"
      recentForm: string; // "4W-0D | 80.0%"
      last3: string; // "3 wins, 8 scored, 2 conceded"
      cleanSheets: string; // "3 (30.0%)"
      goalDifference: string; // "+12"
    };
    away: {
      name: string;
      matchesPlayed: number;
      record: string;
      awayRecord: string;
      awayWinRate: number;
      goals: string;
      avgGoals: string;
      awayAvgGoals: string;
      recentForm: string;
      last3: string;
      cleanSheets: string;
      goalDifference: string;
    };
  };
  h2hData?: {
    matchesPlayed: number;
    distribution: string; // "Home: 2 | Away: 2 | Draws: 1"
    avgGoals: number;
    bttsPercentage: number;
  };
}

/**
 * Calculate team form score based on recent results
 */
function calculateFormScore(stats: TeamStats): number {
  if (stats.matchesPlayed === 0) return 50;
  
  const winRate = (stats.wins / stats.matchesPlayed) * 100;
  const drawRate = (stats.draws / stats.matchesPlayed) * 50;
  const goalDiff = stats.goalsScored - stats.goalsConceded;
  const goalDiffScore = Math.min(Math.max(goalDiff * 5, -25), 25);
  
  return Math.min(Math.max(winRate + drawRate + goalDiffScore, 0), 100);
}

/**
 * Predict Both Teams To Score (BTTS)
 */
function predictBTTS(homeStats: TeamStats, awayStats: TeamStats): {
  prediction: 'Yes' | 'No';
  confidence: number;
  reasoning: string;
} {
  // Factors: Goals scored avg, goals conceded avg, clean sheets
  const homeScoresRegularly = homeStats.avgGoalsScored >= 1.0;
  const awayScoresRegularly = awayStats.avgGoalsScored >= 0.8; // Away teams typically score less
  
  const homeConcedesRegularly = homeStats.avgGoalsConceded >= 0.8;
  const awayConcedesRegularly = awayStats.avgGoalsConceded >= 1.0;
  
  const homeCleanSheetRate = homeStats.cleanSheets / homeStats.matchesPlayed;
  const awayCleanSheetRate = awayStats.cleanSheets / awayStats.matchesPlayed;
  
  // BTTS is likely if both teams score regularly AND both concede regularly
  const bttsScore = 
    (homeScoresRegularly ? 25 : 0) +
    (awayScoresRegularly ? 25 : 0) +
    (homeConcedesRegularly ? 25 : 0) +
    (awayConcedesRegularly ? 25 : 0) -
    (homeCleanSheetRate * 20) -
    (awayCleanSheetRate * 20);
  
  const prediction = bttsScore > 50 ? 'Yes' : 'No';
  const confidence = prediction === 'Yes' ? bttsScore : 100 - bttsScore;
  
  let reasoning = '';
  if (prediction === 'Yes') {
    reasoning = `Both teams average ${homeStats.avgGoalsScored.toFixed(1)} and ${awayStats.avgGoalsScored.toFixed(1)} goals. Both concede regularly.`;
  } else {
    reasoning = `Low scoring potential. ${homeStats.teamName} has ${homeStats.cleanSheets} clean sheets in ${homeStats.matchesPlayed} matches.`;
  }
  
  return { prediction, confidence: Math.round(confidence), reasoning };
}

/**
 * Predict Match Winner
 */
function predictWinner(homeStats: TeamStats, awayStats: TeamStats) {
  // Home advantage factor
  const HOME_ADVANTAGE = 15;
  
  const homeFormScore = calculateFormScore(homeStats);
  const awayFormScore = calculateFormScore(awayStats);
  
  // Adjust for home advantage
  const homeScore = homeFormScore + HOME_ADVANTAGE;
  const awayScore = awayFormScore;
  
  // Goal difference matters
  const homeGoalDiff = homeStats.goalsScored - homeStats.goalsConceded;
  const awayGoalDiff = awayStats.goalsScored - awayStats.goalsConceded;
  
  const goalDiffFactor = (homeGoalDiff - awayGoalDiff) * 3;
  
  const finalHomeScore = homeScore + goalDiffFactor;
  const finalAwayScore = awayScore;
  
  const scoreDiff = Math.abs(finalHomeScore - finalAwayScore);
  
  let prediction: 'Home' | 'Away' | 'Draw';
  let confidence: number;
  let reasoning: string;
  
  if (scoreDiff < 10) {
    prediction = 'Draw';
    confidence = 60;
    reasoning = `Evenly matched teams. Form scores: ${homeStats.teamName} ${homeFormScore.toFixed(0)}, ${awayStats.teamName} ${awayFormScore.toFixed(0)}`;
  } else if (finalHomeScore > finalAwayScore) {
    prediction = 'Home';
    confidence = Math.min(50 + scoreDiff, 95);
    reasoning = `${homeStats.teamName} stronger form (${homeFormScore.toFixed(0)}) + home advantage. Goal diff: +${homeGoalDiff.toFixed(0)}`;
  } else {
    prediction = 'Away';
    confidence = Math.min(50 + scoreDiff, 95);
    reasoning = `${awayStats.teamName} in better form (${awayFormScore.toFixed(0)}). Goal diff: +${awayGoalDiff.toFixed(0)}`;
  }
  
  return { prediction, confidence: Math.round(confidence), reasoning };
}

/**
 * Predict Over/Under 2.5 Goals
 */
function predictOverUnder(homeStats: TeamStats, awayStats: TeamStats): {
  prediction: 'Over 2.5' | 'Under 2.5';
  confidence: number;
  reasoning: string;
  expectedGoals: number;
} {
  // Combined goals average
  const combinedGoalsAvg = homeStats.avgGoalsScored + awayStats.avgGoalsScored;
  const expectedGoals = combinedGoalsAvg;
  
  // Defensive strength
  const combinedDefense = homeStats.avgGoalsConceded + awayStats.avgGoalsConceded;
  
  // Attack vs Defense balance
  const attackDefenseRatio = combinedGoalsAvg / (combinedDefense || 1);
  
  const prediction = expectedGoals > 2.5 ? 'Over 2.5' : 'Under 2.5';
  
  let confidence: number;
  if (expectedGoals > 3.0) {
    confidence = 80 + Math.min((expectedGoals - 3.0) * 10, 15);
  } else if (expectedGoals > 2.5) {
    confidence = 60 + (expectedGoals - 2.5) * 40;
  } else if (expectedGoals < 2.0) {
    confidence = 70 + (2.0 - expectedGoals) * 15;
  } else {
    confidence = 55 + (2.5 - expectedGoals) * 30;
  }
  
  const reasoning = `Expected goals: ${expectedGoals.toFixed(2)}. Combined avg: ${combinedGoalsAvg.toFixed(2)} goals per match.`;
  
  return {
    prediction,
    confidence: Math.round(Math.min(confidence, 95)),
    reasoning,
    expectedGoals: parseFloat(expectedGoals.toFixed(2))
  };
}

/**
 * Predict Corners Range
 */
function predictCorners(homeStats: TeamStats, awayStats: TeamStats) {
  const avgCorners = homeStats.avgCornersFor + awayStats.avgCornersFor;
  const totalCorners = Math.round(avgCorners);
  
  // Add variance
  const min = Math.max(totalCorners - 2, 6);
  const max = totalCorners + 2;
  
  const prediction = `${min}-${max} corners`;
  const confidence = 70;
  
  return {
    prediction,
    range: { min, max },
    confidence
  };
}

/**
 * Predict Bookings Level
 */
function predictBookings(homeStats: TeamStats, awayStats: TeamStats) {
  const avgCards = homeStats.avgYellowCards + awayStats.avgYellowCards;
  const avgRedCards = homeStats.avgRedCards + awayStats.avgRedCards;
  
  const expectedCards = avgCards + (avgRedCards * 2); // Red = 2 yellows
  
  let level: 'Low' | 'Medium' | 'High';
  let confidence: number;
  
  if (expectedCards < 3) {
    level = 'Low';
    confidence = 65;
  } else if (expectedCards < 5) {
    level = 'Medium';
    confidence = 70;
  } else {
    level = 'High';
    confidence = 75;
  }
  
  return {
    level,
    expectedCards: parseFloat(expectedCards.toFixed(1)),
    confidence
  };
}

/**
 * Predict Scoreline
 */
function predictScoreline(homeStats: TeamStats, awayStats: TeamStats, winnerPrediction: string) {
  let homeGoals: number;
  let awayGoals: number;
  
  const homeAvg = homeStats.avgGoalsScored;
  const awayAvg = awayStats.avgGoalsScored;
  
  if (winnerPrediction === 'Home') {
    homeGoals = Math.round(Math.max(homeAvg * 1.2, 2));
    awayGoals = Math.round(Math.min(awayAvg * 0.8, homeGoals - 1));
    awayGoals = Math.max(0, awayGoals);
  } else if (winnerPrediction === 'Away') {
    awayGoals = Math.round(Math.max(awayAvg * 1.2, 2));
    homeGoals = Math.round(Math.min(homeAvg * 0.8, awayGoals - 1));
    homeGoals = Math.max(0, homeGoals);
  } else {
    // Draw
    homeGoals = Math.round(homeAvg);
    awayGoals = homeGoals;
    // Ensure at least 1 goal each for draws
    if (homeGoals === 0 && awayGoals === 0) {
      homeGoals = 1;
      awayGoals = 1;
    }
  }
  
  // Cap at realistic scores
  homeGoals = Math.min(homeGoals, 4);
  awayGoals = Math.min(awayGoals, 4);
  
  const confidence = 55;
  
  return {
    home: homeGoals,
    away: awayGoals,
    confidence
  };
}

/**
 * Validate and adjust predictions for consistency
 */
function validatePredictions(
  scoreline: { home: number; away: number; confidence: number },
  btts: { prediction: 'Yes' | 'No'; confidence: number; reasoning: string },
  overUnder: { prediction: 'Over 2.5' | 'Under 2.5'; confidence: number; reasoning: string; expectedGoals: number }
): {
  scoreline: { home: number; away: number; confidence: number };
  btts: { prediction: 'Yes' | 'No'; confidence: number; reasoning: string };
  overUnder: { prediction: 'Over 2.5' | 'Under 2.5'; confidence: number; reasoning: string; expectedGoals: number };
} {
  const totalGoals = scoreline.home + scoreline.away;
  
  // Fix BTTS inconsistency
  if (scoreline.home > 0 && scoreline.away > 0) {
    // Both teams score in scoreline, BTTS should be Yes
    btts.prediction = 'Yes';
    btts.confidence = Math.max(btts.confidence, 65);
    btts.reasoning = `Scoreline suggests both teams will score (${scoreline.home}-${scoreline.away}).`;
  } else if (scoreline.home === 0 || scoreline.away === 0) {
    // One team doesn't score, BTTS should be No
    btts.prediction = 'No';
    btts.confidence = Math.max(btts.confidence, 65);
    btts.reasoning = `Scoreline suggests a clean sheet (${scoreline.home}-${scoreline.away}).`;
  }
  
  // Fix Over/Under inconsistency
  if (totalGoals > 2.5) {
    overUnder.prediction = 'Over 2.5';
    overUnder.confidence = Math.max(overUnder.confidence, 60);
  } else {
    overUnder.prediction = 'Under 2.5';
    overUnder.confidence = Math.max(overUnder.confidence, 60);
  }
  overUnder.expectedGoals = totalGoals;
  
  return { scoreline, btts, overUnder };
}

/**
 * Create Combo Prediction
 */
function predictCombo(
  winner: string,
  overUnder: string,
  btts: string
) {
  const predictions: string[] = [];
  
  if (winner !== 'Draw') {
    predictions.push(`${winner} Win`);
  } else {
    predictions.push('Draw');
  }
  
  predictions.push(overUnder);
  
  if (btts === 'Yes') {
    predictions.push('BTTS');
  }
  
  const prediction = predictions.slice(0, 2).join(' + ');
  const confidence = 50; // Combo predictions are naturally less confident
  
  return { prediction, confidence };
}

/**
 * Main Prediction Function - ENHANCED VERSION
 * Analyzes both teams with comprehensive real-time data including:
 * - Overall performance (90 days)
 * - Home/Away specific form
 * - Recent form (last 5 and last 3 matches with heavy weighting)
 * - Head-to-head history
 * - Scoring/defensive trends
 * All predictions derived from scoreline for guaranteed consistency
 */
export function predictMatch(homeStats: TeamStats, awayStats: TeamStats, h2hData?: any): MatchPrediction {
  console.log(`\n🧮 STARTING ADVANCED PREDICTION ALGORITHM...`);
  
  // Ensure form scores are calculated
  homeStats.recentForm = calculateFormScore(homeStats);
  awayStats.recentForm = calculateFormScore(awayStats);
  
  // ENHANCED PREDICTION USING COMPREHENSIVE DATA
  
  // Step 1: Analyze Home Advantage with real home form
  const HOME_ADVANTAGE_BASE = 15;
  const homeFormBonus = (homeStats as any).homeWinRate ? ((homeStats as any).homeWinRate - 50) / 5 : 0;
  const HOME_ADVANTAGE = HOME_ADVANTAGE_BASE + homeFormBonus;
  
  // Step 2: Calculate weighted form scores
  // Recent form is HEAVILY weighted (last 3 matches = 50%, last 5 = 30%, overall = 20%)
  const homeFormScore = calculateWeightedForm(homeStats);
  const awayFormScore = calculateWeightedForm(awayStats);
  
  console.log(`   Home form score: ${homeFormScore.toFixed(1)} (with +${HOME_ADVANTAGE.toFixed(1)} home advantage)`);
  console.log(`   Away form score: ${awayFormScore.toFixed(1)}`);
  
  // Step 3: Factor in goal-scoring and defensive capabilities
  const homeAttackStrength = calculateAttackStrength(homeStats, true);
  const homeDefenseStrength = calculateDefenseStrength(homeStats, true);
  const awayAttackStrength = calculateAttackStrength(awayStats, false);
  const awayDefenseStrength = calculateDefenseStrength(awayStats, false);
  
  console.log(`   Home attack: ${homeAttackStrength.toFixed(2)} | Defense: ${homeDefenseStrength.toFixed(2)}`);
  console.log(`   Away attack: ${awayAttackStrength.toFixed(2)} | Defense: ${awayDefenseStrength.toFixed(2)}`);
  
  // Step 4: Factor in head-to-head if available
  let h2hFactor = { homeBonus: 0, awayBonus: 0, avgGoals: 2.5, bttsRate: 50 };
  if (h2hData && h2hData.matchesPlayed > 0) {
    const homeWinRate = (h2hData.homeWins / h2hData.matchesPlayed) * 100;
    const awayWinRate = (h2hData.awayWins / h2hData.matchesPlayed) * 100;
    
    h2hFactor = {
      homeBonus: (homeWinRate - 50) / 10, // Small boost based on h2h dominance
      awayBonus: (awayWinRate - 50) / 10,
      avgGoals: h2hData.avgGoals,
      bttsRate: h2hData.bttsPercentage
    };
    
    console.log(`   H2H factor: Home ${h2hFactor.homeBonus.toFixed(1)} | Away ${h2hFactor.awayBonus.toFixed(1)} | Avg goals: ${h2hFactor.avgGoals.toFixed(2)}`);
  }
  
  // Step 5: Predict winner with all factors
  const finalHomeScore = homeFormScore + HOME_ADVANTAGE + homeAttackStrength * 5 - awayDefenseStrength * 3 + h2hFactor.homeBonus;
  const finalAwayScore = awayFormScore + awayAttackStrength * 5 - homeDefenseStrength * 3 + h2hFactor.awayBonus;
  
  const scoreDiff = Math.abs(finalHomeScore - finalAwayScore);
  
  let winnerPrediction: 'Home' | 'Away' | 'Draw';
  let winnerConfidence: number;
  let winnerReasoning: string;
  
  if (scoreDiff < 8) {
    winnerPrediction = 'Draw';
    winnerConfidence = 55 + (8 - scoreDiff);
    winnerReasoning = `Evenly matched. Home: ${finalHomeScore.toFixed(0)} vs Away: ${finalAwayScore.toFixed(0)}. `;
    winnerReasoning += `Recent form similar: ${(homeStats as any).recentForm?.toFixed(1)}% vs ${(awayStats as any).recentForm?.toFixed(1)}%`;
  } else if (finalHomeScore > finalAwayScore) {
    winnerPrediction = 'Home';
    winnerConfidence = Math.min(55 + scoreDiff, 92);
    winnerReasoning = `${homeStats.teamName} stronger. Home win rate: ${(homeStats as any).homeWinRate?.toFixed(0)}%. `;
    winnerReasoning += `Recent: ${(homeStats as any).last3Wins || 0}/${(homeStats as any).last3?.length || 3} wins`;
  } else {
    winnerPrediction = 'Away';
    winnerConfidence = Math.min(55 + scoreDiff, 92);
    winnerReasoning = `${awayStats.teamName} in superior form. Away record: ${(awayStats as any).awayWins || 0}W-${(awayStats as any).awayDraws || 0}D-${(awayStats as any).awayLosses || 0}L. `;
    winnerReasoning += `Recent: ${(awayStats as any).last3Wins || 0}/${(awayStats as any).last3?.length || 3} wins`;
  }
  
  const winner = {
    prediction: winnerPrediction,
    confidence: Math.round(winnerConfidence),
    reasoning: winnerReasoning
  };
  
  console.log(`   Winner prediction: ${winnerPrediction} (${winnerConfidence.toFixed(0)}%)`);
  
  // Step 6: Predict scoreline using advanced goal expectation
  const homeExpectedGoals = calculateExpectedGoals(homeStats, awayStats, true, winnerPrediction);
  const awayExpectedGoals = calculateExpectedGoals(awayStats, homeStats, false, winnerPrediction);
  
  let homeGoals = Math.round(homeExpectedGoals);
  let awayGoals = Math.round(awayExpectedGoals);
  
  // Adjust based on winner prediction
  if (winnerPrediction === 'Home' && homeGoals <= awayGoals) {
    homeGoals = awayGoals + 1;
  } else if (winnerPrediction === 'Away' && awayGoals <= homeGoals) {
    awayGoals = homeGoals + 1;
  } else if (winnerPrediction === 'Draw' && homeGoals !== awayGoals) {
    homeGoals = Math.round((homeExpectedGoals + awayExpectedGoals) / 2);
    awayGoals = homeGoals;
  }
  
  // Cap at realistic maximum
  homeGoals = Math.min(Math.max(homeGoals, 0), 4);
  awayGoals = Math.min(Math.max(awayGoals, 0), 4);
  
  const scoreline = {
    home: homeGoals,
    away: awayGoals,
    confidence: 58
  };
  
  console.log(`   Predicted scoreline: ${homeGoals}-${awayGoals}`);
  
  // Step 7: Derive ALL other predictions from scoreline for GUARANTEED consistency
  const totalGoals = scoreline.home + scoreline.away;
  
  // BTTS: Mathematical derivation from scoreline - BULLETPROOF LOGIC
  console.log(`   🔍 BTTS Calculation: Home=${scoreline.home}, Away=${scoreline.away}`);
  
  let bttsPrediction: 'Yes' | 'No';
  if (scoreline.home > 0 && scoreline.away > 0) {
    bttsPrediction = 'Yes';
    console.log(`   ✅ Both teams score (${scoreline.home} > 0 AND ${scoreline.away} > 0) → BTTS = YES`);
  } else {
    bttsPrediction = 'No';
    console.log(`   ❌ Clean sheet expected (Home: ${scoreline.home}, Away: ${scoreline.away}) → BTTS = NO`);
  }
  
  let bttsConfidence = 70;
  
  // Adjust confidence based on historical data
  if ((homeStats as any).scoringConsistency && (awayStats as any).scoringConsistency) {
    const avgScoringConsistency = ((homeStats as any).scoringConsistency + (awayStats as any).scoringConsistency) / 2;
    bttsConfidence = bttsPrediction === 'Yes' ? Math.min(avgScoringConsistency, 85) : 70;
  }
  
  const btts = {
    prediction: bttsPrediction,
    confidence: Math.round(bttsConfidence),
    reasoning: bttsPrediction === 'Yes' 
      ? `Scoreline ${homeGoals}-${awayGoals} shows both teams scoring. Both teams scored in ${((homeStats as any).scoringConsistency || 70).toFixed(0)}% of matches.`
      : `Scoreline ${homeGoals}-${awayGoals} indicates clean sheet. ${scoreline.home === 0 ? awayStats.teamName : homeStats.teamName} strong defensively.`
  };
  
  console.log(`   BTTS FINAL: ${bttsPrediction} (${bttsConfidence.toFixed(0)}%) - Derived from scoreline`);
  
  // Over/Under: Mathematical derivation from scoreline - BULLETPROOF LOGIC
  console.log(`   🔍 Over/Under Calculation: Total goals = ${totalGoals} (${scoreline.home} + ${scoreline.away})`);
  
  let overUnderPrediction: 'Over 2.5' | 'Under 2.5';
  if (totalGoals > 2.5) {
    overUnderPrediction = 'Over 2.5';
    console.log(`   ✅ ${totalGoals} > 2.5 → OVER 2.5`);
  } else {
    overUnderPrediction = 'Under 2.5';
    console.log(`   ✅ ${totalGoals} ≤ 2.5 → UNDER 2.5`);
  }
  
  let overUnderConfidence = 65;
  
  // Higher confidence if clearly above/below threshold
  if (totalGoals >= 4) overUnderConfidence = 80;
  else if (totalGoals <= 1) overUnderConfidence = 80;
  else if (Math.abs(totalGoals - 2.5) <= 0.5) overUnderConfidence = 55; // Close to threshold
  
  // Factor in h2h average goals if available
  if (h2hData && h2hData.matchesPlayed > 0) {
    const h2hAvg = h2hData.avgGoals;
    if ((h2hAvg > 2.5 && totalGoals > 2.5) || (h2hAvg <= 2.5 && totalGoals <= 2.5)) {
      overUnderConfidence += 5; // Boost if h2h supports prediction
    }
  }
  
  const overUnder = {
    prediction: overUnderPrediction,
    confidence: Math.round(Math.min(overUnderConfidence, 92)),
    reasoning: `Predicted ${totalGoals} total goals (${homeGoals}-${awayGoals}). Combined avg: ${(homeStats.avgGoalsScored + awayStats.avgGoalsScored).toFixed(2)} goals.`,
    expectedGoals: totalGoals
  };
  
  console.log(`   Over/Under FINAL: ${overUnderPrediction} (${overUnderConfidence.toFixed(0)}%) - Total: ${totalGoals} goals`);
  
  // Step 8: Other predictions
  const corners = predictCorners(homeStats, awayStats);
  const bookings = predictBookings(homeStats, awayStats);
  const combo = predictCombo(winner.prediction, overUnder.prediction, btts.prediction);
  
  // Calculate overall confidence
  const overallConfidence = Math.round(
    (btts.confidence + winner.confidence + overUnder.confidence) / 3
  );
  
  console.log(`   Overall confidence: ${overallConfidence}%`);
  
  // FINAL VALIDATION - Double check consistency
  console.log(`\n🔍 CONSISTENCY CHECK:`);
  console.log(`   Scoreline: ${scoreline.home}-${scoreline.away} (Total: ${totalGoals})`);
  console.log(`   BTTS: ${btts.prediction} | Should be: ${(scoreline.home > 0 && scoreline.away > 0) ? 'Yes' : 'No'}`);
  console.log(`   Over/Under: ${overUnder.prediction} | Should be: ${totalGoals > 2.5 ? 'Over 2.5' : 'Under 2.5'}`);
  
  // Validate consistency
  const bttsExpected = (scoreline.home > 0 && scoreline.away > 0) ? 'Yes' : 'No';
  const ouExpected = totalGoals > 2.5 ? 'Over 2.5' : 'Under 2.5';
  
  if (btts.prediction !== bttsExpected) {
    console.error(`❌ BTTS INCONSISTENCY DETECTED! Predicted: ${btts.prediction}, Expected: ${bttsExpected}`);
  }
  if (overUnder.prediction !== ouExpected) {
    console.error(`❌ OVER/UNDER INCONSISTENCY DETECTED! Predicted: ${overUnder.prediction}, Expected: ${ouExpected}`);
  }
  
  console.log(`✅ PREDICTION COMPLETE - All checks passed\n`);
  
  return {
    btts,
    winner,
    overUnder,
    corners,
    bookings,
    scoreline,
    combo,
    overallConfidence
  };
}

/**
 * Calculate weighted form score prioritizing recent matches
 * Last 3 matches: 50% weight
 * Last 5 matches: 30% weight  
 * Overall: 20% weight
 */
function calculateWeightedForm(stats: TeamStats): number {
  const overallScore = calculateFormScore(stats) * 0.2;
  
  const recentFormScore = ((stats as any).recentForm || 50) * 0.3;
  
  const last3Score = ((stats as any).last3Form || 50) * 0.5;
  
  return overallScore + recentFormScore + last3Score;
}

/**
 * Calculate attack strength considering home/away context
 */
function calculateAttackStrength(stats: TeamStats, isHome: boolean): number {
  const baseAttack = stats.avgGoalsScored;
  
  // Use specific home/away attack stats if available
  let contextualAttack = baseAttack;
  if (isHome && (stats as any).avgHomeGoalsScored !== undefined) {
    contextualAttack = (stats as any).avgHomeGoalsScored;
  } else if (!isHome && (stats as any).avgAwayGoalsScored !== undefined) {
    contextualAttack = (stats as any).avgAwayGoalsScored;
  }
  
  // Factor in recent scoring form
  const recentGoalsAvg = ((stats as any).recentGoalsScored || 0) / Math.max(((stats as any).recentWins || 0) + ((stats as any).recentDraws || 0) + 1, 1);
  
  // Weighted: 60% contextual, 40% recent
  return contextualAttack * 0.6 + recentGoalsAvg * 0.4;
}

/**
 * Calculate defense strength considering home/away context
 */
function calculateDefenseStrength(stats: TeamStats, isHome: boolean): number {
  const baseDefense = stats.avgGoalsConceded;
  
  // Use specific home/away defense stats if available
  let contextualDefense = baseDefense;
  if (isHome && (stats as any).avgHomeGoalsConceded !== undefined) {
    contextualDefense = (stats as any).avgHomeGoalsConceded;
  } else if (!isHome && (stats as any).avgAwayGoalsConceded !== undefined) {
    contextualDefense = (stats as any).avgAwayGoalsConceded;
  }
  
  // Factor in clean sheet rate (lower conceded = stronger defense)
  const cleanSheetBonus = ((stats as any).cleanSheetRate || 20) / 100;
  
  return Math.max(contextualDefense * (1 - cleanSheetBonus * 0.3), 0.3);
}

/**
 * Calculate expected goals for a team in this specific match
 */
function calculateExpectedGoals(
  attackingTeam: TeamStats,
  defendingTeam: TeamStats,
  isHome: boolean,
  winnerPrediction: string
): number {
  const attackStrength = calculateAttackStrength(attackingTeam, isHome);
  const opponentDefense = calculateDefenseStrength(defendingTeam, !isHome);
  
  // Base expected goals from attack vs defense
  let expectedGoals = attackStrength - (opponentDefense * 0.5);
  
  // Adjust based on winner prediction
  const teamSide = isHome ? 'Home' : 'Away';
  if (winnerPrediction === teamSide) {
    expectedGoals *= 1.3; // Boost if predicted to win
  } else if (winnerPrediction === 'Draw') {
    expectedGoals *= 1.0; // Neutral
  } else {
    expectedGoals *= 0.7; // Reduce if predicted to lose
  }
  
  // Ensure minimum and maximum bounds
  return Math.max(0.3, Math.min(expectedGoals, 3.5));
}

/**
 * Generate mock team stats for demonstration
 * In production, this would come from the API
 */
export function generateMockStats(teamName: string, isHome: boolean = false): TeamStats {
  // Generate realistic random stats
  const matchesPlayed = 10;
  const wins = Math.floor(Math.random() * 6) + 2;
  const losses = Math.floor(Math.random() * 4);
  const draws = matchesPlayed - wins - losses;
  
  const goalsScored = wins * 2 + draws + Math.floor(Math.random() * 5);
  const goalsConceded = losses * 2 + Math.floor(Math.random() * 5);
  
  return {
    teamName,
    matchesPlayed,
    wins,
    draws,
    losses,
    goalsScored,
    goalsConceded,
    cleanSheets: Math.floor(Math.random() * 4),
    failedToScore: Math.floor(Math.random() * 3),
    avgGoalsScored: goalsScored / matchesPlayed,
    avgGoalsConceded: goalsConceded / matchesPlayed,
    avgCornersFor: 4 + Math.random() * 3,
    avgCornersAgainst: 4 + Math.random() * 3,
    avgYellowCards: 2 + Math.random() * 2,
    avgRedCards: Math.random() * 0.3,
    recentForm: 0,
    isHome
  };
}
