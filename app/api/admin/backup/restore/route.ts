import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireSuperAdmin, withAudit } from '@/lib/api-auth';

// Same allowlist as the export route — restoring is scoped to exactly what
// can be exported, so this can never be used to write into users, auditLog,
// or any other access-controlled collection.
const COLLECTIONS = new Set([
  'sermons', 'events', 'pastors', 'series', 'speakers', 'ministries',
  'announcements', 'services', 'smallGroups', 'testimonials', 'blogPosts',
  'redirects', 'siteSettings', 'pageContent', 'historyTimeline', 'staffMembers',
  'galleryImages', 'contentTypes', 'customContent', 'formDefinitions',
]);

// Restoring overwrites live content wholesale, so this is the one place in
// the admin panel gated to super_admin rather than admin — a mistake here
// can't be undone by re-running an export first (the whole point is you
// don't have a fresher one).
export async function POST(request: NextRequest) {
  const authResult = await requireSuperAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const body = await request.json();
    const collections = body?.collections;
    if (!collections || typeof collections !== 'object') {
      return NextResponse.json({ success: false, message: 'Invalid backup file: missing "collections"' }, { status: 400 });
    }

    const db = getAdminDb();
    const summary: Record<string, number> = {};
    let totalDocs = 0;

    for (const [name, docs] of Object.entries(collections)) {
      if (!COLLECTIONS.has(name) || !Array.isArray(docs)) continue;
      let written = 0;
      // Firestore batches cap at 500 writes — chunk defensively even though
      // no single collection in this church's data is likely to exceed it.
      for (let i = 0; i < docs.length; i += 450) {
        const batch = db.batch();
        for (const doc of docs.slice(i, i + 450)) {
          if (!doc || typeof doc !== 'object' || !doc.id) continue;
          const { id, ...data } = doc as Record<string, unknown>;
          batch.set(db.collection(name).doc(String(id)), data, { merge: false });
          written += 1;
        }
        await batch.commit();
      }
      summary[name] = written;
      totalDocs += written;
    }

    await withAudit(
      authResult.user,
      request,
      { action: 'backup.restore', targetType: 'backup', targetId: 'batch' },
      async () => ({ before: null, after: { totalDocs, summary }, result: null })
    );

    return NextResponse.json({ success: true, totalDocs, summary });
  } catch (error) {
    console.error('Error restoring backup:', error);
    return NextResponse.json({ success: false, message: 'Failed to restore backup' }, { status: 500 });
  }
}
