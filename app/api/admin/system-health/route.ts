import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/api-auth';

const COUNT_COLLECTIONS = ['sermons', 'events', 'users', 'formDefinitions', 'auditLog'] as const;

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const checks: Array<{ name: string; status: 'ok' | 'error' | 'warning'; detail: string }> = [];

  // Firestore: a real read, timed, doubles as the connectivity check.
  const firestoreStart = Date.now();
  try {
    await getAdminDb().collection('siteSettings').doc('main').get();
    checks.push({ name: 'Firestore', status: 'ok', detail: `Reachable (${Date.now() - firestoreStart}ms)` });
  } catch (error) {
    checks.push({ name: 'Firestore', status: 'error', detail: error instanceof Error ? error.message : 'Unreachable' });
  }

  checks.push({
    name: 'Firebase Admin credentials',
    status: process.env.FIREBASE_ADMIN_PROJECT_ID && process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY ? 'ok' : 'error',
    detail: process.env.FIREBASE_ADMIN_PROJECT_ID ? `Project: ${process.env.FIREBASE_ADMIN_PROJECT_ID}` : 'Missing env vars',
  });

  checks.push({
    name: 'Cloudinary (media uploads)',
    status: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET ? 'ok' : 'warning',
    detail: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? `Cloud: ${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}` : 'Not configured — uploads will fail',
  });

  checks.push({
    name: 'Resend (email sending)',
    status: process.env.RESEND_API_KEY ? 'ok' : 'warning',
    detail: process.env.RESEND_API_KEY ? 'Configured' : 'Not configured — replies/newsletters/notifications will fail',
  });

  let counts: Record<string, number> = {};
  try {
    const snapshots = await Promise.all(COUNT_COLLECTIONS.map((c) => getAdminDb().collection(c).count().get()));
    counts = Object.fromEntries(COUNT_COLLECTIONS.map((c, i) => [c, snapshots[i].data().count]));
  } catch (error) {
    console.error('Error counting collections for system health:', error);
  }

  return NextResponse.json({ success: true, checks, counts, checkedAt: new Date().toISOString() });
}
