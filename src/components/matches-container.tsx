'use client';

import { useState, useEffect, useMemo } from 'react';
import { Filters } from './filters';
import { MatchList } from './match-list';
import { Loader } from './loader';
import type { Match, League } from '@/lib/types';

interface MatchesContainerProps {
  initialMatches: Match[];
  leagues: League[];
}

export function MatchesContainer({ initialMatches, leagues }: MatchesContainerProps) {
  const [matches, setMatches] = useState<Match[]>(Array.isArray(initialMatches) ? initialMatches : []);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>(Array.isArray(initialMatches) ? initialMatches : []);
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('7days');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Extract unique leagues from matches if leagues prop is empty - use useMemo to recalculate when matches change
  const availableLeagues = useMemo(() => {
    if (leagues && leagues.length > 0) {
      return leagues;
    }
    
    return Array.from(
      new Map(
        matches
          .filter(m => m.league)
          .map(m => [m.league.id, m.league])
      ).values()
    );
  }, [leagues, matches]);

  console.log('Available leagues:', availableLeagues);
  console.log('Selected league:', selectedLeague);

  // Apply filters whenever selection changes
  useEffect(() => {
    // Ensure matches is always an array
    const matchesArray = Array.isArray(matches) ? matches : [];
    let filtered = [...matchesArray];

    console.log('Filtering matches:', {
      totalMatches: matchesArray.length,
      selectedLeague,
      selectedStatus,
      sampleLeagues: matchesArray.slice(0, 3).map(m => ({
        id: m.league?.id,
        code: m.league?.code,
        name: m.league?.name
      }))
    });

    // Filter by league
    if (selectedLeague !== 'all') {
      console.log('Filtering by league:', selectedLeague);
      
      filtered = filtered.filter(match => {
        if (!match.league) {
          console.log('Match has no league:', match);
          return false;
        }
        
        // Check by ID, code, or name
        const isMatch = (
          String(match.league.id) === selectedLeague ||
          match.league.code === selectedLeague ||
          match.league.name === selectedLeague
        );
        
        if (isMatch) {
          console.log('Match found for league:', match.league.name, match.teams.home.name, 'vs', match.teams.away.name);
        }
        
        return isMatch;
      });
      
      console.log('After league filter:', filtered.length, 'matches for league:', selectedLeague);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(match => {
        const status = match.status.toLowerCase();
        if (selectedStatus === 'live') {
          return status === 'in_play' || status === 'paused' || status === 'live' || status === 'ongoing';
        } else if (selectedStatus === 'finished') {
          return status === 'finished';
        } else if (selectedStatus === 'scheduled') {
          return status === 'scheduled' || status === 'timed';
        }
        return true;
      });
    }

    // Sort by date
    // For fixtures/scheduled matches OR forward-looking date ranges, show nearest dates first (ascending)
    // For other matches, show most recent first (descending)
    const isForwardLooking = selectedDateRange === 'next7days' || selectedDateRange === 'next30days';
    
    if (selectedStatus === 'scheduled' || isForwardLooking) {
      filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else {
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    setFilteredMatches(filtered);
  }, [matches, selectedLeague, selectedStatus, selectedDateRange]);

  // Fetch new matches when date range changes
  useEffect(() => {
    const fetchMatchesForDateRange = async () => {
      setIsLoading(true);
      try {
        const daysMap: Record<string, { daysBack: number; daysForward: number }> = {
          today: { daysBack: 0, daysForward: 1 },
          'next7days': { daysBack: 0, daysForward: 7 },
          'next30days': { daysBack: 0, daysForward: 30 },
          '3days': { daysBack: 3, daysForward: 0 },
          '7days': { daysBack: 7, daysForward: 0 },
          '30days': { daysBack: 30, daysForward: 0 },
          '1year': { daysBack: 365, daysForward: 0 },
        };

        const { daysBack, daysForward } = daysMap[selectedDateRange] || { daysBack: 7, daysForward: 0 };

        const response = await fetch(`/api/matches?daysBack=${daysBack}&daysForward=${daysForward}`);
        if (!response.ok) throw new Error('Failed to fetch matches');
        
        const data = await response.json();
        // Handle both array and object responses
        const matchesData = Array.isArray(data) ? data : (data.matches || []);
        setMatches(matchesData);
      } catch (error) {
        console.error('Error fetching matches:', error);
        setMatches([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatchesForDateRange();
  }, [selectedDateRange]);

  return (
    <>
      <Filters
        leagues={availableLeagues}
        onLeagueChange={setSelectedLeague}
        onDateRangeChange={setSelectedDateRange}
        onStatusChange={setSelectedStatus}
      />
      <div className="mt-6 flex-grow relative">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader />
          </div>
        ) : (
          <MatchList initialMatches={filteredMatches} />
        )}
      </div>
    </>
  );
}
