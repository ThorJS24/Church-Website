import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { createZip } from '@/lib/zip';
import { checkRateLimit, clientIpFrom } from '@/lib/rateLimit';
import { requireAuth } from '@/lib/api-auth';

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const MAX_PHOTOS = 60; // bounds request duration/memory for a single zip

function safeFilename(title: string, index: number, url: string): string {
  const ext = (url.split('.').pop() || 'jpg').split(/[?#]/)[0].slice(0, 4);
  const base = title.replace(/[^a-zA-Z0-9-_ ]/g, '').trim().slice(0, 60) || `photo-${index + 1}`;
  return `${String(index + 1).padStart(2, '0')}-${base}.${ext}`;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;

  try {
    const ip = clientIpFrom(request);
    const rateLimit = await checkRateLimit(`gallery-album-download_${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json({ success: false, message: 'Too many downloads. Please try again later.' }, { status: 429 });
    }

    const db = getAdminDb();
    const [eventDoc, photosSnap] = await Promise.all([
      db.collection('events').doc(eventId).get(),
      db.collection('galleryImages')
        .where('eventId', '==', eventId)
        .where('isPublic', '==', true)
        .where('moderationStatus', '==', 'approved')
        .get(),
    ]);

    if (eventDoc.data()?.membersOnly) {
      const auth = await requireAuth(request);
      if (!auth.ok) return auth.response;
    }

    const photos = photosSnap.docs
      .map((d) => d.data())
      .filter((p) => p.allowDownload !== false)
      .slice(0, MAX_PHOTOS);

    if (photos.length === 0) {
      return NextResponse.json({ success: false, message: 'No downloadable photos in this album' }, { status: 404 });
    }

    const entries = await Promise.all(
      photos.map(async (photo, i) => {
        const res = await fetch(photo.imageUrl);
        const data = Buffer.from(await res.arrayBuffer());
        return { name: safeFilename(photo.title || '', i, photo.imageUrl), data };
      })
    );

    const zip = createZip(entries);
    const eventTitle = eventDoc.data()?.title || 'album';
    const filename = `${eventTitle.replace(/[^a-zA-Z0-9-_ ]/g, '').trim().slice(0, 60) || 'album'}.zip`;

    return new NextResponse(new Uint8Array(zip), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error(`Error building album zip for event ${eventId}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to build album download' }, { status: 500 });
  }
}
