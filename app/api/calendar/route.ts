import { NextRequest, NextResponse } from 'next/server';
import { getCalendarEvents } from '@/lib/google-calendar';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const maxResults = parseInt(searchParams.get('maxResults') || '10');
    
    const events = await getCalendarEvents(maxResults);
    
    return NextResponse.json({
      success: true,
      events,
      count: events.length
    });
  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}