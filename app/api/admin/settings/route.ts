import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin, withAudit } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const [settingsSnap, servicesSnap] = await Promise.all([
      getAdminDb().collection('siteSettings').doc('main').get(),
      getAdminDb().collection('services').get(),
    ]);

    return NextResponse.json({
      success: true,
      settings: settingsSnap.exists ? settingsSnap.data() : {},
      services: servicesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const body = await request.json();
    const ref = getAdminDb().collection('siteSettings').doc('main');
    const before = (await ref.get()).data();

    await withAudit(
      authResult.user,
      request,
      { action: 'settings.update', targetType: 'siteSettings', targetId: 'main' },
      async () => {
        await ref.set(body, { merge: true });
        return { before, after: body, result: null };
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ success: false, message: 'Failed to update settings' }, { status: 500 });
  }
}
