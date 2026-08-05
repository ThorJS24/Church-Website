import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin, withAudit } from '@/lib/api-auth';

const SOURCES = new Set(['contacts', 'serviceRequests']);

// Staff-only discussion thread on a message — never sent to the sender,
// distinct from the reply endpoint (customer-facing) and the single
// `notes` field (one line, overwritten each edit).
export async function POST(request: NextRequest, { params }: { params: Promise<{ collection: string; id: string }> }) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { collection, id } = await params;
  if (!SOURCES.has(collection)) {
    return NextResponse.json({ success: false, message: 'Unknown source' }, { status: 404 });
  }

  try {
    const { text } = await request.json();
    if (!text || !text.trim()) {
      return NextResponse.json({ success: false, message: 'text is required' }, { status: 400 });
    }

    const ref = getAdminDb().collection(collection).doc(id);
    const before = (await ref.get()).data();
    if (!before) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    const comment = {
      text: text.trim(),
      authorEmail: authResult.user.email,
      at: new Date().toISOString(),
    };

    await withAudit(
      authResult.user,
      request,
      { action: 'message.comment', targetType: collection, targetId: id },
      async () => {
        const updates = {
          internalComments: [...(Array.isArray(before.internalComments) ? before.internalComments : []), comment],
          updatedAt: new Date().toISOString(),
        };
        await ref.update(updates);
        return { before: null, after: comment, result: null };
      }
    );

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    console.error(`Error adding comment to ${collection}/${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to add comment' }, { status: 500 });
  }
}
