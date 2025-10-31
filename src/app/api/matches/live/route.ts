import { NextRequest, NextResponse } from 'next/server';
import { fetchLiveMatches } from '@/lib/football-api';

export const dynamic = 'force-dynamic';
export const revalidate = 30; // Revalidate every 30 seconds for live matches

export async function GET(request: NextRequest) {
  try {
    const matches = await fetchLiveMatches();

    return NextResponse.json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (error: any) {
    console.error('Error in live matches API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch live matches',
      },
      { status: 500 }
    );
  }
}
