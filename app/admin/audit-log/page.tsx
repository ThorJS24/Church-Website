'use client';

import { Fragment, useEffect, useState } from 'react';
import { ScrollText } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { LoadingState, EmptyState, ErrorState } from '@/components/admin/States';

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

  useEffect(() => { load(); }, [actionFilter]);

  const uniqueActions = Array.from(new Set(entries.map(e => e.action))).sort();

  if (loading) return <LoadingState label="Loading audit log..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Log</h1>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white"
        >
          <option value="">All actions</option>
          {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {entries.length === 0 ? (
        <EmptyState icon={ScrollText} title="No audit entries yet" description="Admin actions will appear here as they happen." />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                <th className="p-3">When</th>
                <th className="p-3">Actor</th>
                <th className="p-3">Action</th>
                <th className="p-3">Target</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <Fragment key={entry.id}>
                  <tr
                    className="border-b border-gray-100 dark:border-gray-700 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                  >
                    <td className="p-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatTimestamp(entry.timestamp)}</td>
                    <td className="p-3 text-gray-700 dark:text-gray-300">{entry.actorEmail} <span className="text-xs text-gray-400">({entry.actorRole})</span></td>
                    <td className="p-3 font-medium text-gray-900 dark:text-white">{entry.action}</td>
                    <td className="p-3 text-gray-500 dark:text-gray-400">{entry.targetType}/{entry.targetId}</td>
                  </tr>
                  {expanded === entry.id && (
                    <tr className="bg-gray-50 dark:bg-gray-900/50">
                      <td colSpan={4} className="p-4">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="font-semibold text-gray-600 dark:text-gray-400 mb-1">Before</p>
                            <pre className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto">
                              {JSON.stringify(entry.before, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-600 dark:text-gray-400 mb-1">After</p>
                            <pre className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto">
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
