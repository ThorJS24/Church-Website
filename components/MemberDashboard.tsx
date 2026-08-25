'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { User, Calendar, Heart, DollarSign, Book, Users, Bell, Settings, Download, Bookmark, Star, HandHeart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getIdToken } from '@/lib/firebase';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/states';
import { WelcomeTourModal } from '@/components/WelcomeTourModal';
import { cn } from '@/lib/utils';

interface DashboardStats {
  attendanceCount: number;
  prayerRequests: number;
  donationTotal: number;
  upcomingEvents: number;
  volunteerHours?: number;
  savedItems?: number;
}

interface ActivityEntry {
  type: string;
  title: string;
  date: string;
}

interface MinistryInvolvement {
  area: string;
  department: string;
  date: string;
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
  { icon: Users, label: 'Small Groups', href: '/small-groups' },
  { icon: HandHeart, label: 'Volunteer', href: '/volunteer' },
  { icon: Bookmark, label: 'My Library', href: '#saved' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

const ACTIVITY_ICONS: Record<string, typeof Calendar> = {
  prayer: Heart,
  volunteer: HandHeart,
  rating: Star,
  saved: Bookmark,
  ministry: Users,
};

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString();
}

export default function MemberDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({ attendanceCount: 0, prayerRequests: 0, donationTotal: 0, upcomingEvents: 0 });
  const [recentActivity, setRecentActivity] = useState<ActivityEntry[]>([]);
  const [ministryInvolvement, setMinistryInvolvement] = useState<MinistryInvolvement[]>([]);
  const [savedItems, setSavedItems] = useState<{ id: string; itemType: string; title: string; url: string }[]>([]);
  const [downloadingData, setDownloadingData] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);
  const [activityFilter, setActivityFilter] = useState<string>('all');

  useEffect(() => {
    if (user && !user.hasSeenWelcomeTour) setShowWelcomeTour(true);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    async function fetchDashboardData() {
      try {
        const token = await getIdToken();
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        const [dashRes, savedRes] = await Promise.all([
          fetch('/api/member/dashboard', { headers }),
          fetch('/api/member/saved', { headers }),
        ]);
        const data = await dashRes.json();
        if (data.success) {
          setStats(data.stats);
          setRecentActivity(data.recentActivity);
          setMinistryInvolvement(data.ministryInvolvement);
        }
        const savedData = await savedRes.json();
        if (savedData.success) setSavedItems(savedData.items);
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
      {/* Greeting strip with stats woven inline (small, secondary) instead
          of four large equal-weight cards competing with the actual
          content for top-of-page attention. */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-wrap items-end justify-between gap-6 border-b border-border pb-6">
        <div>
          <p className="font-mono text-caption font-semibold uppercase tracking-[0.1em] text-accent">Member Dashboard</p>
          <h1 className="mt-1 font-display text-headline-lg text-foreground">Welcome back, {user.firstName || user.displayName}</h1>
        </div>
        <div className="flex gap-6">
          {STAT_CARDS.map((stat) => (
            <div key={stat.key} className="text-right">
              <p className="font-mono text-title-lg text-foreground">{stat.prefix}{stats[stat.key]}</p>
              <p className="font-mono text-caption uppercase tracking-wide text-foreground-subtle">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick actions as a compact rail of bordered, flat-shape links —
          not a grid of cards competing for the same visual weight as real
          content below. */}
      <div className="mb-8 flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((action) => (
          <a
            key={action.label}
            href={action.href}
            className="flex items-center gap-2 border border-border bg-surface px-4 py-2 text-body-sm font-medium text-foreground-muted transition-colors hover:border-border-strong hover:text-foreground"
          >
            <action.icon className="h-4 w-4 text-accent" /> {action.label}
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-title-lg text-foreground">Activity Timeline</h2>
              {recentActivity.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {['all', ...Array.from(new Set(recentActivity.map((a) => a.type)))].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setActivityFilter(type)}
                      className={cn(
                        'border px-3 py-1 text-caption font-medium capitalize transition-colors',
                        activityFilter === type
                          ? 'border-accent bg-accent-subtle text-accent'
                          : 'border-border text-foreground-muted hover:border-border-strong hover:text-foreground'
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Card padding="none">
              {recentActivity.length > 0 ? (
                <div className="divide-y divide-border">
                  {recentActivity
                    .filter((activity) => activityFilter === 'all' || activity.type === activityFilter)
                    .map((activity, index) => {
                      const Icon = ACTIVITY_ICONS[activity.type] ?? Calendar;
                      return (
                        <div key={index} className="flex items-center gap-4 p-4">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-subtle">
                            <Icon className="h-4 w-4 text-accent" />
                          </div>
                          <div>
                            <p className="text-body-sm font-medium text-foreground">{activity.title}</p>
                            <p className="text-caption text-foreground-subtle">{timeAgo(activity.date)}</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <EmptyState icon={Calendar} title="No recent activity" description="Activity like prayer requests, volunteer hours, and saved sermons will show up here." />
              )}
            </Card>
          </div>

          <div id="saved" className="mt-8 scroll-mt-6">
            <h2 className="mb-4 font-display text-title-lg text-foreground">My Library</h2>
            <Card padding="none">
              {savedItems.length > 0 ? (
                <div className="divide-y divide-border">
                  {savedItems.map((item) => (
                    <a key={item.id} href={item.url} className="flex items-center gap-4 p-4 transition-colors hover:bg-surface-hover">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-subtle">
                        {item.itemType === 'sermon' ? <Book className="h-4 w-4 text-accent" /> : <Bookmark className="h-4 w-4 text-accent" />}
                      </div>
                      <p className="text-body-sm font-medium text-foreground">{item.title}</p>
                    </a>
                  ))}
                </div>
              ) : (
                <EmptyState icon={Bookmark} title="Nothing saved yet" description="Save sermons and blog posts to find them here later." />
              )}
            </Card>
          </div>
        </div>

        <div>
          <h2 className="mb-4 font-display text-title-lg text-foreground">Profile &amp; Security</h2>
          <Card>
            <div className="mb-6 flex items-center gap-4">
              <Avatar name={`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email} size="lg" />
              <div>
                <h3 className="font-display text-title-sm text-foreground">{user.firstName} {user.lastName}</h3>
                <p className="text-body-sm text-foreground-muted">{user.email}</p>
                <p className="font-mono text-caption uppercase tracking-wide text-accent">{user.role}</p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleDownloadData}
                disabled={downloadingData}
                className="flex w-full items-center justify-between border border-border p-3 transition-colors hover:bg-surface-hover disabled:opacity-50"
              >
                <span className="flex items-center gap-3 text-body-sm font-medium text-foreground"><Download className="h-4 w-4 text-foreground-muted" /> Download Data</span>
                <span className="text-caption text-foreground-subtle">{downloadingData ? 'Preparing...' : 'GDPR'}</span>
              </button>
              {downloadError && <p className="text-caption text-danger">{downloadError}</p>}

              <button onClick={() => router.push('/settings')} className="flex w-full items-center justify-between border border-border p-3 transition-colors hover:bg-surface-hover">
                <span className="flex items-center gap-3 text-body-sm font-medium text-foreground"><Bell className="h-4 w-4 text-foreground-muted" /> Notifications</span>
                <span className="text-caption text-foreground-subtle">Manage</span>
              </button>
            </div>
          </Card>

          <div className="mt-6">
            <h2 className="mb-4 font-display text-title-lg text-foreground">Ministry Involvement</h2>
            <Card>
              {ministryInvolvement.length > 0 ? (
                <ul className="space-y-3">
                  {ministryInvolvement.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Users className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <div>
                        <p className="text-body-sm font-medium text-foreground">{item.area}</p>
                        <p className="text-caption text-foreground-subtle">{timeAgo(item.date)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-body-sm text-foreground-muted">
                  You haven&apos;t reached out about a ministry or small group yet — <Link href="/ministries" className="text-accent underline">browse ministries</Link> to get started.
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>

      {showWelcomeTour && <WelcomeTourModal onClose={() => setShowWelcomeTour(false)} />}
    </Container>
  );
}
