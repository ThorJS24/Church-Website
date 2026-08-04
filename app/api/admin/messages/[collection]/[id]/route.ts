import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin, withAudit } from '@/lib/api-auth';

const SOURCES = new Set(['contacts', 'serviceRequests']);

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ collection: string; id: string }> }) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { collection, id } = await params;
  if (!SOURCES.has(collection)) {
    return NextResponse.json({ success: false, message: 'Unknown source' }, { status: 404 });
  }

  try {
    const { status, notes } = await request.json();
    if (!status) {
      return NextResponse.json({ success: false, message: 'status is required' }, { status: 400 });
    }

    const ref = getAdminDb().collection(collection).doc(id);
    const before = (await ref.get()).data();
    if (!before) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = { status, updatedAt: new Date().toISOString() };
    if (notes !== undefined) updates.notes = notes;

    await withAudit(
      authResult.user,
      request,
      { action: 'message.update', targetType: collection, targetId: id },
      async () => {
        await ref.update(updates);
        return { before: { status: before.status }, after: { status, notes }, result: null };
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error updating message ${collection}/${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to update message' }, { status: 500 });
  }
}
