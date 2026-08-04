import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/api-auth';

// Everything a visitor can submit that isn't already covered by the
// moderation queue (prayer/comments/gallery/testimonials) or the Forms
// Builder — general contact (app/api/contact, includes volunteer
// applications tagged department:'volunteer') and wedding/baptism service
// requests (app/api/services/request). Previously these were only visible
// by opening the Firebase Console directly; there was no admin UI at all.
const SOURCES = ['contacts', 'serviceRequests'] as const;

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const snapshots = await Promise.all(
      SOURCES.map(col => getAdminDb().collection(col).orderBy('createdAt', 'desc').limit(200).get())
    );

    const items = SOURCES.flatMap((col, i) =>
      snapshots[i].docs.map(d => ({ id: d.id, collection: col, ...d.data() }))
    ).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch messages' }, { status: 500 });
  }
}
