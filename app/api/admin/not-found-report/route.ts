import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const snap = await getAdminDb().collection('notFoundHits').get();
    const hits = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => (b.count ?? 0) - (a.count ?? 0));
    return NextResponse.json({ success: true, hits });
  } catch (error) {
    console.error('Error fetching 404 report:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch report' }, { status: 500 });
  }
}
