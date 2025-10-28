import { sanityClient } from '@/lib/sanity';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const paramsStr = searchParams.get('params');

  if (!query) {
    return NextResponse.json({ message: 'Query is required' }, { status: 400 });
  }

  try {
    const params = paramsStr ? JSON.parse(paramsStr) : {};
    const data = await sanityClient.fetch(query, params);
    
    // Add CORS headers
    const response = NextResponse.json(data);
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  } catch (error) {
    console.error('Sanity proxy error:', error);
    return NextResponse.json({ message: 'Error fetching data from Sanity', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
