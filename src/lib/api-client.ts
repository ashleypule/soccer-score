import { Match, League } from './types';

// For server-side fetches, we need to use the full URL
// For client-side, relative URLs work fine
const getBaseUrl = () => {
  // Browser environment
  if (typeof window !== 'undefined') return '';
  
  // Server environment - check for Vercel URL or use localhost for dev
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Local development
  return 'http://localhost:9002';
};

export async function fetchMatches(params: {
  daysBack?: number;
  daysForward?: number;
}): Promise<Match[]> {
  try {
    const searchParams = new URLSearchParams({
      daysBack: (params.daysBack || 7).toString(),
      daysForward: (params.daysForward || 0).toString(),
    });

    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/matches?${searchParams.toString()}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch matches: ${response.statusText}`);
    }

    const data = await response.json();
    return data.matches || [];
  } catch (error) {
    console.error('Error fetching matches:', error);
    throw error;
  }
}

export async function fetchLeagues(): Promise<League[]> {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/leagues`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch leagues: ${response.statusText}`);
    }

    const data = await response.json();
    return data.leagues || [];
  } catch (error) {
    console.error('Error fetching leagues:', error);
    return [];
  }
}

export async function fetchLiveMatches(): Promise<Match[]> {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/matches/live`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch live matches: ${response.statusText}`);
    }

    const data = await response.json();
    return data.matches || [];
  } catch (error) {
    console.error('Error fetching live matches:', error);
    return [];
  }
}

// Client-side fetch for dynamic updates
export async function fetchMatchesClient(params: {
  daysBack?: number;
  daysForward?: number;
}): Promise<Match[]> {
  const searchParams = new URLSearchParams({
    daysBack: (params.daysBack || 7).toString(),
    daysForward: (params.daysForward || 0).toString(),
  });

  const response = await fetch(`/api/matches?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch matches: ${response.statusText}`);
  }

  const data = await response.json();
  return data.matches || [];
}
