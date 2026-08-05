import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAuth } from '@/lib/api-auth';

// savedItems isn't a first-class collection (no firestore.rules entry) —
// every read/write goes through this route with the Admin SDK, same
// approach as resourceRatings (P11) and volunteerHours (P14). A snapshot
// of title/url is stored at save time (rather than just an id) so the
// library view never needs a second fetch per item to render.
function docId(uid: string, itemType: string, itemId: string) {
  return `${uid}_${itemType}_${itemId}`;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.ok) return auth.response;

    const snap = await getAdminDb().collection('savedItems').where('uid', '==', auth.user.uid).get();
    const items = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Error fetching saved items:', error);
    return NextResponse.json({ success: false, message: 'Failed to load saved items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.ok) return auth.response;

    const { itemType, itemId, title, url } = await request.json();
    if (!itemType || !itemId || !title || !url) {
      return NextResponse.json({ success: false, message: 'itemType, itemId, title, and url are required' }, { status: 400 });
    }
    if (itemType !== 'sermon' && itemType !== 'blog') {
      return NextResponse.json({ success: false, message: 'itemType must be "sermon" or "blog"' }, { status: 400 });
    }

    await getAdminDb().collection('savedItems').doc(docId(auth.user.uid, itemType, itemId)).set({
      uid: auth.user.uid,
      itemType,
      itemId,
      title: String(title).slice(0, 200),
      url: String(url).slice(0, 300),
      savedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving item:', error);
    return NextResponse.json({ success: false, message: 'Failed to save item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.ok) return auth.response;

    const { itemType, itemId } = await request.json();
    if (!itemType || !itemId) {
      return NextResponse.json({ success: false, message: 'itemType and itemId are required' }, { status: 400 });
    }

    await getAdminDb().collection('savedItems').doc(docId(auth.user.uid, itemType, itemId)).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing saved item:', error);
    return NextResponse.json({ success: false, message: 'Failed to remove saved item' }, { status: 500 });
  }
}
