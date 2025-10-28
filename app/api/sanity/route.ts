import { createClient } from '@sanity/client';
import { NextRequest, NextResponse } from 'next/server';

const client = createClient({
  projectId: 'jon2drzn',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
});

export async function POST(request: NextRequest) {
  try {
    const { query, params } = await request.json();
    const result = await client.fetch(query, params);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Sanity API error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}