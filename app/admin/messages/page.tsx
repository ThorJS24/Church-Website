'use client';

import { useEffect, useState } from 'react';
import { Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { LoadingState, EmptyState, ErrorState } from '@/components/admin/States';

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

const STATUS_BADGE: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  contacted: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  closed: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages ({items.length})</h1>
        <label htmlFor="message-filter" className="sr-only">Filter by status</label>
        <select
          id="message-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
        >
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Mail} title="No messages" description="General contact form submissions, volunteer applications, and wedding/baptism requests will show up here." />
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const key = `${item.collection}-${item.id}`;
            const isOpen = expanded === key;
            return (
              <div key={key} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : key)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">{typeOf(item)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGE[item.status || 'new'] || STATUS_BADGE.new}`}>
                        {item.status || 'new'}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white truncate">{nameOf(item)} &lt;{item.email}&gt;</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{item.subject || item.message || 'No message'}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>

                {isOpen && (
                  <MessageDetail
                    item={item}
                    saving={saving === key}
                    onSave={(status, notes) => updateStatus(item, status, notes)}
                  />
                )}
              </div>
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
    <div className="border-t border-gray-100 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/30">
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mb-4 text-sm">
        {fields.map(([label, value]) => (
          <div key={label}>
            <dt className="text-gray-500 dark:text-gray-400 capitalize">{label}</dt>
            <dd className="text-gray-800 dark:text-gray-200 break-words">{Array.isArray(value) ? value.join(', ') : String(value)}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <div>
          <label htmlFor={`status-${item.id}`} className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Status</label>
          <select
            id={`status-${item.id}`}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
          >
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label htmlFor={`notes-${item.id}`} className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Notes</label>
          <input
            id={`notes-${item.id}`}
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
          />
        </div>
        <button
          onClick={() => onSave(status, notes)}
          disabled={saving}
          className="px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
