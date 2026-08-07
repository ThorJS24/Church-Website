import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAuth } from '@/lib/api-auth';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAuth(request);
  if (!authResult.ok) return authResult.response;
  const { id } = await params;

  try {
    const db = getAdminDb();
    const doc = await db.collection('notifications').doc(id).get();
    if (!doc.exists) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    // Ownership check — a notification only belongs to the email it was
    // created for, same as how eventRegistrations/prayerRequests scope
    // reads by email rather than uid.
    if (doc.data()!.email !== authResult.user.email?.toLowerCase()) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }
    await doc.ref.update({ read: true });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error marking notification ${id} read:`, error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
