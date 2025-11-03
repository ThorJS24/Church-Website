import { NextRequest, NextResponse } from 'next/server';
import { fetchSanityData } from '@/lib/sanity-optimized';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const results: any = {};
    const searchQuery = `*[_type in ["sermon", "event", "announcement", "galleryImage"] && (title match "${query}*" || description match "${query}*")] | order(_createdAt desc)[0...${limit}]`;
    
    const searchResults = await fetchSanityData(searchQuery, {}); // cached
    
    // Group results by type
    results.sermons = searchResults.filter((item: any) => item._type === 'sermon');
    results.events = searchResults.filter((item: any) => item._type === 'event');
    results.announcements = searchResults.filter((item: any) => item._type === 'announcement');
    results.gallery = searchResults.filter((item: any) => item._type === 'galleryImage');

    const totalResults = searchResults.length;

    return NextResponse.json({
      query,
      totalResults,
      results
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ 
      query: request.url,
      totalResults: 0,
      results: {}
    });
  }
}