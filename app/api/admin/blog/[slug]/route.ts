import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin, withAudit } from '@/lib/api-auth';
import { saveContentVersion } from '@/lib/contentVersions';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { slug } = await params;

  try {
    const ref = getAdminDb().collection('blogPosts').doc(slug);
    const before = (await ref.get()).data();
    if (!before) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    const body = await request.json();
    // The slug is the doc id (and the public URL) — not editable via a
    // plain field update; changing a live post's URL needs a deliberate
    // delete+recreate, not a silent side effect of an unrelated edit.
    const { slug: _ignoredSlug, ...rest } = body;
    const updates = { ...rest, slug, updatedAt: new Date().toISOString() };

    await withAudit(
      authResult.user,
      request,
      { action: 'blog.update', targetType: 'blogPosts', targetId: slug },
      async () => {
        await saveContentVersion(authResult.user, { collection: 'blogPosts', docId: slug, snapshot: before });
        await ref.update(updates);
        return { before, after: updates, result: null };
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error updating blog post ${slug}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to update blog post' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { slug } = await params;

  try {
    const ref = getAdminDb().collection('blogPosts').doc(slug);
    const before = (await ref.get()).data();
    if (!before) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    await withAudit(
      authResult.user,
      request,
      { action: 'blog.delete', targetType: 'blogPosts', targetId: slug },
      async () => {
        await ref.delete();
        return { before, after: null, result: null };
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting blog post ${slug}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to delete blog post' }, { status: 500 });
  }
}
