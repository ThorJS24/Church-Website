'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Download, ChevronUp, ChevronDown, Users as UsersIcon } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, roleAtLeast } from '@/lib/permissions';
import { LoadingState, EmptyState, ErrorState } from '@/components/admin/States';
import ConfirmModal from '@/components/admin/ConfirmModal';

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

type SortKey = 'name' | 'email' | 'role' | 'createdAt';

const ROLE_OPTIONS: UserRole[] = [UserRole.MEMBER, UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN];
const PAGE_SIZE = 20;

function displayName(u: AdminUser) {
  return u.displayName || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
}

export default function UserManagementPage() {
  const { user: actor, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pendingAction, setPendingAction] = useState<
    | { type: 'suspend' | 'reactivate' | 'delete'; ids: string[] }
    | { type: 'role'; ids: string[]; role: UserRole }
    | null
  >(null);

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
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(u => displayName(u).toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
    }
    if (roleFilter !== 'all') result = result.filter(u => u.role === roleFilter);
    if (statusFilter !== 'all') {
      result = result.filter(u => (statusFilter === 'active' ? u.isActive !== false : u.isActive === false));
    }

    const sorted = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = displayName(a).localeCompare(displayName(b));
      else if (sortKey === 'email') cmp = (a.email || '').localeCompare(b.email || '');
      else if (sortKey === 'role') cmp = ROLE_OPTIONS.indexOf(a.role) - ROLE_OPTIONS.indexOf(b.role);
      else cmp = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [users, search, roleFilter, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAllOnPage = () => {
    setSelected(prev => {
      const next = new Set(prev);
      const allSelected = pageItems.every(u => next.has(u.id));
      pageItems.forEach(u => (allSelected ? next.delete(u.id) : next.add(u.id)));
      return next;
    });
  };

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
    setSelected(new Set());
    load();
  };

  const exportCsv = () => {
    const header = ['Name', 'Email', 'Role', 'Status', 'Member Since'];
    const rows = filtered.map(u => [
      displayName(u),
      u.email,
      u.role,
      u.isActive === false ? 'Suspended' : 'Active',
      u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '',
    ]);
    const csv = [header, ...rows].map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `members-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const consequenceFor = (action: NonNullable<typeof pendingAction>) => {
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Members ({filtered.length})</h1>
        <button
          onClick={exportCsv}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name or email..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value as UserRole | 'all'); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white"
        >
          <option value="all">All roles</option>
          {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
          <span className="font-medium text-blue-800 dark:text-blue-300">{selected.size} selected</span>
          <button
            onClick={() => setPendingAction({ type: 'suspend', ids: [...selected] })}
            className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Suspend
          </button>
          <button
            onClick={() => setPendingAction({ type: 'reactivate', ids: [...selected] })}
            className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Reactivate
          </button>
          <button
            onClick={() => setPendingAction({ type: 'delete', ids: [...selected] })}
            className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon={UsersIcon} title="No members match your filters" description="Try clearing the search or filters." />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                <th className="p-3 w-8">
                  <input
                    type="checkbox"
                    checked={pageItems.length > 0 && pageItems.every(u => selected.has(u.id))}
                    onChange={toggleSelectAllOnPage}
                  />
                </th>
                {([['name', 'Name'], ['email', 'Email'], ['role', 'Role'], ['createdAt', 'Member Since']] as [SortKey, string][]).map(([key, label]) => (
                  <th key={key} className="p-3 cursor-pointer select-none" onClick={() => toggleSort(key)}>
                    <span className="inline-flex items-center gap-1">
                      {label}
                      {sortKey === key && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                    </span>
                  </th>
                ))}
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <td className="p-3">
                    <input type="checkbox" checked={selected.has(u.id)} onChange={() => toggleSelect(u.id)} />
                  </td>
                  <td className="p-3 font-medium text-gray-900 dark:text-white">{displayName(u)}</td>
                  <td className="p-3 text-gray-600 dark:text-gray-300">{u.email}</td>
                  <td className="p-3">
                    {isSuperAdmin() ? (
                      <select
                        value={u.role}
                        onChange={(e) => setPendingAction({ type: 'role', ids: [u.id], role: e.target.value as UserRole })}
                        className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-white"
                      >
                        {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">{u.role}</span>
                    )}
                  </td>
                  <td className="p-3 text-gray-500 dark:text-gray-400">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${u.isActive === false ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
                      {u.isActive === false ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {u.isActive === false ? (
                      <button
                        onClick={() => setPendingAction({ type: 'reactivate', ids: [u.id] })}
                        className="text-xs text-green-600 hover:underline"
                      >
                        Reactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => setPendingAction({ type: 'suspend', ids: [u.id] })}
                        className="text-xs text-amber-600 hover:underline"
                      >
                        Suspend
                      </button>
                    )}
                    {u.id !== actor?.uid && (
                      <button
                        onClick={() => setPendingAction({ type: 'delete', ids: [u.id] })}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-gray-400">
          <span>Page {page} of {totalPages}</span>
          <div className="space-x-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-40">Previous</button>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-40">Next</button>
          </div>
        </div>
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
