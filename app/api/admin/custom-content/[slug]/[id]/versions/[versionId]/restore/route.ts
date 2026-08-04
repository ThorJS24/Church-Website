import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin, withAudit } from '@/lib/api-auth';
import { saveContentVersion } from '@/lib/contentVersions';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string; versionId: string }> }
) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { slug, id, versionId } = await params;

  try {
    const versionSnap = await getAdminDb().collection('contentVersions').doc(versionId).get();
    const version = versionSnap.data();
    if (!version || version.collection !== 'customContent' || version.docId !== id) {
      return NextResponse.json({ success: false, message: 'Version not found' }, { status: 404 });
    }

    const ref = getAdminDb().collection('customContent').doc(id);
    const current = (await ref.get()).data();
    if (!current || current.contentType !== slug) {
      return NextResponse.json({ success: false, message: 'Content no longer exists' }, { status: 404 });
    }

    const restored = { ...version.snapshot, contentType: slug, updatedAt: new Date().toISOString() };

    await withAudit(
      authResult.user,
      request,
      { action: `custom-content.${slug}.restore`, targetType: 'customContent', targetId: id },
      async () => {
        await saveContentVersion(authResult.user, { collection: 'customContent', docId: id, snapshot: current });
        await ref.set(restored);
        return { before: current, after: restored, result: null };
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error restoring version ${versionId} for customContent/${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to restore version' }, { status: 500 });
  }
}
