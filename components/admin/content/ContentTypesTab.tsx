'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, Layers, X } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { LoadingState, EmptyState, ErrorState } from '@/components/admin/States';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { CONTENT_TYPE_SLUG_PATTERN, ContentTypeDefinition, FieldSchema, FieldType } from '@/types/contentType';

const FIELD_TYPES: FieldType[] = ['text', 'textarea', 'date', 'datetime', 'number', 'checkbox', 'url', 'email'];

interface DraftField extends FieldSchema {
  showInTable: boolean;
}

function slugify(label: string): string {
  return label.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50);
}

function emptyField(): DraftField {
  return { key: '', label: '', type: 'text', required: false, showInTable: false };
}

interface ContentTypesTabProps {
  /** Called after a type is created/updated/deleted so the parent can refresh its dynamic tab list. */
  onChange: () => void;
}

export default function ContentTypesTab({ onChange }: ContentTypesTabProps) {
  const [types, setTypes] = useState<ContentTypeDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ContentTypeDefinition | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ContentTypeDefinition | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const formModalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(showForm, () => setShowForm(false), formModalRef);

  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [label, setLabel] = useState('');
  const [pluralLabel, setPluralLabel] = useState('');
  const [fields, setFields] = useState<DraftField[]>([emptyField()]);

  const load = () => {
    setLoading(true);
    setError(null);
    adminFetch('/api/admin/content-types')
      .then((data) => setTypes(data.types))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setSlug('');
    setSlugTouched(false);
    setLabel('');
    setPluralLabel('');
    setFields([emptyField()]);
    setSaveError(null);
    setShowForm(true);
  };

  const openEdit = (type: ContentTypeDefinition) => {
    setEditing(type);
    setSlug(type.id);
    setSlugTouched(true);
    setLabel(type.label);
    setPluralLabel(type.pluralLabel);
    setFields(type.fields.map(f => ({ ...f, showInTable: type.columns.includes(f.key) })));
    setSaveError(null);
    setShowForm(true);
  };

  const updateField = (index: number, patch: Partial<DraftField>) => {
    setFields(prev => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  };

  const removeField = (index: number) => {
    setFields(prev => prev.filter((_, i) => i !== index));
  };

  const save = async () => {
    setSaveError(null);
    const cleanFields = fields
      .filter(f => f.key.trim() && f.label.trim())
      .map(({ showInTable, ...f }) => f);
    const columns = fields.filter(f => f.showInTable && f.key.trim()).map(f => f.key);

    if (cleanFields.length === 0) {
      setSaveError('Add at least one field with a key and label.');
      return;
    }
    const keys = cleanFields.map(f => f.key);
    if (new Set(keys).size !== keys.length) {
      setSaveError('Field keys must be unique.');
      return;
    }

    setSaving(true);
    try {
      const body = { id: slug, label, pluralLabel, fields: cleanFields, columns };
      if (editing) {
        await adminFetch(`/api/admin/content-types/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        await adminFetch('/api/admin/content-types', { method: 'POST', body: JSON.stringify(body) });
      }
      setShowForm(false);
      load();
      onChange();
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    await adminFetch(`/api/admin/content-types/${deleteTarget.id}`, { method: 'DELETE' });
    load();
    onChange();
  };

  if (loading) return <LoadingState label="Loading content types..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Custom Content Types ({types.length})</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Define a new content collection (e.g. "Testimonies") without a code deploy — it gets its own tab here and is publicly readable via <code>getCustomContent()</code>.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> New Content Type
        </button>
      </div>

      {types.length === 0 ? (
        <EmptyState icon={Layers} title="No custom content types yet" description="Create one to add a new collection alongside sermons/events/etc." />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                <th className="p-3">Label</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Fields</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {types.map((type) => (
                <tr key={type.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <td className="p-3 text-gray-700 dark:text-gray-300">{type.pluralLabel}</td>
                  <td className="p-3 text-gray-500 dark:text-gray-400 font-mono text-xs">{type.id}</td>
                  <td className="p-3 text-gray-500 dark:text-gray-400">{type.fields.length}</td>
                  <td className="p-3 text-right space-x-3">
                    <button onClick={() => openEdit(type)} className="text-blue-600 hover:underline inline-flex items-center gap-1 text-xs">
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => setDeleteTarget(type)} className="text-red-600 hover:underline inline-flex items-center gap-1 text-xs">
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
            aria-labelledby="content-type-form-title"
            tabIndex={-1}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl p-6 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="content-type-form-title" className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {editing ? `Edit "${editing.pluralLabel}"` : 'New Content Type'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="ct-label" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Label (singular) *</label>
                <input
                  id="ct-label"
                  type="text"
                  value={label}
                  onChange={(e) => {
                    setLabel(e.target.value);
                    if (!slugTouched) setSlug(slugify(e.target.value));
                  }}
                  placeholder="Testimony"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="ct-plural" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Label (plural) *</label>
                <input
                  id="ct-plural"
                  type="text"
                  value={pluralLabel}
                  onChange={(e) => setPluralLabel(e.target.value)}
                  placeholder="Testimonies"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="ct-slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug *</label>
                <input
                  id="ct-slug"
                  type="text"
                  value={slug}
                  disabled={!!editing}
                  onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }}
                  placeholder="testimonies"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white disabled:opacity-60 font-mono text-sm"
                />
                {slug && !CONTENT_TYPE_SLUG_PATTERN.test(slug) && (
                  <p className="text-xs text-red-600 mt-1">Lowercase letters, numbers, hyphens; must start with a letter.</p>
                )}
              </div>
            </div>

            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fields</span>
              <button
                type="button"
                onClick={() => setFields(prev => [...prev, emptyField()])}
                className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Field
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {fields.map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/40 p-2 rounded-lg">
                  <input
                    type="text"
                    value={f.key}
                    onChange={(e) => updateField(i, { key: e.target.value.replace(/[^a-zA-Z0-9]/g, '') })}
                    placeholder="fieldKey"
                    aria-label="Field key"
                    className="w-28 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white font-mono"
                  />
                  <input
                    type="text"
                    value={f.label}
                    onChange={(e) => updateField(i, { label: e.target.value })}
                    placeholder="Field Label"
                    aria-label="Field label"
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white"
                  />
                  <label htmlFor={`ct-field-type-${i}`} className="sr-only">Field type</label>
                  <select
                    id={`ct-field-type-${i}`}
                    value={f.type}
                    onChange={(e) => updateField(i, { type: e.target.value as FieldType })}
                    className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white"
                  >
                    {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    <input type="checkbox" checked={!!f.required} onChange={(e) => updateField(i, { required: e.target.checked })} /> Req.
                  </label>
                  <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    <input type="checkbox" checked={f.showInTable} onChange={(e) => updateField(i, { showInTable: e.target.checked })} /> In table
                  </label>
                  <button type="button" onClick={() => removeField(i)} aria-label="Remove field" className="text-gray-400 hover:text-red-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {saveError && <p className="text-sm text-red-600 mb-3">{saveError}</p>}

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving || !label || !pluralLabel || !CONTENT_TYPE_SLUG_PATTERN.test(slug)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Content Type'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete content type"
        consequence={`This removes the "${deleteTarget?.pluralLabel}" type definition and its tab. Existing entries are NOT deleted — they'll reappear if you recreate a type with the same slug ("${deleteTarget?.id}").`}
        confirmLabel="Delete"
        onConfirm={remove}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
