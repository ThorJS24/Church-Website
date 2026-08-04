'use client';

import { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';
import { Plus, Pencil, Trash2, FileText, History, Image as ImageIcon, Download, Upload, X } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { LoadingState, EmptyState, ErrorState } from '@/components/admin/States';
import ConfirmModal from '@/components/admin/ConfirmModal';
import MediaPickerModal from '@/components/admin/content/MediaPickerModal';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { FieldSchema } from '@/types/contentType';

export type { FieldSchema } from '@/types/contentType';

interface GenericContentTabProps {
  type: string; // matches the API route's [type]/[slug] param
  label: string; // plural, e.g. "Sermons"
  fields: FieldSchema[];
  columns: string[]; // subset of field keys to show in the table
  /** Base path for CRUD calls: `${apiBase}/${type}`. Built-in collections
   * use '/api/admin/content' (default); custom types use '/api/admin/custom-content'. */
  apiBase?: string;
  /** Custom types support versioning too (same underlying route shape) — default true. */
  supportsVersions?: boolean;
}

type Item = Record<string, any> & { id: string };

interface Version {
  id: string;
  snapshot: Record<string, any>;
  editedByEmail?: string | null;
  editedAt?: { seconds: number } | string | null;
}

function emptyForm(fields: FieldSchema[]): Record<string, any> {
  const form: Record<string, any> = { status: 'published', publishAt: '' };
  fields.forEach(f => { form[f.key] = f.type === 'checkbox' ? false : ''; });
  return form;
}

function formatTimestamp(value: Version['editedAt']): string {
  if (!value) return '—';
  if (typeof value === 'string') return new Date(value).toLocaleString();
  if (typeof value === 'object' && 'seconds' in value) return new Date(value.seconds * 1000).toLocaleString();
  return '—';
}

export default function GenericContentTab({
  type,
  label,
  fields,
  columns,
  apiBase = '/api/admin/content',
  supportsVersions = true,
}: GenericContentTabProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Item | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Record<string, any>>(emptyForm(fields));
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const formModalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(showForm, () => setShowForm(false), formModalRef);
  const [saving, setSaving] = useState(false);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const [historyTarget, setHistoryTarget] = useState<Item | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const historyModalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(!!historyTarget, () => setHistoryTarget(null), historyModalRef);

  const [mediaPickerField, setMediaPickerField] = useState<{ key: string; accept: 'image' | 'file' } | null>(null);
  const [importing, setImporting] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    setSelected(new Set());
    adminFetch(`${apiBase}/${type}`)
      .then((data) => setItems(data.items))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [type, apiBase]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm(fields));
    setShowForm(true);
  };

  const openEdit = (item: Item) => {
    setEditing(item);
    const next = emptyForm(fields);
    fields.forEach(f => { if (item[f.key] !== undefined) next[f.key] = item[f.key]; });
    next.status = item.status ?? 'published';
    next.publishAt = item.publishAt ?? '';
    setForm(next);
    setShowForm(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      if (payload.status !== 'draft') payload.publishAt = payload.publishAt || null;
      if (editing) {
        await adminFetch(`${apiBase}/${type}/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await adminFetch(`${apiBase}/${type}`, { method: 'POST', body: JSON.stringify(payload) });
      }
      setShowForm(false);
      load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    await adminFetch(`${apiBase}/${type}/${deleteTarget.id}`, { method: 'DELETE' });
    load();
  };

  const bulkDelete = async () => {
    const ids = Array.from(selected);
    for (const id of ids) {
      await adminFetch(`${apiBase}/${type}/${id}`, { method: 'DELETE' });
    }
    load();
  };

  const toggleSelected = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected(prev => (prev.size === items.length ? new Set() : new Set(items.map(i => i.id))));
  };

  const openHistory = async (item: Item) => {
    setHistoryTarget(item);
    setVersionsLoading(true);
    try {
      const data = await adminFetch(`${apiBase}/${type}/${item.id}/versions`);
      setVersions(data.versions);
    } catch (err: any) {
      alert(err.message);
      setHistoryTarget(null);
    } finally {
      setVersionsLoading(false);
    }
  };

  const restoreVersion = async (versionId: string) => {
    if (!historyTarget) return;
    if (!confirm('Restore this version? The current state will be saved to history first, so this can be undone.')) return;
    try {
      await adminFetch(`${apiBase}/${type}/${historyTarget.id}/versions/${versionId}/restore`, { method: 'POST' });
      setHistoryTarget(null);
      load();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const exportCsv = () => {
    const exportColumns = ['id', ...fields.map(f => f.key), 'status', 'publishAt'];
    const rows = items.map(item => {
      const row: Record<string, any> = {};
      exportColumns.forEach(col => { row[col] = item[col] ?? ''; });
      return row;
    });
    const csv = Papa.unparse({ fields: exportColumns, data: rows });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importCsv = (file: File | undefined) => {
    if (!file) return;
    setImporting(true);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        let succeeded = 0;
        const failures: string[] = [];
        for (const row of results.data) {
          const payload: Record<string, any> = { status: row.status === 'draft' ? 'draft' : 'published', publishAt: row.publishAt || null };
          fields.forEach(f => {
            const raw = row[f.key];
            if (raw === undefined) return;
            if (f.type === 'checkbox') payload[f.key] = /^(true|1|yes)$/i.test(raw);
            else if (f.type === 'number') payload[f.key] = raw === '' ? '' : Number(raw);
            else payload[f.key] = raw;
          });
          try {
            await adminFetch(`${apiBase}/${type}`, { method: 'POST', body: JSON.stringify(payload) });
            succeeded += 1;
          } catch (err: any) {
            failures.push(`Row ${succeeded + failures.length + 1}: ${err.message}`);
          }
        }
        setImporting(false);
        if (csvInputRef.current) csvInputRef.current.value = '';
        alert(
          `Imported ${succeeded} of ${results.data.length} rows.` +
          (failures.length ? `\n\nFailures:\n${failures.slice(0, 5).join('\n')}` : '')
        );
        load();
      },
      error: (err) => {
        setImporting(false);
        alert(`CSV parse error: ${err.message}`);
      },
    });
  };

  if (loading) return <LoadingState label={`Loading ${label.toLowerCase()}...`} />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{label} ({items.length})</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            disabled={items.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <label className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" /> {importing ? 'Importing...' : 'Import CSV'}
            <input ref={csvInputRef} type="file" accept=".csv" className="hidden" disabled={importing} onChange={(e) => importCsv(e.target.files?.[0])} />
          </label>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add {label.replace(/s$/, '')}
          </button>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center justify-between mb-3 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
          <span className="text-blue-800 dark:text-blue-300">{selected.size} selected</span>
          <button onClick={() => setBulkDeleteOpen(true)} className="text-red-600 hover:underline font-medium">
            Delete selected
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState icon={FileText} title={`No ${label.toLowerCase()} yet`} description="Add one to get started." />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                <th className="p-3 w-8">
                  <input type="checkbox" aria-label="Select all" checked={selected.size === items.length} onChange={toggleSelectAll} />
                </th>
                {columns.map(col => (
                  <th key={col} className="p-3">{fields.find(f => f.key === col)?.label || col}</th>
                ))}
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const isDraft = item.status === 'draft';
                const isScheduled = isDraft && item.publishAt && new Date(item.publishAt).getTime() > Date.now();
                return (
                  <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <td className="p-3">
                      <input type="checkbox" aria-label={`Select ${item.title || item.name || item.id}`} checked={selected.has(item.id)} onChange={() => toggleSelected(item.id)} />
                    </td>
                    {columns.map(col => (
                      <td key={col} className="p-3 text-gray-700 dark:text-gray-300 max-w-xs truncate">
                        {typeof item[col] === 'boolean' ? (item[col] ? 'Yes' : 'No') : String(item[col] ?? '—')}
                      </td>
                    ))}
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        !isDraft ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : isScheduled ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {!isDraft ? 'Published' : isScheduled ? 'Scheduled' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-3 whitespace-nowrap">
                      {supportsVersions && (
                        <button onClick={() => openHistory(item)} className="text-gray-500 hover:underline inline-flex items-center gap-1 text-xs">
                          <History className="w-3 h-3" /> History
                        </button>
                      )}
                      <button onClick={() => openEdit(item)} className="text-blue-600 hover:underline inline-flex items-center gap-1 text-xs">
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                      <button onClick={() => setDeleteTarget(item)} className="text-red-600 hover:underline inline-flex items-center gap-1 text-xs">
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div
            ref={formModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="content-form-title"
            tabIndex={-1}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="content-form-title" className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {editing ? `Edit ${label.replace(/s$/, '')}` : `Add ${label.replace(/s$/, '')}`}
            </h3>
            <div className="space-y-4">
              {fields.map((f) => (
                <div key={f.key}>
                  <label htmlFor={`field-${f.key}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {f.label}{f.required && ' *'}
                  </label>
                  {f.type === 'textarea' ? (
                    <textarea
                      id={`field-${f.key}`}
                      value={form[f.key] ?? ''}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                    />
                  ) : f.type === 'checkbox' ? (
                    <input
                      id={`field-${f.key}`}
                      type="checkbox"
                      checked={!!form[f.key]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })}
                      className="w-4 h-4"
                    />
                  ) : f.type === 'url' && (f.accept === 'image' || f.accept === 'file') ? (
                    <div className="flex gap-2">
                      <input
                        id={`field-${f.key}`}
                        type="url"
                        value={form[f.key] ?? ''}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setMediaPickerField({ key: f.key, accept: f.accept as 'image' | 'file' })}
                        className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 shrink-0 inline-flex items-center gap-1.5"
                      >
                        <ImageIcon className="w-4 h-4" /> Browse
                      </button>
                    </div>
                  ) : (
                    <input
                      id={`field-${f.key}`}
                      type={f.type === 'datetime' ? 'datetime-local' : f.type}
                      value={form[f.key] ?? ''}
                      onChange={(e) => setForm({ ...form, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                    />
                  )}
                </div>
              ))}

              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <label htmlFor="field-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Publishing</label>
                <select
                  id="field-status"
                  value={form.status ?? 'published'}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white mb-2"
                >
                  <option value="published">Published (visible now)</option>
                  <option value="draft">Draft (hidden from the public site)</option>
                </select>
                {form.status === 'draft' && (
                  <div>
                    <label htmlFor="field-publishAt" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Optionally schedule: goes live automatically once this passes
                    </label>
                    <input
                      id="field-publishAt"
                      type="datetime-local"
                      value={form.publishAt ?? ''}
                      onChange={(e) => setForm({ ...form, publishAt: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                Cancel
              </button>
              <button onClick={save} disabled={saving} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <MediaPickerModal
        isOpen={!!mediaPickerField}
        accept={mediaPickerField?.accept}
        onClose={() => setMediaPickerField(null)}
        onSelect={(url) => { if (mediaPickerField) setForm(prev => ({ ...prev, [mediaPickerField.key]: url })); }}
      />

      {historyTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setHistoryTarget(null)}>
          <div
            ref={historyModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-modal-title"
            tabIndex={-1}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 id="history-modal-title" className="text-lg font-bold text-gray-900 dark:text-white">
                History: {historyTarget.title || historyTarget.name || historyTarget.id}
              </h3>
              <button onClick={() => setHistoryTarget(null)} aria-label="Close" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {versionsLoading ? (
                <LoadingState label="Loading history..." />
              ) : versions.length === 0 ? (
                <EmptyState icon={History} title="No prior versions" description="Edits create a version automatically — this is the first one." />
              ) : (
                <ul className="space-y-2">
                  {versions.map((v) => (
                    <li key={v.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">{v.editedByEmail || 'Unknown'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatTimestamp(v.editedAt)}</p>
                      </div>
                      <button onClick={() => restoreVersion(v.id)} className="text-sm text-blue-600 hover:underline font-medium">
                        Restore
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title={`Delete ${label.replace(/s$/, '')}`}
        consequence={`This will permanently delete "${deleteTarget?.title || deleteTarget?.name || deleteTarget?.id}". This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={remove}
        onClose={() => setDeleteTarget(null)}
      />

      <ConfirmModal
        isOpen={bulkDeleteOpen}
        title={`Delete ${selected.size} ${selected.size === 1 ? 'item' : 'items'}`}
        consequence={`This will permanently delete ${selected.size} selected ${label.toLowerCase()}. This cannot be undone.`}
        confirmLabel="Delete All"
        onConfirm={bulkDelete}
        onClose={() => setBulkDeleteOpen(false)}
      />
    </div>
  );
}
