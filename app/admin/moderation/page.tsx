'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Check, X, ShieldCheck } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { LoadingState, EmptyState, ErrorState } from '@/components/admin/States';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface QueueItem {
  id: string;
  collection: 'prayerRequests' | 'comments' | 'galleryImages' | 'testimonials';
  title?: string;
  text?: string;
  description?: string;
  content?: string;
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
  testimonials: 'Testimonial',
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
      <h1 className="mb-6 text-headline-md text-foreground">Moderation Queue ({items.length})</h1>

      {items.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="Nothing waiting for review" description="Prayer requests, comments, and gallery submissions will show up here as they come in." />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={`${item.collection}-${item.id}`} className="flex items-start gap-4">
              {item.collection === 'galleryImages' && item.imageUrl && (
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-active">
                  <Image src={item.imageUrl} alt={item.title || 'submission'} fill className="object-cover" sizes="80px" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <span className="text-caption font-semibold uppercase tracking-wide text-accent">{COLLECTION_LABEL[item.collection]}</span>
                <p className="truncate text-body-sm font-medium text-foreground">
                  {item.title || item.text || item.description || item.content || 'Untitled'}
                </p>
                {(item.collection === 'comments' || item.collection === 'testimonials') && (item.text || item.content) && (
                  <p className="mt-1 text-body-sm text-foreground-muted">&ldquo;{item.text || item.content}&rdquo;</p>
                )}
                <p className="mt-1 text-caption text-foreground-subtle">
                  {item.authorName || item.author || item.photographer || 'Anonymous'}
                  {item.isPrivate && ' · Private'}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button size="sm" variant="primary" leftIcon={<Check className="h-4 w-4" />} disabled={busyId === item.id} onClick={() => decide(item, 'approved')}>
                  Approve
                </Button>
                <Button size="sm" variant="outline" leftIcon={<X className="h-4 w-4" />} disabled={busyId === item.id} onClick={() => decide(item, 'rejected')}>
                  Reject
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
