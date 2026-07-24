import 'server-only';
import { getAdminDb } from '@/lib/firebase-admin';

/**
 * Fixed-window rate limit backed by Firestore — survives cold starts,
 * unlike an in-memory counter (see lib/security.ts's history: it had one
 * of those and it was dead code because it reset on every serverless
 * invocation). Not applied globally; see the route(s) that call this for
 * which endpoints are actually covered today.
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; retryAfterMs?: number }> {
  const ref = getAdminDb().collection('rateLimits').doc(key);
  const now = Date.now();

  return getAdminDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.data();

    if (!data || now - data.windowStart > windowMs) {
      tx.set(ref, { windowStart: now, count: 1 });
      return { allowed: true };
    }

    if (data.count >= maxRequests) {
      return { allowed: false, retryAfterMs: windowMs - (now - data.windowStart) };
    }

    tx.update(ref, { count: data.count + 1 });
    return { allowed: true };
  });
}

export function clientIpFrom(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}
