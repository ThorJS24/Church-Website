import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { UserRole, roleAtLeast } from '@/lib/permissions';

export interface AuthenticatedUser {
  uid: string;
  email: string | null;
  role: UserRole;
}

type AuthResult =
  | { ok: true; user: AuthenticatedUser }
  | { ok: false; response: NextResponse };

function unauthorized(message: string) {
  return NextResponse.json({ success: false, message }, { status: 401 });
}

function forbidden(message: string) {
  return NextResponse.json({ success: false, message }, { status: 403 });
}

/**
 * Verifies the Firebase ID token on the request and checks the caller's
 * role (read from their Firestore users/{uid} doc — a trusted, server-side
 * read, never from anything the client sends) is at or above `minRole`.
 */
export async function requireRole(request: NextRequest, minRole: UserRole): Promise<AuthResult> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;

  if (!token) {
    return { ok: false, response: unauthorized('Missing Authorization header') };
  }

  let decoded;
  try {
    decoded = await getAdminAuth().verifyIdToken(token);
  } catch {
    return { ok: false, response: unauthorized('Invalid or expired session') };
  }

  const userDoc = await getAdminDb().collection('users').doc(decoded.uid).get();
  const role = (userDoc.exists ? (userDoc.data()?.role as UserRole) : undefined) ?? UserRole.MEMBER;

  if (userDoc.exists && userDoc.data()?.isActive === false) {
    return { ok: false, response: forbidden('Account is disabled') };
  }

  if (!roleAtLeast(role, minRole)) {
    return { ok: false, response: forbidden('Insufficient permissions') };
  }

  return { ok: true, user: { uid: decoded.uid, email: decoded.email ?? null, role } };
}

/** Any authenticated, non-disabled member (no role floor beyond MEMBER). */
export function requireAuth(request: NextRequest) {
  return requireRole(request, UserRole.MEMBER);
}

/** Moderators and above — moderation actions only (no content/user edits). */
export function requireModerator(request: NextRequest) {
  return requireRole(request, UserRole.MODERATOR);
}

/** Admins and above — content edits, user management (not role changes). */
export function requireAdmin(request: NextRequest) {
  return requireRole(request, UserRole.ADMIN);
}

/** Super admins only — role changes and anything else admin can't do. */
export function requireSuperAdmin(request: NextRequest) {
  return requireRole(request, UserRole.SUPER_ADMIN);
}

// ---- Audit log ----
// Every mutation from the admin panel should route through withAudit rather
// than hand-writing a log entry, so nobody can forget to log an action.

export interface AuditEntry {
  action: string;
  targetType: string;
  targetId: string;
  before?: unknown;
  after?: unknown;
}

export async function logAudit(user: AuthenticatedUser, entry: AuditEntry, request: NextRequest) {
  await getAdminDb().collection('auditLog').add({
    actorUid: user.uid,
    actorEmail: user.email,
    actorRole: user.role,
    action: entry.action,
    targetType: entry.targetType,
    targetId: entry.targetId,
    before: entry.before ?? null,
    after: entry.after ?? null,
    timestamp: FieldValue.serverTimestamp(),
    ip: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? null,
  });
}

/**
 * Wraps a mutation so it's logged automatically. `fn` performs the actual
 * write and returns what to log alongside its result — callers don't
 * construct audit entries by hand, they just describe before/after.
 */
export async function withAudit<T>(
  user: AuthenticatedUser,
  request: NextRequest,
  entry: Omit<AuditEntry, 'before' | 'after'>,
  fn: () => Promise<{ before?: unknown; after?: unknown; result: T }>
): Promise<T> {
  const { before, after, result } = await fn();
  await logAudit(user, { ...entry, before, after }, request);
  return result;
}
