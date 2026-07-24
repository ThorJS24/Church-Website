'use client';

import { useEffect, useState, useRef } from 'react';
import { Plus, Pencil, Trash2, FileText } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { LoadingState, EmptyState, ErrorState } from '@/components/admin/States';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { useFocusTrap } from '@/hooks/useFocusTrap';

export interface FieldSchema {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'datetime' | 'number' | 'checkbox' | 'url';
  required?: boolean;
}

interface GenericContentTabProps {
  type: string; // matches app/api/admin/content/[type] allowlist
  label: string; // plural, e.g. "Sermons"
  fields: FieldSchema[];
  columns: string[]; // subset of field keys to show in the table
}

type Item = Record<string, any> & { id: string };

function emptyForm(fields: FieldSchema[]): Record<string, any> {
  const form: Record<string, any> = {};
  fields.forEach(f => { form[f.key] = f.type === 'checkbox' ? false : ''; });
  return form;
}

export default function GenericContentTab({ type, label, fields, columns }: GenericContentTabProps) {
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

  const load = () => {
    setLoading(true);
    setError(null);
    adminFetch(`/api/admin/content/${type}`)
      .then((data) => setItems(data.items))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [type]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm(fields));
    setShowForm(true);
  };

  const openEdit = (item: Item) => {
    setEditing(item);
    const next = emptyForm(fields);
    fields.forEach(f => { if (item[f.key] !== undefined) next[f.key] = item[f.key]; });
    setForm(next);
    setShowForm(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editing) {
        await adminFetch(`/api/admin/content/${type}/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await adminFetch(`/api/admin/content/${type}`, { method: 'POST', body: JSON.stringify(form) });
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
    await adminFetch(`/api/admin/content/${type}/${deleteTarget.id}`, { method: 'DELETE' });
    load();
  };

  if (loading) return <LoadingState label={`Loading ${label.toLowerCase()}...`} />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{label} ({items.length})</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add {label.replace(/s$/, '')}
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={FileText} title={`No ${label.toLowerCase()} yet`} description="Add one to get started." />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                {columns.map(col => (
                  <th key={col} className="p-3">{fields.find(f => f.key === col)?.label || col}</th>
                ))}
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                  {columns.map(col => (
                    <td key={col} className="p-3 text-gray-700 dark:text-gray-300 max-w-xs truncate">
                      {typeof item[col] === 'boolean' ? (item[col] ? 'Yes' : 'No') : String(item[col] ?? '—')}
                    </td>
                  ))}
                  <td className="p-3 text-right space-x-3">
                    <button onClick={() => openEdit(item)} className="text-blue-600 hover:underline inline-flex items-center gap-1 text-xs">
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => setDeleteTarget(item)} className="text-red-600 hover:underline inline-flex items-center gap-1 text-xs">
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {f.label}{f.required && ' *'}
                  </label>
                  {f.type === 'textarea' ? (
                    <textarea
                      value={form[f.key] ?? ''}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                    />
                  ) : f.type === 'checkbox' ? (
                    <input
                      type="checkbox"
                      checked={!!form[f.key]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })}
                      className="w-4 h-4"
                    />
                  ) : (
                    <input
                      type={f.type === 'datetime' ? 'datetime-local' : f.type}
                      value={form[f.key] ?? ''}
                      onChange={(e) => setForm({ ...form, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                    />
                  )}
                </div>
              ))}
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

      <ConfirmModal
        isOpen={!!deleteTarget}
        title={`Delete ${label.replace(/s$/, '')}`}
        consequence={`This will permanently delete "${deleteTarget?.title || deleteTarget?.name || deleteTarget?.id}". This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={remove}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
