import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { sanityFetch } from '@/lib/sanity-fetch';

export async function GET() {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Get Firebase Firestore data
    const usersRef = collection(db, 'users');
    const prayerRequestsRef = collection(db, 'prayerRequests');
    
    const [usersSnapshot, prayerRequestsSnapshot] = await Promise.all([
      getDocs(usersRef).catch(() => ({ docs: [] })),
      getDocs(prayerRequestsRef).catch(() => ({ docs: [] }))
    ]);

    const users = usersSnapshot.docs || [];
    const totalUsers = users.length;
    const activeUsers = users.filter(doc => doc.data().isActive !== false).length;
    
    const newUsersThisMonth = users.filter(doc => {
      const createdAt = doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt);
      return createdAt >= firstDayOfMonth;
    }).length;
    
    const newUsersLastMonth = users.filter(doc => {
      const createdAt = doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt);
      return createdAt >= firstDayOfLastMonth && createdAt < firstDayOfMonth;
    }).length;

    const firebasePrayerRequests = prayerRequestsSnapshot.docs?.length || 0;

    // Get Sanity data
    const [events, sanityPrayerRequests] = await Promise.all([
      sanityFetch(`*[_type == "event" && eventDate >= "${now.toISOString()}"]`).catch(() => []),
      sanityFetch(`*[_type == "prayerRequest"]`).catch(() => [])
    ]);

    const totalPrayerRequests = (sanityPrayerRequests?.length || 0) + firebasePrayerRequests;
    const monthlyGrowth = newUsersLastMonth > 0 
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth * 100).toFixed(1)
      : newUsersThisMonth > 0 ? '100.0' : '0.0';

    const stats = {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      totalEvents: events?.length || 0,
      prayerRequests: totalPrayerRequests,
      monthlyGrowth: parseFloat(monthlyGrowth)
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}