import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, serializeTimestamps } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/api-auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { id } = await params;

  try {
    const snap = await getAdminDb().collection('eventRegistrations').where('eventId', '==', id).get();
    const registrations = snap.docs
      .map((d) => serializeTimestamps({ id: d.id, ...d.data() }) as any)
      .sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime());

    const confirmed = registrations.filter((r) => r.status === 'confirmed');
    const waitlisted = registrations.filter((r) => r.status === 'waitlisted');

    return NextResponse.json({
      success: true,
      registrations,
      summary: {
        confirmedHeadcount: confirmed.reduce((sum, r) => sum + (r.headcount || 1), 0),
        waitlistedHeadcount: waitlisted.reduce((sum, r) => sum + (r.headcount || 1), 0),
        confirmedCount: confirmed.length,
        waitlistedCount: waitlisted.length,
      },
    });
  } catch (error) {
    console.error(`Error fetching registrations for event ${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to fetch registrations' }, { status: 500 });
  }
}
