'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users, ShieldCheck, Calendar, TrendingUp, ScrollText, AlertCircle,
  Inbox, UserPlus, Megaphone, Clock, Mail, MessageSquare,
} from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { LoadingState, ErrorState } from '@/components/admin/States';
import { Card } from '@/components/ui/card';
import { Grid } from '@/components/ui/grid';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/lib/toast';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  newUsersThisWeek: number;
  totalEvents: number;
  prayerRequests: number;
  pendingModerationCount: number;
  monthlyGrowth: number;
  roleDistribution: Record<string, number>;
  staleContentCount: number;
}

interface AuditEntry {
  id: string;
  actorEmail: string;
  action: string;
}

interface NextEvent {
  id: string;
  title: string;
  startDate: string;
  location?: string;
}

interface RecentMember {
  id: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
  welcomed?: boolean;
}

interface FeedItem {
  id: string;
  feedType: 'message' | 'moderation';
  collection: string;
  createdAt?: string;
  name?: string;
  firstName?: string;
  subject?: string;
  title?: string;
  content?: string;
}

function timeAgo(iso?: string) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 0) return `${days}d ago`;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 0) return `${hours}h ago`;
  const mins = Math.max(1, Math.floor(diff / (1000 * 60)));
  return `${mins}m ago`;
}

