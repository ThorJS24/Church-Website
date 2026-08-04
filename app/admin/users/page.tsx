'use client';

import { useEffect, useMemo, useState } from 'react';
import { Users as UsersIcon } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/permissions';
import { LoadingState, ErrorState } from '@/components/admin/States';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';

interface AdminUser {
  id: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
}

type PendingAction =
  | { type: 'suspend' | 'reactivate' | 'delete'; ids: string[] }
  | { type: 'role'; ids: string[]; role: UserRole };

const ROLE_OPTIONS: UserRole[] = [UserRole.MEMBER, UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN];

function displayName(u: AdminUser) {
  return u.displayName || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
}

export default function UserManagementPage() {
  const { user: actor, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    adminFetch('/api/admin/users')
      .then((data) => setUsers(data.users))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let result = users;
    if (roleFilter !== 'all') result = result.filter((u) => u.role === roleFilter);
    if (statusFilter !== 'all') {
      result = result.filter((u) => (statusFilter === 'active' ? u.isActive !== false : u.isActive === false));
    }
    return result;
  }, [users, roleFilter, statusFilter]);

  const runAction = async () => {
    if (!pendingAction) return;
    const { ids } = pendingAction;

    if (pendingAction.type === 'delete') {
      for (const id of ids) {
        await adminFetch('/api/admin/users', { method: 'DELETE', body: JSON.stringify({ userId: id }) });
      }
    } else if (pendingAction.type === 'suspend' || pendingAction.type === 'reactivate') {
      const isActive = pendingAction.type === 'reactivate';
      for (const id of ids) {
        await adminFetch('/api/admin/users', { method: 'PATCH', body: JSON.stringify({ userId: id, isActive }) });
      }
    } else if (pendingAction.type === 'role') {
      for (const id of ids) {
        await adminFetch('/api/admin/users', { method: 'PUT', body: JSON.stringify({ userId: id, role: pendingAction.role }) });
      }
    }
    load();
  };

  const consequenceFor = (action: PendingAction) => {
    const n = action.ids.length;
    const plural = n === 1 ? 'account' : `${n} accounts`;
    switch (action.type) {
      case 'delete':
        return `This will permanently delete ${plural}. Their profile, role, and activity history cannot be recovered.`;
      case 'suspend':
        return `This will suspend ${plural} — they will be immediately signed out and unable to sign in until reactivated.`;
      case 'reactivate':
        return `This will restore login access for ${plural}.`;
      case 'role':
        return `This will change the role for ${plural} to "${action.role}", changing what they can access in the admin panel.`;
    }
  };

  if (loading) return <LoadingState label="Loading members..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const columns: DataTableColumn<AdminUser>[] = [
    { key: 'name', header: 'Name', accessor: (u) => <span className="font-medium text-foreground">{displayName(u)}</span>, sortValue: displayName },
    { key: 'email', header: 'Email', accessor: (u) => u.email, sortValue: (u) => u.email || '' },
    {
      key: 'role',
      header: 'Role',
      sortValue: (u) => ROLE_OPTIONS.indexOf(u.role),
      accessor: (u) =>
        isSuperAdmin() ? (
          <Select
            size="sm"
            value={u.role}
            onChange={(e) => setPendingAction({ type: 'role', ids: [u.id], role: e.target.value as UserRole })}
            options={ROLE_OPTIONS.map((r) => ({ value: r, label: r }))}
            className="w-auto"
          />
        ) : (
          <Badge variant="neutral">{u.role}</Badge>
        ),
    },
    {
      key: 'createdAt',
      header: 'Member Since',
      sortValue: (u) => new Date(u.createdAt || 0).getTime(),
      accessor: (u) => (u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'),
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (u) => (u.isActive === false ? 0 : 1),
      accessor: (u) => <Badge variant={u.isActive === false ? 'danger' : 'success'}>{u.isActive === false ? 'Suspended' : 'Active'}</Badge>,
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-headline-md text-foreground">Members ({filtered.length})</h1>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
          options={[{ value: 'all', label: 'All roles' }, ...ROLE_OPTIONS.map((r) => ({ value: r, label: r }))]}
          className="w-auto"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          options={[{ value: 'all', label: 'All statuses' }, { value: 'active', label: 'Active' }, { value: 'suspended', label: 'Suspended' }]}
          className="w-auto"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-background p-12 text-center">
          <UsersIcon className="mx-auto mb-3 h-12 w-12 text-foreground-subtle" />
          <h3 className="text-title-sm text-foreground">No members match your filters</h3>
          <p className="mt-1 text-body-sm text-foreground-muted">Try clearing the search or filters.</p>
        </div>
      ) : (
        <DataTable
          data={filtered}
          columns={columns}
          getRowId={(u) => u.id}
          selectable
          searchKeys={(u) => `${displayName(u)} ${u.email}`}
          searchPlaceholder="Search name or email..."
          exportFilename={`members-${new Date().toISOString().split('T')[0]}.csv`}
          bulkActions={(ids) => (
            <div className="flex items-center gap-3">
              <button onClick={() => setPendingAction({ type: 'suspend', ids })} className="font-medium hover:underline">Suspend</button>
              <button onClick={() => setPendingAction({ type: 'reactivate', ids })} className="font-medium hover:underline">Reactivate</button>
              <button onClick={() => setPendingAction({ type: 'delete', ids })} className="font-medium text-danger hover:underline">Delete</button>
            </div>
          )}
          rowActions={(u) => (
            <div className="flex items-center justify-end gap-3 whitespace-nowrap text-caption">
              {u.isActive === false ? (
                <button onClick={() => setPendingAction({ type: 'reactivate', ids: [u.id] })} className="text-success hover:underline">Reactivate</button>
              ) : (
                <button onClick={() => setPendingAction({ type: 'suspend', ids: [u.id] })} className="text-warning hover:underline">Suspend</button>
              )}
              {u.id !== actor?.uid && (
                <button onClick={() => setPendingAction({ type: 'delete', ids: [u.id] })} className="text-danger hover:underline">Delete</button>
              )}
            </div>
          )}
        />
      )}

      <ConfirmModal
        isOpen={!!pendingAction}
        title={pendingAction?.type === 'role' ? 'Change role' : pendingAction?.type === 'delete' ? 'Delete member(s)' : pendingAction?.type === 'suspend' ? 'Suspend member(s)' : 'Reactivate member(s)'}
        consequence={pendingAction ? consequenceFor(pendingAction) : ''}
        confirmLabel={pendingAction?.type === 'delete' ? 'Delete' : 'Confirm'}
        destructive={pendingAction?.type === 'delete' || pendingAction?.type === 'suspend'}
        onConfirm={runAction}
        onClose={() => setPendingAction(null)}
      />
    </div>
  );
}
