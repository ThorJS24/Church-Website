import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin, withAudit } from '@/lib/api-auth';
import { saveContentVersion } from '@/lib/contentVersions';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; versionId: string }> }
) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { slug, versionId } = await params;

  try {
    const versionSnap = await getAdminDb().collection('contentVersions').doc(versionId).get();
    const version = versionSnap.data();
    if (!version || version.collection !== 'blogPosts' || version.docId !== slug) {
      return NextResponse.json({ success: false, message: 'Version not found' }, { status: 404 });
    }

    const ref = getAdminDb().collection('blogPosts').doc(slug);
    const current = (await ref.get()).data();
    if (!current) {
      return NextResponse.json({ success: false, message: 'Post no longer exists' }, { status: 404 });
    }

    const restored = { ...version.snapshot, slug, updatedAt: new Date().toISOString() };

    await withAudit(
      authResult.user,
      request,
      { action: 'blog.restore', targetType: 'blogPosts', targetId: slug },
      async () => {
        await saveContentVersion(authResult.user, { collection: 'blogPosts', docId: slug, snapshot: current });
        await ref.set(restored);
        return { before: current, after: restored, result: null };
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error restoring version ${versionId} for blogPosts/${slug}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to restore version' }, { status: 500 });
  }
}
