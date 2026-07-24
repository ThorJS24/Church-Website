import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireModerator, withAudit } from '@/lib/api-auth';

const MODERATION_COLLECTIONS = new Set(['prayerRequests', 'comments', 'galleryImages']);

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ collection: string; id: string }> }) {
  const authResult = await requireModerator(request);
  if (!authResult.ok) return authResult.response;

  const { collection, id } = await params;
  if (!MODERATION_COLLECTIONS.has(collection)) {
    return NextResponse.json({ success: false, message: 'Unknown moderation target' }, { status: 404 });
  }

  try {
    const { decision, reason } = await request.json();
    if (decision !== 'approved' && decision !== 'rejected') {
      return NextResponse.json({ success: false, message: 'decision must be "approved" or "rejected"' }, { status: 400 });
    }

    const ref = getAdminDb().collection(collection).doc(id);
    const before = (await ref.get()).data();
    if (!before) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    await withAudit(
      authResult.user,
      request,
      { action: `moderation.${decision}`, targetType: collection, targetId: id },
      async () => {
        await ref.update({
          moderationStatus: decision,
          moderatedBy: authResult.user.uid,
          moderatedAt: new Date().toISOString(),
          moderationReason: reason || null,
        });
        return {
          before: { moderationStatus: before.moderationStatus },
          after: { moderationStatus: decision, reason: reason || null },
          result: null,
        };
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error moderating item:', error);
    return NextResponse.json({ success: false, message: 'Failed to moderate item' }, { status: 500 });
  }
}
