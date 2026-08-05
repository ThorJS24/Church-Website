'use client';

import { useEffect, useMemo, useState } from 'react';
import { Mail, Flag, Reply, MessageSquare, Users2, Settings2, Trash2, Send } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { LoadingState, EmptyState, ErrorState } from '@/components/admin/States';
import { Card } from '@/components/ui-legacy/Card';
import { Badge, type BadgeVariant } from '@/components/ui-legacy/Badge';
import { Select } from '@/components/ui-legacy/Select';
import { Input } from '@/components/ui-legacy/Input';
import { Textarea } from '@/components/ui-legacy/Textarea';
import { Button } from '@/components/ui-legacy/Button';
import { IconButton } from '@/components/ui-legacy/IconButton';
import { Modal } from '@/components/ui-legacy/Modal';
import { useToast } from '@/components/ui-legacy/Toast';
import { cn } from '@/lib/cn';

interface Reply { subject: string; body: string; sentBy: string; sentAt: string }
interface Comment { text: string; authorEmail: string; at: string }
interface AssignedTo { uid: string; email: string }

interface MessageItem {
  id: string;
  collection: 'contacts' | 'serviceRequests';
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  department?: string;
  serviceType?: string;
  subject?: string;
  message?: string;
  preferredDate?: string;
  status?: string;
  notes?: string;
  priority?: 'high' | 'normal';
  assignedTo?: AssignedTo | null;
  replies?: Reply[];
  internalComments?: Comment[];
  createdAt: string;
  details?: Record<string, any>;
}

interface StaffUser { id: string; email: string; role: string; displayName?: string }
interface Template { id: string; name: string; subject: string; body: string }

const TYPE_LABEL: Record<string, string> = {
  general: 'General',
  volunteer: 'Volunteer',
  wedding: 'Wedding Request',
  baptism: 'Baptism Request',
};

const STATUS_OPTIONS = ['new', 'pending', 'contacted', 'closed'];
const STAFF_ROLES = new Set(['moderator', 'admin', 'super_admin']);

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  new: 'info',
  pending: 'warning',
  contacted: 'accent',
  closed: 'neutral',
};

function typeOf(item: MessageItem): string {
  if (item.collection === 'serviceRequests') return TYPE_LABEL[item.serviceType || ''] || 'Service Request';
  return TYPE_LABEL[item.department || 'general'] || item.department || 'General';
}

function nameOf(item: MessageItem): string {
  return item.name || [item.firstName, item.lastName].filter(Boolean).join(' ') || 'Unknown';
}

function searchHaystack(item: MessageItem): string {
  return [
    nameOf(item), item.email, item.phone, item.subject, item.message, item.department, item.serviceType, item.notes,
    ...Object.values(item.details || {}),
  ].filter(Boolean).join(' ').toLowerCase();
}

