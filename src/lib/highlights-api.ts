// This service integrates with ScoreBat API for free match highlights
// ScoreBat provides free football highlights without requiring an API key

export interface Highlight {
  title: string;
  competition: string;
  date: string;
  thumbnail: string;
  videos: {
    title: string;
    embed: string;
  }[];
  matchId?: number;
}

const SCOREBAT_API = 'https://www.scorebat.com/video-api/v3/';

/**
 * Fetch all available highlights from ScoreBat
 */
export async function fetchAllHighlights(): Promise<Highlight[]> {
  try {
    const response = await fetch(SCOREBAT_API, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`ScoreBat API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    
    // ScoreBat returns { response: [...] }
    return data.response || [];
  } catch (error) {
    console.error('Error fetching highlights from ScoreBat:', error);
    return [];
  }
}

/**
 * Search for highlights matching team names
 */
export function findHighlightForMatch(
  highlights: Highlight[],
  homeTeam: string,
  awayTeam: string
): Highlight | null {
  if (!highlights || highlights.length === 0) return null;

  // Normalize team names for matching
  const normalizeTeam = (name: string) => 
    name.toLowerCase().replace(/fc|cf|sc|ac|afc|bfc|cfc|dfc/gi, '').trim();

  const homeNormalized = normalizeTeam(homeTeam);
  const awayNormalized = normalizeTeam(awayTeam);

  // Try to find exact match
  const exactMatch = highlights.find(h => {
    const title = h.title.toLowerCase();
    return title.includes(homeNormalized) && title.includes(awayNormalized);
  });

  if (exactMatch) return exactMatch;

  // Try partial match (at least one team)
  const partialMatch = highlights.find(h => {
    const title = h.title.toLowerCase();
    return title.includes(homeNormalized) || title.includes(awayNormalized);
  });

  return partialMatch || null;
}

/**
 * Get embed URL from highlight
 */
export function getEmbedUrl(highlight: Highlight): string | null {
  if (!highlight.videos || highlight.videos.length === 0) return null;
  
  // Get the first video's embed URL
  return highlight.videos[0].embed;
}
