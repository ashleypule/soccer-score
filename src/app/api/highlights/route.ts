import { NextRequest, NextResponse } from 'next/server';
import { fetchAllHighlights } from '@/lib/highlights-api';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export async function GET(request: NextRequest) {
  try {
    const highlights = await fetchAllHighlights();

    return NextResponse.json({
      success: true,
      count: highlights.length,
      highlights,
    });
  } catch (error: any) {
    console.error('Error in highlights API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch highlights',
        highlights: [],
      },
      { status: 500 }
    );
  }
}
