'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, Heart, DollarSign, Book, Users, Bell, Settings, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getIdToken } from '@/lib/firebase';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Grid } from '@/components/ui/Grid';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/States';

interface DashboardStats {
  attendanceCount: number;
  prayerRequests: number;
  donationTotal: number;
  upcomingEvents: number;
}

const STAT_CARDS = [
  { key: 'attendanceCount' as const, icon: Calendar, label: 'Services Attended', color: 'text-info' },
  { key: 'prayerRequests' as const, icon: Heart, label: 'Prayer Requests', color: 'text-danger' },
  { key: 'donationTotal' as const, icon: DollarSign, label: 'Total Given', color: 'text-success', prefix: '₹' },
  { key: 'upcomingEvents' as const, icon: Calendar, label: 'Upcoming Events', color: 'text-accent' },
];

const QUICK_ACTIONS = [
  { icon: Calendar, label: 'View Events', href: '/events' },
  { icon: Heart, label: 'Prayer Requests', href: '/prayer' },
  { icon: DollarSign, label: 'Give Online', href: '/give' },
  { icon: Book, label: 'Sermons', href: '/sermons' },
  { icon: Users, label: 'Small Groups', href: '/ministries' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function MemberDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({ attendanceCount: 0, prayerRequests: 0, donationTotal: 0, upcomingEvents: 0 });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [downloadingData, setDownloadingData] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  useEffect(() => {
    if (!user) return;
    async function fetchDashboardData() {
      try {
        const token = await getIdToken();
        const response = await fetch('/api/member/dashboard', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
          setRecentActivity(data.recentActivity);
        }
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
      }
    }
    fetchDashboardData();
  }, [user]);

  const handleDownloadData = async () => {
    setDownloadingData(true);
    setDownloadError('');
    try {
      const token = await getIdToken();
      const response = await fetch('/api/privacy/download-data', { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my-church-data.json';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Data download error:', error);
      setDownloadError('Could not download your data. Please try again.');
    } finally {
      setDownloadingData(false);
    }
  };

  if (!user) {
    return (
      <Container size="sm" className="flex min-h-[60vh] items-center justify-center text-center">
        <h2 className="text-headline-sm text-foreground">Please log in to access your dashboard</h2>
      </Container>
    );
  }

  return (
    <Container size="lg" className="py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-headline-lg text-foreground">Welcome back, {user.firstName || user.displayName}!</h1>
        <p className="mt-2 text-body-md text-foreground-muted">Here&apos;s what&apos;s happening in your church community</p>
      </motion.div>

      <Grid cols={4} gap={6} className="mb-8">
        {STAT_CARDS.map((stat, index) => (
          <motion.div key={stat.key} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}>
            <Card variant="raised" className="flex items-center gap-4">
              <stat.icon className={`h-8 w-8 shrink-0 ${stat.color}`} />
              <div>
                <p className="text-body-sm text-foreground-muted">{stat.label}</p>
                <p className="text-title-lg text-foreground">{stat.prefix}{stats[stat.key]}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </Grid>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-title-lg text-foreground">Quick Actions</h2>
          <Grid cols={3} gap={4}>
            {QUICK_ACTIONS.map((action, index) => (
              <motion.a
                key={action.label}
                href={action.href}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="block"
              >
                <Card variant="interactive" className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-subtle">
                    <action.icon className="h-6 w-6 text-accent" />
                  </div>
                  <p className="text-body-sm font-medium text-foreground">{action.label}</p>
                </Card>
              </motion.a>
            ))}
          </Grid>

          <div className="mt-8">
            <h2 className="mb-4 text-title-lg text-foreground">Recent Activity</h2>
            <Card padding="none">
              {recentActivity.length > 0 ? (
                <div className="divide-y divide-border">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 p-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-subtle">
                        <Calendar className="h-4 w-4 text-accent" />
                      </div>
                      <div>
                        <p className="text-body-sm font-medium text-foreground">{activity.title}</p>
                        <p className="text-caption text-foreground-subtle">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={Calendar} title="No recent activity" />
              )}
            </Card>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-title-lg text-foreground">Profile &amp; Security</h2>
          <Card>
            <div className="mb-6 flex items-center gap-4">
              <Avatar name={`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email} size="lg" />
              <div>
                <h3 className="text-title-sm text-foreground">{user.firstName} {user.lastName}</h3>
                <p className="text-body-sm text-foreground-muted">{user.email}</p>
                <p className="text-body-sm capitalize text-accent">{user.role}</p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleDownloadData}
                disabled={downloadingData}
                className="flex w-full items-center justify-between rounded-lg bg-surface p-3 transition-colors hover:bg-surface-hover disabled:opacity-50"
              >
                <span className="flex items-center gap-3 text-body-sm font-medium text-foreground"><Download className="h-4 w-4 text-foreground-muted" /> Download Data</span>
                <span className="text-caption text-foreground-subtle">{downloadingData ? 'Preparing...' : 'GDPR'}</span>
              </button>
              {downloadError && <p className="text-caption text-danger">{downloadError}</p>}

              <button onClick={() => router.push('/settings')} className="flex w-full items-center justify-between rounded-lg bg-surface p-3 transition-colors hover:bg-surface-hover">
                <span className="flex items-center gap-3 text-body-sm font-medium text-foreground"><Bell className="h-4 w-4 text-foreground-muted" /> Notifications</span>
                <span className="text-caption text-foreground-subtle">Manage</span>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </Container>
  );
}
