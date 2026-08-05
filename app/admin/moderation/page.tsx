'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Check, X, ShieldCheck, Eye, Clock, Settings2, Trash2, Grid3x3, List as ListIcon } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { LoadingState, EmptyState, ErrorState } from '@/components/admin/States';
import { Card } from '@/components/ui-legacy/Card';
import { Button } from '@/components/ui-legacy/Button';
import { IconButton } from '@/components/ui-legacy/IconButton';
import { Checkbox } from '@/components/ui-legacy/Checkbox';
import { Badge, type BadgeVariant } from '@/components/ui-legacy/Badge';
import { Modal } from '@/components/ui-legacy/Modal';
import { Select } from '@/components/ui-legacy/Select';
import { Textarea } from '@/components/ui-legacy/Textarea';
import { Input } from '@/components/ui-legacy/Input';
import { useToast } from '@/components/ui-legacy/Toast';
import { cn } from '@/lib/cn';

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
  isAnonymous?: boolean;
  submittedAt?: string | null;
  priorRejected?: Record<string, any> | null;
}

interface ReasonTemplate { id: string; text: string }

const COLLECTION_LABEL: Record<string, string> = {
  prayerRequests: 'Prayer Request',
  comments: 'Comment',
  galleryImages: 'Gallery Submission',
  testimonials: 'Testimonial',
};

function itemText(item: QueueItem): string {
  return item.title || item.text || item.description || item.content || 'Untitled';
}
function itemAuthor(item: QueueItem): string {
  return item.authorName || item.author || item.photographer || 'Anonymous';
}

function slaInfo(submittedAt?: string | null): { label: string; variant: BadgeVariant } {
  if (!submittedAt) return { label: 'Unknown', variant: 'neutral' };
  const hours = (Date.now() - new Date(submittedAt).getTime()) / 3_600_000;
  if (hours < 24) return { label: `${Math.max(0, Math.round(hours))}h pending`, variant: 'success' };
  if (hours < 72) return { label: `${Math.round(hours / 24)}d pending`, variant: 'warning' };
  return { label: `${Math.round(hours / 24)}d pending`, variant: 'danger' };
}

