import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://api.football-data.org/v4';
const API_KEY = process.env.FOOTBALL_DATA_API_KEY || '';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const homeTeamId = searchParams.get('homeTeamId');
    const awayTeamId = searchParams.get('awayTeamId');

    if (!homeTeamId || !awayTeamId) {
      return NextResponse.json(
        { error: 'Both team IDs are required' },
        { status: 400 }
      );
    }

    console.log(`🔍 API: Fetching H2H - Team ${homeTeamId} vs Team ${awayTeamId}`);

    const response = await fetch(`${API_BASE_URL}/teams/${homeTeamId}/matches`, {
      headers: {
        'X-Auth-Token': API_KEY,
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.warn(`Failed to fetch h2h data`);
      return NextResponse.json(
        { error: 'Failed to fetch head-to-head data' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const allMatches = data.matches || [];

    // Filter for matches between these two teams
    const h2hMatches = allMatches.filter((match: any) => {
      return (
        match.status === 'FINISHED' &&
        ((match.homeTeam.id === parseInt(homeTeamId) &&
          match.awayTeam.id === parseInt(awayTeamId)) ||
          (match.homeTeam.id === parseInt(awayTeamId) &&
            match.awayTeam.id === parseInt(homeTeamId)))
      );
    });

    if (h2hMatches.length === 0) {
      return NextResponse.json({
        matchesPlayed: 0,
        homeWins: 0,
        awayWins: 0,
        draws: 0,
        avgGoals: 0,
        bttsPercentage: 0,
      });
    }

    let homeWins = 0,
      awayWins = 0,
      draws = 0;
    let totalGoals = 0;
    let bttsCount = 0;

    h2hMatches.forEach((match: any) => {
      const homeIsHome = match.homeTeam.id === parseInt(homeTeamId);
      const homeScore = homeIsHome
        ? match.score.fullTime.home
        : match.score.fullTime.away;
      const awayScore = homeIsHome
        ? match.score.fullTime.away
        : match.score.fullTime.home;

      if (homeScore !== null && awayScore !== null) {
        totalGoals += homeScore + awayScore;

        if (homeScore > awayScore) homeWins++;
        else if (awayScore > homeScore) awayWins++;
        else draws++;

        if (homeScore > 0 && awayScore > 0) bttsCount++;
      }
    });

    const h2hData = {
      matchesPlayed: h2hMatches.length,
      homeWins,
      awayWins,
      draws,
      avgGoals: totalGoals / h2hMatches.length,
      bttsPercentage: (bttsCount / h2hMatches.length) * 100,
      recentMatches: h2hMatches.slice(-3), // Last 3 h2h matches
    };

    console.log(
      `📋 H2H: ${h2hMatches.length} matches | Home wins: ${homeWins} | Away wins: ${awayWins} | Draws: ${draws}`
    );

    return NextResponse.json(h2hData);
  } catch (error) {
    console.error('Error in head-to-head API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