export default function MessagesPage() {
  const [items, setItems] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [membersByEmail, setMembersByEmail] = useState<Map<string, StaffUser>>(new Map());
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      adminFetch('/api/admin/messages'),
      adminFetch('/api/admin/users').catch(() => ({ users: [] })),
      adminFetch('/api/admin/message-templates').catch(() => ({ templates: [] })),
    ])
      .then(([messagesData, usersData, templatesData]) => {
        setItems(messagesData.items);
        const allUsers: StaffUser[] = usersData.users || [];
        setStaff(allUsers.filter((u) => STAFF_ROLES.has(u.role)));
        setMembersByEmail(new Map(allUsers.map((u) => [String(u.email).toLowerCase(), u])));
        setTemplates(templatesData.templates || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const patch = async (item: MessageItem, body: Record<string, any>) => {
    const key = `${item.collection}-${item.id}`;
    setSaving(key);
    try {
      await adminFetch(`/api/admin/messages/${item.collection}/${item.id}`, { method: 'PATCH', body: JSON.stringify(body) });
      setItems((prev) => prev.map((i) => (i.id === item.id && i.collection === item.collection ? { ...i, ...body } : i)));
    } catch (err: any) {
      toast({ title: 'Failed to update', description: err.message, variant: 'danger' });
    } finally {
      setSaving(null);
    }
  };

  const togglePriority = (item: MessageItem, e: React.MouseEvent) => {
    e.stopPropagation();
    patch(item, { priority: item.priority === 'high' ? 'normal' : 'high' });
  };

  const onReplySent = (item: MessageItem, reply: Reply) => {
    setItems((prev) => prev.map((i) =>
      i.id === item.id && i.collection === item.collection
        ? { ...i, replies: [...(i.replies || []), reply], status: (!i.status || i.status === 'new') ? 'contacted' : i.status }
        : i
    ));
  };

  const onCommentAdded = (item: MessageItem, comment: Comment) => {
    setItems((prev) => prev.map((i) =>
      i.id === item.id && i.collection === item.collection ? { ...i, internalComments: [...(i.internalComments || []), comment] } : i
    ));
  };

  if (loading) return <LoadingState label="Loading messages..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const filtered = items
    .filter((i) => filter === 'all' || (i.status || 'new') === filter)
    .filter((i) => priorityFilter === 'all' || (i.priority || 'normal') === priorityFilter)
    .filter((i) => !query.trim() || searchHaystack(i).includes(query.trim().toLowerCase()));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-headline-md text-foreground">Messages ({items.length})</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Input placeholder="Search all fields..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-56" size="sm" />
          <Select
            aria-label="Filter by priority"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            options={[{ value: 'all', label: 'All priorities' }, { value: 'high', label: 'High priority' }, { value: 'normal', label: 'Normal priority' }]}
            className="w-auto"
            size="sm"
          />
          <Select
            aria-label="Filter by status"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            options={[{ value: 'all', label: 'All statuses' }, ...STATUS_OPTIONS.map(s => ({ value: s, label: s }))]}
            className="w-auto"
            size="sm"
          />
          <Button variant="outline" size="sm" leftIcon={<Settings2 className="h-4 w-4" />} onClick={() => setShowTemplates(true)}>
            Templates
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Mail} title="No messages" description="General contact form submissions, volunteer applications, and wedding/baptism requests will show up here." />
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const key = `${item.collection}-${item.id}`;
            const isOpen = expanded === key;
            const panelId = `message-detail-${key}`;
            const linkedMember = membersByEmail.get(item.email?.toLowerCase() || '');
            const isHigh = item.priority === 'high';
            return (
              <Card key={key} padding="none" className={cn('overflow-hidden', isHigh && 'border-danger/40')}>
                <div className="flex w-full items-center justify-between gap-4 p-4">
                  <button
                    onClick={() => setExpanded(isOpen ? null : key)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-caption font-semibold uppercase tracking-wide text-accent">{typeOf(item)}</span>
                      <Badge variant={STATUS_VARIANT[item.status || 'new'] || 'info'}>{item.status || 'new'}</Badge>
                      {isHigh && <Badge variant="danger" dot>High priority</Badge>}
                      {linkedMember && <Badge variant="accent">Member: {linkedMember.displayName || linkedMember.email}</Badge>}
                      {item.assignedTo && <Badge variant="neutral">Assigned: {item.assignedTo.email}</Badge>}
                    </div>
                    <p className="truncate text-body-sm font-medium text-foreground">{nameOf(item)} &lt;{item.email}&gt;</p>
                    <p className="truncate text-body-sm text-foreground-muted">{item.subject || item.message || 'No message'}</p>
                  </button>
                  <div className="flex shrink-0 items-center gap-2">
                    <IconButton
                      label={isHigh ? 'Remove high priority' : 'Flag as high priority'}
                      size="sm"
                      variant="ghost"
                      className={isHigh ? 'text-danger' : undefined}
                      onClick={(e) => togglePriority(item, e)}
                    >
                      <Flag className={cn('h-3.5 w-3.5', isHigh && 'fill-current')} />
                    </IconButton>
                    <span className="text-caption text-foreground-subtle">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {isOpen && (
                  <div id={panelId}>
                    <MessageDetail
                      item={item}
                      saving={saving === key}
                      staff={staff}
                      linkedMember={linkedMember}
                      templates={templates}
                      onSave={(status, notes) => patch(item, { status, notes })}
                      onAssign={(assignedTo) => patch(item, { assignedTo })}
                      onReplySent={(reply) => onReplySent(item, reply)}
                      onCommentAdded={(comment) => onCommentAdded(item, comment)}
                    />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <TemplatesModal isOpen={showTemplates} onClose={() => setShowTemplates(false)} templates={templates} onChange={setTemplates} />
    </div>
  );
}

function MessageDetail({
  item, saving, staff, linkedMember, templates, onSave, onAssign, onReplySent, onCommentAdded,
}: {
  item: MessageItem;
  saving: boolean;
  staff: StaffUser[];
  linkedMember?: StaffUser;
  templates: Template[];
  onSave: (status: string, notes: string) => void;
  onAssign: (assignedTo: AssignedTo | null) => void;
  onReplySent: (reply: Reply) => void;
  onCommentAdded: (comment: Comment) => void;
}) {
  const [status, setStatus] = useState(item.status || 'new');
  const [notes, setNotes] = useState(item.notes || '');
  const [tab, setTab] = useState<'details' | 'reply' | 'comments'>('details');

  const fields: [string, any][] = Object.entries({
    Phone: item.phone,
    'Preferred Date': item.preferredDate,
    Message: item.message,
    ...(item.details || {}),
  }).filter(([, v]) => v !== undefined && v !== null && v !== '');

  return (
    <div className="border-t border-border bg-surface p-4">
      {linkedMember && (
        <p className="mb-3 rounded-md bg-accent-subtle px-3 py-2 text-body-sm text-accent">
          Matches member account <strong>{linkedMember.displayName || linkedMember.email}</strong> ({linkedMember.role}).
        </p>
      )}

      <dl className="mb-4 grid grid-cols-1 gap-x-6 gap-y-2 text-body-sm sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label}>
            <dt className="capitalize text-foreground-subtle">{label}</dt>
            <dd className="wrap-break-word text-foreground">{Array.isArray(value) ? value.join(', ') : String(value)}</dd>
          </div>
        ))}
      </dl>

      <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-end">
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} options={STATUS_OPTIONS.map(s => ({ value: s, label: s }))} size="sm" className="w-auto" />
        <Input label="Notes" size="sm" value={notes} onChange={(e) => setNotes(e.target.value)} className="min-w-[200px] flex-1" />
        <Select
          label="Assign to"
          size="sm"
          className="w-auto"
          value={item.assignedTo?.uid || ''}
          onChange={(e) => {
            const staffMember = staff.find((s) => s.id === e.target.value);
            onAssign(staffMember ? { uid: staffMember.id, email: staffMember.email } : null);
          }}
          options={[{ value: '', label: 'Unassigned' }, ...staff.map((s) => ({ value: s.id, label: s.displayName || s.email }))]}
        />
        <Button size="sm" loading={saving} onClick={() => onSave(status, notes)}>{saving ? 'Saving...' : 'Save'}</Button>
      </div>

      <div className="mb-3 flex items-center gap-1 border-b border-border">
        {([
          ['details', 'Reply History', Reply],
          ['comments', 'Internal Comments', MessageSquare],
        ] as const).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-body-sm font-medium',
              tab === key ? 'border-b-2 border-accent text-foreground' : 'text-foreground-muted hover:text-foreground'
            )}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      {tab !== 'comments' && (
        <ReplyPanel item={item} templates={templates} onReplySent={onReplySent} />
      )}
      {tab === 'comments' && (
        <CommentsPanel item={item} onCommentAdded={onCommentAdded} />
      )}
    </div>
  );
}

