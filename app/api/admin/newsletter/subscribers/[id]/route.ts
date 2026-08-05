import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin, withAudit } from '@/lib/api-auth';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { id } = await params;

  try {
    const { tags } = await request.json();
    if (!Array.isArray(tags)) {
      return NextResponse.json({ success: false, message: 'tags must be an array' }, { status: 400 });
    }

    const ref = getAdminDb().collection('newsletterSubscribers').doc(id);
    const before = (await ref.get()).data();
    if (!before) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    await withAudit(
      authResult.user,
      request,
      { action: 'newsletter.subscriber_tags', targetType: 'newsletterSubscribers', targetId: id },
      async () => {
        await ref.update({ tags });
        return { before: { tags: before.tags ?? [] }, after: { tags }, result: null };
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error updating subscriber ${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to update subscriber' }, { status: 500 });
  }
}
