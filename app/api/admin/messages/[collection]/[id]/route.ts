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
    const { status, notes, priority, assignedTo } = await request.json();
    const hasStatus = typeof status === 'string';
    const hasPriority = typeof priority === 'string';
    const hasAssignment = assignedTo !== undefined;
    if (!hasStatus && !hasPriority && !hasAssignment) {
      return NextResponse.json({ success: false, message: 'status, priority, or assignedTo is required' }, { status: 400 });
    }

    const ref = getAdminDb().collection(collection).doc(id);
    const before = (await ref.get()).data();
    if (!before) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (hasStatus) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    if (hasPriority) updates.priority = priority;
    if (hasAssignment) updates.assignedTo = assignedTo;

    const action = hasAssignment ? 'message.assign' : hasPriority && !hasStatus ? 'message.priority_change' : 'message.update';

    await withAudit(
      authResult.user,
      request,
      { action, targetType: collection, targetId: id },
      async () => {
        await ref.update(updates);
        return {
          before: { status: before.status ?? null, priority: before.priority ?? null, assignedTo: before.assignedTo ?? null },
          after: {
            status: (updates.status ?? before.status) ?? null,
            priority: (updates.priority ?? before.priority) ?? null,
            assignedTo: (hasAssignment ? assignedTo : before.assignedTo) ?? null,
          },
          result: null,
        };
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error updating message ${collection}/${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to update message' }, { status: 500 });
  }
}
