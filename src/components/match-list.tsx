'use client';

import { useState, useEffect, useRef } from 'react';
import { MatchCard } from './match-card';
import { Loader } from './loader';
import { fetchLiveMatches } from '@/lib/api-client';
import type { Match } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export function MatchList({ initialMatches }: { initialMatches: Match[] }) {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Update matches when initialMatches changes (from filtering)
  useEffect(() => {
    setMatches(initialMatches);
  }, [initialMatches]);

  // Auto-refresh live matches every 2 minutes
  useEffect(() => {
    const refreshLiveMatches = async () => {
      try {
        const liveMatches = await fetchLiveMatches();
        if (liveMatches.length > 0) {
          setMatches(prevMatches => {
            const updatedMatches = [...prevMatches];
            liveMatches.forEach(liveMatch => {
              const index = updatedMatches.findIndex(m => m.id === liveMatch.id);
              if (index !== -1) {
                updatedMatches[index] = liveMatch;
              }
            });
            return updatedMatches;
          });
          
          toast({
            title: "Live Updates",
            description: `${liveMatches.length} live match(es) updated.`,
          });
        }
      } catch (error) {
        console.error('Error refreshing live matches:', error);
      }
    };

    const interval = setInterval(refreshLiveMatches, 2 * 60 * 1000); // 2 minutes
    return () => clearInterval(interval);
  }, [toast]);

  return (
    <div ref={scrollContainerRef} className="h-full max-h-[calc(100vh-220px)] overflow-y-auto flex flex-col p-1">
      {isLoading && (
        <div className="flex justify-center items-center py-6">
          <Loader />
        </div>
      )}
      
      {matches.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center h-full text-center py-12">
          <p className="text-xl text-muted-foreground mb-2">No matches found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting the date range or check back later
          </p>
        </div>
      )}

      {matches.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
          {matches.map((match) => (
            <MatchCard key={`${match.id}-${match.date}`} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