function ReplyPanel({ item, templates, onReplySent }: { item: MessageItem; templates: Template[]; onReplySent: (reply: Reply) => void }) {
  const [subject, setSubject] = useState(item.subject ? `Re: ${item.subject}` : `Re: your message to Salem PBC`);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const applyTemplate = (id: string) => {
    const t = templates.find((tpl) => tpl.id === id);
    if (t) { setSubject(t.subject); setBody(t.body); }
  };

  const send = async () => {
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    try {
      const data = await adminFetch(`/api/admin/messages/${item.collection}/${item.id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ subject, body }),
      });
      onReplySent(data.reply);
      setBody('');
      toast({ title: 'Reply sent', variant: 'success' });
    } catch (err: any) {
      toast({ title: 'Failed to send reply', description: err.message, variant: 'danger' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-3">
      {(item.replies?.length ?? 0) > 0 && (
        <ul className="space-y-2 rounded-md border border-border p-2">
          {item.replies!.map((r, i) => (
            <li key={i} className="rounded-md bg-background p-2 text-body-sm">
              <p className="font-medium text-foreground">{r.subject}</p>
              <p className="whitespace-pre-wrap text-foreground-muted">{r.body}</p>
              <p className="mt-1 text-caption text-foreground-subtle">{r.sentBy} — {new Date(r.sentAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
      {templates.length > 0 && (
        <Select
          size="sm"
          className="w-auto"
          aria-label="Insert canned response"
          value=""
          onChange={(e) => applyTemplate(e.target.value)}
          options={[{ value: '', label: 'Insert canned response...' }, ...templates.map((t) => ({ value: t.id, label: t.name }))]}
        />
      )}
      <Input label="Subject" size="sm" value={subject} onChange={(e) => setSubject(e.target.value)} />
      <Textarea label="Reply" rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder={`Hi ${nameOf(item)},`} />
      <Button size="sm" leftIcon={<Send className="h-3.5 w-3.5" />} loading={sending} onClick={send} disabled={!subject.trim() || !body.trim()}>
        {sending ? 'Sending...' : `Send to ${item.email}`}
      </Button>
    </div>
  );
}

function CommentsPanel({ item, onCommentAdded }: { item: MessageItem; onCommentAdded: (comment: Comment) => void }) {
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const { toast } = useToast();

  const post = async () => {
    if (!text.trim()) return;
    setPosting(true);
    try {
      const data = await adminFetch(`/api/admin/messages/${item.collection}/${item.id}/comment`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      onCommentAdded(data.comment);
      setText('');
    } catch (err: any) {
      toast({ title: 'Failed to add comment', description: err.message, variant: 'danger' });
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="space-y-3">
      {(item.internalComments?.length ?? 0) > 0 ? (
        <ul className="space-y-2">
          {item.internalComments!.map((c, i) => (
            <li key={i} className="rounded-md border border-border p-2 text-body-sm">
              <p className="text-foreground">{c.text}</p>
              <p className="mt-1 text-caption text-foreground-subtle">{c.authorEmail} — {new Date(c.at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-body-sm text-foreground-subtle">No internal comments yet — visible only to staff, never sent to the sender.</p>
      )}
      <div className="flex items-end gap-2">
        <Textarea label="Add a comment" rows={2} value={text} onChange={(e) => setText(e.target.value)} className="flex-1" />
        <Button size="sm" loading={posting} onClick={post} disabled={!text.trim()}>{posting ? 'Posting...' : 'Post'}</Button>
      </div>
    </div>
  );
}

function TemplatesModal({ isOpen, onClose, templates, onChange }: { isOpen: boolean; onClose: () => void; templates: Template[]; onChange: (t: Template[]) => void }) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const create = async () => {
    if (!name.trim() || !subject.trim() || !body.trim()) return;
    setSaving(true);
    try {
      const data = await adminFetch('/api/admin/message-templates', { method: 'POST', body: JSON.stringify({ name, subject, body }) });
      onChange([...templates, { id: data.id, name, subject, body }]);
      setName(''); setSubject(''); setBody('');
      toast({ title: 'Template saved', variant: 'success' });
    } catch (err: any) {
      toast({ title: 'Failed to save template', description: err.message, variant: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await adminFetch(`/api/admin/message-templates/${id}`, { method: 'DELETE' });
      onChange(templates.filter((t) => t.id !== id));
    } catch (err: any) {
      toast({ title: 'Failed to delete template', description: err.message, variant: 'danger' });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Canned Response Templates">
      <div className="mb-4 space-y-4">
        {templates.length === 0 ? (
          <p className="text-body-sm text-foreground-subtle">No templates yet — add one below to reuse it from any reply composer.</p>
        ) : (
          <ul className="space-y-2">
            {templates.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2 rounded-md border border-border p-2">
                <div className="min-w-0">
                  <p className="truncate text-body-sm font-medium text-foreground">{t.name}</p>
                  <p className="truncate text-caption text-foreground-subtle">{t.subject}</p>
                </div>
                <IconButton label="Delete template" size="sm" onClick={() => remove(t.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-danger" />
                </IconButton>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="space-y-3 border-t border-border pt-4">
        <Input label="Template name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Volunteer follow-up" />
        <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <Textarea label="Body" rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
        <Button size="sm" leftIcon={<Users2 className="h-3.5 w-3.5" />} loading={saving} onClick={create} disabled={!name.trim() || !subject.trim() || !body.trim()}>
          {saving ? 'Saving...' : 'Add Template'}
        </Button>
      </div>
    </Modal>
  );
}
