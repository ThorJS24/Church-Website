import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAuth } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.ok) return authResult.response;

  try {
    const prayerRequestsSnapshot = await getAdminDb()
      .collection('prayerRequests')
      .where('requestedBy', '==', authResult.user.uid)
      .get();

    // NOTE: attendance/donation aggregation is not implemented yet — there is
    // no attendance or donation collection to query. Flagging rather than
    // faking: these two numbers are placeholders until that data model
    // exists (tracked for Phase 3 analytics work).
    const stats = {
      attendanceCount: 0,
      prayerRequests: prayerRequestsSnapshot.size,
      donationTotal: 0,
      upcomingEvents: 0
    };

    return NextResponse.json({
      success: true,
      stats,
      recentActivity: []
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