function feedItemLabel(item: FeedItem): { title: string; subtitle: string } {
  if (item.feedType === 'message') {
    return {
      title: item.subject || (item.collection === 'serviceRequests' ? 'Service request' : 'Contact message'),
      subtitle: item.name || item.firstName || 'Unknown sender',
    };
  }
  return {
    title: item.title || `New ${item.collection.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
    subtitle: item.content ? String(item.content).slice(0, 60) : 'Pending review',
  };
}

const ROLE_LABELS: Record<string, string> = { member: 'Member', moderator: 'Moderator', admin: 'Admin', super_admin: 'Super Admin' };
const ROLE_COLORS: Record<string, string> = {
  member: 'bg-foreground-subtle', moderator: 'bg-info', admin: 'bg-accent', super_admin: 'bg-warm',
};

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActions, setRecentActions] = useState<AuditEntry[]>([]);
  const [nextEvent, setNextEvent] = useState<NextEvent | null>(null);
  const [recentMembers, setRecentMembers] = useState<RecentMember[]>([]);
  const [activityByDay, setActivityByDay] = useState<{ date: string; count: number }[]>([]);
  const [pendingFeed, setPendingFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showComposer, setShowComposer] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    adminFetch('/api/admin/stats')
      .then((data) => {
        setStats(data.stats);
        setRecentActions(data.recentActions || []);
        setNextEvent(data.nextEvent || null);
        setRecentMembers(data.recentMembers || []);
        setActivityByDay(data.auditActivityByDay || []);
        setPendingFeed(data.pendingItemsFeed || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleWelcomed = async (member: RecentMember) => {
    try {
      await adminFetch('/api/admin/users', { method: 'PATCH', body: JSON.stringify({ userId: member.id, welcomed: !member.welcomed }) });
      setRecentMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, welcomed: !m.welcomed } : m)));
    } catch (err: any) {
      toast({ title: 'Could not update', description: err.message, variant: 'danger' });
    }
  };

  if (loading) return <LoadingState label="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!stats) return null;

  const cards = [
    { label: 'New Members This Week', value: stats.newUsersThisWeek, icon: Users, tone: 'text-info bg-info-subtle' },
    { label: 'Pending Moderation', value: stats.pendingModerationCount, icon: ShieldCheck, tone: 'text-warning bg-warning-subtle', href: '/admin/moderation' },
    { label: 'Upcoming Events', value: stats.totalEvents, icon: Calendar, tone: 'text-success bg-success-subtle' },
    { label: 'Member Growth (mo/mo)', value: `${stats.monthlyGrowth}%`, icon: TrendingUp, tone: 'text-accent bg-accent-subtle' },
    { label: 'Content Needing a Refresh', value: stats.staleContentCount, icon: AlertCircle, tone: 'text-warm bg-warm-subtle' },
  ];

  const maxActivity = Math.max(1, ...activityByDay.map((d) => d.count));
  const totalByRole = Object.values(stats.roleDistribution).reduce((a, b) => a + b, 0) || 1;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-headline-md text-foreground">Dashboard</h1>
        <Button leftIcon={<Megaphone className="h-4 w-4" />} onClick={() => setShowComposer(true)}>
          Post Announcement
        </Button>
      </div>

      {nextEvent && (
        <Card className="mb-6 flex items-center justify-between bg-accent-subtle">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-accent" />
            <div>
              <p className="text-body-sm font-medium text-foreground">Next up: {nextEvent.title}</p>
              <p className="text-caption text-foreground-muted">
                {new Date(nextEvent.startDate).toLocaleString(undefined, { weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                {nextEvent.location ? ` · ${nextEvent.location}` : ''}
              </p>
            </div>
          </div>
          <Link href="/admin/content" className="text-caption text-accent hover:underline dark:text-accent-hover">Manage events</Link>
        </Card>
      )}

      <Grid cols={5} gap={4} className="mb-8">
        {cards.map((card) => {
          const content = (
            <Card variant="interactive" padding="md">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${card.tone}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div className="text-headline-sm text-foreground">{card.value}</div>
              <div className="text-body-sm text-foreground-muted">{card.label}</div>
            </Card>
          );
          return card.href ? (
            <Link key={card.label} href={card.href}>{content}</Link>
          ) : (
            <div key={card.label}>{content}</div>
          );
        })}
      </Grid>

      <Grid cols={2} gap={6} className="mb-6">
        <Card>
          <h2 className="mb-4 text-title-md text-foreground">Membership</h2>
          <dl className="mb-5 space-y-3 text-body-sm">
            <div className="flex justify-between">
              <dt className="text-foreground-muted">Total members</dt>
              <dd className="font-medium text-foreground">{stats.totalUsers}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-foreground-muted">Active</dt>
              <dd className="font-medium text-foreground">{stats.activeUsers}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-foreground-muted">New this month</dt>
              <dd className="font-medium text-foreground">{stats.newUsersThisMonth}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-foreground-muted">Prayer requests (all time)</dt>
              <dd className="font-medium text-foreground">{stats.prayerRequests}</dd>
            </div>
          </dl>

          <p className="mb-2 text-label text-foreground-subtle">Role distribution</p>
          <div className="mb-1 flex h-2.5 overflow-hidden rounded-full bg-surface-active">
            {Object.entries(stats.roleDistribution).map(([role, count]) => (
              count > 0 && (
                <div key={role} className={ROLE_COLORS[role]} style={{ width: `${(count / totalByRole) * 100}%` }} title={`${ROLE_LABELS[role] || role}: ${count}`} />
              )
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {Object.entries(stats.roleDistribution).map(([role, count]) => (
              <span key={role} className="flex items-center gap-1.5 text-caption text-foreground-muted">
                <span className={`h-2 w-2 rounded-full ${ROLE_COLORS[role]}`} /> {ROLE_LABELS[role] || role} ({count})
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-title-md text-foreground">Recent Admin Actions</h2>
            <Link href="/admin/audit-log" className="flex items-center gap-1 text-caption text-accent hover:underline dark:text-accent-hover">
              <ScrollText className="h-3 w-3" /> View all
            </Link>
          </div>
          {recentActions.length === 0 ? (
            <p className="mb-5 text-body-sm text-foreground-muted">No admin actions recorded yet.</p>
          ) : (
            <ul className="mb-5 space-y-3 text-body-sm">
              {recentActions.slice(0, 6).map((entry) => (
                <li key={entry.id} className="border-b border-border pb-2 last:border-0">
                  <span className="text-foreground-muted">
                    <span className="font-medium text-foreground">{entry.actorEmail}</span> — {entry.action}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <p className="mb-2 text-label text-foreground-subtle">Staff activity, last 14 days</p>
          <div className="flex h-16 items-end gap-1">
            {activityByDay.map((day) => (
              <div
                key={day.date}
                className="flex-1 rounded-t bg-accent/70 transition-all hover:bg-accent"
                style={{ height: `${Math.max(6, (day.count / maxActivity) * 100)}%` }}
                title={`${day.date}: ${day.count} action${day.count === 1 ? '' : 's'}`}
              />
            ))}
          </div>
        </Card>
      </Grid>

      <Grid cols={2} gap={6}>
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Inbox className="h-4 w-4 text-foreground-subtle" />
            <h2 className="text-title-md text-foreground">Needs Attention</h2>
          </div>
          {pendingFeed.length === 0 ? (
            <p className="text-body-sm text-foreground-muted">Nothing pending — inbox is clear.</p>
          ) : (
            <ul className="space-y-3">
              {pendingFeed.map((item) => {
                const { title, subtitle } = feedItemLabel(item);
                const href = item.feedType === 'message' ? '/admin/messages' : '/admin/moderation';
                return (
                  <li key={`${item.feedType}-${item.id}`}>
                    <Link href={href} className="flex items-start gap-2.5 rounded-md p-1.5 -mx-1.5 hover:bg-surface-hover">
                      {item.feedType === 'message' ? <Mail className="mt-0.5 h-4 w-4 shrink-0 text-info" /> : <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-warning" />}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-body-sm font-medium text-foreground">{title}</p>
                        <p className="truncate text-caption text-foreground-subtle">{subtitle}</p>
                      </div>
                      <span className="shrink-0 text-caption text-foreground-subtle">{timeAgo(item.createdAt)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-foreground-subtle" />
            <h2 className="text-title-md text-foreground">New-Member Welcome Queue</h2>
          </div>
          {recentMembers.length === 0 ? (
            <p className="text-body-sm text-foreground-muted">No recent registrations.</p>
          ) : (
            <ul className="space-y-3">
              {recentMembers.map((member) => (
                <li key={member.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-sm font-medium text-foreground">
                      {member.displayName || [member.firstName, member.lastName].filter(Boolean).join(' ') || member.email}
                    </p>
                    <p className="truncate text-caption text-foreground-subtle">{member.email} · {timeAgo(member.createdAt)}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={member.welcomed ? 'secondary' : 'primary'}
                    onClick={() => toggleWelcomed(member)}
                  >
                    {member.welcomed ? 'Welcomed' : 'Mark welcomed'}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </Grid>

      <AnnouncementComposer isOpen={showComposer} onClose={() => setShowComposer(false)} onPosted={load} />
    </div>
  );
}

function AnnouncementComposer({ isOpen, onClose, onPosted }: { isOpen: boolean; onClose: () => void; onPosted: () => void }) {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      await adminFetch('/api/admin/content/announcements', {
        method: 'POST',
        body: JSON.stringify({ title, content, date: new Date().toISOString().slice(0, 10), status: 'published' }),
      });
      toast({ title: 'Announcement posted', variant: 'success' });
      setTitle('');
      setContent('');
      onClose();
      onPosted();
    } catch (err: any) {
      toast({ title: 'Could not post announcement', description: err.message, variant: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Post Announcement">
      <div className="space-y-4">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Textarea label="Content" rows={5} value={content} onChange={(e) => setContent(e.target.value)} required />
        <p className="text-caption text-foreground-subtle">Posts immediately as published — for a scheduled or draft announcement, use Content → Announcements instead.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button loading={saving} disabled={!title.trim() || !content.trim()} onClick={submit}>Post</Button>
        </div>
      </div>
    </Modal>
  );
}
