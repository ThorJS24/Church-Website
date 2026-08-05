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
    const targetType = searchParams.get('targetType');
    const targetId = searchParams.get('targetId');
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
    const hasFilter = !!(actorUid || action || targetType || targetId || from || to);
    if (actorUid) q = q.where('actorUid', '==', actorUid);
    if (action) q = q.where('action', '==', action);
    if (targetType) q = q.where('targetType', '==', targetType);
    if (targetId) q = q.where('targetId', '==', targetId);
    if (from) q = q.where('timestamp', '>=', new Date(from));
    if (to) q = q.where('timestamp', '<=', new Date(to));

    // A plain orderBy(timestamp) with no other filter is always served by
    // Firestore's automatic single-field index. The moment any other field
    // filter joins it — even one — Firestore needs a composite index that
    // may not exist (targetType/targetId/actorUid weren't queryable before
    // this route grew these filters), so those combinations skip orderBy
    // here and sort in memory instead, same fix as the dashboard's
    // moderation-status query.
    if (!hasFilter) {
      q = q.orderBy('timestamp', 'desc').limit(limit);
      const snap = await q.get();
      const entries = snap.docs.map(d => serializeTimestamps({ id: d.id, ...d.data() }));
      return NextResponse.json({ success: true, entries });
    }

    const snap = await q.limit(500).get();
    const entries = snap.docs
      .map(d => serializeTimestamps({ id: d.id, ...d.data() }) as any)
      .sort((a, b) => new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime())
      .slice(0, limit);

    return NextResponse.json({ success: true, entries });
  } catch (error) {
    console.error('Error fetching audit log:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch audit log' }, { status: 500 });
  }
}
