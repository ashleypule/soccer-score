'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Match } from '@/lib/types';
import { Clock, RadioTower, CheckCircle2, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { PredictionDisplay } from './prediction-display';
import { HighlightPlayer } from './highlight-player';
import { generatePrediction } from '@/lib/predictionService';
import type { MatchPrediction } from '@/lib/predictionEngine';

interface MatchCardProps {
  match: Match;
}

const statusIcons: Record<Match['status'], React.ReactNode> = {
  Scheduled: <Clock className="h-3 w-3" />,
  TIMED: <Clock className="h-3 w-3" />,
  Ongoing: <RadioTower className="h-3 w-3 animate-pulse text-green-400" />,
  IN_PLAY: <RadioTower className="h-3 w-3 animate-pulse text-green-400" />,
  PAUSED: <RadioTower className="h-3 w-3 animate-pulse text-yellow-400" />,
  LIVE: <RadioTower className="h-3 w-3 animate-pulse text-green-400" />,
  Finished: <CheckCircle2 className="h-3 w-3 text-primary" />,
};

const statusColors: Record<Match['status'], 'default' | 'secondary' | 'outline'> = {
    Finished: 'default',
    Ongoing: 'secondary',
    IN_PLAY: 'secondary',
    PAUSED: 'secondary',
    LIVE: 'secondary',
    Scheduled: 'outline',
    TIMED: 'outline',
};

export function MatchCard({ match }: MatchCardProps) {
  const matchDate = new Date(match.date);
  const [prediction, setPrediction] = useState<MatchPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPrediction, setShowPrediction] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async () => {
    if (prediction) {
      // Toggle visibility if already predicted
      setShowPrediction(!showPrediction);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await generatePrediction(
        match.id,
        match.teams.home.name,
        match.teams.away.name,
        match.teams.home.id,
        match.teams.away.id
      );
      setPrediction(result);
      setShowPrediction(true);
    } catch (error: any) {
      console.error('Failed to generate prediction:', error);
      const errorMessage = error.message || 'Failed to generate prediction';
      setError(errorMessage);
      
      // Clear error after 8 seconds
      setTimeout(() => setError(null), 8000);
    } finally {
      setIsLoading(false);
    }
  };

  // Only show predict button for scheduled matches
  const canPredict = match.status === 'Scheduled' || match.status === 'TIMED';
  
  // Show highlights for finished matches
  const showHighlights = match.status === 'Finished';

  // Map league names for better display
  const getDisplayLeagueName = (leagueName: string): string => {
    const leagueNameMap: Record<string, string> = {
      'Primera Division': 'LaLiga',
      'Primera División': 'LaLiga',
    };
    return leagueNameMap[leagueName] || leagueName;
  };

  return (
    <Card className="hover:bg-card/80 transition-colors duration-300">
      <CardContent className="p-4">
        <div className="flex justify-between items-center text-xs text-muted-foreground mb-3">
          <span>{getDisplayLeagueName(match.league.name)} - {match.round}</span>
          <time dateTime={match.date}>{format(matchDate, 'MMM d, yyyy')}</time>
        </div>
        <div className="flex items-center justify-between">
          {/* Home Team */}
          <div className="flex items-center gap-3 w-2/5">
            <span className="font-medium text-right flex-1 truncate">{match.teams.home.name}</span>
            <Image
              src={match.teams.home.logo}
              alt={`${match.teams.home.name} logo`}
              width={40}
              height={40}
              className="rounded-full"
            />
          </div>

          {/* Score / Status */}
          <div className="text-center w-1/5">
            {match.status === 'Finished' || match.status === 'Ongoing' ? (
              <div className="text-2xl font-bold">
                <span>{match.score.home}</span> - <span>{match.score.away}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="text-lg font-semibold">{format(matchDate, 'HH:mm')}</div>
                <div className="text-xs text-muted-foreground">{format(matchDate, 'MMM d')}</div>
              </div>
            )}
             <Badge variant={statusColors[match.status]} className="mt-1">
              {statusIcons[match.status]}
              <span className="ml-1.5">{match.status === 'Scheduled' || match.status === 'TIMED' ? 'Fixture' : match.status}</span>
            </Badge>
          </div>

          {/* Away Team */}
          <div className="flex items-center gap-3 w-2/5">
            <Image
              src={match.teams.away.logo}
              alt={`${match.teams.away.name} logo`}
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="font-medium text-left flex-1 truncate">{match.teams.away.name}</span>
          </div>
        </div>

        {/* Highlight Player for Finished Matches */}
        {showHighlights && (
          <div className="mt-3 pt-3 border-t">
            <HighlightPlayer
              homeTeam={match.teams.home.name}
              awayTeam={match.teams.away.name}
              matchDate={match.date}
            />
          </div>
        )}

        {/* Prediction Button for Scheduled Matches */}
        {canPredict && (
          <div className="mt-3 pt-3 border-t">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="mb-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {error}
                  {error.includes('rate limit') && (
                    <div className="mt-1 text-xs opacity-90">
                      💡 Tip: Wait 60 seconds or click predictions one at a time
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            <Button
              onClick={handlePredict}
              disabled={isLoading}
              variant={prediction ? "outline" : "default"}
              size="sm"
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : prediction ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {showPrediction ? 'Hide' : 'Show'} Prediction
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get AI Prediction
                </>
              )}
            </Button>
          </div>
        )}

        {/* Prediction Display */}
        {prediction && (
          <PredictionDisplay 
            prediction={prediction} 
            isVisible={showPrediction} 
          />
        )}
      </CardContent>
    </Card>
  );
}
