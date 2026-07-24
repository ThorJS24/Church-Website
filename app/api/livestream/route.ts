import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin, withAudit } from '@/lib/api-auth';

const LIVESTREAM_DOC = 'current';

export async function GET() {
  try {
    const snap = await getAdminDb().collection('livestream').doc(LIVESTREAM_DOC).get();
    return NextResponse.json({ success: true, data: snap.exists ? snap.data() : null });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const { viewerCount, isLive } = await request.json();

    const updates: Record<string, unknown> = {};
    if (viewerCount !== undefined) updates.viewerCount = viewerCount;
    if (isLive !== undefined) updates.isLive = isLive;

    const ref = getAdminDb().collection('livestream').doc(LIVESTREAM_DOC);
    const before = (await ref.get()).data();

    await withAudit(
      authResult.user,
      request,
      { action: 'livestream.update', targetType: 'livestream', targetId: LIVESTREAM_DOC },
      async () => {
        await ref.set(updates, { merge: true });
        return { before, after: updates, result: null };
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
  }
}
