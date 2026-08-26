'use client';

import { useEffect, useState, useRef, type ReactNode } from 'react';
import Papa from 'papaparse';
import { Plus, Pencil, Trash2, FileText, History, Image as ImageIcon, Download, Upload, Copy } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { LoadingState, EmptyState, ErrorState } from '@/components/admin/States';
import ConfirmModal from '@/components/admin/ConfirmModal';
import MediaPickerModal from '@/components/admin/content/MediaPickerModal';
import PersonPickerModal, { PersonOption } from '@/components/admin/content/PersonPickerModal';
import { FieldSchema } from '@/types/contentType';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Modal } from '@/components/ui/modal';
import { Button, buttonClasses } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/lib/toast';

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
  /** Jump straight into editing this item once it loads — used by cross-type
   * search and the content calendar to deep-link into a specific tab+item. */
  autoOpenId?: string | null;
  onAutoOpened?: () => void;
  /** Extra per-row action rendered alongside History/Duplicate/Edit/Delete —
   * an escape hatch for type-specific actions (e.g. Events' registrations
   * view) without forking this component per content type. */
  extraRowAction?: (item: Item) => ReactNode;
}

type Item = Record<string, any> & { id: string };

interface Version {
  id: string;
  snapshot: Record<string, any>;
  editedByEmail?: string | null;
  editedAt?: string | null;
}

function emptyForm(fields: FieldSchema[]): Record<string, any> {
  const form: Record<string, any> = { status: 'published', publishAt: '', tags: '', metaDescription: '', shareImageUrl: '' };
  fields.forEach(f => { form[f.key] = f.type === 'checkbox' ? false : f.type === 'personRefs' ? [] : ''; });
  return form;
}

function formatTimestamp(value: Version['editedAt']): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
}

