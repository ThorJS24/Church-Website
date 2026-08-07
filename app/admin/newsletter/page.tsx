'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Send, Users, Mail, Bold, Italic, Link as LinkIcon, Heading2, List, Sparkles, Archive } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { LoadingState, EmptyState } from '@/components/admin/States';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/lib/toast';

interface Campaign {
  id: string;
  subject: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  segmentTag?: string | null;
  sentAt?: string;
}

interface Subscriber {
  id: string;
  email: string;
  status: string;
  tags?: string[];
}

function formatTimestamp(value?: string): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
}

export default function NewsletterPage() {
  const [count, setCount] = useState<number | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [segmentTag, setSegmentTag] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [compiling, setCompiling] = useState(false);
  const [tab, setTab] = useState<'compose' | 'subscribers'>('compose');
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    Promise.all([
      adminFetch('/api/admin/newsletter/subscribers'),
      adminFetch('/api/admin/newsletter/campaigns'),
    ])
      .then(([subs, camps]) => {
        setCount(subs.count);
        setSubscribers(subs.subscribers || []);
        setCampaigns(camps.campaigns);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const allTags = useMemo(() => Array.from(new Set(subscribers.flatMap((s) => s.tags || []))), [subscribers]);
  const segmentCount = segmentTag ? subscribers.filter((s) => s.status === 'subscribed' && (s.tags || []).includes(segmentTag)).length : count ?? 0;

  const send = async () => {
    if (!confirm(`Send this email to ${segmentCount} subscriber${segmentCount === 1 ? '' : 's'}? This can't be undone.`)) return;
    setSending(true);
    setResult(null);
    try {
      const data = await adminFetch('/api/admin/newsletter/campaigns', {
        method: 'POST',
        body: JSON.stringify({ subject, body, segmentTag: segmentTag || undefined }),
      });
      setResult(`Sent to ${data.sent} of ${data.sent + data.failed} subscribers.${data.failed ? ` ${data.failed} failed.` : ''}`);
      setSubject('');
      setBody('');
      setSegmentTag('');
      load();
    } catch (err: any) {
      setResult(err.message);
    } finally {
      setSending(false);
    }
  };

  const wrapSelection = (before: string, after: string = before) => {
    const el = bodyRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = body.slice(start, end) || 'text';
    const next = body.slice(0, start) + before + selected + after + body.slice(end);
    setBody(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  const insertLink = () => {
    const url = prompt('Link URL:', 'https://');
    if (!url) return;
    wrapSelection('<a href="' + url + '">', '</a>');
  };

  const compileDigest = async () => {
    setCompiling(true);
    try {
      const [sermonsRes, eventsRes, announcementsRes] = await Promise.all([
        adminFetch('/api/admin/content/sermons'),
        adminFetch('/api/admin/content/events'),
        adminFetch('/api/admin/content/announcements'),
      ]);
      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const recentSermons = (sermonsRes.items || [])
        .filter((s: any) => s.status !== 'draft' && new Date(s.date).getTime() >= cutoff)
        .slice(0, 3);
      const upcomingEvents = (eventsRes.items || [])
        .filter((e: any) => e.status !== 'draft' && new Date(e.startDate).getTime() >= Date.now())
        .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, 3);
      const activeAnnouncements = (announcementsRes.items || []).filter((a: any) => a.status !== 'draft').slice(0, 3);

      const section = (title: string, items: string[]) =>
        items.length ? `<h2>${title}</h2><ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>` : '';

      const html = [
        '<p>This week at Salem PBC...</p>',
        section('Recent Sermons', recentSermons.map((s: any) => `${s.title}${s.speakerName ? ` — ${s.speakerName}` : ''}`)),
        section('Upcoming Events', upcomingEvents.map((e: any) => `${e.title} — ${new Date(e.startDate).toLocaleDateString()}`)),
        section('Announcements', activeAnnouncements.map((a: any) => a.title)),
      ].filter(Boolean).join('\n');

      setSubject(`This Week at Salem PBC — ${new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}`);
      setBody(html);
      toast({ title: 'Digest compiled from recent content', variant: 'success' });
    } catch (err: any) {
      toast({ title: 'Failed to compile digest', description: err.message, variant: 'danger' });
    } finally {
      setCompiling(false);
    }
  };

  const saveTags = async (subscriber: Subscriber, tagsInput: string) => {
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    try {
      await adminFetch(`/api/admin/newsletter/subscribers/${subscriber.id}`, { method: 'PATCH', body: JSON.stringify({ tags }) });
      setSubscribers((prev) => prev.map((s) => (s.id === subscriber.id ? { ...s, tags } : s)));
      toast({ title: 'Tags updated', variant: 'success' });
    } catch (err: any) {
      toast({ title: 'Failed to update tags', description: err.message, variant: 'danger' });
    }
  };

  if (loading) return <LoadingState label="Loading newsletter..." />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-headline-md text-foreground">Newsletter</h1>
        <a href="/newsletter/archive" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-body-sm text-accent hover:underline">
          <Archive className="h-4 w-4" /> View public archive
        </a>
      </div>

      <div className="mb-6 flex items-center gap-2 text-body-sm text-foreground-muted">
        <Users className="h-4 w-4" /> {count} active subscriber{count === 1 ? '' : 's'}
      </div>

      <div className="mb-4 flex items-center gap-1 border-b border-border">
        <button onClick={() => setTab('compose')} className={`px-3 py-2 text-body-sm font-medium ${tab === 'compose' ? 'border-b-2 border-accent text-foreground' : 'text-foreground-muted'}`}>Compose</button>
        <button onClick={() => setTab('subscribers')} className={`px-3 py-2 text-body-sm font-medium ${tab === 'subscribers' ? 'border-b-2 border-accent text-foreground' : 'text-foreground-muted'}`}>Subscribers ({subscribers.length})</button>
      </div>

      {tab === 'compose' ? (
        <>
          <Card className="mb-8 max-w-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-title-lg text-foreground">New Campaign</h2>
              <Button variant="outline" size="sm" leftIcon={<Sparkles className="h-3.5 w-3.5" />} loading={compiling} onClick={compileDigest}>
                {compiling ? 'Compiling...' : 'Compile Digest'}
              </Button>
            </div>
            <div className="space-y-4">
              <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />

              {allTags.length > 0 && (
                <Select
                  label="Send to"
                  value={segmentTag}
                  onChange={(e) => setSegmentTag(e.target.value)}
                  options={[{ value: '', label: 'All subscribers' }, ...allTags.map((t) => ({ value: t, label: `Tagged "${t}"` }))]}
                />
              )}

              <div>
                <label className="mb-1.5 block text-label text-foreground">Body (HTML)</label>
                <div className="mb-1.5 flex items-center gap-1 rounded-t-md border border-b-0 border-border bg-surface p-1.5">
                  <IconButton label="Bold" size="sm" onClick={() => wrapSelection('<strong>', '</strong>')}><Bold className="h-3.5 w-3.5" /></IconButton>
                  <IconButton label="Italic" size="sm" onClick={() => wrapSelection('<em>', '</em>')}><Italic className="h-3.5 w-3.5" /></IconButton>
                  <IconButton label="Heading" size="sm" onClick={() => wrapSelection('<h2>', '</h2>')}><Heading2 className="h-3.5 w-3.5" /></IconButton>
                  <IconButton label="List item" size="sm" onClick={() => wrapSelection('<li>', '</li>')}><List className="h-3.5 w-3.5" /></IconButton>
                  <IconButton label="Link" size="sm" onClick={insertLink}><LinkIcon className="h-3.5 w-3.5" /></IconButton>
                </div>
                <Textarea
                  ref={bodyRef}
                  aria-label="Body (HTML)"
                  rows={10}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="<p>This week at Salem PBC...</p>"
                  hint="A preferences/unsubscribe footer is appended automatically."
                  className="rounded-t-none font-mono"
                />
              </div>

              {result && <p className="text-body-sm text-foreground-muted">{result}</p>}
              <Button leftIcon={<Send className="h-4 w-4" />} loading={sending} disabled={!subject || !body || !segmentCount} onClick={send}>
                {sending ? 'Sending...' : `Send to ${segmentCount} Subscriber${segmentCount === 1 ? '' : 's'}`}
              </Button>
            </div>
          </Card>

          <h2 className="mb-3 text-title-lg text-foreground">Past Campaigns</h2>
          {campaigns.length === 0 ? (
            <EmptyState icon={Mail} title="No campaigns sent yet" />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-body-sm">
                <thead className="bg-surface">
                  <tr>
                    <th className="p-3 text-label text-foreground-subtle">Subject</th>
                    <th className="p-3 text-label text-foreground-subtle">Segment</th>
                    <th className="p-3 text-label text-foreground-subtle">Sent</th>
                    <th className="p-3 text-label text-foreground-subtle">Recipients</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => (
                    <tr key={c.id} className="border-t border-border">
                      <td className="p-3 text-foreground">{c.subject}</td>
                      <td className="p-3 text-foreground-muted">{c.segmentTag ? <Badge variant="accent">{c.segmentTag}</Badge> : 'All'}</td>
                      <td className="p-3 text-foreground-muted">{formatTimestamp(c.sentAt)}</td>
                      <td className="p-3 text-foreground-muted">{c.sentCount}/{c.recipientCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <SubscribersTab subscribers={subscribers} onSaveTags={saveTags} />
      )}
    </div>
  );
}

function SubscribersTab({ subscribers, onSaveTags }: { subscribers: Subscriber[]; onSaveTags: (s: Subscriber, tags: string) => void }) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  if (subscribers.length === 0) {
    return <EmptyState icon={Users} title="No subscribers yet" />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-body-sm">
        <thead className="bg-surface">
          <tr>
            <th className="p-3 text-label text-foreground-subtle">Email</th>
            <th className="p-3 text-label text-foreground-subtle">Status</th>
            <th className="p-3 text-label text-foreground-subtle">Tags (segments)</th>
            <th className="p-3 text-label text-foreground-subtle" />
          </tr>
        </thead>
        <tbody>
          {subscribers.map((s) => {
            const draft = drafts[s.id] ?? (s.tags || []).join(', ');
            return (
              <tr key={s.id} className="border-t border-border">
                <td className="p-3 text-foreground">{s.email}</td>
                <td className="p-3">
                  <Badge variant={s.status === 'subscribed' ? 'success' : 'neutral'}>{s.status}</Badge>
                </td>
                <td className="p-3">
                  <input
                    value={draft}
                    onChange={(e) => setDrafts((prev) => ({ ...prev, [s.id]: e.target.value }))}
                    placeholder="e.g. events, youth"
                    className="w-full rounded-md border border-border bg-background px-2 py-1 text-body-sm text-foreground"
                  />
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => onSaveTags(s, draft)} className="text-caption font-medium text-accent hover:underline">Save</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
