import { sanityClient } from '@/lib/sanity';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ message: 'Query is required' }, { status: 400 });
  }

  try {
    const data = await sanityClient.fetch(query);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching data from Sanity', error }, { status: 500 });
  }
}
