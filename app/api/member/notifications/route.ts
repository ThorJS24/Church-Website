import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAuth } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.ok) return authResult.response;
  const { email } = authResult.user;
  if (!email) return NextResponse.json({ success: true, notifications: [], unreadCount: 0 });

  try {
    // No orderBy here deliberately (same reasoning as admin/stats): a
    // where(email) + orderBy(createdAt) query needs a composite index that
    // isn't provisioned, and firestore.indexes.json changes don't take
    // effect until deployed. Sorting the (small, capped) result in memory
    // avoids that dependency entirely.
    const snap = await getAdminDb().collection('notifications')
      .where('email', '==', email.toLowerCase())
      .limit(50)
      .get();

    const notifications = snap.docs
      .map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title,
          message: data.message,
          link: data.link || null,
          read: !!data.read,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || null,
        };
      })
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 30);

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ success: false, notifications: [], unreadCount: 0 }, { status: 500 });
  }
}
