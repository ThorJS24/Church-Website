'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';
import { ScrollText, Download, ChevronDown, ChevronRight, History, Bookmark, X } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { LoadingState, EmptyState, ErrorState } from '@/components/admin/States';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/cn';

interface AuditEntry {
  id: string;
  actorEmail: string;
  actorUid: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  before: unknown;
  after: unknown;
  timestamp: string | null;
  ip?: string;
}

interface FilterPreset {
  name: string;
  actorEmail: string;
  action: string;
  targetType: string;
  from: string;
  to: string;
}

const PRESETS_KEY = 'auditLogFilterPresets';
// Entries from the same actor doing the same action within this window are
// treated as one bulk operation (e.g. bulk-delete loops one audit write per
// item) — grouped into a single collapsible row instead of flooding the list.
const GROUP_WINDOW_MS = 10_000;

function formatTimestamp(ts: AuditEntry['timestamp']) {
  if (!ts) return '—';
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
}

function loadPresets(): FilterPreset[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(PRESETS_KEY) || '[]'); } catch { return []; }
}

interface EntryGroup { key: string; actorEmail: string; actorRole: string; action: string; timestamp: string | null; entries: AuditEntry[] }

function groupEntries(entries: AuditEntry[]): EntryGroup[] {
  const groups: EntryGroup[] = [];
  for (const entry of entries) {
    const last = groups[groups.length - 1];
    const entryTime = entry.timestamp ? new Date(entry.timestamp).getTime() : null;
    const lastTime = last?.timestamp ? new Date(last.timestamp).getTime() : null;
    if (
      last &&
      last.actorEmail === entry.actorEmail &&
      last.action === entry.action &&
      entryTime !== null && lastTime !== null &&
      Math.abs(lastTime - entryTime) < GROUP_WINDOW_MS
    ) {
      last.entries.push(entry);
    } else {
      groups.push({ key: entry.id, actorEmail: entry.actorEmail, actorRole: entry.actorRole, action: entry.action, timestamp: entry.timestamp, entries: [entry] });
    }
  }
  return groups;
}

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState('');
  const [actorEmailFilter, setActorEmailFilter] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('');
  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [historyTarget, setHistoryTarget] = useState<{ targetType: string; targetId: string } | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (actionFilter) params.set('action', actionFilter);
    if (targetTypeFilter) params.set('targetType', targetTypeFilter);
    if (fromFilter) params.set('from', new Date(fromFilter).toISOString());
    if (toFilter) params.set('to', new Date(toFilter).toISOString());
    params.set('limit', '100');
    adminFetch(`/api/admin/audit-log?${params.toString()}`)
      .then((data) => setEntries(data.entries))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [actionFilter, targetTypeFilter, fromFilter, toFilter]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setPresets(loadPresets()); }, []);

  const uniqueActions = Array.from(new Set(entries.map(e => e.action))).sort();

  // actorEmail and free-text query filter within the already-fetched page —
  // the backend doesn't index actorEmail (only actorUid), and free-text
  // search over the before/after JSON blobs isn't something Firestore can
  // query at all, so both apply client-side to the current result set.
  const filtered = useMemo(() => {
    let list = entries;
    if (actorEmailFilter.trim()) {
      const q = actorEmailFilter.trim().toLowerCase();
      list = list.filter((e) => e.actorEmail?.toLowerCase().includes(q));
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((e) =>
        [e.action, e.targetType, e.targetId, e.actorEmail, JSON.stringify(e.before), JSON.stringify(e.after)]
          .join(' ').toLowerCase().includes(q)
      );
    }
    return list;
  }, [entries, actorEmailFilter, query]);

  const groups = useMemo(() => groupEntries(filtered), [filtered]);

  const clearFilters = () => {
    setActionFilter(''); setActorEmailFilter(''); setTargetTypeFilter(''); setFromFilter(''); setToFilter(''); setQuery('');
  };

  const savePreset = () => {
    const name = window.prompt('Name this filter preset:');
    if (!name) return;
    const next = [...presets.filter((p) => p.name !== name), { name, actorEmail: actorEmailFilter, action: actionFilter, targetType: targetTypeFilter, from: fromFilter, to: toFilter }];
    setPresets(next);
    localStorage.setItem(PRESETS_KEY, JSON.stringify(next));
  };

  const applyPreset = (name: string) => {
    const preset = presets.find((p) => p.name === name);
    if (!preset) return;
    setActorEmailFilter(preset.actorEmail);
    setActionFilter(preset.action);
    setTargetTypeFilter(preset.targetType);
    setFromFilter(preset.from);
    setToFilter(preset.to);
  };

  const deletePreset = (name: string) => {
    const next = presets.filter((p) => p.name !== name);
    setPresets(next);
    localStorage.setItem(PRESETS_KEY, JSON.stringify(next));
  };

  const exportCsv = () => {
    const rows = filtered.map((e) => ({
      timestamp: formatTimestamp(e.timestamp),
      actorEmail: e.actorEmail,
      actorRole: e.actorRole,
      action: e.action,
      targetType: e.targetType,
      targetId: e.targetId,
      before: JSON.stringify(e.before ?? null),
      after: JSON.stringify(e.after ?? null),
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit-log.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingState label="Loading audit log..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-headline-md text-foreground">Audit Log</h1>
        <div className="flex flex-wrap items-center gap-2">
          {presets.length > 0 && (
            <Select
              aria-label="Load a saved filter preset"
              value=""
              onChange={(e) => applyPreset(e.target.value)}
              options={[{ value: '', label: 'Load preset...' }, ...presets.map((p) => ({ value: p.name, label: p.name }))]}
              size="sm"
              className="w-auto"
            />
          )}
          <Button variant="outline" size="sm" leftIcon={<Bookmark className="h-3.5 w-3.5" />} onClick={savePreset}>Save Preset</Button>
          <Button variant="outline" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />} onClick={exportCsv} disabled={filtered.length === 0}>Export CSV</Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-2 rounded-lg border border-border bg-surface p-3">
        <Input label="Search (payloads, action, target)" size="sm" value={query} onChange={(e) => setQuery(e.target.value)} className="w-56" />
        <Input label="Actor email" size="sm" value={actorEmailFilter} onChange={(e) => setActorEmailFilter(e.target.value)} className="w-44" />
        <Select
          label="Action"
          size="sm"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          options={[{ value: '', label: 'All actions' }, ...uniqueActions.map(a => ({ value: a, label: a }))]}
          className="w-auto"
        />
        <Input label="Target type" size="sm" value={targetTypeFilter} onChange={(e) => setTargetTypeFilter(e.target.value)} placeholder="e.g. sermons, user" className="w-36" />
        <Input label="From" size="sm" type="date" value={fromFilter} onChange={(e) => setFromFilter(e.target.value)} className="w-auto" />
        <Input label="To" size="sm" type="date" value={toFilter} onChange={(e) => setToFilter(e.target.value)} className="w-auto" />
        {(actionFilter || actorEmailFilter || targetTypeFilter || fromFilter || toFilter || query) && (
          <button onClick={clearFilters} className="mb-1 inline-flex items-center gap-1 text-caption text-foreground-subtle hover:text-foreground">
            <X className="h-3 w-3" /> Clear
          </button>
        )}
        {presets.length > 0 && (
          <div className="mb-1 flex flex-wrap gap-1">
            {presets.map((p) => (
              <span key={p.name} className="inline-flex items-center gap-1 rounded-full bg-accent-subtle px-2 py-0.5 text-caption text-accent">
                {p.name}
                <button onClick={() => deletePreset(p.name)} aria-label={`Delete preset ${p.name}`}><X className="h-2.5 w-2.5" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
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
              {groups.map((group) => {
                const isBulk = group.entries.length > 1;
                const groupOpen = expandedGroups.has(group.key);
                return (
                  <Fragment key={group.key}>
                    <tr
                      className={cn('cursor-pointer border-t border-border transition-colors hover:bg-surface-hover', isBulk && 'bg-accent-subtle/40')}
                      onClick={() => {
                        if (isBulk) {
                          setExpandedGroups((prev) => { const next = new Set(prev); if (next.has(group.key)) next.delete(group.key); else next.add(group.key); return next; });
                        } else {
                          setExpanded(expanded === group.entries[0].id ? null : group.entries[0].id);
                        }
                      }}
                    >
                      <td className="whitespace-nowrap p-3 text-foreground-muted">{formatTimestamp(group.timestamp)}</td>
                      <td className="p-3 text-foreground-muted">{group.actorEmail} <span className="text-caption text-foreground-subtle">({group.actorRole})</span></td>
                      <td className="p-3 font-medium text-foreground">
                        {isBulk && (groupOpen ? <ChevronDown className="mr-1 inline h-3.5 w-3.5" /> : <ChevronRight className="mr-1 inline h-3.5 w-3.5" />)}
                        {group.action}
                      </td>
                      <td className="p-3 text-foreground-muted">
                        {isBulk ? (
                          `${group.entries.length} items`
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); setHistoryTarget({ targetType: group.entries[0].targetType, targetId: group.entries[0].targetId }); }}
                            className="inline-flex items-center gap-1 text-accent hover:underline"
                          >
                            <History className="h-3 w-3" /> {group.entries[0].targetType}/{group.entries[0].targetId}
                          </button>
                        )}
                      </td>
                    </tr>
                    {isBulk && groupOpen && group.entries.map((entry) => (
                      <tr key={entry.id} className="border-t border-border bg-surface/60">
                        <td className="p-2 pl-8 text-caption text-foreground-subtle">{formatTimestamp(entry.timestamp)}</td>
                        <td className="p-2" />
                        <td className="p-2" />
                        <td className="p-2">
                          <button
                            onClick={() => setHistoryTarget({ targetType: entry.targetType, targetId: entry.targetId })}
                            className="inline-flex items-center gap-1 text-caption text-accent hover:underline"
                          >
                            <History className="h-3 w-3" /> {entry.targetType}/{entry.targetId}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!isBulk && expanded === group.entries[0].id && (
                      <tr className="bg-surface">
                        <td colSpan={4} className="p-4">
                          <div className="grid grid-cols-2 gap-4 text-caption">
                            <div>
                              <p className="mb-1 font-semibold text-foreground-muted">Before</p>
                              <pre className="overflow-x-auto rounded-md border border-border bg-background p-2 text-foreground">
                                {JSON.stringify(group.entries[0].before, null, 2)}
                              </pre>
                            </div>
                            <div>
                              <p className="mb-1 font-semibold text-foreground-muted">After</p>
                              <pre className="overflow-x-auto rounded-md border border-border bg-background p-2 text-foreground">
                                {JSON.stringify(group.entries[0].after, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <TargetHistoryModal target={historyTarget} onClose={() => setHistoryTarget(null)} />
    </div>
  );
}

function TargetHistoryModal({ target, onClose }: { target: { targetType: string; targetId: string } | null; onClose: () => void }) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!target) return;
    setLoading(true);
    const params = new URLSearchParams({ targetType: target.targetType, targetId: target.targetId, limit: '100' });
    adminFetch(`/api/admin/audit-log?${params.toString()}`)
      .then((data) => setEntries(data.entries))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [target]);

  if (!target) return null;

  return (
    <Modal isOpen={!!target} onClose={onClose} title={`History: ${target.targetType}/${target.targetId}`} size="lg">
      {loading ? (
        <LoadingState label="Loading history..." />
      ) : entries.length === 0 ? (
        <EmptyState icon={History} title="No history found" />
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li key={entry.id} className="rounded-lg border border-border p-3">
              <div className="mb-2 flex items-center justify-between text-caption text-foreground-subtle">
                <span>{entry.actorEmail} — {entry.action}</span>
                <span>{formatTimestamp(entry.timestamp)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-caption">
                <pre className="overflow-x-auto rounded-md border border-border bg-background p-2 text-foreground">{JSON.stringify(entry.before, null, 2)}</pre>
                <pre className="overflow-x-auto rounded-md border border-border bg-background p-2 text-foreground">{JSON.stringify(entry.after, null, 2)}</pre>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
