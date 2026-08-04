'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Trash2, Image as ImageIcon, Upload, Copy, Check, Search, FileText } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { getIdToken } from '@/lib/firebase';
import { LoadingState, EmptyState, ErrorState } from '@/components/admin/States';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { Card } from '@/components/ui/Card';
import { Grid } from '@/components/ui/Grid';
import { Input } from '@/components/ui/Input';
import { IconButton } from '@/components/ui/IconButton';
import { buttonClasses } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface MediaItem {
  id: string;
  url: string;
  fileName: string;
  size?: number;
  mimeType?: string;
  tags?: string[];
  uploadedAt?: { seconds: number } | string;
}

function formatSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaLibraryPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
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
      const response = await fetch('/api/admin/media', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      load();
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'danger' });
    } finally {
      setUploading(false);
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    await adminFetch(`/api/admin/media/${deleteTarget.id}`, { method: 'DELETE' });
    load();
  };

  const copyUrl = async (item: MediaItem) => {
    await navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  if (loading) return <LoadingState label="Loading media library..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const filtered = items.filter(item => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return item.fileName?.toLowerCase().includes(q) || item.tags?.some(t => t.toLowerCase().includes(q));
  });

  return (
    <div>
      <h1 className="mb-6 text-headline-md text-foreground">Media Library</h1>

      <div className="mb-4 flex items-center justify-between gap-3">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or tag..." leftIcon={<Search />} className="max-w-sm" />
        <label className={buttonClasses({ className: 'shrink-0 cursor-pointer gap-1.5', disabled: uploading })}>
          <Upload className="h-4 w-4" /> {uploading ? 'Uploading...' : 'Upload'}
          <input type="file" multiple className="hidden" disabled={uploading} onChange={(e) => upload(e.target.files)} />
        </label>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ImageIcon} title="No media yet" description="Upload images or files here to reuse them across sermons, events, pastors, resources, and any other content field." />
      ) : (
        <Grid cols={5} gap={4}>
          {filtered.map((item) => (
            <Card key={item.id} padding="none" className="overflow-hidden">
              <div className="relative aspect-square bg-surface-active">
                {(item.mimeType?.startsWith('image/') ?? true) ? (
                  <Image src={item.url} alt={item.fileName} fill className="object-cover" sizes="200px" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center p-2">
                    <FileText className="mb-1 h-10 w-10 text-foreground-subtle" />
                    <span className="w-full truncate text-center text-caption text-foreground-subtle">{item.fileName}</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-body-sm font-medium text-foreground" title={item.fileName}>{item.fileName}</p>
                <p className="text-caption text-foreground-subtle">{formatSize(item.size)}</p>
                <div className="mt-2 flex items-center justify-between">
                  <button onClick={() => copyUrl(item)} className="inline-flex items-center gap-1 text-caption text-accent hover:underline">
                    {copiedId === item.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copiedId === item.id ? 'Copied' : 'Copy URL'}
                  </button>
                  <IconButton label={`Delete ${item.fileName}`} size="sm" onClick={() => setDeleteTarget(item)}>
                    <Trash2 className="h-4 w-4 text-danger" />
                  </IconButton>
                </div>
              </div>
            </Card>
          ))}
        </Grid>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete media"
        consequence={`This will permanently delete "${deleteTarget?.fileName}" from the media library and Cloudinary. Any content still referencing its URL will show a broken image.`}
        confirmLabel="Delete"
        onConfirm={remove}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
