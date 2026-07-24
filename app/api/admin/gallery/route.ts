import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/api-auth';

// Bounded well above any real-world size this congregation's gallery is
// likely to reach for the foreseeable future, but not literally unbounded
// — public submissions (app/api/gallery/submit) mean this collection can
// only grow. Deliberately no orderBy('uploadDate') paired with this: tested
// live against a doc missing that field and confirmed Firestore's orderBy
// silently excludes documents that don't have the sort field at all, which
// would mean a doc without uploadDate (a legacy record, a manual edit, a
// future code path that forgets to set it) just vanishes from the admin
// gallery view with no error. A plain limit(), unordered, doesn't have
// that failure mode.
const MAX_ITEMS = 500;

// Full gallery view for admins — includes pending/rejected images too,
// unlike the public-facing lib/content.ts reads which only ever see
// moderationStatus == 'approved'.
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const snap = await getAdminDb().collection('galleryImages').limit(MAX_ITEMS).get();
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Error listing gallery images:', error);
    return NextResponse.json({ success: false, message: 'Failed to list gallery images' }, { status: 500 });
  }
}
