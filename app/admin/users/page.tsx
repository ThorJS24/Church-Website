'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Papa from 'papaparse';
import { Users as UsersIcon, LayoutGrid, List, Upload, Mail, Pencil } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/permissions';
import { LoadingState, ErrorState } from '@/components/admin/States';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { DataTable, type DataTableColumn } from '@/components/ui-legacy/DataTable';
import { Select } from '@/components/ui-legacy/Select';
import { Badge } from '@/components/ui-legacy/Badge';
import { Avatar } from '@/components/ui-legacy/Avatar';
import { Card } from '@/components/ui-legacy/Card';
import { Button } from '@/components/ui-legacy/Button';
import { IconButton } from '@/components/ui-legacy/IconButton';
import { Modal } from '@/components/ui-legacy/Modal';
import { Input } from '@/components/ui-legacy/Input';
import { Textarea } from '@/components/ui-legacy/Textarea';
import { useToast } from '@/components/ui-legacy/Toast';

interface AdminUser {
  id: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
  lastSignInTime?: string | null;
  tags?: string[];
  pastoralNotes?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  householdName?: string;
}

type PendingAction =
  | { type: 'suspend' | 'reactivate' | 'delete'; ids: string[] }
  | { type: 'role'; ids: string[]; role: UserRole };

const ROLE_OPTIONS: UserRole[] = [UserRole.MEMBER, UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN];
const INACTIVE_AFTER_DAYS = 90;

function displayName(u: AdminUser) {
  return u.displayName || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
}

function isInactive(u: AdminUser) {
  const last = u.lastSignInTime ? new Date(u.lastSignInTime) : u.createdAt ? new Date(u.createdAt) : null;
  if (!last) return false;
  return Date.now() - last.getTime() > INACTIVE_AFTER_DAYS * 24 * 60 * 60 * 1000;
}

