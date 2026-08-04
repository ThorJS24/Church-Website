'use client';

import { useEffect, useRef, useState } from 'react';
import Papa from 'papaparse';
import { Plus, Pencil, Trash2, ClipboardList, X, Eye, Download, Link as LinkIcon } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { LoadingState, EmptyState, ErrorState } from '@/components/admin/States';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { FieldSchema, FieldType } from '@/types/contentType';
import { FORM_SLUG_PATTERN, FormDefinition } from '@/types/formSchema';

const FIELD_TYPES: FieldType[] = ['text', 'email', 'textarea', 'date', 'datetime', 'number', 'checkbox', 'url'];

function slugify(label: string): string {
  return label.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50);
}

function emptyField(): FieldSchema {
  return { key: '', label: '', type: 'text', required: false };
}

export default function FormsBuilderPage() {
  const [forms, setForms] = useState<FormDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<FormDefinition | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FormDefinition | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const formModalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(showForm, () => setShowForm(false), formModalRef);

  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fields, setFields] = useState<FieldSchema[]>([emptyField()]);

  const [submissionsTarget, setSubmissionsTarget] = useState<FormDefinition | null>(null);
  const [submissions, setSubmissions] = useState<Record<string, any>[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const submissionsModalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(!!submissionsTarget, () => setSubmissionsTarget(null), submissionsModalRef);

  const load = () => {
    setLoading(true);
    setError(null);
    adminFetch('/api/admin/forms')
      .then((data) => setForms(data.forms))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setSlug('');
    setSlugTouched(false);
    setTitle('');
    setDescription('');
    setSuccessMessage('');
    setFields([emptyField()]);
    setSaveError(null);
    setShowForm(true);
  };

  const openEdit = (form: FormDefinition) => {
    setEditing(form);
    setSlug(form.id);
    setSlugTouched(true);
    setTitle(form.title);
    setDescription(form.description || '');
    setSuccessMessage(form.successMessage || '');
    setFields(form.fields);
    setSaveError(null);
    setShowForm(true);
  };

  const updateField = (index: number, patch: Partial<FieldSchema>) => {
    setFields(prev => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  };

  const removeField = (index: number) => {
    setFields(prev => prev.filter((_, i) => i !== index));
  };

  const save = async () => {
    setSaveError(null);
    const cleanFields = fields.filter(f => f.key.trim() && f.label.trim());
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
      const body = { id: slug, title, description, successMessage, fields: cleanFields };
      if (editing) {
        await adminFetch(`/api/admin/forms/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        await adminFetch('/api/admin/forms', { method: 'POST', body: JSON.stringify(body) });
      }
      setShowForm(false);
      load();
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    await adminFetch(`/api/admin/forms/${deleteTarget.id}`, { method: 'DELETE' });
    load();
  };

  const openSubmissions = async (form: FormDefinition) => {
    setSubmissionsTarget(form);
    setSubmissionsLoading(true);
    try {
      const data = await adminFetch(`/api/admin/forms/${form.id}/submissions`);
      setSubmissions(data.submissions);
    } catch (err: any) {
      alert(err.message);
      setSubmissionsTarget(null);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const exportSubmissionsCsv = () => {
    if (!submissionsTarget) return;
    const rows = submissions.map(s => ({ submittedAt: formatTimestamp(s.submittedAt), ...s.data }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${submissionsTarget.id}-submissions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyFormLink = async (form: FormDefinition) => {
    await navigator.clipboard.writeText(`${window.location.origin}/forms/${form.id}`);
    alert('Form link copied to clipboard.');
  };

  if (loading) return <LoadingState label="Loading forms..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Forms</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Build a custom form, share its link, and view submissions here.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Form
        </button>
      </div>

      {forms.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No forms yet" description="Create a form for volunteer sign-ups, event registration, or anything else you need to collect." />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                <th className="p-3">Title</th>
                <th className="p-3">Link</th>
                <th className="p-3">Fields</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {forms.map((form) => (
                <tr key={form.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <td className="p-3 text-gray-700 dark:text-gray-300">{form.title}</td>
                  <td className="p-3">
                    <button onClick={() => copyFormLink(form)} className="text-blue-600 hover:underline inline-flex items-center gap-1 text-xs font-mono">
                      <LinkIcon className="w-3 h-3" /> /forms/{form.id}
                    </button>
                  </td>
                  <td className="p-3 text-gray-500 dark:text-gray-400">{form.fields.length}</td>
                  <td className="p-3 text-right space-x-3 whitespace-nowrap">
                    <button onClick={() => openSubmissions(form)} className="text-gray-600 dark:text-gray-300 hover:underline inline-flex items-center gap-1 text-xs">
                      <Eye className="w-3 h-3" /> Submissions
                    </button>
                    <button onClick={() => openEdit(form)} className="text-blue-600 hover:underline inline-flex items-center gap-1 text-xs">
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => setDeleteTarget(form)} className="text-red-600 hover:underline inline-flex items-center gap-1 text-xs">
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
            aria-labelledby="form-builder-title"
            tabIndex={-1}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl p-6 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="form-builder-title" className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {editing ? `Edit "${editing.title}"` : 'New Form'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="form-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input
                  id="form-title"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!slugTouched) setSlug(slugify(e.target.value));
                  }}
                  placeholder="Volunteer Sign-Up"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="form-slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug *</label>
                <input
                  id="form-slug"
                  type="text"
                  value={slug}
                  disabled={!!editing}
                  onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white disabled:opacity-60 font-mono text-sm"
                />
                {slug && !FORM_SLUG_PATTERN.test(slug) && (
                  <p className="text-xs text-red-600 mt-1">Lowercase letters, numbers, hyphens; must start with a letter.</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="form-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                id="form-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="form-success" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Success Message</label>
              <input
                id="form-success"
                type="text"
                value={successMessage}
                onChange={(e) => setSuccessMessage(e.target.value)}
                placeholder="Thank you — we'll be in touch."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
              />
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
                  <label htmlFor={`form-field-type-${i}`} className="sr-only">Field type</label>
                  <select
                    id={`form-field-type-${i}`}
                    value={f.type}
                    onChange={(e) => updateField(i, { type: e.target.value as FieldType })}
                    className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white"
                  >
                    {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    <input type="checkbox" checked={!!f.required} onChange={(e) => updateField(i, { required: e.target.checked })} /> Req.
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
                disabled={saving || !title || !FORM_SLUG_PATTERN.test(slug)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Form'}
              </button>
            </div>
          </div>
        </div>
      )}

      {submissionsTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSubmissionsTarget(null)}>
          <div
            ref={submissionsModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="submissions-title"
            tabIndex={-1}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 id="submissions-title" className="text-lg font-bold text-gray-900 dark:text-white">
                {submissionsTarget.title} — Submissions ({submissions.length})
              </h3>
              <div className="flex items-center gap-3">
                <button onClick={exportSubmissionsCsv} disabled={submissions.length === 0} className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1 disabled:opacity-50">
                  <Download className="w-4 h-4" /> Export CSV
                </button>
                <button onClick={() => setSubmissionsTarget(null)} aria-label="Close" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {submissionsLoading ? (
                <LoadingState label="Loading submissions..." />
              ) : submissions.length === 0 ? (
                <EmptyState icon={ClipboardList} title="No submissions yet" />
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                      <th className="p-2">Submitted</th>
                      {submissionsTarget.fields.map(f => <th key={f.key} className="p-2">{f.label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((s) => (
                      <tr key={s.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <td className="p-2 text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatTimestamp(s.submittedAt)}</td>
                        {submissionsTarget.fields.map(f => (
                          <td key={f.key} className="p-2 text-gray-700 dark:text-gray-300">{String(s.data?.[f.key] ?? '—')}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete form"
        consequence={`This removes "${deleteTarget?.title}" and its public link. Existing submissions are kept, not deleted.`}
        confirmLabel="Delete"
        onConfirm={remove}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function formatTimestamp(value: any): string {
  if (!value) return '—';
  if (typeof value === 'string') return new Date(value).toLocaleString();
  if (typeof value === 'object' && 'seconds' in value) return new Date(value.seconds * 1000).toLocaleString();
  return '—';
}
