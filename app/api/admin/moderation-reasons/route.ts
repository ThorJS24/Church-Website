import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireModerator, withAudit } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const authResult = await requireModerator(request);
  if (!authResult.ok) return authResult.response;

  try {
    const snap = await getAdminDb().collection('moderationReasonTemplates').get();
    const reasons = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ success: true, reasons });
  } catch (error) {
    console.error('Error listing rejection reasons:', error);
    return NextResponse.json({ success: false, message: 'Failed to list reasons' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireModerator(request);
  if (!authResult.ok) return authResult.response;

  try {
    const { text } = await request.json();
    if (!text || !text.trim()) {
      return NextResponse.json({ success: false, message: 'text is required' }, { status: 400 });
    }

    const docRef = getAdminDb().collection('moderationReasonTemplates').doc();
    const data = { text: text.trim(), createdAt: new Date().toISOString() };

    const id = await withAudit(
      authResult.user,
      request,
      { action: 'moderation-reason.create', targetType: 'moderationReasonTemplates', targetId: docRef.id },
      async () => {
        await docRef.set(data);
        return { after: data, result: docRef.id };
      }
    );

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error creating rejection reason:', error);
    return NextResponse.json({ success: false, message: 'Failed to create reason' }, { status: 500 });
  }
}