export default function UserManagementPage() {
  const { user: actor, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'inactive'>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [emailTargets, setEmailTargets] = useState<string[] | null>(null);
  const [importing, setImporting] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    adminFetch('/api/admin/users')
      .then((data) => setUsers(data.users))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => (u.tags || []).forEach((t) => set.add(t)));
    return [...set].sort();
  }, [users]);

  const filtered = useMemo(() => {
    let result = users;
    if (roleFilter !== 'all') result = result.filter((u) => u.role === roleFilter);
    if (statusFilter === 'active') result = result.filter((u) => u.isActive !== false);
    else if (statusFilter === 'suspended') result = result.filter((u) => u.isActive === false);
    else if (statusFilter === 'inactive') result = result.filter(isInactive);
    if (tagFilter !== 'all') result = result.filter((u) => (u.tags || []).includes(tagFilter));
    return result;
  }, [users, roleFilter, statusFilter, tagFilter]);

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

  const importCsv = (file: File | undefined) => {
    if (!file) return;
    setImporting(true);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        let updated = 0;
        const failures: string[] = [];
        for (const row of results.data) {
          const email = row.email?.trim();
          const match = users.find((u) => u.email?.toLowerCase() === email?.toLowerCase());
          if (!match) {
            if (email) failures.push(`${email}: no existing account`);
            continue;
          }
          const profile: Record<string, unknown> = {};
          if (row.tags !== undefined) profile.tags = row.tags.split(';').map((t) => t.trim()).filter(Boolean);
          if (row.pastoralNotes !== undefined) profile.pastoralNotes = row.pastoralNotes;
          if (row.emergencyContactName !== undefined) profile.emergencyContactName = row.emergencyContactName;
          if (row.emergencyContactPhone !== undefined) profile.emergencyContactPhone = row.emergencyContactPhone;
          if (row.householdName !== undefined) profile.householdName = row.householdName;
          try {
            await adminFetch('/api/admin/users', { method: 'PATCH', body: JSON.stringify({ userId: match.id, profile }) });
            updated++;
          } catch (err: any) {
            failures.push(`${email}: ${err.message}`);
          }
        }
        setImporting(false);
        if (csvInputRef.current) csvInputRef.current.value = '';
        toast({
          title: `Updated ${updated} of ${results.data.length} rows`,
          description: failures.length ? failures.slice(0, 3).join(' · ') : 'Matched by email — rows with no existing account were skipped.',
          variant: failures.length ? 'warning' : 'success',
        });
        load();
      },
    });
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
      key: 'tags',
      header: 'Tags',
      sortValue: (u) => (u.tags || []).join(','),
      accessor: (u) => (
        <div className="flex flex-wrap gap-1">
          {(u.tags || []).map((t) => <Badge key={t} variant="neutral">{t}</Badge>)}
        </div>
      ),
    },
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
      sortValue: (u) => (u.isActive === false ? 0 : isInactive(u) ? 1 : 2),
      accessor: (u) => (
        <div className="flex flex-wrap gap-1">
          <Badge variant={u.isActive === false ? 'danger' : 'success'}>{u.isActive === false ? 'Suspended' : 'Active'}</Badge>
          {isInactive(u) && u.isActive !== false && <Badge variant="warning">Inactive 90d+</Badge>}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-headline-md text-foreground">Members ({filtered.length})</h1>
        <div className="flex items-center gap-2">
          <input ref={csvInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => importCsv(e.target.files?.[0])} />
          <Button variant="secondary" size="sm" leftIcon={<Upload className="h-4 w-4" />} loading={importing} onClick={() => csvInputRef.current?.click()}>
            Import CSV
          </Button>
          <div className="flex rounded-lg bg-surface-active p-1">
            <IconButton label="Table view" size="sm" className={viewMode === 'table' ? 'bg-background shadow-xs' : ''} onClick={() => setViewMode('table')}>
              <List className="h-4 w-4" />
            </IconButton>
            <IconButton label="Grid view" size="sm" className={viewMode === 'grid' ? 'bg-background shadow-xs' : ''} onClick={() => setViewMode('grid')}>
              <LayoutGrid className="h-4 w-4" />
            </IconButton>
          </div>
        </div>
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
          options={[
            { value: 'all', label: 'All statuses' },
            { value: 'active', label: 'Active' },
            { value: 'suspended', label: 'Suspended' },
            { value: 'inactive', label: `Inactive ${INACTIVE_AFTER_DAYS}d+` },
          ]}
          className="w-auto"
        />
        {allTags.length > 0 && (
          <Select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            options={[{ value: 'all', label: 'All tags' }, ...allTags.map((t) => ({ value: t, label: t }))]}
            className="w-auto"
          />
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-background p-12 text-center">
          <UsersIcon className="mx-auto mb-3 h-12 w-12 text-foreground-subtle" />
          <h3 className="text-title-sm text-foreground">No members match your filters</h3>
          <p className="mt-1 text-body-sm text-foreground-muted">Try clearing the search or filters.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((u) => (
            <Card key={u.id} padding="md">
              <div className="mb-3 flex items-center gap-3">
                <Avatar name={displayName(u)} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body-sm font-medium text-foreground">{displayName(u)}</p>
                  <p className="truncate text-caption text-foreground-subtle">{u.email}</p>
                </div>
                <IconButton label="Edit profile" size="sm" onClick={() => setEditingUser(u)}><Pencil className="h-3.5 w-3.5" /></IconButton>
              </div>
              <div className="mb-2 flex flex-wrap gap-1">
                <Badge variant="neutral">{u.role}</Badge>
                <Badge variant={u.isActive === false ? 'danger' : 'success'}>{u.isActive === false ? 'Suspended' : 'Active'}</Badge>
                {u.householdName && <Badge variant="accent">{u.householdName}</Badge>}
              </div>
              {(u.tags || []).length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {u.tags!.map((t) => <Badge key={t} variant="neutral">{t}</Badge>)}
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <DataTable
          data={filtered}
          columns={columns}
          getRowId={(u) => u.id}
          selectable
          searchKeys={(u) => `${displayName(u)} ${u.email} ${(u.tags || []).join(' ')}`}
          searchPlaceholder="Search name, email, or tag..."
          exportFilename={`members-${new Date().toISOString().split('T')[0]}.csv`}
          bulkActions={(ids) => (
            <div className="flex items-center gap-3">
              <button onClick={() => setEmailTargets(ids)} className="flex items-center gap-1 font-medium hover:underline"><Mail className="h-3.5 w-3.5" /> Email</button>
              <button onClick={() => setPendingAction({ type: 'suspend', ids })} className="font-medium hover:underline">Suspend</button>
              <button onClick={() => setPendingAction({ type: 'reactivate', ids })} className="font-medium hover:underline">Reactivate</button>
              <button onClick={() => setPendingAction({ type: 'delete', ids })} className="font-medium text-danger hover:underline">Delete</button>
            </div>
          )}
          rowActions={(u) => (
            <div className="flex items-center justify-end gap-3 whitespace-nowrap text-caption">
              <button onClick={() => setEditingUser(u)} className="text-accent hover:underline">Edit</button>
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

      {editingUser && (
        <EditProfileModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={() => { setEditingUser(null); load(); }}
        />
      )}

      {emailTargets && (
        <BulkEmailModal
          userIds={emailTargets}
          count={emailTargets.length}
          onClose={() => setEmailTargets(null)}
        />
      )}
    </div>
  );
}

function EditProfileModal({ user, onClose, onSaved }: { user: AdminUser; onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const [tags, setTags] = useState((user.tags || []).join(', '));
  const [pastoralNotes, setPastoralNotes] = useState(user.pastoralNotes || '');
  const [emergencyContactName, setEmergencyContactName] = useState(user.emergencyContactName || '');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(user.emergencyContactPhone || '');
  const [householdName, setHouseholdName] = useState(user.householdName || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await adminFetch('/api/admin/users', {
        method: 'PATCH',
        body: JSON.stringify({
          userId: user.id,
          profile: {
            tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
            pastoralNotes,
            emergencyContactName,
            emergencyContactPhone,
            householdName,
          },
        }),
      });
      toast({ title: 'Profile updated', variant: 'success' });
      onSaved();
    } catch (err: any) {
      toast({ title: 'Could not save', description: err.message, variant: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={`Edit ${displayName(user)}`}>
      <div className="space-y-4">
        <Input label="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="choir, usher team, new believer" />
        <Input label="Household name" value={householdName} onChange={(e) => setHouseholdName(e.target.value)} hint="Members sharing this value are treated as one household." />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Emergency contact name" value={emergencyContactName} onChange={(e) => setEmergencyContactName(e.target.value)} />
          <Input label="Emergency contact phone" value={emergencyContactPhone} onChange={(e) => setEmergencyContactPhone(e.target.value)} />
        </div>
        <Textarea label="Pastoral notes (staff-only)" rows={4} value={pastoralNotes} onChange={(e) => setPastoralNotes(e.target.value)} hint="Never visible to the member themselves." />
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button loading={saving} onClick={save}>Save</Button>
        </div>
      </div>
    </Modal>
  );
}

function BulkEmailModal({ userIds, count, onClose }: { userIds: string[]; count: number; onClose: () => void }) {
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const send = async () => {
    setSending(true);
    try {
      const data = await adminFetch('/api/admin/users/email', { method: 'POST', body: JSON.stringify({ userIds, subject, body }) });
      toast({ title: `Sent to ${data.sent} of ${data.sent + data.failed}`, variant: data.failed ? 'warning' : 'success' });
      onClose();
    } catch (err: any) {
      toast({ title: 'Could not send', description: err.message, variant: 'danger' });
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={`Email ${count} member${count === 1 ? '' : 's'}`}>
      <div className="space-y-4">
        <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
        <Textarea label="Body (HTML)" rows={8} value={body} onChange={(e) => setBody(e.target.value)} className="font-mono" required />
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button loading={sending} disabled={!subject.trim() || !body.trim()} onClick={send}>Send</Button>
        </div>
      </div>
    </Modal>
  );
}
