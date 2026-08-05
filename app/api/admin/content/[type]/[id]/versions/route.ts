import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, serializeTimestamps } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/api-auth';

// Same allowlist as app/api/admin/content/[type] — kept in sync manually
// since both routes gate the same fixed set of built-in collections.
const COLLECTIONS: Record<string, string> = {
  sermons: 'sermons',
  events: 'events',
  pastors: 'pastors',
  series: 'series',
  speakers: 'speakers',
  ministries: 'ministries',
  announcements: 'announcements',
  services: 'services',
  smallGroups: 'smallGroups',
  testimonials: 'testimonials',
  redirects: 'redirects',
  resources: 'resources',
  staffMembers: 'staffMembers',
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ type: string; id: string }> }) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { type, id } = await params;
  const collectionName = COLLECTIONS[type];
  if (!collectionName) {
    return NextResponse.json({ success: false, message: 'Unknown content type' }, { status: 404 });
  }

  try {
    const snap = await getAdminDb()
      .collection('contentVersions')
      .where('collection', '==', collectionName)
      .where('docId', '==', id)
      .orderBy('editedAt', 'desc')
      .get();

    const versions = snap.docs.map(d => serializeTimestamps({ id: d.id, ...d.data() }));
    return NextResponse.json({ success: true, versions });
  } catch (error) {
    console.error(`Error listing versions for ${collectionName}/${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to list versions' }, { status: 500 });
  }
}
