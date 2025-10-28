import { NextRequest, NextResponse } from 'next/server';
import { getRandomVerse } from '@/lib/bible-api';

export async function GET() {
  try {
    const verse = await getRandomVerse();
    return NextResponse.json({ success: true, verse });
  } catch (error) {
    console.error('Bible API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch verse' },
      { status: 500 }
    );
  }
}