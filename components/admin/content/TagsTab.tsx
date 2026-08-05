'use client';

import { useEffect, useState } from 'react';
import { Tag as TagIcon, Pencil, Trash2 } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { LoadingState, EmptyState, ErrorState } from '@/components/admin/States';
import { IconButton } from '@/components/ui/IconButton';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { useToast } from '@/components/ui/Toast';

interface TagRow {
  tag: string;
  count: number;
  byType: Record<string, number>;
}

const TYPE_LABELS: Record<string, string> = {
  sermons: 'Sermons', events: 'Events', pastors: 'Pastors', series: 'Series', speakers: 'Speakers',
  ministries: 'Ministries', announcements: 'Announcements', blog: 'Blog', smallGroups: 'Small Groups',
  testimonials: 'Testimonials', resources: 'Resources',
};

export default function TagsTab() {
  const [tags, setTags] = useState<TagRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<TagRow | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleting, setDeleting] = useState<TagRow | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    setError(null);
    adminFetch('/api/admin/content-tags')
      .then((data) => setTags(data.tags))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const submitRename = async () => {
    if (!renaming || !renameValue.trim()) return;
    setSaving(true);
    try {
      const data = await adminFetch('/api/admin/content-tags', {
        method: 'PATCH',
        body: JSON.stringify({ oldTag: renaming.tag, newTag: renameValue.trim() }),
      });
      toast({ title: `Renamed across ${data.updated} ${data.updated === 1 ? 'item' : 'items'}`, variant: 'success' });
      setRenaming(null);
      load();
    } catch (err: any) {
      toast({ title: 'Failed to rename tag', description: err.message, variant: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  const submitDelete = async () => {
    if (!deleting) return;
    try {
      const data = await adminFetch('/api/admin/content-tags', {
        method: 'PATCH',
        body: JSON.stringify({ oldTag: deleting.tag }),
      });
      toast({ title: `Removed from ${data.updated} ${data.updated === 1 ? 'item' : 'items'}`, variant: 'success' });
      setDeleting(null);
      load();
    } catch (err: any) {
      toast({ title: 'Failed to delete tag', description: err.message, variant: 'danger' });
    }
  };

  if (loading) return <LoadingState label="Loading tags..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-title-lg text-foreground">Tags ({tags.length})</h2>
        <p className="text-body-sm text-foreground-subtle">
          Every tag in use across all content types. Renaming or deleting here applies everywhere the tag appears.
        </p>
      </div>

      {tags.length === 0 ? (
        <EmptyState icon={TagIcon} title="No tags yet" description="Add tags to any piece of content from its edit form to build a taxonomy here." />
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {tags.map((row) => (
            <li key={row.tag} className="flex flex-wrap items-center justify-between gap-3 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="neutral">{row.tag}</Badge>
                <span className="text-body-sm text-foreground-subtle">
                  {row.count} {row.count === 1 ? 'item' : 'items'} —{' '}
                  {Object.entries(row.byType).map(([type, n], i, arr) => (
                    <span key={type}>
                      {TYPE_LABELS[type] ?? type} ({n}){i < arr.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <IconButton label="Rename" size="sm" onClick={() => { setRenaming(row); setRenameValue(row.tag); }}>
                  <Pencil className="h-3.5 w-3.5" />
                </IconButton>
                <IconButton label="Delete" size="sm" onClick={() => setDeleting(row)}>
                  <Trash2 className="h-3.5 w-3.5 text-danger" />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        isOpen={!!renaming}
        onClose={() => setRenaming(null)}
        title={`Rename "${renaming?.tag}"`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRenaming(null)}>Cancel</Button>
            <Button onClick={submitRename} loading={saving}>{saving ? 'Renaming...' : 'Rename'}</Button>
          </>
        }
      >
        <Input
          label="New tag name"
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          hint={`Applies to all ${renaming?.count ?? 0} tagged items`}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!deleting}
        title={`Delete tag "${deleting?.tag}"`}
        consequence={`This removes the tag from all ${deleting?.count ?? 0} items that carry it. The items themselves are not deleted.`}
        confirmLabel="Delete Tag"
        onConfirm={submitDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
