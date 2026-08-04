import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const snap = await getAdminDb().collection('newsletterSubscribers').where('status', '==', 'subscribed').get();
    return NextResponse.json({ success: true, count: snap.size });
  } catch (error) {
    console.error('Error counting subscribers:', error);
    return NextResponse.json({ success: false, message: 'Failed to load subscribers' }, { status: 500 });
  }
}
