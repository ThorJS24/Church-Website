import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, serializeTimestamps } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/api-auth';

const MAX_LIMIT = 100;

// Read-only by design — there is no PATCH/DELETE here or anywhere else for
// this collection. firestore.rules also denies all client writes to
// auditLog; entries only ever come from lib/api-auth.ts's logAudit().
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const { searchParams } = new URL(request.url);
    const actorUid = searchParams.get('actorUid');
    const action = searchParams.get('action');
    const from = searchParams.get('from'); // ISO date string
    const to = searchParams.get('to');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10) || 50, MAX_LIMIT);

    if (from && Number.isNaN(new Date(from).getTime())) {
      return NextResponse.json({ success: false, message: 'Invalid "from" date' }, { status: 400 });
    }
    if (to && Number.isNaN(new Date(to).getTime())) {
      return NextResponse.json({ success: false, message: 'Invalid "to" date' }, { status: 400 });
    }

    let q: FirebaseFirestore.Query = getAdminDb().collection('auditLog');
    if (actorUid) q = q.where('actorUid', '==', actorUid);
    if (action) q = q.where('action', '==', action);
    // Range filters on `timestamp` must share it with orderBy — Firestore
    // requires the first orderBy to match a field with an inequality/range
    // filter on it, so these are ordered together, not filtered in memory
    // after the fact.
    if (from) q = q.where('timestamp', '>=', new Date(from));
    if (to) q = q.where('timestamp', '<=', new Date(to));
    q = q.orderBy('timestamp', 'desc').limit(limit);

    const snap = await q.get();
    const entries = snap.docs.map(d => serializeTimestamps({ id: d.id, ...d.data() }));

    return NextResponse.json({ success: true, entries });
  } catch (error) {
    console.error('Error fetching audit log:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch audit log' }, { status: 500 });
  }
}