export default function GenericContentTab({
  type,
  label,
  fields,
  columns,
  apiBase = '/api/admin/content',
  supportsVersions = true,
  autoOpenId = null,
  onAutoOpened,
  extraRowAction,
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
  const [personPickerField, setPersonPickerField] = useState<{ key: string; mode: 'single' | 'multi' } | null>(null);
  const [peopleById, setPeopleById] = useState<Record<string, PersonOption>>({});
  const [importing, setImporting] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const hasPersonField = fields.some((f) => f.type === 'personRef' || f.type === 'personRefs');

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, apiBase]);

  useEffect(() => {
    if (!hasPersonField) return;
    adminFetch('/api/admin/content/people')
      .then((data) => {
        const map: Record<string, PersonOption> = {};
        (data.items ?? []).forEach((p: any) => { map[p.id] = { id: p.id, displayName: p.displayName, title: p.title }; });
        setPeopleById(map);
      })
      .catch(() => setPeopleById({}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPersonField]);

  useEffect(() => {
    if (!autoOpenId || loading) return;
    const match = items.find((i) => i.id === autoOpenId);
    if (match) {
      openEdit(match);
      onAutoOpened?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpenId, loading, items]);

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
    next.tags = Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags ?? '');
    next.metaDescription = item.metaDescription ?? '';
    next.shareImageUrl = item.shareImageUrl ?? '';
    setForm(next);
    setShowForm(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      if (payload.status !== 'draft') payload.publishAt = payload.publishAt || null;
      payload.tags = typeof payload.tags === 'string'
        ? payload.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : [];
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

  const bulkSetStatus = async (ids: string[], status: 'published' | 'draft', clearSelection: () => void) => {
    try {
      for (const id of ids) {
        await adminFetch(`${apiBase}/${type}/${id}`, { method: 'PUT', body: JSON.stringify({ status, ...(status === 'draft' ? {} : { publishAt: null }) }) });
      }
      toast({ title: `${ids.length} ${ids.length === 1 ? 'item' : 'items'} ${status === 'published' ? 'published' : 'unpublished'}`, variant: 'success' });
      clearSelection();
      load();
    } catch (err: any) {
      toast({ title: 'Bulk update failed', description: err.message, variant: 'danger' });
    }
  };

  const duplicate = async (item: Item) => {
    try {
      const payload: Record<string, any> = { ...item };
      delete payload.id;
      delete payload.createdAt;
      delete payload.updatedAt;
      const titleKey = 'title' in payload ? 'title' : 'name' in payload ? 'name' : null;
      if (titleKey) payload[titleKey] = `Copy of ${payload[titleKey]}`;
      payload.status = 'draft';
      payload.publishAt = null;
      await adminFetch(`${apiBase}/${type}`, { method: 'POST', body: JSON.stringify(payload) });
      toast({ title: 'Duplicated as a new draft', variant: 'success' });
      load();
    } catch (err: any) {
      toast({ title: 'Failed to duplicate', description: err.message, variant: 'danger' });
    }
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
          searchKeys={(item) => [...columns.map((c) => String(item[c] ?? '')), (Array.isArray(item.tags) ? item.tags.join(' ') : '')].join(' ')}
          searchPlaceholder={`Search ${label.toLowerCase()}...`}
          exportFilename={`${type}-view.csv`}
          bulkActions={(ids, clear) => (
            <>
              <button onClick={() => bulkSetStatus(ids, 'published', clear)} className="font-medium text-success hover:underline">
                Publish selected
              </button>
              <button onClick={() => bulkSetStatus(ids, 'draft', clear)} className="font-medium text-foreground-muted hover:underline">
                Unpublish selected
              </button>
              <button onClick={() => { setBulkDeleteIds(ids); }} className="font-medium text-danger hover:underline">
                Delete selected
              </button>
            </>
          )}
          rowActions={(item) => (
            <div className="flex items-center justify-end gap-1">
              {extraRowAction?.(item)}
              {supportsVersions && (
                <IconButton label="History" size="sm" onClick={() => openHistory(item)}>
                  <History className="h-3.5 w-3.5" />
                </IconButton>
              )}
              <IconButton label="Duplicate" size="sm" onClick={() => duplicate(item)}>
                <Copy className="h-3.5 w-3.5" />
              </IconButton>
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
              ) : f.type === 'personRef' ? (
                <div>
                  <label className="mb-1.5 block text-label text-foreground">{f.label}{f.required && <span className="ml-0.5 text-danger">*</span>}</label>
                  <div className="flex items-center gap-2">
                    <span className="flex-1 rounded-lg border border-border px-3 py-2 text-body-sm text-foreground">
                      {form[f.key] ? (peopleById[form[f.key]]?.displayName ?? 'Selected person') : 'No one selected'}
                    </span>
                    <Button type="button" variant="outline" onClick={() => setPersonPickerField({ key: f.key, mode: 'single' })}>
                      {form[f.key] ? 'Change' : 'Select'}
                    </Button>
                  </div>
                </div>
              ) : f.type === 'personRefs' ? (
                <div>
                  <label className="mb-1.5 block text-label text-foreground">{f.label}{f.required && <span className="ml-0.5 text-danger">*</span>}</label>
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {(form[f.key] ?? []).length === 0 && <span className="text-body-sm text-foreground-subtle">No one selected</span>}
                    {(form[f.key] ?? []).map((personId: string) => (
                      <Badge key={personId} variant="neutral">
                        {peopleById[personId]?.displayName ?? personId}
                        <button
                          type="button"
                          className="ml-1.5 text-foreground-subtle hover:text-danger"
                          onClick={() => setForm({ ...form, [f.key]: (form[f.key] ?? []).filter((id: string) => id !== personId) })}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => setPersonPickerField({ key: f.key, mode: 'multi' })}>
                    Add / Edit People
                  </Button>
                </div>
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

          <div className="space-y-4 border-t border-border pt-4">
            <Input
              label="Tags"
              hint="Comma-separated — searchable here and manageable from the Tags tab"
              value={form.tags ?? ''}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="e.g. youth, outreach, spring-2026"
            />
            <Textarea
              label="Meta description (SEO)"
              hint={`${(form.metaDescription ?? '').length}/160 characters — shown in search results`}
              value={form.metaDescription ?? ''}
              onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
              rows={2}
              maxLength={160}
            />
            <div>
              <label className="mb-1.5 block text-label text-foreground">Share image (social preview)</label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  value={form.shareImageUrl ?? ''}
                  onChange={(e) => setForm({ ...form, shareImageUrl: e.target.value })}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  leftIcon={<ImageIcon className="h-4 w-4" />}
                  onClick={() => setMediaPickerField({ key: 'shareImageUrl', accept: 'image' })}
                >
                  Browse
                </Button>
              </div>
            </div>
            {(form.metaDescription || form.shareImageUrl || form.title || form.name) && (
              <div className="overflow-hidden rounded-lg border border-border">
                {form.shareImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.shareImageUrl} alt="" className="h-32 w-full object-cover" />
                )}
                <div className="p-3">
                  <p className="truncate text-body-sm font-medium text-accent">
                    {form.title || form.name || `${label.replace(/s$/, '')}`}
                  </p>
                  <p className="text-caption text-success">salempbc.in</p>
                  <p className="line-clamp-2 text-caption text-foreground-subtle">
                    {form.metaDescription || 'No meta description set — search engines will generate one automatically.'}
                  </p>
                </div>
              </div>
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

      <PersonPickerModal
        isOpen={!!personPickerField}
        mode={personPickerField?.mode ?? 'single'}
        selectedIds={personPickerField ? (personPickerField.mode === 'multi' ? (form[personPickerField.key] ?? []) : (form[personPickerField.key] ? [form[personPickerField.key]] : [])) : []}
        onChange={(ids) => {
          if (!personPickerField) return;
          setForm(prev => ({ ...prev, [personPickerField.key]: personPickerField.mode === 'multi' ? ids : (ids[0] ?? '') }));
        }}
        onPeopleLoaded={(people) => {
          setPeopleById((prev) => {
            const next = { ...prev };
            people.forEach((p) => { next[p.id] = p; });
            return next;
          });
        }}
        onClose={() => setPersonPickerField(null)}
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
                <button onClick={() => restoreVersion(v.id)} className="text-body-sm font-medium text-accent hover:underline dark:text-accent-hover">
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
