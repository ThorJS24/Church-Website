'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Check, X, ShieldCheck } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { LoadingState, EmptyState, ErrorState } from '@/components/admin/States';

interface QueueItem {
  id: string;
  collection: 'prayerRequests' | 'comments' | 'galleryImages';
  title?: string;
  text?: string;
  description?: string;
  authorName?: string;
  author?: string;
  photographer?: string;
  imageUrl?: string;
  isPrivate?: boolean;
}

const COLLECTION_LABEL: Record<string, string> = {
  prayerRequests: 'Prayer Request',
  comments: 'Comment',
  galleryImages: 'Gallery Submission',
};

export default function ModerationQueuePage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    adminFetch('/api/admin/moderation')
      .then((data) => setItems(data.items))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const decide = async (item: QueueItem, decision: 'approved' | 'rejected') => {
    const reason = decision === 'rejected' ? (window.prompt('Reason for rejecting (optional):') ?? undefined) : undefined;
    setBusyId(item.id);
    try {
      await adminFetch(`/api/admin/moderation/${item.collection}/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ decision, reason }),
      });
      setItems(prev => prev.filter(i => !(i.id === item.id && i.collection === item.collection)));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <LoadingState label="Loading moderation queue..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Moderation Queue ({items.length})</h1>

      {items.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="Nothing waiting for review" description="Prayer requests, comments, and gallery submissions will show up here as they come in." />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={`${item.collection}-${item.id}`} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-start gap-4">
              {item.collection === 'galleryImages' && item.imageUrl && (
                <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <Image src={item.imageUrl} alt={item.title || 'submission'} fill className="object-cover" sizes="80px" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                  {COLLECTION_LABEL[item.collection]}
                </span>
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {item.title || item.text || item.description || 'Untitled'}
                </p>
                {item.collection === 'comments' && item.text && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">&ldquo;{item.text}&rdquo;</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {item.authorName || item.author || item.photographer || 'Anonymous'}
                  {item.isPrivate && ' · Private'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => decide(item, 'approved')}
                  disabled={busyId === item.id}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => decide(item, 'rejected')}
                  disabled={busyId === item.id}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  <X className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
