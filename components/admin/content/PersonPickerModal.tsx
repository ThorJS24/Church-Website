'use client';

import { useEffect, useState } from 'react';
import { Search, UserPlus, User as UserIcon } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { LoadingState, EmptyState } from '@/components/admin/States';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button, buttonClasses } from '@/components/ui/button';
import { useToast } from '@/lib/toast';

export interface PersonOption {
  id: string;
  displayName: string;
  title?: string;
}

interface PersonPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Single-select calls onSelect once and closes; multi-select stays open, toggling selection until Done. */
  mode: 'single' | 'multi';
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onPeopleLoaded?: (people: PersonOption[]) => void;
}

/**
 * Replaces free-text "leader/speaker/organizer name" inputs with a real
 * Person reference — the minimum functional control the domain redesign
 * needs (architecture doc §9, decision 1). Modeled directly on
 * MediaPickerModal: browse existing people, or create a new one inline
 * when the admin confirms this is genuinely a new person (never fabricated
 * automatically — see the migration's unresolved-record rule).
 */
export default function PersonPickerModal({ isOpen, onClose, mode, selectedIds, onChange, onPeopleLoaded }: PersonPickerModalProps) {
  const [people, setPeople] = useState<PersonOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    adminFetch('/api/admin/content/people')
      .then((data) => {
        const items = (data.items ?? []).map((p: any) => ({ id: p.id, displayName: p.displayName, title: p.title }));
        setPeople(items);
        onPeopleLoaded?.(items);
      })
      .catch(() => setPeople([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const toggle = (personId: string) => {
    if (mode === 'single') {
      onChange([personId]);
      onClose();
      return;
    }
    const next = selectedIds.includes(personId)
      ? selectedIds.filter((id) => id !== personId)
      : [...selectedIds, personId];
    onChange(next);
  };

  const createPerson = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const now = new Date().toISOString();
      const result = await adminFetch('/api/admin/content/people', {
        method: 'POST',
        body: JSON.stringify({ displayName: newName.trim(), status: 'active', isStaff: false, createdAt: now, updatedAt: now }),
      });
      const created: PersonOption = { id: result.id, displayName: newName.trim() };
      setPeople((prev) => [...prev, created]);
      setNewName('');
      toggle(created.id);
      toast({ title: `${created.displayName} added`, variant: 'success' });
    } catch (err: any) {
      toast({ title: 'Failed to create person', description: err.message, variant: 'danger' });
    } finally {
      setCreating(false);
    }
  };

  const filtered = people.filter((p) => !search.trim() || p.displayName.toLowerCase().includes(search.toLowerCase()));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'single' ? 'Select Person' : 'Select People'} size="lg">
      <div className="mb-4 flex items-center gap-3">
        <Input
          aria-label="Search people"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          leftIcon={<Search />}
          className="flex-1"
        />
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-border p-3">
        <UserPlus className="h-4 w-4 shrink-0 text-foreground-subtle" />
        <Input
          aria-label="New person's name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Not listed? Add a new person by name"
          className="flex-1"
        />
        <button
          type="button"
          disabled={!newName.trim() || creating}
          onClick={createPerson}
          className={buttonClasses({ size: 'sm', disabled: !newName.trim() || creating })}
        >
          {creating ? 'Adding...' : 'Add'}
        </button>
      </div>

      {loading ? (
        <LoadingState label="Loading people..." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={UserIcon} title="No people found" description="Add one above to get started." />
      ) : (
        <ul className="max-h-80 divide-y divide-border overflow-y-auto rounded-lg border border-border">
          {filtered.map((p) => {
            const selected = selectedIds.includes(p.id);
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => toggle(p.id)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left hover:bg-surface-hover ${selected ? 'bg-accent-subtle' : ''}`}
                >
                  <span>
                    <span className="text-body-sm font-medium text-foreground">{p.displayName}</span>
                    {p.title && <span className="ml-2 text-caption text-foreground-subtle">{p.title}</span>}
                  </span>
                  {selected && <span className="text-caption font-medium text-accent">Selected</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {mode === 'multi' && (
        <div className="mt-4 flex justify-end">
          <Button onClick={onClose}>Done</Button>
        </div>
      )}
    </Modal>
  );
}
