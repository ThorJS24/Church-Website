import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, serializeTimestamps } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/api-auth';
import { UserRole } from '@/lib/permissions';

const MODERATION_COLLECTIONS = ['prayerRequests', 'comments', 'galleryImages'] as const;
const MESSAGE_COLLECTIONS = ['contacts', 'serviceRequests'] as const;
// Published, dated content types checked for staleness — collections
// without a meaningful "still relevant" lifecycle (pastors, series) are
// deliberately left out.
const FRESHNESS_COLLECTIONS = ['sermons', 'announcements', 'blogPosts'] as const;
const STALE_AFTER_DAYS = 30;

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const db = getAdminDb();
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const staleCutoff = new Date(now.getTime() - STALE_AFTER_DAYS * 24 * 60 * 60 * 1000);

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
      roleAggs,
      nextEventSnapshot,
      recentMembersSnapshot,
      activityAuditSnapshot,
      freshnessSnapshots,
      messageSnapshots,
      pendingModerationSnapshots,
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
      Promise.all(Object.values(UserRole).map(role => usersRef.where('role', '==', role).count().get())),
      db.collection('events').where('startDate', '>=', now.toISOString()).orderBy('startDate', 'asc').limit(1).get(),
      usersRef.orderBy('createdAt', 'desc').limit(8).get(),
      db.collection('auditLog').where('timestamp', '>=', fourteenDaysAgo).get(),
      Promise.all(FRESHNESS_COLLECTIONS.map(col => db.collection(col).where('status', '==', 'published').get())),
      Promise.all(MESSAGE_COLLECTIONS.map(col => db.collection(col).orderBy('createdAt', 'desc').limit(5).get())),
      // No orderBy here deliberately: where(moderationStatus) + orderBy(createdAt)
      // needs a composite index per collection that doesn't exist yet. Pulling
      // a slightly larger unordered batch and sorting in JS below avoids that
      // entirely for what's just a small dashboard preview feed.
      Promise.all(MODERATION_COLLECTIONS.map(col =>
        db.collection(col).where('moderationStatus', '==', 'pending').limit(20).get()
      )),
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

    const recentActions = recentAuditSnapshot.docs.map(d => serializeTimestamps({ id: d.id, ...d.data() }));

    const roleDistribution = Object.fromEntries(
      Object.values(UserRole).map((role, i) => [role, roleAggs[i].data().count])
    );

    const nextEventDoc = nextEventSnapshot.docs[0];
    const nextEvent = nextEventDoc ? { id: nextEventDoc.id, ...serializeTimestamps(nextEventDoc.data()) } : null;

    const recentMembers = recentMembersSnapshot.docs.map(d => serializeTimestamps({ id: d.id, ...d.data() }));

    // Bucket audit entries into day-of-week counts for the last 14 days —
    // count() aggregation can't group by day, and there are few enough
    // entries in a normal 2-week window that reading them in full and
    // bucketing here is simpler than a scheduled rollup job.
    const activityByDay: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      activityByDay[d.toISOString().slice(0, 10)] = 0;
    }
    activityAuditSnapshot.docs.forEach((doc) => {
      const ts = doc.data().timestamp;
      const date = ts?.toDate ? ts.toDate() : null;
      if (!date) return;
      const key = date.toISOString().slice(0, 10);
      if (key in activityByDay) activityByDay[key]++;
    });
    const auditActivityByDay = Object.entries(activityByDay).map(([date, count]) => ({ date, count }));

    let staleContentCount = 0;
    freshnessSnapshots.forEach((snap) => {
      snap.docs.forEach((doc) => {
        const data = doc.data();
        const updated = data.updatedAt ? new Date(data.updatedAt) : data.createdAt ? new Date(data.createdAt) : null;
        if (updated && updated < staleCutoff) staleContentCount++;
      });
    });

    const pendingMessages = MESSAGE_COLLECTIONS.flatMap((col, i) =>
      messageSnapshots[i].docs
        .filter((d) => !d.data().status || d.data().status === 'new' || d.data().status === 'pending')
        .map((d) => serializeTimestamps({ id: d.id, feedType: 'message', collection: col, ...d.data() }))
    );
    const pendingModItems = MODERATION_COLLECTIONS.flatMap((col, i) =>
      pendingModerationSnapshots[i].docs.map((d) => serializeTimestamps({ id: d.id, feedType: 'moderation', collection: col, ...d.data() }))
    );
    const pendingItemsFeed = [...pendingMessages, ...pendingModItems]
      .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 8);

    const stats = {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      newUsersThisWeek,
      totalEvents: totalEventsAgg.data().count,
      prayerRequests: prayerRequestsAgg.data().count,
      pendingModerationCount,
      monthlyGrowth: parseFloat(monthlyGrowth),
      roleDistribution,
      staleContentCount,
    };

    return NextResponse.json({
      success: true,
      stats,
      recentActions,
      nextEvent,
      recentMembers,
      auditActivityByDay,
      pendingItemsFeed,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
