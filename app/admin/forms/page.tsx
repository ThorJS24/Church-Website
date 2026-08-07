'use client';

import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { Plus, Pencil, Trash2, ClipboardList, X, Eye, Download, Link as LinkIcon } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { LoadingState, EmptyState, ErrorState } from '@/components/admin/States';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { FieldSchema, FieldType } from '@/types/contentType';
import { FORM_SLUG_PATTERN, FormDefinition } from '@/types/formSchema';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { useToast } from '@/lib/toast';

const FIELD_TYPES: FieldType[] = ['text', 'email', 'textarea', 'date', 'datetime', 'number', 'checkbox', 'url', 'file'];

function slugify(label: string): string {
  return label.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50);
}

function emptyField(): FieldSchema {
  return { key: '', label: '', type: 'text', required: false };
}

function formatTimestamp(value: any): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
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
  const { toast } = useToast();

  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [thankYouUrl, setThankYouUrl] = useState('');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [fields, setFields] = useState<FieldSchema[]>([emptyField()]);

  const [submissionsTarget, setSubmissionsTarget] = useState<FormDefinition | null>(null);
  const [submissions, setSubmissions] = useState<Record<string, any>[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

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
    setThankYouUrl('');
    setNotifyEmail('');
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
    setThankYouUrl(form.thankYouUrl || '');
    setNotifyEmail(form.notifyEmail || '');
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
      const body = { id: slug, title, description, successMessage, thankYouUrl, notifyEmail, fields: cleanFields };
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
      toast({ title: 'Failed to load submissions', description: err.message, variant: 'danger' });
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
    toast({ title: 'Form link copied to clipboard', variant: 'success' });
  };

  if (loading) return <LoadingState label="Loading forms..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const submissionColumns: DataTableColumn<Record<string, any>>[] = submissionsTarget
    ? [
        { key: 'submittedAt', header: 'Submitted', accessor: (s) => formatTimestamp(s.submittedAt), sortValue: (s) => formatTimestamp(s.submittedAt) },
        ...submissionsTarget.fields.map((f): DataTableColumn<Record<string, any>> => ({
          key: f.key,
          header: f.label,
          accessor: (s) => String(s.data?.[f.key] ?? '—'),
        })),
      ]
    : [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-headline-md text-foreground">Forms</h1>
          <p className="text-body-sm text-foreground-muted">Build a custom form, share its link, and view submissions here.</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>New Form</Button>
      </div>

      {forms.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No forms yet" description="Create a form for volunteer sign-ups, event registration, or anything else you need to collect." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-surface">
              <tr>
                <th className="p-3 text-label text-foreground-subtle">Title</th>
                <th className="p-3 text-label text-foreground-subtle">Link</th>
                <th className="p-3 text-label text-foreground-subtle">Fields</th>
                <th className="p-3 text-right text-label text-foreground-subtle">Actions</th>
              </tr>
            </thead>
            <tbody>
              {forms.map((form) => (
                <tr key={form.id} className="border-t border-border">
                  <td className="p-3 text-foreground">{form.title}</td>
                  <td className="p-3">
                    <button onClick={() => copyFormLink(form)} className="inline-flex items-center gap-1 font-mono text-caption text-accent hover:underline dark:text-accent-hover">
                      <LinkIcon className="h-3 w-3" /> /forms/{form.id}
                    </button>
                  </td>
                  <td className="p-3 text-foreground-muted">{form.fields.length}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <IconButton label="Submissions" size="sm" onClick={() => openSubmissions(form)}><Eye className="h-3.5 w-3.5" /></IconButton>
                      <IconButton label="Edit" size="sm" onClick={() => openEdit(form)}><Pencil className="h-3.5 w-3.5" /></IconButton>
                      <IconButton label="Delete" size="sm" onClick={() => setDeleteTarget(form)}><Trash2 className="h-3.5 w-3.5 text-danger" /></IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? `Edit "${editing.title}"` : 'New Form'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={save} loading={saving} disabled={!title || !FORM_SLUG_PATTERN.test(slug)}>
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Form'}
            </Button>
          </>
        }
      >
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Title"
            required
            value={title}
            onChange={(e) => { setTitle(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }}
            placeholder="Volunteer Sign-Up"
          />
          <Input
            label="Slug"
            required
            disabled={!!editing}
            value={slug}
            onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }}
            className="font-mono"
            error={slug && !FORM_SLUG_PATTERN.test(slug) ? 'Lowercase letters, numbers, hyphens; must start with a letter.' : undefined}
          />
        </div>

        <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="mb-4" />
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Success Message"
            value={successMessage}
            onChange={(e) => setSuccessMessage(e.target.value)}
            placeholder="Thank you — we'll be in touch."
          />
          <Input
            label="Thank-You Page URL (optional)"
            hint="Redirects here instead of showing the success message"
            value={thankYouUrl}
            onChange={(e) => setThankYouUrl(e.target.value)}
            placeholder="/thank-you"
          />
        </div>
        <Input
          label="Notify Staff Email (optional)"
          hint="Sends an email summary of each new submission to this address"
          type="email"
          value={notifyEmail}
          onChange={(e) => setNotifyEmail(e.target.value)}
          placeholder="staff@salempbc.in"
          className="mb-4"
        />

        <div className="mb-2 flex items-center justify-between">
          <span className="text-label text-foreground">Fields</span>
          <button type="button" onClick={() => setFields(prev => [...prev, emptyField()])} className="inline-flex items-center gap-1 text-caption text-accent hover:underline dark:text-accent-hover">
            <Plus className="h-3 w-3" /> Add Field
          </button>
        </div>

        <div className="mb-4 space-y-2">
          {fields.map((f, i) => {
            const otherFields = fields.filter((_, j) => j !== i && fields[j].key);
            const triggerField = otherFields.find((of) => of.key === f.showIf?.fieldKey);
            return (
              <div key={i} className="rounded-lg bg-surface p-2">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={f.key}
                    onChange={(e) => updateField(i, { key: e.target.value.replace(/[^a-zA-Z0-9]/g, '') })}
                    placeholder="fieldKey"
                    aria-label="Field key"
                    className="w-28 rounded-md border border-border bg-background px-2 py-1.5 font-mono text-body-sm text-foreground"
                  />
                  <input
                    type="text"
                    value={f.label}
                    onChange={(e) => updateField(i, { label: e.target.value })}
                    placeholder="Field Label"
                    aria-label="Field label"
                    className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-body-sm text-foreground"
                  />
                  <Select
                    aria-label="Field type"
                    value={f.type}
                    onChange={(e) => updateField(i, { type: e.target.value as FieldType })}
                    options={FIELD_TYPES.map(t => ({ value: t, label: t }))}
                    size="sm"
                    className="w-auto"
                  />
                  <Checkbox label="Req." checked={!!f.required} onChange={(e) => updateField(i, { required: e.target.checked })} />
                  <IconButton label="Remove field" size="sm" onClick={() => removeField(i)}><X className="h-4 w-4" /></IconButton>
                </div>
                {otherFields.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-border pt-2 text-caption text-foreground-subtle">
                    <span>Show only if</span>
                    <Select
                      aria-label="Conditional field"
                      size="sm"
                      className="w-auto"
                      value={f.showIf?.fieldKey || ''}
                      onChange={(e) => updateField(i, e.target.value ? { showIf: { fieldKey: e.target.value, equals: true } } : { showIf: undefined })}
                      options={[{ value: '', label: 'Always shown' }, ...otherFields.map((of) => ({ value: of.key, label: of.label || of.key }))]}
                    />
                    {f.showIf && (
                      <>
                        <span>equals</span>
                        {triggerField?.type === 'checkbox' ? (
                          <Select
                            aria-label="Conditional value"
                            size="sm"
                            className="w-auto"
                            value={String(f.showIf.equals)}
                            onChange={(e) => updateField(i, { showIf: { fieldKey: f.showIf!.fieldKey, equals: e.target.value === 'true' } })}
                            options={[{ value: 'true', label: 'Yes / Checked' }, { value: 'false', label: 'No / Unchecked' }]}
                          />
                        ) : (
                          <input
                            type="text"
                            value={String(f.showIf.equals)}
                            onChange={(e) => updateField(i, { showIf: { fieldKey: f.showIf!.fieldKey, equals: e.target.value } })}
                            placeholder="value"
                            aria-label="Conditional value"
                            className="w-32 rounded-md border border-border bg-background px-2 py-1 text-caption text-foreground"
                          />
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {saveError && <p className="mb-3 text-body-sm text-danger">{saveError}</p>}
      </Modal>

      <Modal
        isOpen={!!submissionsTarget}
        onClose={() => setSubmissionsTarget(null)}
        title={`${submissionsTarget?.title} — Submissions (${submissions.length})`}
        size="xl"
        footer={
          <Button variant="outline" leftIcon={<Download className="h-4 w-4" />} disabled={submissions.length === 0} onClick={exportSubmissionsCsv}>
            Export CSV
          </Button>
        }
      >
        {submissionsLoading ? (
          <LoadingState label="Loading submissions..." />
        ) : submissions.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No submissions yet" />
        ) : (
          <DataTable
            data={submissions}
            columns={submissionColumns}
            getRowId={(s) => s.id}
            exportFilename={`${submissionsTarget?.id}-submissions.csv`}
            selectable
            bulkActions={(ids, clear) => (
              <button
                onClick={async () => {
                  if (!submissionsTarget) return;
                  for (const sid of ids) {
                    await adminFetch(`/api/admin/forms/${submissionsTarget.id}/submissions/${sid}`, { method: 'DELETE' });
                  }
                  setSubmissions((prev) => prev.filter((s) => !ids.includes(s.id)));
                  toast({ title: `Deleted ${ids.length} submission(s)`, variant: 'success' });
                  clear();
                }}
                className="font-medium text-danger hover:underline"
              >
                Delete selected
              </button>
            )}
          />
        )}
      </Modal>

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
