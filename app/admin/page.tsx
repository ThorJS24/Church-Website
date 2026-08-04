'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, ShieldCheck, Calendar, TrendingUp, ScrollText } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { LoadingState, ErrorState } from '@/components/admin/States';
import { Card } from '@/components/ui/Card';
import { Grid } from '@/components/ui/Grid';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  newUsersThisWeek: number;
  totalEvents: number;
  prayerRequests: number;
  pendingModerationCount: number;
  monthlyGrowth: number;
}

interface AuditEntry {
  id: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  timestamp: { toDate?: () => Date } | null;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActions, setRecentActions] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    adminFetch('/api/admin/stats')
      .then((data) => {
        setStats(data.stats);
        setRecentActions(data.recentActions || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingState label="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!stats) return null;

  const cards = [
    { label: 'New Members This Week', value: stats.newUsersThisWeek, icon: Users, tone: 'text-info bg-info-subtle' },
    { label: 'Pending Moderation', value: stats.pendingModerationCount, icon: ShieldCheck, tone: 'text-warning bg-warning-subtle', href: '/admin/moderation' },
    { label: 'Upcoming Events', value: stats.totalEvents, icon: Calendar, tone: 'text-success bg-success-subtle' },
    { label: 'Member Growth (mo/mo)', value: `${stats.monthlyGrowth}%`, icon: TrendingUp, tone: 'text-accent bg-accent-subtle' },
  ];

  return (
    <div>
      <h1 className="mb-6 text-headline-md text-foreground">Dashboard</h1>

      <Grid cols={4} gap={4} className="mb-8">
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

      <Grid cols={2} gap={6}>
        <Card>
          <h2 className="mb-4 text-title-md text-foreground">Membership</h2>
          <dl className="space-y-3 text-body-sm">
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
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-title-md text-foreground">Recent Admin Actions</h2>
            <Link href="/admin/audit-log" className="flex items-center gap-1 text-caption text-accent hover:underline">
              <ScrollText className="h-3 w-3" /> View all
            </Link>
          </div>
          {recentActions.length === 0 ? (
            <p className="text-body-sm text-foreground-muted">No admin actions recorded yet.</p>
          ) : (
            <ul className="space-y-3 text-body-sm">
              {recentActions.slice(0, 6).map((entry) => (
                <li key={entry.id} className="border-b border-border pb-2 last:border-0">
                  <span className="text-foreground-muted">
                    <span className="font-medium text-foreground">{entry.actorEmail}</span> — {entry.action}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </Grid>
    </div>
  );
}
