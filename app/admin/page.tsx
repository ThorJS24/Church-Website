'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, ShieldCheck, Calendar, TrendingUp, ScrollText } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { LoadingState, ErrorState } from '@/components/admin/States';

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
    { label: 'New Members This Week', value: stats.newUsersThisWeek, icon: Users, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' },
    { label: 'Pending Moderation', value: stats.pendingModerationCount, icon: ShieldCheck, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30', href: '/admin/moderation' },
    { label: 'Upcoming Events', value: stats.totalEvents, icon: Calendar, color: 'text-green-600 bg-green-50 dark:bg-green-900/30' },
    { label: 'Member Growth (mo/mo)', value: `${stats.monthlyGrowth}%`, icon: TrendingUp, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => {
          const content = (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{card.label}</div>
            </div>
          );
          return card.href ? (
            <Link key={card.label} href={card.href}>{content}</Link>
          ) : (
            <div key={card.label}>{content}</div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Membership</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Total members</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{stats.totalUsers}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Active</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{stats.activeUsers}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">New this month</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{stats.newUsersThisMonth}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Prayer requests (all time)</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{stats.prayerRequests}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent Admin Actions</h2>
            <Link href="/admin/audit-log" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <ScrollText className="w-3 h-3" /> View all
            </Link>
          </div>
          {recentActions.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No admin actions recorded yet.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {recentActions.slice(0, 6).map((entry) => (
                <li key={entry.id} className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0">
                  <span className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">{entry.actorEmail}</span> — {entry.action}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
