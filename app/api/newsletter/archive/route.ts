import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, serializeTimestamps } from '@/lib/firebase-admin';

// Public read of sent campaigns — subject/date/id only, never recipient
// counts or the sender, so anyone can browse past newsletters without an
// admin session.
export async function GET(request: NextRequest) {
  try {
    const snap = await getAdminDb().collection('newsletterCampaigns').orderBy('sentAt', 'desc').limit(50).get();
    const campaigns = snap.docs.map((d) => {
      const data = serializeTimestamps({ id: d.id, ...d.data() }) as any;
      return { id: data.id, subject: data.subject, sentAt: data.sentAt };
    });
    return NextResponse.json({ success: true, campaigns });
  } catch (error) {
    console.error('Error listing newsletter archive:', error);
    return NextResponse.json({ success: false, message: 'Failed to load archive' }, { status: 500 });
  }
}
