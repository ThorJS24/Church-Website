'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Search, Upload, X, Image as ImageIcon, FileText } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { getIdToken } from '@/lib/firebase';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { LoadingState, EmptyState } from '@/components/admin/States';

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
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(isOpen, onClose, modalRef);

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
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  const filtered = items
    .filter(item => (accept === 'image' ? (item.mimeType?.startsWith('image/') ?? true) : true))
    .filter(item => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return item.fileName?.toLowerCase().includes(q) || item.tags?.some(t => t.toLowerCase().includes(q));
    });

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-picker-title"
        tabIndex={-1}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 id="media-picker-title" className="text-lg font-bold text-gray-900 dark:text-white">Select Media</h3>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <label htmlFor="media-picker-search" className="sr-only">Search media</label>
            <input
              id="media-picker-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or tag..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
            />
          </div>
          <label className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer shrink-0">
            <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload'}
            <input type="file" multiple accept={accept === 'image' ? 'image/*' : undefined} className="hidden" disabled={uploading} onChange={(e) => upload(e.target.files)} />
          </label>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <LoadingState label="Loading media..." />
          ) : filtered.length === 0 ? (
            <EmptyState icon={ImageIcon} title="No media found" description="Upload a file to get started." />
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {filtered.map((item) => {
                const isImage = item.mimeType?.startsWith('image/') ?? true;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onSelect(item.url); onClose(); }}
                    className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-colors focus:outline-none focus:border-blue-500"
                    title={item.fileName}
                  >
                    {isImage ? (
                      <Image src={item.url} alt={item.fileName} fill className="object-cover" sizes="150px" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2">
                        <FileText className="w-8 h-8 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate w-full text-center">{item.fileName}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
