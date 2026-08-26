import { NextRequest, NextResponse } from 'next/server';
import { resolveMinistry } from '@/lib/repositories/ministries';
import { isEffectivelyPublished } from '@/lib/content';

/**
 * Domain-shaped read: a ministry with its leaders, groups, upcoming events,
 * and open volunteer opportunities resolved — see architecture doc §5.
 * Public (ministries are public-read content), but respects draft/publishAt
 * the same way lib/content.ts's client-side reads do.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const ministry = await resolveMinistry(id);
    if (!ministry || !isEffectivelyPublished(ministry)) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, ministry });
  } catch (error) {
    console.error(`Error resolving ministry ${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to load ministry' }, { status: 500 });
  }
}
