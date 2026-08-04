'use client';

import { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';
import { Plus, Pencil, Trash2, FileText, History, Image as ImageIcon, Download, Upload } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { LoadingState, EmptyState, ErrorState } from '@/components/admin/States';
import ConfirmModal from '@/components/admin/ConfirmModal';
import MediaPickerModal from '@/components/admin/content/MediaPickerModal';
import { FieldSchema } from '@/types/contentType';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Button, buttonClasses } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

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
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[] | null>(null);

  const [historyTarget, setHistoryTarget] = useState<Item | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);

  const [mediaPickerField, setMediaPickerField] = useState<{ key: string; accept: 'image' | 'file' } | null>(null);
  const [importing, setImporting] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, apiBase]);

  function load() {
    setLoading(true);
    setError(null);
    adminFetch(`${apiBase}/${type}`)
      .then((data) => setItems(data.items))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

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
      toast({ title: 'Failed to save', description: err.message, variant: 'danger' });
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
    if (!bulkDeleteIds) return;
    for (const id of bulkDeleteIds) {
      await adminFetch(`${apiBase}/${type}/${id}`, { method: 'DELETE' });
    }
    load();
  };

  const openHistory = async (item: Item) => {
    setHistoryTarget(item);
    setVersionsLoading(true);
    try {
      const data = await adminFetch(`${apiBase}/${type}/${item.id}/versions`);
      setVersions(data.versions);
    } catch (err: any) {
      toast({ title: 'Failed to load history', description: err.message, variant: 'danger' });
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
      toast({ title: 'Failed to restore version', description: err.message, variant: 'danger' });
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
        toast({
          title: `Imported ${succeeded} of ${results.data.length} rows`,
          description: failures.length ? failures.slice(0, 3).join(' · ') : undefined,
          variant: failures.length ? 'warning' : 'success',
        });
        load();
      },
      error: (err) => {
        setImporting(false);
        toast({ title: 'CSV parse error', description: err.message, variant: 'danger' });
      },
    });
  };

  if (loading) return <LoadingState label={`Loading ${label.toLowerCase()}...`} />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const tableColumns: DataTableColumn<Item>[] = [
    ...columns.map((col): DataTableColumn<Item> => {
      const field = fields.find(f => f.key === col);
      return {
        key: col,
        header: field?.label || col,
        accessor: (item) => (typeof item[col] === 'boolean' ? (item[col] ? 'Yes' : 'No') : String(item[col] ?? '—')),
        sortValue: (item) => (typeof item[col] === 'boolean' ? Number(item[col]) : String(item[col] ?? '')),
      };
    }),
    {
      key: 'status',
      header: 'Status',
      sortValue: (item) => item.status ?? 'published',
      accessor: (item) => {
        const isDraft = item.status === 'draft';
        const isScheduled = isDraft && item.publishAt && new Date(item.publishAt).getTime() > Date.now();
        return (
          <Badge variant={!isDraft ? 'success' : isScheduled ? 'warning' : 'neutral'}>
            {!isDraft ? 'Published' : isScheduled ? 'Scheduled' : 'Draft'}
          </Badge>
        );
      },
    },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-title-lg text-foreground">{label} ({items.length})</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />} disabled={items.length === 0} onClick={exportCsv}>
            Export All (CSV)
          </Button>
          <label className={buttonClasses({ variant: 'outline', size: 'sm', disabled: importing, className: 'cursor-pointer gap-1.5' })}>
            <Upload className="h-4 w-4" /> {importing ? 'Importing...' : 'Import CSV'}
            <input ref={csvInputRef} type="file" accept=".csv" className="hidden" disabled={importing} onChange={(e) => importCsv(e.target.files?.[0])} />
          </label>
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Add {label.replace(/s$/, '')}
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={FileText} title={`No ${label.toLowerCase()} yet`} description="Add one to get started." />
      ) : (
        <DataTable
          data={items}
          columns={tableColumns}
          getRowId={(item) => item.id}
          selectable
          searchKeys={(item) => columns.map((c) => String(item[c] ?? '')).join(' ')}
          searchPlaceholder={`Search ${label.toLowerCase()}...`}
          exportFilename={`${type}-view.csv`}
          bulkActions={(ids, clear) => (
            <button
              onClick={() => { setBulkDeleteIds(ids); }}
              className="font-medium text-danger hover:underline"
            >
              Delete selected
            </button>
          )}
          rowActions={(item) => (
            <div className="flex items-center justify-end gap-1">
              {supportsVersions && (
                <IconButton label="History" size="sm" onClick={() => openHistory(item)}>
                  <History className="h-3.5 w-3.5" />
                </IconButton>
              )}
              <IconButton label="Edit" size="sm" onClick={() => openEdit(item)}>
                <Pencil className="h-3.5 w-3.5" />
              </IconButton>
              <IconButton label="Delete" size="sm" onClick={() => setDeleteTarget(item)}>
                <Trash2 className="h-3.5 w-3.5 text-danger" />
              </IconButton>
            </div>
          )}
        />
      )}

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? `Edit ${label.replace(/s$/, '')}` : `Add ${label.replace(/s$/, '')}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={save} loading={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              {f.type === 'textarea' ? (
                <Textarea
                  label={f.label}
                  required={f.required}
                  value={form[f.key] ?? ''}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  rows={3}
                />
              ) : f.type === 'checkbox' ? (
                <Checkbox
                  label={`${f.label}${f.required ? ' *' : ''}`}
                  checked={!!form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })}
                />
              ) : f.type === 'url' && (f.accept === 'image' || f.accept === 'file') ? (
                <div>
                  <label className="mb-1.5 block text-label text-foreground">{f.label}{f.required && <span className="ml-0.5 text-danger">*</span>}</label>
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      value={form[f.key] ?? ''}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      leftIcon={<ImageIcon className="h-4 w-4" />}
                      onClick={() => setMediaPickerField({ key: f.key, accept: f.accept as 'image' | 'file' })}
                    >
                      Browse
                    </Button>
                  </div>
                </div>
              ) : (
                <Input
                  label={f.label}
                  required={f.required}
                  type={f.type === 'datetime' ? 'datetime-local' : f.type}
                  value={form[f.key] ?? ''}
                  onChange={(e) => setForm({ ...form, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value })}
                />
              )}
            </div>
          ))}

          <div className="border-t border-border pt-4">
            <Select
              label="Publishing"
              value={form.status ?? 'published'}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={[
                { value: 'published', label: 'Published (visible now)' },
                { value: 'draft', label: 'Draft (hidden from the public site)' },
              ]}
            />
            {form.status === 'draft' && (
              <Input
                className="mt-3"
                label="Optionally schedule"
                hint="Goes live automatically once this passes"
                type="datetime-local"
                value={form.publishAt ?? ''}
                onChange={(e) => setForm({ ...form, publishAt: e.target.value })}
              />
            )}
          </div>
        </div>
      </Modal>

      <MediaPickerModal
        isOpen={!!mediaPickerField}
        accept={mediaPickerField?.accept}
        onClose={() => setMediaPickerField(null)}
        onSelect={(url) => { if (mediaPickerField) setForm(prev => ({ ...prev, [mediaPickerField.key]: url })); }}
      />

      <Modal
        isOpen={!!historyTarget}
        onClose={() => setHistoryTarget(null)}
        title={`History: ${historyTarget?.title || historyTarget?.name || historyTarget?.id}`}
      >
        {versionsLoading ? (
          <LoadingState label="Loading history..." />
        ) : versions.length === 0 ? (
          <EmptyState icon={History} title="No prior versions" description="Edits create a version automatically — this is the first one." />
        ) : (
          <ul className="space-y-2">
            {versions.map((v) => (
              <li key={v.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-body-sm text-foreground">{v.editedByEmail || 'Unknown'}</p>
                  <p className="text-caption text-foreground-subtle">{formatTimestamp(v.editedAt)}</p>
                </div>
                <button onClick={() => restoreVersion(v.id)} className="text-body-sm font-medium text-accent hover:underline">
                  Restore
                </button>
              </li>
            ))}
          </ul>
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title={`Delete ${label.replace(/s$/, '')}`}
        consequence={`This will permanently delete "${deleteTarget?.title || deleteTarget?.name || deleteTarget?.id}". This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={remove}
        onClose={() => setDeleteTarget(null)}
      />

      <ConfirmModal
        isOpen={!!bulkDeleteIds}
        title={`Delete ${bulkDeleteIds?.length ?? 0} ${(bulkDeleteIds?.length ?? 0) === 1 ? 'item' : 'items'}`}
        consequence={`This will permanently delete ${bulkDeleteIds?.length ?? 0} selected ${label.toLowerCase()}. This cannot be undone.`}
        confirmLabel="Delete All"
        onConfirm={bulkDelete}
        onClose={() => setBulkDeleteIds(null)}
      />
    </div>
  );
}
