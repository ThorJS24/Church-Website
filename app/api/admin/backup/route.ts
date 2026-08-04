import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/api-auth';

// Content collections only — deliberately excludes users, auditLog,
// rateLimits, accountDeletionRequests, and anything else with access-
// controlled or sensitive-by-design data. This is a content backup, not a
// full database dump.
const COLLECTIONS = [
  'sermons', 'events', 'pastors', 'series', 'speakers', 'ministries',
  'announcements', 'services', 'smallGroups', 'testimonials', 'blogPosts',
  'redirects', 'siteSettings', 'pageContent', 'historyTimeline', 'staffMembers',
  'galleryImages', 'contentTypes', 'customContent', 'formDefinitions',
];

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const db = getAdminDb();
    const entries = await Promise.all(
      COLLECTIONS.map(async (name) => {
        const snap = await db.collection(name).get();
        return [name, snap.docs.map(d => ({ id: d.id, ...d.data() }))] as const;
      })
    );

    const backup = {
      exportedAt: new Date().toISOString(),
      exportedBy: authResult.user.email,
      collections: Object.fromEntries(entries),
    };

    return new NextResponse(JSON.stringify(backup, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="salempbc-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    console.error('Error generating backup:', error);
    return NextResponse.json({ success: false, message: 'Failed to generate backup' }, { status: 500 });
  }
}
