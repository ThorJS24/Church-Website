'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Trash2, Image as ImageIcon, Upload, Copy, Check, Search } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { getIdToken } from '@/lib/firebase';
import { LoadingState, EmptyState, ErrorState } from '@/components/admin/States';
import ConfirmModal from '@/components/admin/ConfirmModal';

interface MediaItem {
  id: string;
  url: string;
  fileName: string;
  size?: number;
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
      alert(err.message);
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Media Library</h1>

      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <label htmlFor="media-search" className="sr-only">Search media</label>
          <input
            id="media-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or tag..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
          />
        </div>
        <label className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer shrink-0">
          <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload'}
          <input type="file" multiple accept="image/*" className="hidden" disabled={uploading} onChange={(e) => upload(e.target.files)} />
        </label>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ImageIcon} title="No media yet" description="Upload images here to reuse them across sermons, events, pastors, and any other content field." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
                <Image src={item.url} alt={item.fileName} fill className="object-cover" sizes="200px" />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={item.fileName}>{item.fileName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{formatSize(item.size)}</p>
                <div className="flex items-center justify-between mt-2">
                  <button
                    onClick={() => copyUrl(item)}
                    className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    {copiedId === item.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedId === item.id ? 'Copied' : 'Copy URL'}
                  </button>
                  <button onClick={() => setDeleteTarget(item)} className="text-red-600 hover:text-red-700" aria-label={`Delete ${item.fileName}`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
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
