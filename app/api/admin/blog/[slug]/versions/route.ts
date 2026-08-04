import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/api-auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { slug } = await params;

  try {
    const snap = await getAdminDb()
      .collection('contentVersions')
      .where('collection', '==', 'blogPosts')
      .where('docId', '==', slug)
      .orderBy('editedAt', 'desc')
      .get();

    const versions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ success: true, versions });
  } catch (error) {
    console.error(`Error listing versions for blogPosts/${slug}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to list versions' }, { status: 500 });
  }
}
