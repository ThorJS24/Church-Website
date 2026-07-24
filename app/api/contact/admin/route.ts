import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin, withAudit } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const snapshot = await getAdminDb()
      .collection('enhanced_contacts')
      .orderBy('submittedAt', 'desc')
      .limit(100)
      .get();

    const submissions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ success: true, submissions });
  } catch (error) {
    console.error('Admin fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const body = await request.json();
    const { id, status, notes, assignedTo } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: 'ID and status are required' },
        { status: 400 }
      );
    }

    const ref = getAdminDb().collection('enhanced_contacts').doc(id);
    const before = (await ref.get()).data();

    const updateData: Record<string, unknown> = {
      status,
      updatedAt: new Date().toISOString()
    };
    if (notes) updateData.notes = notes;
    if (assignedTo) updateData.assignedTo = assignedTo;

    await withAudit(
      authResult.user,
      request,
      { action: 'contact.update', targetType: 'enhanced_contacts', targetId: id },
      async () => {
        await ref.update(updateData);
        return { before: { status: before?.status }, after: { status, notes, assignedTo }, result: null };
      }
    );

    return NextResponse.json({ success: true, message: 'Submission updated successfully' });
  } catch (error) {
    console.error('Admin update error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update submission' },
      { status: 500 }
    );
  }
}
