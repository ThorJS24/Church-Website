import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin, withAudit } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const snap = await getAdminDb().collection('messageTemplates').get();
    const templates = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ success: true, templates });
  } catch (error) {
    console.error('Error listing message templates:', error);
    return NextResponse.json({ success: false, message: 'Failed to list templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const { name, subject, body } = await request.json();
    if (!name || !subject || !body) {
      return NextResponse.json({ success: false, message: 'name, subject, and body are required' }, { status: 400 });
    }

    const docRef = getAdminDb().collection('messageTemplates').doc();
    const data = { name, subject, body, createdAt: new Date().toISOString() };

    const id = await withAudit(
      authResult.user,
      request,
      { action: 'message-template.create', targetType: 'messageTemplates', targetId: docRef.id },
      async () => {
        await docRef.set(data);
        return { after: data, result: docRef.id };
      }
    );

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error creating message template:', error);
    return NextResponse.json({ success: false, message: 'Failed to create template' }, { status: 500 });
  }
}
