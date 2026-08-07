'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Trash2, Image as ImageIcon, Upload, Copy, Check, Search, FileText, AlertTriangle, Files as DuplicateIcon, RotateCcw, FolderOpen } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { getIdToken } from '@/lib/firebase';
import { LoadingState, EmptyState, ErrorState } from '@/components/admin/States';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { Card } from '@/components/ui/card';
import { Grid } from '@/components/ui/grid';
import { Input } from '@/components/ui/input';
import { IconButton } from '@/components/ui/icon-button';
import { Button, buttonClasses } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/lib/toast';
import { cn } from '@/lib/utils';

interface MediaItem {
  id: string;
  url: string;
  fileName: string;
  size?: number;
  mimeType?: string;
  tags?: string[];
  folder?: string | null;
  altText?: string;
  copyright?: string;
  duplicateOfId?: string | null;
  deletedAt?: string | null;
  uploadedAt?: { seconds: number } | string;
}

function formatSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(item: MediaItem): boolean {
  return item.mimeType?.startsWith('image/') ?? true;
}

export default function MediaLibraryPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadFolder, setUploadFolder] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [view, setView] = useState<'library' | 'trash'>('library');
  const [folderFilter, setFolderFilter] = useState('all');
  const [missingAltOnly, setMissingAltOnly] = useState(false);
  const [duplicatesOnly, setDuplicatesOnly] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkTagInput, setBulkTagInput] = useState('');
  const [detailItem, setDetailItem] = useState<MediaItem | null>(null);
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    setError(null);
    adminFetch('/api/admin/media')
      .then((data) => setItems(data.items))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const token = await getIdToken();
      const formData = new FormData();
      Array.from(files).forEach(f => formData.append('files', f));
      if (uploadFolder.trim()) formData.append('folder', uploadFolder.trim());
      const response = await fetch('/api/admin/media', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      const dupes = (data.items || []).filter((i: any) => i.duplicateOfFileName);
      if (dupes.length > 0) {
        toast({
          title: `${dupes.length} file(s) match an existing upload`,
          description: dupes.map((d: any) => `matches "${d.duplicateOfFileName}"`).join(', '),
          variant: 'warning',
        });
      }
      load();
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'danger' });
    } finally {
      setUploading(false);
    }
  };

  const trashOrDelete = async () => {
    if (!deleteTarget) return;
    const data = await adminFetch(`/api/admin/media/${deleteTarget.id}`, { method: 'DELETE' });
    toast({ title: data.trashed ? 'Moved to Trash' : 'Permanently deleted', variant: 'success' });
    setDeleteTarget(null);
    setDetailItem(null);
    load();
  };

  const restore = async (item: MediaItem) => {
    await adminFetch(`/api/admin/media/${item.id}/restore`, { method: 'POST' });
    toast({ title: 'Restored from Trash', variant: 'success' });
    load();
  };

  const copyUrl = async (item: MediaItem) => {
    await navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const applyBulkTags = async () => {
    const newTags = bulkTagInput.split(',').map((t) => t.trim()).filter(Boolean);
    if (newTags.length === 0 || selected.size === 0) return;
    try {
      for (const id of selected) {
        const item = items.find((i) => i.id === id);
        const merged = Array.from(new Set([...(item?.tags || []), ...newTags]));
        await adminFetch(`/api/admin/media/${id}`, { method: 'PATCH', body: JSON.stringify({ tags: merged }) });
      }
      toast({ title: `Tagged ${selected.size} item(s)`, variant: 'success' });
      setBulkTagInput('');
      setSelected(new Set());
      load();
    } catch (err: any) {
      toast({ title: 'Bulk tagging failed', description: err.message, variant: 'danger' });
    }
  };

  const bulkTrash = async () => {
    try {
      for (const id of selected) {
        await adminFetch(`/api/admin/media/${id}`, { method: 'DELETE' });
      }
      toast({ title: `Moved ${selected.size} item(s) to Trash`, variant: 'success' });
      setSelected(new Set());
      load();
    } catch (err: any) {
      toast({ title: 'Bulk move to Trash failed', description: err.message, variant: 'danger' });
    }
  };

  const folders = useMemo(() => Array.from(new Set(items.map((i) => i.folder).filter(Boolean))) as string[], [items]);

  const visible = items.filter((i) => (view === 'trash' ? !!i.deletedAt : !i.deletedAt));
  const filtered = visible.filter((item) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matches = item.fileName?.toLowerCase().includes(q) || item.tags?.some(t => t.toLowerCase().includes(q));
      if (!matches) return false;
    }
    if (folderFilter !== 'all') {
      if (folderFilter === '__unfiled__' ? !!item.folder : item.folder !== folderFilter) return false;
    }
    if (missingAltOnly && (item.altText || !isImage(item))) return false;
    if (duplicatesOnly && !item.duplicateOfId) return false;
    return true;
  });

  if (loading) return <LoadingState label="Loading media library..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-headline-md text-foreground">Media Library</h1>
        <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
          <button
            onClick={() => setView('library')}
            className={cn('rounded px-3 py-1 text-body-sm font-medium', view === 'library' ? 'bg-accent text-accent-foreground' : 'text-foreground-muted hover:text-foreground')}
          >
            Library ({items.filter((i) => !i.deletedAt).length})
          </button>
          <button
            onClick={() => setView('trash')}
            className={cn('rounded px-3 py-1 text-body-sm font-medium', view === 'trash' ? 'bg-accent text-accent-foreground' : 'text-foreground-muted hover:text-foreground')}
          >
            Trash ({items.filter((i) => !!i.deletedAt).length})
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or tag..." leftIcon={<Search />} className="max-w-xs" size="sm" />
        {folders.length > 0 && (
          <select
            aria-label="Filter by folder"
            value={folderFilter}
            onChange={(e) => setFolderFilter(e.target.value)}
            className="h-8 rounded-md border border-border bg-background px-2 text-body-sm text-foreground"
          >
            <option value="all">All folders</option>
            <option value="__unfiled__">Unfiled</option>
            {folders.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        )}
        {view === 'library' && (
          <>
            <label className="flex items-center gap-1.5 text-caption text-foreground-muted">
              <Checkbox checked={missingAltOnly} onChange={(e) => setMissingAltOnly(e.target.checked)} /> Missing alt text
            </label>
            <label className="flex items-center gap-1.5 text-caption text-foreground-muted">
              <Checkbox checked={duplicatesOnly} onChange={(e) => setDuplicatesOnly(e.target.checked)} /> Duplicates only
            </label>
          </>
        )}
        {view === 'library' && (
          <div className="ml-auto flex items-center gap-2">
            <Input value={uploadFolder} onChange={(e) => setUploadFolder(e.target.value)} placeholder="Folder (optional)" size="sm" className="w-40" />
            <label className={buttonClasses({ className: 'shrink-0 cursor-pointer gap-1.5', disabled: uploading })}>
              <Upload className="h-4 w-4" /> {uploading ? 'Uploading...' : 'Upload'}
              <input type="file" multiple className="hidden" disabled={uploading} onChange={(e) => upload(e.target.files)} />
            </label>
          </div>
        )}
      </div>

      {selected.size > 0 && view === 'library' && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-md bg-accent-subtle px-3 py-2 text-body-sm text-accent">
          <span>{selected.size} selected</span>
          <Input value={bulkTagInput} onChange={(e) => setBulkTagInput(e.target.value)} placeholder="tag1, tag2" size="sm" className="w-40" />
          <Button size="sm" variant="outline" onClick={applyBulkTags} disabled={!bulkTagInput.trim()}>Add tags</Button>
          <Button size="sm" variant="outline" onClick={bulkTrash}>Move to Trash</Button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-caption underline">Clear</button>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={view === 'trash' ? Trash2 : ImageIcon}
          title={view === 'trash' ? 'Trash is empty' : 'No media yet'}
          description={view === 'trash' ? 'Items moved to Trash appear here until restored or permanently deleted.' : 'Upload images or files here to reuse them across sermons, events, pastors, resources, and any other content field.'}
        />
      ) : (
        <Grid cols={5} gap={4}>
          {filtered.map((item) => (
            <Card key={item.id} padding="none" className="overflow-hidden">
              <div className="relative aspect-square bg-surface-active">
                {view === 'library' && (
                  <div className="absolute left-2 top-2 z-10" onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={selected.has(item.id)} onChange={() => toggleSelected(item.id)} aria-label={`Select ${item.fileName}`} />
                  </div>
                )}
                <button className="absolute inset-0" onClick={() => setDetailItem(item)} aria-label={`Open details for ${item.fileName}`}>
                  {isImage(item) ? (
                    <Image src={item.url} alt={item.altText || item.fileName} fill className="object-cover" sizes="200px" />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center p-2">
                      <FileText className="mb-1 h-10 w-10 text-foreground-subtle" />
                      <span className="w-full truncate text-center text-caption text-foreground-subtle">{item.fileName}</span>
                    </div>
                  )}
                </button>
                <div className="pointer-events-none absolute bottom-2 left-2 flex gap-1">
                  {isImage(item) && !item.altText && <Badge variant="warning" dot>No alt text</Badge>}
                  {item.duplicateOfId && <Badge variant="danger" dot>Duplicate</Badge>}
                </div>
              </div>
              <div className="p-3">
                <p className="truncate text-body-sm font-medium text-foreground" title={item.fileName}>{item.fileName}</p>
                <p className="text-caption text-foreground-subtle">{formatSize(item.size)}{item.folder ? ` · ${item.folder}` : ''}</p>
                <div className="mt-2 flex items-center justify-between">
                  <button onClick={() => copyUrl(item)} className="inline-flex items-center gap-1 text-caption text-accent hover:underline dark:text-accent-hover">
                    {copiedId === item.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copiedId === item.id ? 'Copied' : 'Copy URL'}
                  </button>
                  {view === 'trash' ? (
                    <div className="flex items-center gap-1">
                      <IconButton label="Restore" size="sm" onClick={() => restore(item)}>
                        <RotateCcw className="h-4 w-4" />
                      </IconButton>
                      <IconButton label={`Permanently delete ${item.fileName}`} size="sm" onClick={() => setDeleteTarget(item)}>
                        <Trash2 className="h-4 w-4 text-danger" />
                      </IconButton>
                    </div>
                  ) : (
                    <IconButton label={`Move ${item.fileName} to Trash`} size="sm" onClick={() => setDeleteTarget(item)}>
                      <Trash2 className="h-4 w-4 text-danger" />
                    </IconButton>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </Grid>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title={deleteTarget?.deletedAt ? 'Permanently delete media' : 'Move to Trash'}
        consequence={
          deleteTarget?.deletedAt
            ? `This permanently deletes "${deleteTarget?.fileName}" from the media library and Cloudinary. Any content still referencing its URL will show a broken image. This cannot be undone.`
            : `"${deleteTarget?.fileName}" moves to Trash and can be restored later. The file itself stays on Cloudinary until it's permanently deleted from Trash.`
        }
        confirmLabel={deleteTarget?.deletedAt ? 'Delete Permanently' : 'Move to Trash'}
        onConfirm={trashOrDelete}
        onClose={() => setDeleteTarget(null)}
      />

      <MediaDetailModal
        item={detailItem}
        onClose={() => setDetailItem(null)}
        onSaved={(updated) => { setItems((prev) => prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i))); }}
        onTrash={(item) => { setDetailItem(null); setDeleteTarget(item); }}
      />
    </div>
  );
}

function MediaDetailModal({
  item, onClose, onSaved, onTrash,
}: {
  item: MediaItem | null;
  onClose: () => void;
  onSaved: (updated: Partial<MediaItem> & { id: string }) => void;
  onTrash: (item: MediaItem) => void;
}) {
  const [altText, setAltText] = useState('');
  const [copyright, setCopyright] = useState('');
  const [folder, setFolder] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [usages, setUsages] = useState<Array<{ label: string; title: string }> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!item) return;
    setAltText(item.altText || '');
    setCopyright(item.copyright || '');
    setFolder(item.folder || '');
    setTags((item.tags || []).join(', '));
    setUsages(null);
    adminFetch(`/api/admin/media/${item.id}/usage`)
      .then((data) => setUsages(data.usages))
      .catch(() => setUsages([]));
  }, [item]);

  if (!item) return null;

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        altText,
        copyright,
        folder: folder.trim() || null,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      };
      await adminFetch(`/api/admin/media/${item.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      onSaved({ id: item.id, ...payload });
      toast({ title: 'Saved', variant: 'success' });
      onClose();
    } catch (err: any) {
      toast({ title: 'Failed to save', description: err.message, variant: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={!!item}
      onClose={onClose}
      title={item.fileName}
      footer={
        <>
          <Button variant="outline" onClick={() => onTrash(item)}>Move to Trash</Button>
          <Button onClick={save} loading={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        {isImage(item) && (
          <div className="relative h-48 w-full overflow-hidden rounded-lg bg-surface-active">
            <Image src={item.url} alt={altText || item.fileName} fill className="object-contain" sizes="500px" />
          </div>
        )}
        {!altText && isImage(item) && (
          <p className="flex items-center gap-1.5 rounded-md bg-warning-subtle px-3 py-2 text-body-sm text-warning">
            <AlertTriangle className="h-4 w-4 shrink-0" /> No alt text set — required for accessible, SEO-friendly images.
          </p>
        )}
        {item.duplicateOfId && (
          <p className="flex items-center gap-1.5 rounded-md bg-danger-subtle px-3 py-2 text-body-sm text-danger">
            <DuplicateIcon className="h-4 w-4 shrink-0" /> This file's content matches another item already in the library.
          </p>
        )}
        <Input label="Alt text" value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="Describe the image for screen readers and search engines" />
        <Input label="Copyright / License" value={copyright} onChange={(e) => setCopyright(e.target.value)} placeholder="e.g. © 2026 Salem PBC, or CC-BY-4.0" />
        <Input label="Folder" value={folder} onChange={(e) => setFolder(e.target.value)} placeholder="e.g. Events 2026" />
        <Input label="Tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="comma, separated" />

        <div className="border-t border-border pt-4">
          <p className="mb-2 flex items-center gap-1.5 text-label text-foreground"><FolderOpen className="h-3.5 w-3.5" /> Usage</p>
          {usages === null ? (
            <p className="text-body-sm text-foreground-subtle">Checking where this is used...</p>
          ) : usages.length === 0 ? (
            <p className="text-body-sm text-foreground-subtle">Not currently referenced anywhere — safe to delete.</p>
          ) : (
            <ul className="space-y-1">
              {usages.map((u, i) => (
                <li key={i} className="text-body-sm text-foreground">
                  <span className="text-foreground-subtle">{u.label}:</span> {u.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}
