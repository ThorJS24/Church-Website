'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Trash2, Image as ImageIcon, Upload } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { getIdToken } from '@/lib/firebase';
import { LoadingState, EmptyState, ErrorState } from '@/components/admin/States';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { Card } from '@/components/ui/Card';
import { Grid } from '@/components/ui/Grid';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/IconButton';
import { buttonClasses } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  moderationStatus?: 'pending' | 'approved' | 'rejected';
  photographer?: string;
}

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  approved: 'success',
  pending: 'warning',
  rejected: 'danger',
};

export default function GalleryTab() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    setError(null);
    adminFetch('/api/admin/gallery')
      .then((data) => setItems(data.items))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const remove = async () => {
    if (!deleteTarget) return;
    await adminFetch(`/api/admin/gallery/${deleteTarget.id}`, { method: 'DELETE' });
    load();
  };

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const token = await getIdToken();
      const formData = new FormData();
      Array.from(files).forEach(f => formData.append('files', f));
      formData.append('metadata', JSON.stringify({}));
      const response = await fetch('/api/gallery/upload', {
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

  if (loading) return <LoadingState label="Loading gallery..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-title-lg text-foreground">Gallery ({items.length})</h2>
        <label className={buttonClasses({ className: 'cursor-pointer gap-1.5', disabled: uploading })}>
          <Upload className="h-4 w-4" /> {uploading ? 'Uploading...' : 'Upload Images'}
          <input type="file" multiple accept="image/*" className="hidden" disabled={uploading} onChange={(e) => upload(e.target.files)} />
        </label>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={ImageIcon} title="No gallery images yet" description="Upload some, or wait for public submissions in the Moderation Queue." />
      ) : (
        <Grid cols={4} gap={4}>
          {items.map((item) => (
            <Card key={item.id} padding="none" className="overflow-hidden">
              <div className="relative aspect-square bg-surface-active">
                <Image src={item.imageUrl} alt={item.title} fill className="object-cover" sizes="200px" />
              </div>
              <div className="p-3">
                <p className="truncate text-body-sm font-medium text-foreground">{item.title}</p>
                <div className="mt-2 flex items-center justify-between">
                  <Badge variant={STATUS_VARIANT[item.moderationStatus || 'approved']}>{item.moderationStatus || 'approved'}</Badge>
                  <IconButton label="Delete image" size="sm" onClick={() => setDeleteTarget(item)}>
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
        title="Delete image"
        consequence={`This will permanently delete "${deleteTarget?.title}" from the gallery.`}
        confirmLabel="Delete"
        onConfirm={remove}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
