'use client';

import { Fragment, useEffect, useState } from 'react';
import { ScrollText } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { LoadingState, EmptyState, ErrorState } from '@/components/admin/States';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/cn';

interface AuditEntry {
  id: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  before: unknown;
  after: unknown;
  timestamp: { seconds?: number } | null;
  ip?: string;
}

function formatTimestamp(ts: AuditEntry['timestamp']) {
  if (!ts || typeof ts.seconds !== 'number') return '—';
  return new Date(ts.seconds * 1000).toLocaleString();
}

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (actionFilter) params.set('action', actionFilter);
    adminFetch(`/api/admin/audit-log?${params.toString()}`)
      .then((data) => setEntries(data.entries))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [actionFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const uniqueActions = Array.from(new Set(entries.map(e => e.action))).sort();

  if (loading) return <LoadingState label="Loading audit log..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-headline-md text-foreground">Audit Log</h1>
        <Select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          options={[{ value: '', label: 'All actions' }, ...uniqueActions.map(a => ({ value: a, label: a }))]}
          className="w-auto"
        />
      </div>

      {entries.length === 0 ? (
        <EmptyState icon={ScrollText} title="No audit entries yet" description="Admin actions will appear here as they happen." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-surface">
              <tr>
                <th className="p-3 text-label text-foreground-subtle">When</th>
                <th className="p-3 text-label text-foreground-subtle">Actor</th>
                <th className="p-3 text-label text-foreground-subtle">Action</th>
                <th className="p-3 text-label text-foreground-subtle">Target</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <Fragment key={entry.id}>
                  <tr
                    className={cn('cursor-pointer border-t border-border transition-colors hover:bg-surface-hover', expanded === entry.id && 'bg-surface-hover')}
                    onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                  >
                    <td className="whitespace-nowrap p-3 text-foreground-muted">{formatTimestamp(entry.timestamp)}</td>
                    <td className="p-3 text-foreground-muted">{entry.actorEmail} <span className="text-caption text-foreground-subtle">({entry.actorRole})</span></td>
                    <td className="p-3 font-medium text-foreground">{entry.action}</td>
                    <td className="p-3 text-foreground-muted">{entry.targetType}/{entry.targetId}</td>
                  </tr>
                  {expanded === entry.id && (
                    <tr className="bg-surface">
                      <td colSpan={4} className="p-4">
                        <div className="grid grid-cols-2 gap-4 text-caption">
                          <div>
                            <p className="mb-1 font-semibold text-foreground-muted">Before</p>
                            <pre className="overflow-x-auto rounded-md border border-border bg-background p-2 text-foreground">
                              {JSON.stringify(entry.before, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <p className="mb-1 font-semibold text-foreground-muted">After</p>
                            <pre className="overflow-x-auto rounded-md border border-border bg-background p-2 text-foreground">
                              {JSON.stringify(entry.after, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
