'use client';

import { useEffect, useState } from 'react';
import { Send, Users, Mail } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { LoadingState, EmptyState } from '@/components/admin/States';

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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Newsletter</h1>

      <div className="flex items-center gap-2 mb-6 text-sm text-gray-600 dark:text-gray-300">
        <Users className="w-4 h-4" /> {count} active subscriber{count === 1 ? '' : 's'}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8 max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">New Campaign</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="campaign-subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
            <input
              id="campaign-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="campaign-body" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Body (HTML)</label>
            <textarea
              id="campaign-body"
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="<p>This week at Salem PBC...</p>"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white font-mono text-sm"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">An unsubscribe link is appended automatically.</p>
          </div>
          {result && <p className="text-sm text-gray-700 dark:text-gray-300">{result}</p>}
          <button
            onClick={send}
            disabled={sending || !subject || !body || !count}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> {sending ? 'Sending...' : `Send to ${count ?? 0} Subscribers`}
          </button>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Past Campaigns</h2>
      {campaigns.length === 0 ? (
        <EmptyState icon={Mail} title="No campaigns sent yet" />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                <th className="p-3">Subject</th>
                <th className="p-3">Sent</th>
                <th className="p-3">Recipients</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <td className="p-3 text-gray-700 dark:text-gray-300">{c.subject}</td>
                  <td className="p-3 text-gray-500 dark:text-gray-400">{formatTimestamp(c.sentAt)}</td>
                  <td className="p-3 text-gray-500 dark:text-gray-400">{c.sentCount}/{c.recipientCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
