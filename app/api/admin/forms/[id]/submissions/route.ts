import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, serializeTimestamps } from '@/lib/firebase-admin';
import { requireModerator } from '@/lib/api-auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireModerator(request);
  if (!authResult.ok) return authResult.response;

  const { id } = await params;

  try {
    const snap = await getAdminDb()
      .collection('formSubmissions')
      .where('formId', '==', id)
      .orderBy('submittedAt', 'desc')
      .get();

    const submissions = snap.docs.map(d => serializeTimestamps({ id: d.id, ...d.data() }));
    return NextResponse.json({ success: true, submissions });
  } catch (error) {
    console.error(`Error listing submissions for form ${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to list submissions' }, { status: 500 });
  }
}
