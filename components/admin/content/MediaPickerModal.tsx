'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Search, Upload, Image as ImageIcon, FileText } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { getIdToken } from '@/lib/firebase';
import { LoadingState, EmptyState } from '@/components/admin/States';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { buttonClasses } from '@/components/ui/button';
import { useToast } from '@/lib/toast';

interface MediaItem {
  id: string;
  url: string;
  fileName: string;
  mimeType?: string;
  tags?: string[];
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onSelect: (url: string) => void;
  onClose: () => void;
  /** 'image' (default) shows only image/* uploads; 'file' shows everything
   * (PDFs, docs, etc.) — used by the Resources content type's file field. */
  accept?: 'image' | 'file';
}

/** Browse/upload/reuse assets from the shared media library, for any
 * image-URL field in the content forms — avoids re-uploading the same
 * photo per sermon/event/pastor. */
export default function MediaPickerModal({ isOpen, onSelect, onClose, accept = 'image' }: MediaPickerModalProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    adminFetch('/api/admin/media')
      .then((data) => setItems(data.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen]);

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

  const filtered = items
    .filter(item => (accept === 'image' ? (item.mimeType?.startsWith('image/') ?? true) : true))
    .filter(item => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return item.fileName?.toLowerCase().includes(q) || item.tags?.some(t => t.toLowerCase().includes(q));
    });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Media" size="lg">
      <div className="mb-4 flex items-center gap-3">
        <Input
          aria-label="Search media"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or tag..."
          leftIcon={<Search />}
          className="flex-1"
        />
        <label className={buttonClasses({ className: 'shrink-0 cursor-pointer gap-1.5', disabled: uploading })}>
          <Upload className="h-4 w-4" /> {uploading ? 'Uploading...' : 'Upload'}
          <input type="file" multiple accept={accept === 'image' ? 'image/*' : undefined} className="hidden" disabled={uploading} onChange={(e) => upload(e.target.files)} />
        </label>
      </div>

      {loading ? (
        <LoadingState label="Loading media..." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={ImageIcon} title="No media found" description="Upload a file to get started." />
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {filtered.map((item) => {
            const isImage = item.mimeType?.startsWith('image/') ?? true;
            return (
              <button
                key={item.id}
                onClick={() => { onSelect(item.url); onClose(); }}
                className="relative aspect-square overflow-hidden rounded-lg border-2 border-transparent bg-surface-active transition-colors hover:border-accent focus:border-accent focus:outline-hidden"
                title={item.fileName}
              >
                {isImage ? (
                  <Image src={item.url} alt={item.fileName} fill className="object-cover" sizes="150px" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center p-2">
                    <FileText className="mb-1 h-8 w-8 text-foreground-subtle" />
                    <span className="w-full truncate text-center text-caption text-foreground-subtle">{item.fileName}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
