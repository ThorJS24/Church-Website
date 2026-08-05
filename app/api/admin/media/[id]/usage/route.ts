import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/api-auth';

// Scans every collection that can hold a media URL for an exact match,
// rather than maintaining a fixed list of "the field is called imageUrl
// here, fileUrl there" — new content types (including admin-defined custom
// ones) get usage tracking for free since this checks every string field.
const SCANNABLE: { collection: string; label: string; titleField: string }[] = [
  { collection: 'sermons', label: 'Sermon', titleField: 'title' },
  { collection: 'events', label: 'Event', titleField: 'title' },
  { collection: 'pastors', label: 'Pastor', titleField: 'name' },
  { collection: 'series', label: 'Series', titleField: 'title' },
  { collection: 'speakers', label: 'Speaker', titleField: 'name' },
  { collection: 'ministries', label: 'Ministry', titleField: 'title' },
  { collection: 'announcements', label: 'Announcement', titleField: 'title' },
  { collection: 'blogPosts', label: 'Blog Post', titleField: 'title' },
  { collection: 'smallGroups', label: 'Small Group', titleField: 'name' },
  { collection: 'testimonials', label: 'Testimonial', titleField: 'authorName' },
  { collection: 'resources', label: 'Resource', titleField: 'title' },
  { collection: 'galleryImages', label: 'Gallery Image', titleField: 'caption' },
  { collection: 'customContent', label: 'Custom Content', titleField: 'title' },
];

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { id } = await params;

  try {
    const db = getAdminDb();
    const mediaDoc = await db.collection('mediaLibrary').doc(id).get();
    const url = mediaDoc.data()?.url;
    if (!url) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    const snapshots = await Promise.all(SCANNABLE.map((s) => db.collection(s.collection).get()));
    const usages: Array<{ collection: string; label: string; id: string; title: string; field: string }> = [];

    SCANNABLE.forEach((source, i) => {
      snapshots[i].docs.forEach((doc) => {
        const data = doc.data();
        const matchField = Object.entries(data).find(([, v]) => v === url)?.[0];
        if (matchField) {
          usages.push({
            collection: source.collection,
            label: source.label,
            id: doc.id,
            title: String(data[source.titleField] ?? doc.id),
            field: matchField,
          });
        }
      });
    });

    return NextResponse.json({ success: true, usages });
  } catch (error) {
    console.error(`Error checking usage for media/${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to check usage' }, { status: 500 });
  }
}
