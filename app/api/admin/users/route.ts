import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin, requireSuperAdmin, withAudit } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const snapshot = await getAdminDb().collection('users').get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // lastSignInTime only lives in Firebase Auth, not Firestore — fetched
    // per-user here for the inactive-member flag. Fine at this
    // congregation's current size; would need batching/caching well before
    // this becomes thousands of users.
    const withLastSignIn = await Promise.all(
      users.map(async (u: any) => {
        try {
          const record = await getAdminAuth().getUser(u.id);
          return { ...u, lastSignInTime: record.metadata.lastSignInTime || null };
        } catch {
          return { ...u, lastSignInTime: null };
        }
      })
    );

    return NextResponse.json({ success: true, users: withLastSignIn });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// Role changes only — super_admin only, per the role spec (admin can manage
// users but not change roles).
export async function PUT(request: NextRequest) {
  const authResult = await requireSuperAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const { userId, role } = await request.json();
    if (!userId || !role) {
      return NextResponse.json({ success: false, message: 'userId and role are required' }, { status: 400 });
    }

    const ref = getAdminDb().collection('users').doc(userId);
    const before = (await ref.get()).data();

    await withAudit(
      authResult.user,
      request,
      { action: 'user.role_change', targetType: 'user', targetId: userId },
      async () => {
        await ref.update({ role, updatedAt: new Date().toISOString() });
        return { before: { role: before?.role }, after: { role }, result: null };
      }
    );

    return NextResponse.json({ success: true, message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// Allowlisted, purely-informational fields — pastoral notes and emergency
// contact are staff-only additions to a member's record, never something
// the member edits about themselves, so they live here rather than on the
// self-service profile endpoint.
const PROFILE_FIELDS = ['tags', 'pastoralNotes', 'emergencyContactName', 'emergencyContactPhone', 'householdName'] as const;

// Suspend/reactivate (isActive toggle), mark a new member as welcomed, or
// edit staff-only profile fields — admin and above. Kept in one handler
// since all three are "update a small set of fields on a user doc" with
// the same shape, just different allowed keys.
export async function PATCH(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const body = await request.json();
    const { userId, isActive, reason, welcomed, profile } = body;
    const hasProfile = profile && typeof profile === 'object';
    if (!userId || (typeof isActive !== 'boolean' && typeof welcomed !== 'boolean' && !hasProfile)) {
      return NextResponse.json({ success: false, message: 'userId and isActive, welcomed, or profile are required' }, { status: 400 });
    }

    const ref = getAdminDb().collection('users').doc(userId);
    const before = (await ref.get()).data();

    if (hasProfile) {
      const updates: Record<string, unknown> = {};
      const beforeProfile: Record<string, unknown> = {};
      for (const key of PROFILE_FIELDS) {
        if (key in profile) {
          updates[key] = profile[key];
          beforeProfile[key] = before?.[key] ?? null;
        }
      }
      await withAudit(
        authResult.user,
        request,
        { action: 'user.profile_update', targetType: 'user', targetId: userId },
        async () => {
          await ref.update({ ...updates, updatedAt: new Date().toISOString() });
          return { before: beforeProfile, after: updates, result: null };
        }
      );
      return NextResponse.json({ success: true, message: 'Profile updated' });
    }

    if (typeof welcomed === 'boolean') {
      await withAudit(
        authResult.user,
        request,
        { action: 'user.welcomed', targetType: 'user', targetId: userId },
        async () => {
          await ref.update({ welcomed, welcomedAt: welcomed ? new Date().toISOString() : null });
          return { before: { welcomed: before?.welcomed }, after: { welcomed }, result: null };
        }
      );
      return NextResponse.json({ success: true, message: welcomed ? 'Marked as welcomed' : 'Marked as not yet welcomed' });
    }

    await withAudit(
      authResult.user,
      request,
      { action: isActive ? 'user.reactivate' : 'user.suspend', targetType: 'user', targetId: userId },
      async () => {
        const updates: Record<string, unknown> = { isActive, updatedAt: new Date().toISOString() };
        if (!isActive) {
          updates.suspendedAt = new Date().toISOString();
          updates.suspendedReason = reason || null;
        }
        await ref.update(updates);
        return {
          before: { isActive: before?.isActive },
          after: { isActive, reason: reason || null },
          result: null,
        };
      }
    );

    return NextResponse.json({ success: true, message: isActive ? 'User reactivated' : 'User suspended' });
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update user status' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 });
    }

    if (userId === authResult.user.uid) {
      return NextResponse.json({ success: false, message: 'Cannot delete your own account' }, { status: 400 });
    }

    const ref = getAdminDb().collection('users').doc(userId);
    const before = (await ref.get()).data();

    await withAudit(
      authResult.user,
      request,
      { action: 'user.delete', targetType: 'user', targetId: userId },
      async () => {
        await ref.delete();
        return { before, after: null, result: null };
      }
    );

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
