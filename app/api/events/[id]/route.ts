import { NextRequest, NextResponse } from 'next/server';
import { resolveEvent } from '@/lib/repositories/events';
import { isEffectivelyPublished } from '@/lib/content';

/**
 * Domain-shaped read: an event with its organizer/location/ministry/group
 * resolved, plus registration and attendance counts — see architecture doc
 * §5. Public (events are public-read content, same as lib/content.ts's
 * getEventById — draft/scheduled filtering only, no membership gate).
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const event = await resolveEvent(id);
    if (!event || !isEffectivelyPublished(event)) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error(`Error resolving event ${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to load event' }, { status: 500 });
  }
}
