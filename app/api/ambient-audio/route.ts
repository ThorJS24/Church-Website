import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const snap = await getAdminDb().collection('ambientAudio').doc('current').get();
    return NextResponse.json(snap.exists ? snap.data() : {});
  } catch (error) {
    console.error('Ambient audio fetch error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
