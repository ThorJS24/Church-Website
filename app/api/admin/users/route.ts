import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin, requireSuperAdmin, withAudit } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const snapshot = await getAdminDb().collection('users').get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ success: true, users });
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

// Suspend/reactivate (isActive toggle) — admin and above.
export async function PATCH(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const { userId, isActive, reason } = await request.json();
    if (!userId || typeof isActive !== 'boolean') {
      return NextResponse.json({ success: false, message: 'userId and isActive are required' }, { status: 400 });
    }

    const ref = getAdminDb().collection('users').doc(userId);
    const before = (await ref.get()).data();

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
