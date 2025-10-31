import { NextRequest, NextResponse } from 'next/server';
import { fetchLeagues } from '@/lib/football-api';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export async function GET(request: NextRequest) {
  try {
    const leagues = await fetchLeagues();
    
    console.log('Leagues API - fetched leagues:', leagues.length, leagues);

    return NextResponse.json({
      success: true,
      count: leagues.length,
      leagues,
    });
  } catch (error: any) {
    console.error('Error in leagues API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch leagues',
        leagues: [], // Return empty array on error
      },
      { status: 500 }
    );
  }
}
