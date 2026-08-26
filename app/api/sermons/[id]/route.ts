import { NextRequest, NextResponse } from 'next/server';
import { resolveSermon } from '@/lib/repositories/sermons';
import { isEffectivelyPublished } from '@/lib/content';

/**
 * Domain-shaped read: a sermon with its speaker, series (+ sibling sermons
 * in that series), and primary media asset resolved — see architecture
 * doc §5. Public (sermons are public-read content).
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const sermon = await resolveSermon(id);
    if (!sermon || !isEffectivelyPublished(sermon)) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, sermon });
  } catch (error) {
    console.error(`Error resolving sermon ${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to load sermon' }, { status: 500 });
  }
}
