'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Layers, X } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { LoadingState, EmptyState, ErrorState } from '@/components/admin/States';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { CONTENT_TYPE_SLUG_PATTERN, ContentTypeDefinition, FieldSchema, FieldType } from '@/types/contentType';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

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
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-title-lg text-foreground">Custom Content Types ({types.length})</h2>
          <p className="text-body-sm text-foreground-muted">Define a new content collection (e.g. "Testimonies") without a code deploy — it gets its own tab here and is publicly readable via <code>getCustomContent()</code>.</p>
        </div>
        <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate} className="shrink-0">
          New Content Type
        </Button>
      </div>

      {types.length === 0 ? (
        <EmptyState icon={Layers} title="No custom content types yet" description="Create one to add a new collection alongside sermons/events/etc." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-surface">
              <tr>
                <th className="p-3 text-label text-foreground-subtle">Label</th>
                <th className="p-3 text-label text-foreground-subtle">Slug</th>
                <th className="p-3 text-label text-foreground-subtle">Fields</th>
                <th className="p-3 text-right text-label text-foreground-subtle">Actions</th>
              </tr>
            </thead>
            <tbody>
              {types.map((type) => (
                <tr key={type.id} className="border-t border-border">
                  <td className="p-3 text-foreground">{type.pluralLabel}</td>
                  <td className="p-3 font-mono text-caption text-foreground-subtle">{type.id}</td>
                  <td className="p-3 text-foreground-muted">{type.fields.length}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <IconButton label="Edit" size="sm" onClick={() => openEdit(type)}><Pencil className="h-3.5 w-3.5" /></IconButton>
                      <IconButton label="Delete" size="sm" onClick={() => setDeleteTarget(type)}><Trash2 className="h-3.5 w-3.5 text-danger" /></IconButton>
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
        title={editing ? `Edit "${editing.pluralLabel}"` : 'New Content Type'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={save} loading={saving} disabled={!label || !pluralLabel || !CONTENT_TYPE_SLUG_PATTERN.test(slug)}>
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Content Type'}
            </Button>
          </>
        }
      >
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Label (singular)"
            required
            value={label}
            onChange={(e) => { setLabel(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }}
            placeholder="Testimony"
          />
          <Input label="Label (plural)" required value={pluralLabel} onChange={(e) => setPluralLabel(e.target.value)} placeholder="Testimonies" />
          <Input
            label="Slug"
            required
            disabled={!!editing}
            value={slug}
            onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }}
            placeholder="testimonies"
            className="font-mono"
            error={slug && !CONTENT_TYPE_SLUG_PATTERN.test(slug) ? 'Lowercase letters, numbers, hyphens; must start with a letter.' : undefined}
          />
        </div>

        <div className="mb-2 flex items-center justify-between">
          <span className="text-label text-foreground">Fields</span>
          <button type="button" onClick={() => setFields(prev => [...prev, emptyField()])} className="inline-flex items-center gap-1 text-caption text-accent hover:underline dark:text-accent-hover">
            <Plus className="h-3 w-3" /> Add Field
          </button>
        </div>

        <div className="mb-4 space-y-2">
          {fields.map((f, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg bg-surface p-2">
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
              <Checkbox label="In table" checked={f.showInTable} onChange={(e) => updateField(i, { showInTable: e.target.checked })} />
              <IconButton label="Remove field" size="sm" onClick={() => removeField(i)}><X className="h-4 w-4" /></IconButton>
            </div>
          ))}
        </div>

        {saveError && <p className="mb-3 text-body-sm text-danger">{saveError}</p>}
      </Modal>

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
