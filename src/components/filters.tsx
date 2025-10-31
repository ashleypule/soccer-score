'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { League } from '@/lib/types';

interface FiltersProps {
  leagues: League[];
  onLeagueChange: (leagueId: string) => void;
  onDateRangeChange: (range: string) => void;
  onStatusChange: (status: string) => void;
}

export function Filters({ 
  leagues, 
  onLeagueChange, 
  onDateRangeChange, 
  onStatusChange 
}: FiltersProps) {
  console.log('Filters component - leagues:', leagues);
  
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('7days');
  
  // Function to display custom league names
  const getDisplayName = (leagueName: string) => {
    if (leagueName === 'Primera Division') {
      return 'LaLiga';
    }
    return leagueName;
  };
  
  // Date ranges for fixtures (upcoming matches)
  const fixturesDateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'next7days', label: 'Next 7 Days' },
    { value: 'next30days', label: 'Next 30 Days' },
  ];
  
  // Date ranges for finished matches
  const finishedDateRanges = [
    { value: 'today', label: 'Today' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '1year', label: 'Last 1 Year' },
  ];
  
  // Date ranges for all matches (default)
  const allDateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'next7days', label: 'Next 7 Days' },
    { value: 'next30days', label: 'Next 30 Days' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '1year', label: 'Last 1 Year' },
  ];
  
  // Determine which date ranges to show based on status
  const getDateRanges = () => {
    if (selectedStatus === 'scheduled') return fixturesDateRanges;
    if (selectedStatus === 'finished') return finishedDateRanges;
    if (selectedStatus === 'live') return [{ value: 'today', label: 'Today' }];
    return allDateRanges;
  };

  const statuses = [
    { value: 'all', label: 'All Matches' },
    { value: 'live', label: 'Live' },
    { value: 'scheduled', label: 'Fixtures (Upcoming)' },
    { value: 'finished', label: 'Finished' },
  ];
  
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    
    // Reset date range to appropriate default when status changes
    let newDateRange = 'today';
    if (status === 'scheduled') {
      newDateRange = 'next7days';
    } else if (status === 'finished') {
      newDateRange = '7days';
    } else if (status === 'all') {
      newDateRange = '7days';
    }
    
    setSelectedDateRange(newDateRange);
    onDateRangeChange(newDateRange);
    onStatusChange(status);
  };
  
  const handleDateRangeChange = (range: string) => {
    setSelectedDateRange(range);
    onDateRangeChange(range);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Select onValueChange={onLeagueChange} defaultValue="all">
        <SelectTrigger className="w-full">
          <SelectValue placeholder="All Leagues" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Leagues</SelectItem>
          {leagues && leagues.length > 0 ? (
            leagues.map((league) => (
              <SelectItem key={league.id} value={league.name}>
                {getDisplayName(league.name)}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="loading" disabled>Loading leagues...</SelectItem>
          )}
        </SelectContent>
      </Select>
      <Select onValueChange={handleDateRangeChange} value={selectedDateRange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select date range" />
        </SelectTrigger>
        <SelectContent>
          {getDateRanges().map((range) => (
            <SelectItem key={range.value} value={range.value}>
              {range.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select onValueChange={handleStatusChange} value={selectedStatus}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="All Matches" />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
