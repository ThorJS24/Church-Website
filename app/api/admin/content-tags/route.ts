import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin, withAudit } from '@/lib/api-auth';

// Every collection GenericContentTab can render carries the same optional
// `tags: string[]` field (added generically, not per-type) — this route
// scans all of them to build one cross-type taxonomy view, and can
// rename/delete a tag everywhere it's used in one operation.
const TAGGED_COLLECTIONS: Record<string, string> = {
  sermons: 'sermons',
  events: 'events',
  pastors: 'pastors',
  series: 'series',
  speakers: 'speakers',
  ministries: 'ministries',
  announcements: 'announcements',
  blog: 'blogPosts',
  smallGroups: 'smallGroups',
  testimonials: 'testimonials',
  resources: 'resources',
  staffMembers: 'staffMembers',
};

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const db = getAdminDb();
    const entries = Object.entries(TAGGED_COLLECTIONS);
    const snapshots = await Promise.all(entries.map(([, col]) => db.collection(col).get()));

    const tagMap = new Map<string, { count: number; byType: Record<string, number> }>();
    entries.forEach(([type], i) => {
      snapshots[i].docs.forEach((doc) => {
        const tags: unknown = doc.data().tags;
        if (!Array.isArray(tags)) return;
        tags.forEach((raw) => {
          const tag = String(raw).trim();
          if (!tag) return;
          const entry = tagMap.get(tag) ?? { count: 0, byType: {} };
          entry.count += 1;
          entry.byType[type] = (entry.byType[type] ?? 0) + 1;
          tagMap.set(tag, entry);
        });
      });
    });

    const tags = Array.from(tagMap.entries())
      .map(([tag, v]) => ({ tag, count: v.count, byType: v.byType }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({ success: true, tags });
  } catch (error) {
    console.error('Error listing content tags:', error);
    return NextResponse.json({ success: false, message: 'Failed to list tags' }, { status: 500 });
  }
}

// Rename a tag (body: {oldTag, newTag}) or delete it (body: {oldTag}, no
// newTag) across every doc that carries it. Applied doc-by-doc since
// Firestore has no bulk array-element replace.
export async function PATCH(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const { oldTag, newTag } = await request.json();
    if (!oldTag || typeof oldTag !== 'string') {
      return NextResponse.json({ success: false, message: 'oldTag is required' }, { status: 400 });
    }
    const renaming = typeof newTag === 'string' && newTag.trim().length > 0;
    const cleanNewTag = renaming ? newTag.trim() : null;

    const db = getAdminDb();
    let updated = 0;

    await withAudit(
      authResult.user,
      request,
      { action: renaming ? 'content-tags.rename' : 'content-tags.delete', targetType: 'tag', targetId: oldTag },
      async () => {
        for (const [type, col] of Object.entries(TAGGED_COLLECTIONS)) {
          const snap = await db.collection(col).where('tags', 'array-contains', oldTag).get();
          for (const doc of snap.docs) {
            const tags: string[] = Array.isArray(doc.data().tags) ? doc.data().tags : [];
            const withoutOld = tags.filter((t) => t !== oldTag);
            const nextTags = cleanNewTag && !withoutOld.includes(cleanNewTag) ? [...withoutOld, cleanNewTag] : withoutOld;
            await doc.ref.update({ tags: nextTags, updatedAt: new Date().toISOString() });
            updated += 1;
          }
        }
        return { before: { oldTag }, after: { newTag: cleanNewTag, updated }, result: null };
      }
    );

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error('Error updating content tags:', error);
    return NextResponse.json({ success: false, message: 'Failed to update tag' }, { status: 500 });
  }
}
