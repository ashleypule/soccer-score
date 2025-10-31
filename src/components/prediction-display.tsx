'use client';

import { useState } from 'react';
import { Sparkles, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, BarChart3, Trophy, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { MatchPrediction } from '@/lib/predictionEngine';

interface PredictionDisplayProps {
  prediction: MatchPrediction;
  isVisible: boolean;
}

export function PredictionDisplay({ prediction, isVisible }: PredictionDisplayProps) {
  const [showStats, setShowStats] = useState(true);

  if (!isVisible) return null;

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 75) return 'text-green-600 dark:text-green-400';
    if (confidence >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getConfidenceBg = (confidence: number): string => {
    if (confidence >= 75) return 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700';
    if (confidence >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700';
    return 'bg-orange-100 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700';
  };

  const WinnerIcon = prediction.winner.prediction === 'Home' ? TrendingUp : 
                     prediction.winner.prediction === 'Away' ? TrendingDown : Minus;

  const hasStats = prediction.teamStats !== undefined;

  return (
    <div className="mt-4 animate-in slide-in-from-top-2 duration-500 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
            AI Prediction Analysis
          </span>
        </div>
        <Badge variant="outline" className="text-base px-3 py-1">
          {prediction.overallConfidence}% confidence
        </Badge>
      </div>

      {/* Team Statistics (if available) */}
      {hasStats && prediction.teamStats && (
        <div className="space-y-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStats(!showStats)}
            className="w-full flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Team Statistics & Analysis
            </span>
            {showStats ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>

          {showStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Home Team Stats */}
              <Card className="p-4 border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-bold text-blue-900 dark:text-blue-100">
                    {prediction.teamStats.home.name} (HOME)
                  </h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Overall:</span>
                    <span className="font-semibold ml-2">{prediction.teamStats.home.matchesPlayed} matches | {prediction.teamStats.home.record}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Home form:</span>
                    <span className="font-semibold ml-2">{prediction.teamStats.home.homeRecord} | Win rate: {prediction.teamStats.home.homeWinRate.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Goals:</span>
                    <span className="font-semibold ml-2">{prediction.teamStats.home.goals}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Average:</span>
                    <span className="font-semibold ml-2">{prediction.teamStats.home.avgGoals}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Home attack/defense:</span>
                    <span className="font-semibold ml-2">{prediction.teamStats.home.homeAvgGoals}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Recent form (last 5):</span>
                    <span className="font-semibold ml-2">{prediction.teamStats.home.recentForm}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last 3 matches:</span>
                    <span className="font-semibold ml-2">{prediction.teamStats.home.last3}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Clean sheets:</span>
                    <span className="font-semibold ml-2">{prediction.teamStats.home.cleanSheets}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Goal difference:</span>
                    <span className="font-semibold ml-2">{prediction.teamStats.home.goalDifference}</span>
                  </div>
                </div>
              </Card>

              {/* Away Team Stats */}
              <Card className="p-4 border-2 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <h3 className="font-bold text-red-900 dark:text-red-100">
                    {prediction.teamStats.away.name} (AWAY)
                  </h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Overall:</span>
                    <span className="font-semibold ml-2">{prediction.teamStats.away.matchesPlayed} matches | {prediction.teamStats.away.record}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Away form:</span>
                    <span className="font-semibold ml-2">{prediction.teamStats.away.awayRecord} | Win rate: {prediction.teamStats.away.awayWinRate.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Goals:</span>
                    <span className="font-semibold ml-2">{prediction.teamStats.away.goals}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Average:</span>
                    <span className="font-semibold ml-2">{prediction.teamStats.away.avgGoals}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Away attack/defense:</span>
                    <span className="font-semibold ml-2">{prediction.teamStats.away.awayAvgGoals}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Recent form (last 5):</span>
                    <span className="font-semibold ml-2">{prediction.teamStats.away.recentForm}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last 3 matches:</span>
                    <span className="font-semibold ml-2">{prediction.teamStats.away.last3}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Clean sheets:</span>
                    <span className="font-semibold ml-2">{prediction.teamStats.away.cleanSheets}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Goal difference:</span>
                    <span className="font-semibold ml-2">{prediction.teamStats.away.goalDifference}</span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Head-to-Head */}
          {prediction.h2hData && prediction.h2hData.matchesPlayed > 0 && showStats && (
            <Card className="p-4 border-2 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="font-bold text-purple-900 dark:text-purple-100">Head-to-Head History</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground block">Matches</span>
                  <span className="font-bold text-lg">{prediction.h2hData.matchesPlayed}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground block">Results</span>
                  <span className="font-semibold">{prediction.h2hData.distribution}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Avg Goals</span>
                  <span className="font-bold text-lg">{prediction.h2hData.avgGoals.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                BTTS: {prediction.h2hData.bttsPercentage.toFixed(1)}% of matches
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Main Predictions */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="font-bold text-lg">Predictions</h3>
        </div>

        {/* Predicted Scoreline - Prominent */}
        <Card className="p-4 border-2 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-pink-950/30 border-indigo-300 dark:border-indigo-700">
          <div className="text-center">
            <div className="text-sm font-medium text-muted-foreground mb-2">PREDICTED SCORELINE</div>
            <div className="text-5xl font-bold text-indigo-900 dark:text-indigo-100 mb-2">
              {prediction.scoreline.home} - {prediction.scoreline.away}
            </div>
            <Badge variant="outline" className="text-sm">
              Expected {prediction.overUnder.expectedGoals} total goals
            </Badge>
          </div>
        </Card>

        {/* Winner Prediction */}
        <Card className={`p-4 border-2 ${getConfidenceBg(prediction.winner.confidence)}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <WinnerIcon className={`w-5 h-5 ${getConfidenceColor(prediction.winner.confidence)}`} />
                <span className="text-sm font-semibold uppercase tracking-wide">Match Winner</span>
              </div>
              <div className="text-2xl font-bold mb-2">{prediction.winner.prediction}</div>
              <p className="text-sm text-muted-foreground mb-3">{prediction.winner.reasoning}</p>
              <Progress 
                value={prediction.winner.confidence} 
                className="h-2" 
              />
            </div>
            <Badge className={`${getConfidenceColor(prediction.winner.confidence)} text-lg px-3 py-1`}>
              {prediction.winner.confidence}%
            </Badge>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          {/* BTTS */}
          <Card className={`p-4 border-2 ${getConfidenceBg(prediction.btts.confidence)}`}>
            <div className="text-xs font-semibold uppercase tracking-wide mb-2 text-muted-foreground">Both Teams To Score</div>
            <div className="text-2xl font-bold mb-2">{prediction.btts.prediction}</div>
            <Progress value={prediction.btts.confidence} className="h-1 mb-2" />
            <Badge variant="outline" className="text-xs">
              {prediction.btts.confidence}% confident
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">{prediction.btts.reasoning}</p>
          </Card>

          {/* Over/Under */}
          <Card className={`p-4 border-2 ${getConfidenceBg(prediction.overUnder.confidence)}`}>
            <div className="text-xs font-semibold uppercase tracking-wide mb-2 text-muted-foreground">Total Goals</div>
            <div className="text-2xl font-bold mb-2">{prediction.overUnder.prediction}</div>
            <Progress value={prediction.overUnder.confidence} className="h-1 mb-2" />
            <Badge variant="outline" className="text-xs">
              {prediction.overUnder.confidence}% confident
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">{prediction.overUnder.reasoning}</p>
          </Card>
        </div>

        {/* Additional Predictions */}
        <div className="grid grid-cols-3 gap-3">
          {/* Corners */}
          <Card className="p-3 border-2">
            <div className="text-xs font-semibold mb-1 text-muted-foreground">Corners</div>
            <div className="text-lg font-bold">{prediction.corners.prediction}</div>
            <div className="text-xs text-muted-foreground mt-1">{prediction.corners.confidence}% confident</div>
          </Card>

          {/* Bookings */}
          <Card className="p-3 border-2">
            <div className="text-xs font-semibold mb-1 text-muted-foreground">Cards</div>
            <div className="text-lg font-bold">{prediction.bookings.level}</div>
            <div className="text-xs text-muted-foreground">~{prediction.bookings.expectedCards} cards</div>
          </Card>

          {/* Combo */}
          <Card className="p-3 border-2">
            <div className="text-xs font-semibold mb-1 text-muted-foreground">Combo Bet</div>
            <div className="text-sm font-bold leading-tight">{prediction.combo.prediction}</div>
            <div className="text-xs text-muted-foreground mt-1">{prediction.combo.confidence}%</div>
          </Card>
        </div>

        {/* Data Source */}
        <div className="text-xs text-muted-foreground border-t pt-3 mt-3 flex items-center gap-2">
          <Sparkles className="w-3 h-3" />
          <span>
            {hasStats 
              ? "Analysis based on real team performance from last 90 days of matches" 
              : "Prediction generated using AI analysis"}
          </span>
        </div>
      </div>
    </div>
  );
}
