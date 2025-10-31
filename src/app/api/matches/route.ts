import { NextRequest, NextResponse } from 'next/server';
import { fetchMatchesFromAllLeagues, fetchAllMatches } from '@/lib/football-api';
import { subDays, format } from 'date-fns';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate every 60 seconds

export async function GET(request: NextRequest) {
  try {
    // Debug: Check if API key is loaded
    const apiKey = process.env.FOOTBALL_DATA_API_KEY;
    console.log('🔑 API Key status:', apiKey ? `Loaded (${apiKey.substring(0, 8)}...)` : '❌ NOT FOUND');
    
    const searchParams = request.nextUrl.searchParams;
    const daysBack = parseInt(searchParams.get('daysBack') || '7', 10);
    const daysForward = parseInt(searchParams.get('daysForward') || '0', 10);
    
    // Calculate date range
    const today = new Date();
    const dateFrom = format(subDays(today, daysBack), 'yyyy-MM-dd');
    const dateTo = format(new Date(today.getTime() + daysForward * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');

    console.log(`Fetching matches from ${dateFrom} to ${dateTo}`);

    // Try to fetch from all leagues first (free tier might limit this)
    let matches;
    try {
      matches = await fetchMatchesFromAllLeagues(dateFrom, dateTo);
    } catch (error: any) {
      // If that fails, try the general matches endpoint
      console.warn('Failed to fetch from all leagues, trying general endpoint:', error.message);
      matches = await fetchAllMatches(dateFrom, dateTo);
    }

    return NextResponse.json({
      success: true,
      count: matches.length,
      dateFrom,
      dateTo,
      matches,
    });
  } catch (error: any) {
    console.error('Error in matches API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch matches',
      },
      { status: 500 }
    );
  }
}
