import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const snap = await getAdminDb().collection('newsletterSubscribers').get();
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const subscribed = all.filter((s: any) => s.status === 'subscribed');
    return NextResponse.json({
      success: true,
      count: subscribed.length,
      // unsubscribeToken never leaves the server — everything else about a
      // subscriber is fine to show an admin managing segments/tags.
      subscribers: all.map(({ unsubscribeToken, ...rest }: any) => rest),
    });
  } catch (error) {
    console.error('Error counting subscribers:', error);
    return NextResponse.json({ success: false, message: 'Failed to load subscribers' }, { status: 500 });
  }
}
