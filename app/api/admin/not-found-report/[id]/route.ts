import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/api-auth';

// Dismiss a 404 report row (e.g. once a redirect has been added for it).
// Not audit-logged — this is housekeeping on telemetry, not a content or
// access-control change.
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { id } = await params;

  try {
    await getAdminDb().collection('notFoundHits').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error dismissing 404 report ${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to dismiss' }, { status: 500 });
  }
}
