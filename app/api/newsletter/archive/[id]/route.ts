import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, serializeTimestamps } from '@/lib/firebase-admin';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const doc = await getAdminDb().collection('newsletterCampaigns').doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    const data = serializeTimestamps({ id: doc.id, ...doc.data() }) as any;
    return NextResponse.json({ success: true, campaign: { id: data.id, subject: data.subject, body: data.body, sentAt: data.sentAt } });
  } catch (error) {
    console.error(`Error loading campaign ${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to load campaign' }, { status: 500 });
  }
}
