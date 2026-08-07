import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * In-app notification inbox, keyed by email rather than uid — matches how
 * eventRegistrations and prayerRequests already identify people (RSVP is
 * possible without an account), and a logged-in member's notifications are
 * looked up by their account email at read time.
 */
export async function createNotification(params: {
  email: string;
  title: string;
  message: string;
  link?: string;
}) {
  const db = getAdminDb();
  await db.collection('notifications').add({
    email: params.email.trim().toLowerCase(),
    title: params.title,
    message: params.message,
    link: params.link || null,
    read: false,
    createdAt: FieldValue.serverTimestamp(),
  });
}
