import { NextRequest, NextResponse } from 'next/server';
import { requireModerator, withAudit } from '@/lib/api-auth';
import { recordEventAttendance, listAttendanceForEvent } from '@/lib/repositories/events';

/** Who attended this event — moderator+ only (attendance is not public-read, see architecture doc §6). */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireModerator(request);
  if (!authResult.ok) return authResult.response;

  const { id } = await params;
  try {
    const attendance = await listAttendanceForEvent(id);
    return NextResponse.json({ success: true, attendance });
  } catch (error) {
    console.error(`Error listing attendance for event ${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to load attendance' }, { status: 500 });
  }
}

/** Check a person (or a walk-in guest) in to an event — moderator+ only. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireModerator(request);
  if (!authResult.ok) return authResult.response;

  const { id: eventId } = await params;
  try {
    const body = await request.json();
    const record = await withAudit(
      authResult.user,
      request,
      { action: 'eventAttendance.create', targetType: 'eventAttendance', targetId: eventId },
      async () => {
        const result = await recordEventAttendance({
          eventId,
          personId: body.personId ?? null,
          guestName: body.guestName ?? null,
          checkedInBy: authResult.user.uid,
          method: body.method ?? 'staff',
        });
        return { after: result, result };
      }
    );
    return NextResponse.json({ success: true, attendance: record });
  } catch (error: any) {
    console.error(`Error recording attendance for event ${eventId}:`, error);
    return NextResponse.json({ success: false, message: error.message ?? 'Failed to record attendance' }, { status: 400 });
  }
}