export default function ModerationQueuePage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [view, setView] = useState<'all' | 'gallery-grid'>('all');
  const [previewItem, setPreviewItem] = useState<QueueItem | null>(null);
  const [rejectTarget, setRejectTarget] = useState<QueueItem[] | null>(null);
  const [reasons, setReasons] = useState<ReasonTemplate[]>([]);
  const [showManageReasons, setShowManageReasons] = useState(false);
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      adminFetch('/api/admin/moderation'),
      adminFetch('/api/admin/moderation-reasons').catch(() => ({ reasons: [] })),
    ])
      .then(([mod, reasonsData]) => { setItems(mod.items); setReasons(reasonsData.reasons || []); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const key = (item: QueueItem) => `${item.collection}-${item.id}`;

  const decide = async (targets: QueueItem[], decision: 'approved' | 'rejected', reason?: string) => {
    setBusyId(targets.length === 1 ? key(targets[0]) : 'bulk');
    try {
      for (const item of targets) {
        await adminFetch(`/api/admin/moderation/${item.collection}/${item.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ decision, reason }),
        });
      }
      const targetKeys = new Set(targets.map(key));
      setItems((prev) => prev.filter((i) => !targetKeys.has(key(i))));
      setSelected((prev) => { const next = new Set(prev); targetKeys.forEach((k) => next.delete(k)); return next; });
      toast({ title: `${targets.length} item(s) ${decision}`, variant: decision === 'approved' ? 'success' : 'warning' });
    } catch (err: any) {
      toast({ title: 'Failed to update', description: err.message, variant: 'danger' });
    } finally {
      setBusyId(null);
    }
  };

  const toggleSelected = (item: QueueItem) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const k = key(item);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });
  };

  const galleryItems = useMemo(() => items.filter((i) => i.collection === 'galleryImages'), [items]);
  const selectedItems = items.filter((i) => selected.has(key(i)));

  if (loading) return <LoadingState label="Loading moderation queue..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const displayItems = view === 'gallery-grid' ? galleryItems : items;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-headline-md text-foreground">Moderation Queue ({items.length})</h1>
        <div className="flex items-center gap-2">
          {galleryItems.length > 0 && (
            <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
              <IconButton label="List view" size="sm" variant={view === 'all' ? 'secondary' : 'ghost'} onClick={() => setView('all')}><ListIcon className="h-4 w-4" /></IconButton>
              <IconButton label="Gallery grid view" size="sm" variant={view === 'gallery-grid' ? 'secondary' : 'ghost'} onClick={() => setView('gallery-grid')}><Grid3x3 className="h-4 w-4" /></IconButton>
            </div>
          )}
          <Button variant="outline" size="sm" leftIcon={<Settings2 className="h-3.5 w-3.5" />} onClick={() => setShowManageReasons(true)}>
            Rejection Reasons
          </Button>
        </div>
      </div>

      {selectedItems.length > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-md bg-accent-subtle px-3 py-2 text-body-sm text-accent">
          <span>{selectedItems.length} selected</span>
          <button onClick={() => decide(selectedItems, 'approved')} className="font-medium text-success hover:underline">Approve selected</button>
          <button onClick={() => setRejectTarget(selectedItems)} className="font-medium text-danger hover:underline">Reject selected</button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-caption underline">Clear</button>
        </div>
      )}

      {displayItems.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="Nothing waiting for review" description="Prayer requests, comments, and gallery submissions will show up here as they come in." />
      ) : view === 'gallery-grid' ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {galleryItems.map((item) => {
            const sla = slaInfo(item.submittedAt);
            const isSelected = selected.has(key(item));
            return (
              <div key={key(item)} className={cn('overflow-hidden rounded-lg border', isSelected ? 'border-accent ring-2 ring-accent/30' : 'border-border')}>
                <div className="relative aspect-square bg-surface-active">
                  <div className="absolute left-2 top-2 z-10"><Checkbox checked={isSelected} onChange={() => toggleSelected(item)} aria-label={`Select ${itemText(item)}`} /></div>
                  {item.imageUrl && <Image src={item.imageUrl} alt={itemText(item)} fill className="object-cover" sizes="200px" />}
                </div>
                <div className="flex items-center justify-between p-2">
                  <Badge variant={sla.variant} className="text-[10px]">{sla.label}</Badge>
                  <div className="flex items-center gap-0.5">
                    <IconButton label="Preview" size="sm" onClick={() => setPreviewItem(item)}><Eye className="h-3.5 w-3.5" /></IconButton>
                    <IconButton label="Approve" size="sm" onClick={() => decide([item], 'approved')}><Check className="h-3.5 w-3.5 text-success" /></IconButton>
                    <IconButton label="Reject" size="sm" onClick={() => setRejectTarget([item])}><X className="h-3.5 w-3.5 text-danger" /></IconButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {displayItems.map((item) => {
            const sla = slaInfo(item.submittedAt);
            const isSelected = selected.has(key(item));
            return (
              <Card key={key(item)} className={cn('flex items-start gap-4', isSelected && 'ring-2 ring-accent/30')}>
                <div className="pt-1"><Checkbox checked={isSelected} onChange={() => toggleSelected(item)} aria-label={`Select ${itemText(item)}`} /></div>
                {item.collection === 'galleryImages' && item.imageUrl && (
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-active">
                    <Image src={item.imageUrl} alt={item.title || 'submission'} fill className="object-cover" sizes="80px" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-caption font-semibold uppercase tracking-wide text-accent">{COLLECTION_LABEL[item.collection]}</span>
                    <Badge variant={sla.variant}><Clock className="mr-1 h-3 w-3" />{sla.label}</Badge>
                    {item.priorRejected && <Badge variant="warning">Resubmitted after rejection</Badge>}
                  </div>
                  <p className="truncate text-body-sm font-medium text-foreground">{itemText(item)}</p>
                  {(item.collection === 'comments' || item.collection === 'testimonials') && (item.text || item.content) && (
                    <p className="mt-1 text-body-sm text-foreground-muted">&ldquo;{item.text || item.content}&rdquo;</p>
                  )}
                  <p className="mt-1 text-caption text-foreground-subtle">
                    {itemAuthor(item)}
                    {item.isPrivate && ' · Private'}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <IconButton label="Preview in context" size="sm" onClick={() => setPreviewItem(item)}><Eye className="h-4 w-4" /></IconButton>
                  <Button size="sm" variant="primary" leftIcon={<Check className="h-4 w-4" />} disabled={busyId === key(item)} onClick={() => decide([item], 'approved')}>
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" leftIcon={<X className="h-4 w-4" />} disabled={busyId === key(item)} onClick={() => setRejectTarget([item])}>
                    Reject
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />

      <RejectModal
        targets={rejectTarget}
        reasons={reasons}
        onClose={() => setRejectTarget(null)}
        onConfirm={(reason) => { if (rejectTarget) decide(rejectTarget, 'rejected', reason); setRejectTarget(null); }}
      />

      <ManageReasonsModal
        isOpen={showManageReasons}
        onClose={() => setShowManageReasons(false)}
        reasons={reasons}
        onChange={setReasons}
      />
    </div>
  );
}

function PreviewModal({ item, onClose }: { item: QueueItem | null; onClose: () => void }) {
  if (!item) return null;
  return (
    <Modal isOpen={!!item} onClose={onClose} title={`Preview: ${COLLECTION_LABEL[item.collection]}`} size="lg">
      <div className={cn('grid gap-4', item.priorRejected ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1')}>
        <div>
          {item.priorRejected && <p className="mb-2 text-label text-danger">Previously rejected version</p>}
          {!item.priorRejected && <p className="mb-2 text-label text-foreground-subtle">New submission</p>}
          <PreviewCard item={item} />
        </div>
        {item.priorRejected && (
          <div>
            <p className="mb-2 text-label text-success">Current submission</p>
            <PreviewCard item={item.priorRejected as QueueItem} />
          </div>
        )}
      </div>
    </Modal>
  );
}

function PreviewCard({ item }: { item: QueueItem | Record<string, any> }) {
  if (item.collection === 'testimonials' || (!item.collection && item.authorName !== undefined && item.content)) {
    return (
      <div className="rounded-xl border border-border bg-surface p-5">
        <p className="text-body-md italic text-foreground">&ldquo;{item.content}&rdquo;</p>
        <p className="mt-3 text-body-sm font-medium text-foreground-muted">— {item.authorName}</p>
      </div>
    );
  }
  if (item.collection === 'prayerRequests' || item.title !== undefined) {
    return (
      <div className="rounded-xl border border-border bg-surface p-5">
        <p className="text-title-sm text-foreground">{item.title}</p>
        <p className="mt-2 text-body-sm text-foreground-muted">{item.description}</p>
        <p className="mt-3 text-caption text-foreground-subtle">{item.isAnonymous ? 'Anonymous' : item.authorName}</p>
      </div>
    );
  }
  if (item.collection === 'comments' || item.text !== undefined) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="text-body-sm text-foreground">{item.text}</p>
        <p className="mt-2 text-caption text-foreground-subtle">{item.author}</p>
      </div>
    );
  }
  if (item.collection === 'galleryImages' || item.imageUrl) {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        {item.imageUrl && (
          <div className="relative aspect-video">
            <Image src={item.imageUrl} alt={item.title || 'submission'} fill className="object-cover" sizes="400px" />
          </div>
        )}
        <div className="p-3">
          <p className="text-body-sm font-medium text-foreground">{item.title}</p>
          <p className="text-caption text-foreground-subtle">{item.photographer}</p>
        </div>
      </div>
    );
  }
  return null;
}

function RejectModal({
  targets, reasons, onClose, onConfirm,
}: {
  targets: QueueItem[] | null;
  reasons: ReasonTemplate[];
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');

  useEffect(() => { if (targets) setReason(''); }, [targets]);

  if (!targets) return null;

  return (
    <Modal
      isOpen={!!targets}
      onClose={onClose}
      title={`Reject ${targets.length} item${targets.length === 1 ? '' : 's'}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={() => onConfirm(reason)}>Reject</Button>
        </>
      }
    >
      <div className="space-y-3">
        {reasons.length > 0 && (
          <Select
            label="Quick reason"
            value=""
            onChange={(e) => setReason(e.target.value)}
            options={[{ value: '', label: 'Choose a template...' }, ...reasons.map((r) => ({ value: r.text, label: r.text }))]}
          />
        )}
        <Textarea label="Reason (optional, shown in the audit log)" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>
    </Modal>
  );
}

function ManageReasonsModal({
  isOpen, onClose, reasons, onChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  reasons: ReasonTemplate[];
  onChange: (r: ReasonTemplate[]) => void;
}) {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const add = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const data = await adminFetch('/api/admin/moderation-reasons', { method: 'POST', body: JSON.stringify({ text }) });
      onChange([...reasons, { id: data.id, text }]);
      setText('');
    } catch (err: any) {
      toast({ title: 'Failed to add reason', description: err.message, variant: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await adminFetch(`/api/admin/moderation-reasons/${id}`, { method: 'DELETE' });
      onChange(reasons.filter((r) => r.id !== id));
    } catch (err: any) {
      toast({ title: 'Failed to delete reason', description: err.message, variant: 'danger' });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rejection Reason Templates">
      <div className="mb-4 space-y-2">
        {reasons.length === 0 ? (
          <p className="text-body-sm text-foreground-subtle">No templates yet — add common rejection reasons below to reuse from the Reject dialog.</p>
        ) : (
          reasons.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-md border border-border p-2">
              <p className="text-body-sm text-foreground">{r.text}</p>
              <IconButton label="Delete" size="sm" onClick={() => remove(r.id)}><Trash2 className="h-3.5 w-3.5 text-danger" /></IconButton>
            </div>
          ))
        )}
      </div>
      <div className="flex items-end gap-2 border-t border-border pt-4">
        <Input label="New reason" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Doesn't meet content guidelines" className="flex-1" />
        <Button loading={saving} onClick={add} disabled={!text.trim()}>Add</Button>
      </div>
    </Modal>
  );
}
