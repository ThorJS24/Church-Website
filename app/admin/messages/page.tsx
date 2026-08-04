'use client';

import { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { LoadingState, EmptyState, ErrorState } from '@/components/admin/States';
import { Card } from '@/components/ui/Card';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface MessageItem {
  id: string;
  collection: 'contacts' | 'serviceRequests';
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  department?: string;
  serviceType?: string;
  subject?: string;
  message?: string;
  preferredDate?: string;
  status?: string;
  notes?: string;
  createdAt: string;
  details?: Record<string, any>;
}

const TYPE_LABEL: Record<string, string> = {
  general: 'General',
  volunteer: 'Volunteer',
  wedding: 'Wedding Request',
  baptism: 'Baptism Request',
};

const STATUS_OPTIONS = ['new', 'pending', 'contacted', 'closed'];

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  new: 'info',
  pending: 'warning',
  contacted: 'accent',
  closed: 'neutral',
};

function typeOf(item: MessageItem): string {
  if (item.collection === 'serviceRequests') return TYPE_LABEL[item.serviceType || ''] || 'Service Request';
  return TYPE_LABEL[item.department || 'general'] || item.department || 'General';
}

function nameOf(item: MessageItem): string {
  return item.name || [item.firstName, item.lastName].filter(Boolean).join(' ') || 'Unknown';
}

export default function MessagesPage() {
  const [items, setItems] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [saving, setSaving] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    adminFetch('/api/admin/messages')
      .then((data) => setItems(data.items))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (item: MessageItem, status: string, notes: string) => {
    const key = `${item.collection}-${item.id}`;
    setSaving(key);
    try {
      await adminFetch(`/api/admin/messages/${item.collection}/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes }),
      });
      setItems(prev => prev.map(i => (i.id === item.id && i.collection === item.collection ? { ...i, status, notes } : i)));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <LoadingState label="Loading messages..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const filtered = filter === 'all' ? items : items.filter(i => (i.status || 'new') === filter);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-headline-md text-foreground">Messages ({items.length})</h1>
        <Select
          aria-label="Filter by status"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          options={[{ value: 'all', label: 'All statuses' }, ...STATUS_OPTIONS.map(s => ({ value: s, label: s }))]}
          className="w-auto"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Mail} title="No messages" description="General contact form submissions, volunteer applications, and wedding/baptism requests will show up here." />
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const key = `${item.collection}-${item.id}`;
            const isOpen = expanded === key;
            const panelId = `message-detail-${key}`;
            return (
              <Card key={key} padding="none" className="overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : key)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="flex w-full items-center justify-between gap-4 p-4 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-caption font-semibold uppercase tracking-wide text-accent">{typeOf(item)}</span>
                      <Badge variant={STATUS_VARIANT[item.status || 'new'] || 'info'}>{item.status || 'new'}</Badge>
                    </div>
                    <p className="truncate text-body-sm font-medium text-foreground">{nameOf(item)} &lt;{item.email}&gt;</p>
                    <p className="truncate text-body-sm text-foreground-muted">{item.subject || item.message || 'No message'}</p>
                  </div>
                  <span className="shrink-0 text-caption text-foreground-subtle">{new Date(item.createdAt).toLocaleDateString()}</span>
                </button>

                {isOpen && (
                  <div id={panelId}>
                    <MessageDetail item={item} saving={saving === key} onSave={(status, notes) => updateStatus(item, status, notes)} />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MessageDetail({ item, saving, onSave }: { item: MessageItem; saving: boolean; onSave: (status: string, notes: string) => void }) {
  const [status, setStatus] = useState(item.status || 'new');
  const [notes, setNotes] = useState(item.notes || '');

  const fields: [string, any][] = Object.entries({
    Phone: item.phone,
    'Preferred Date': item.preferredDate,
    Message: item.message,
    ...(item.details || {}),
  }).filter(([, v]) => v !== undefined && v !== null && v !== '');

  return (
    <div className="border-t border-border bg-surface p-4">
      <dl className="mb-4 grid grid-cols-1 gap-x-6 gap-y-2 text-body-sm sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label}>
            <dt className="capitalize text-foreground-subtle">{label}</dt>
            <dd className="break-words text-foreground">{Array.isArray(value) ? value.join(', ') : String(value)}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end">
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} options={STATUS_OPTIONS.map(s => ({ value: s, label: s }))} size="sm" className="w-auto" />
        <Input label="Notes" size="sm" value={notes} onChange={(e) => setNotes(e.target.value)} className="min-w-[200px] flex-1" />
        <Button size="sm" loading={saving} onClick={() => onSave(status, notes)}>{saving ? 'Saving...' : 'Save'}</Button>
      </div>
    </div>
  );
}
