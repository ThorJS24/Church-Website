import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/api-auth';

const MODERATION_COLLECTIONS = ['prayerRequests', 'comments', 'galleryImages'] as const;

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const db = getAdminDb();
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const usersRef = db.collection('users');

    // Every number here used to come from reading the *entire* users and
    // prayerRequests collections (plus filtered-but-still-full events and
    // moderation reads) just to call .length/.size on them — the most
    // expensive query on the admin panel, run on every dashboard load.
    // Firestore's count() aggregation gets the same numbers for a fraction
    // of the read cost, since it doesn't transfer full documents.
    const [
      totalUsersAgg,
      activeUsersAgg,
      newUsersThisMonthAgg,
      newUsersLastMonthAgg,
      newUsersThisWeekAgg,
      totalEventsAgg,
      prayerRequestsAgg,
      moderationAggs,
      recentAuditSnapshot,
    ] = await Promise.all([
      usersRef.count().get(),
      usersRef.where('isActive', '==', true).count().get(),
      usersRef.where('createdAt', '>=', firstDayOfMonth.toISOString()).count().get(),
      usersRef
        .where('createdAt', '>=', firstDayOfLastMonth.toISOString())
        .where('createdAt', '<', firstDayOfMonth.toISOString())
        .count().get(),
      usersRef.where('createdAt', '>=', sevenDaysAgo.toISOString()).count().get(),
      // EventItem.startDate is the field lib/content.ts / firestore.rules
      // agree on — using it here too rather than a mismatched "eventDate".
      db.collection('events').where('startDate', '>=', now.toISOString()).count().get(),
      db.collection('prayerRequests').count().get(),
      Promise.all(MODERATION_COLLECTIONS.map(col =>
        db.collection(col).where('moderationStatus', '==', 'pending').count().get()
      )),
      db.collection('auditLog').orderBy('timestamp', 'desc').limit(10).get(),
    ]);

    const totalUsers = totalUsersAgg.data().count;
    const activeUsers = activeUsersAgg.data().count;
    const newUsersThisMonth = newUsersThisMonthAgg.data().count;
    const newUsersLastMonth = newUsersLastMonthAgg.data().count;
    const newUsersThisWeek = newUsersThisWeekAgg.data().count;

    const monthlyGrowth = newUsersLastMonth > 0
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth * 100).toFixed(1)
      : newUsersThisMonth > 0 ? '100.0' : '0.0';

    const pendingModerationCount = moderationAggs.reduce((sum, agg) => sum + agg.data().count, 0);

    const recentActions = recentAuditSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    const stats = {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      newUsersThisWeek,
      totalEvents: totalEventsAgg.data().count,
      prayerRequests: prayerRequestsAgg.data().count,
      pendingModerationCount,
      monthlyGrowth: parseFloat(monthlyGrowth)
    };

    return NextResponse.json({ success: true, stats, recentActions });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
