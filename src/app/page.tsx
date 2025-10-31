import { Suspense } from 'react';
import { Header } from '@/components/header';
import { MatchesContainer } from '@/components/matches-container';
import { fetchMatches, fetchLeagues } from '@/lib/api-client';
import { Loader } from '@/components/loader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { Match, League } from '@/lib/types';

export default async function Home() {
  let initialMatches: Match[] = [];
  let leagues: League[] = [];
  let error: string | null = null;

  try {
    // Fetch initial data on the server - last 7 days of matches
    const [matchesData, leaguesData] = await Promise.all([
      fetchMatches({ daysBack: 7, daysForward: 0 }),
      fetchLeagues(),
    ]);
    
    initialMatches = matchesData;
    leagues = leaguesData;
    
    console.log('Page loaded - Leagues:', leagues.length, leagues);
    console.log('Page loaded - Matches:', initialMatches.length);

    // If no matches found, extend the range
    if (initialMatches.length === 0) {
      console.log('No matches in last 7 days, extending to 14 days');
      initialMatches = await fetchMatches({ daysBack: 14, daysForward: 0 });
    }
  } catch (err: any) {
    console.error('Error loading initial data:', err);
    error = err.message || 'Failed to load match data';
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-grow flex flex-col">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}. Please check your API configuration in .env.local
            </AlertDescription>
          </Alert>
        )}
        
        {!error && initialMatches.length === 0 && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Matches Found</AlertTitle>
            <AlertDescription>
              No matches available for the selected time period. Try adjusting the filters or check back later.
            </AlertDescription>
          </Alert>
        )}

        <Suspense fallback={<div className="flex justify-center items-center h-full"><Loader /></div>}>
          <MatchesContainer initialMatches={initialMatches} leagues={leagues} />
        </Suspense>
      </main>
    </div>
  );
}
