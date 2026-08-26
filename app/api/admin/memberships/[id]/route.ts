import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, withAudit } from '@/lib/api-auth';
import { removeMinistryMembership, removeGroupMembership } from '@/lib/repositories/memberships';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get('kind');

  try {
    await withAudit(
      authResult.user,
      request,
      { action: `${kind === 'group' ? 'groupMembership' : 'ministryMembership'}.delete`, targetType: kind === 'group' ? 'groupMemberships' : 'ministryMemberships', targetId: id },
      async () => {
        if (kind === 'group') await removeGroupMembership(id);
        else await removeMinistryMembership(id);
        return { before: null, after: null, result: null };
      }
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting membership ${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to delete membership' }, { status: 500 });
  }
}
