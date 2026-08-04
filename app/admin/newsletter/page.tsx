'use client';

import { useEffect, useState } from 'react';
import { Send, Users, Mail } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { LoadingState, EmptyState } from '@/components/admin/States';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

interface Campaign {
  id: string;
  subject: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  sentAt?: { seconds: number } | string;
}

function formatTimestamp(value: Campaign['sentAt']): string {
  if (!value) return '—';
  if (typeof value === 'string') return new Date(value).toLocaleString();
  if (typeof value === 'object' && 'seconds' in value) return new Date(value.seconds * 1000).toLocaleString();
  return '—';
}

export default function NewsletterPage() {
  const [count, setCount] = useState<number | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      adminFetch('/api/admin/newsletter/subscribers'),
      adminFetch('/api/admin/newsletter/campaigns'),
    ])
      .then(([subs, camps]) => {
        setCount(subs.count);
        setCampaigns(camps.campaigns);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const send = async () => {
    if (!confirm(`Send this email to ${count} subscriber${count === 1 ? '' : 's'}? This can't be undone.`)) return;
    setSending(true);
    setResult(null);
    try {
      const data = await adminFetch('/api/admin/newsletter/campaigns', {
        method: 'POST',
        body: JSON.stringify({ subject, body }),
      });
      setResult(`Sent to ${data.sent} of ${data.sent + data.failed} subscribers.${data.failed ? ` ${data.failed} failed.` : ''}`);
      setSubject('');
      setBody('');
      load();
    } catch (err: any) {
      setResult(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingState label="Loading newsletter..." />;

  return (
    <div>
      <h1 className="mb-6 text-headline-md text-foreground">Newsletter</h1>

      <div className="mb-6 flex items-center gap-2 text-body-sm text-foreground-muted">
        <Users className="h-4 w-4" /> {count} active subscriber{count === 1 ? '' : 's'}
      </div>

      <Card className="mb-8 max-w-2xl">
        <h2 className="mb-4 text-title-lg text-foreground">New Campaign</h2>
        <div className="space-y-4">
          <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <Textarea
            label="Body (HTML)"
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="<p>This week at Salem PBC...</p>"
            hint="An unsubscribe link is appended automatically."
            className="font-mono"
          />
          {result && <p className="text-body-sm text-foreground-muted">{result}</p>}
          <Button leftIcon={<Send className="h-4 w-4" />} loading={sending} disabled={!subject || !body || !count} onClick={send}>
            {sending ? 'Sending...' : `Send to ${count ?? 0} Subscribers`}
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
                <th className="p-3 text-label text-foreground-subtle">Sent</th>
                <th className="p-3 text-label text-foreground-subtle">Recipients</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="p-3 text-foreground">{c.subject}</td>
                  <td className="p-3 text-foreground-muted">{formatTimestamp(c.sentAt)}</td>
                  <td className="p-3 text-foreground-muted">{c.sentCount}/{c.recipientCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
