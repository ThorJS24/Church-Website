'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Heart, Users, Sparkles, HandHeart, CheckCircle2, Archive } from 'lucide-react';
import { getIdToken } from '@/lib/firebase';
import { PageHero } from '@/components/ui/page-hero';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { Grid } from '@/components/ui/grid';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { LoadingState, EmptyState } from '@/components/ui/states';
import { useToast } from '@/lib/toast';
import { cn } from '@/lib/utils';

const CATEGORIES = ['all', 'healing', 'guidance', 'thanksgiving', 'family', 'work'];

interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  isAnonymous: boolean;
  authorName: string;
  status: 'praying' | 'ongoing' | 'answered';
  prayerTally?: number;
  answeredNote?: string;
  createdAt: string;
}

export default function PrayerPage() {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'wall' | 'answered'>('wall');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [prayerStats, setPrayerStats] = useState({ requests: 0, people: 0, prayers: 0 });
  const [prayedIds, setPrayedIds] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    title: '',
    category: 'general',
    description: '',
    isPrivate: false,
    isAnonymous: false,
    authorName: '',
    email: '',
    followUpRequested: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch('/api/prayer')
      .then((res) => res.json())
      .then((data) => { if (data.success) setPrayers(data.prayerRequests); })
      .catch((error) => console.error('Error fetching prayer requests:', error))
      .finally(() => setLoading(false));

    async function fetchPrayerStats() {
      try {
        const { getSiteSettings } = await import('@/lib/content');
        const stats = await getSiteSettings();
        if (stats?.prayerStats) {
          setPrayerStats({
            requests: stats.prayerStats.totalRequests || 0,
            people: stats.prayerStats.totalPeople || 0,
            prayers: stats.prayerStats.totalPrayers || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching prayer stats:', error);
      }
    }
    fetchPrayerStats();
  }, []);

  const activePrayers = useMemo(() => prayers.filter((p) => p.status !== 'answered'), [prayers]);
  const answeredPrayers = useMemo(() => prayers.filter((p) => p.status === 'answered'), [prayers]);

  const visiblePrayers = (view === 'wall' ? activePrayers : answeredPrayers).filter(
    (p) => activeFilter === 'all' || p.category === activeFilter
  );

  const handlePray = async (id: string) => {
    if (prayedIds.has(id)) return;
    setPrayedIds((prev) => new Set(prev).add(id));
    setPrayers((prev) => prev.map((p) => (p.id === id ? { ...p, prayerTally: (p.prayerTally ?? 0) + 1 } : p)));
    try {
      const res = await fetch('/api/prayer/pray', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: id }),
      });
      const data = await res.json();
      if (data.success) {
        setPrayers((prev) => prev.map((p) => (p.id === id ? { ...p, prayerTally: data.prayerTally } : p)));
      }
    } catch {
      // optimistic count stands even if the network call failed silently —
      // a missed increment on a "someone is praying for you" tally isn't
      // worth surfacing an error toast over.
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.followUpRequested && !formData.email) {
      toast({ title: 'Email needed', description: 'Please add an email so we can follow up with you.', variant: 'warning' });
      return;
    }
    setSubmitting(true);
    try {
      const token = await getIdToken();
      const response = await fetch('/api/prayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        setFormData({ title: '', category: 'general', description: '', isPrivate: false, isAnonymous: false, authorName: '', email: '', followUpRequested: false });
        toast({ title: 'Prayer request submitted', description: 'Thank you — our community will be lifting you up.', variant: 'success' });
      } else {
        toast({ title: 'Something went wrong', description: data.message || 'Failed to submit prayer request', variant: 'danger' });
      }
    } catch {
      toast({ title: 'Something went wrong', description: 'An error occurred. Please try again.', variant: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHero
        icon={<Sparkles />}
        eyebrow="Prayer Wall"
        title="Prayer Requests"
        description="Share your prayer needs and join us in lifting each other up"
        actions={<Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowModal(true)}>Submit Prayer Request</Button>}
      />

      <div className="border-b border-border bg-background py-6">
        <div className="mx-auto mb-4 flex max-w-7xl justify-center gap-2 px-4">
          <button
            onClick={() => setView('wall')}
            className={cn('flex items-center gap-1.5 rounded-full px-5 py-2 text-body-sm font-medium transition-colors', view === 'wall' ? 'bg-warm text-warm-foreground' : 'bg-surface-active text-foreground-muted hover:bg-surface-hover')}
          >
            <HandHeart className="h-4 w-4" /> Prayer Wall
          </button>
          <button
            onClick={() => setView('answered')}
            className={cn('flex items-center gap-1.5 rounded-full px-5 py-2 text-body-sm font-medium transition-colors', view === 'answered' ? 'bg-warm text-warm-foreground' : 'bg-surface-active text-foreground-muted hover:bg-surface-hover')}
          >
            <Archive className="h-4 w-4" /> Answered Prayers {answeredPrayers.length > 0 && `(${answeredPrayers.length})`}
          </button>
        </div>
        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-3 px-4">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`rounded-full px-5 py-2 text-body-sm font-medium capitalize transition-colors ${
                activeFilter === category ? 'bg-warm text-warm-foreground' : 'bg-surface-active text-foreground-muted hover:bg-surface-hover'
              }`}
            >
              {category === 'all' ? 'All Prayers' : category}
            </button>
          ))}
        </div>
      </div>

      <Section spacing="lg">
        {loading ? (
          <LoadingState label="Loading prayer requests..." />
        ) : visiblePrayers.length === 0 ? (
          <Card variant="raised" padding="lg" className="mx-auto max-w-2xl text-center">
            <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 3, repeat: Infinity }}>
              <Heart className="mx-auto mb-4 h-12 w-12 text-warm" />
            </motion.div>
            <h2 className="text-title-lg text-foreground">
              {view === 'answered' ? 'No answered prayers yet' : 'No prayer requests yet'}
            </h2>
            <p className="mt-2 text-body-sm text-foreground-muted">
              {view === 'answered' ? 'Check back soon to celebrate what God has done.' : 'Submit a prayer request to get started'}
            </p>
          </Card>
        ) : (
          <Grid cols={2} gap={6}>
            <AnimatePresence>
              {visiblePrayers.map((prayer) => (
                <motion.div key={prayer.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} layout>
                  <Card variant="raised" padding="lg" className="h-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="accent" className="capitalize">{prayer.category}</Badge>
                      {prayer.status === 'ongoing' && <Badge variant="info">Ongoing</Badge>}
                      {prayer.status === 'answered' && <Badge variant="success"><CheckCircle2 className="h-3 w-3" /> Answered</Badge>}
                    </div>
                    <h3 className="mt-3 text-title-md text-foreground">{prayer.title}</h3>
                    <p className="mt-2 text-body-sm text-foreground-muted">{prayer.description}</p>
                    {prayer.status === 'answered' && prayer.answeredNote && (
                      <div className="mt-3 rounded-lg border border-success/30 bg-success-subtle p-3 text-body-sm text-success">
                        {prayer.answeredNote}
                      </div>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-body-sm text-foreground-subtle">— {prayer.isAnonymous ? 'Anonymous' : prayer.authorName}</span>
                      {prayer.status !== 'answered' ? (
                        <motion.button
                          onClick={() => handlePray(prayer.id)}
                          disabled={prayedIds.has(prayer.id)}
                          whileTap={{ scale: 0.88 }}
                          animate={prayedIds.has(prayer.id) ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                          className={cn(
                            'relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-body-sm font-medium transition-colors',
                            prayedIds.has(prayer.id) ? 'bg-warm text-warm-foreground' : 'bg-surface-active text-foreground-muted hover:bg-warm-subtle hover:text-warm'
                          )}
                        >
                          <HandHeart className="h-4 w-4" /> {prayedIds.has(prayer.id) ? "I'm Praying" : 'Pray for This'} ({prayer.prayerTally ?? 0})
                          <AnimatePresence>
                            {prayedIds.has(prayer.id) && (
                              <motion.span
                                key="burst"
                                initial={{ opacity: 1, y: 0, scale: 0.6 }}
                                animate={{ opacity: 0, y: -24, scale: 1.4 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                                className="pointer-events-none absolute -top-1 right-2 text-warm"
                                aria-hidden="true"
                              >
                                <Heart className="h-4 w-4 fill-current" />
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      ) : (
                        <span className="flex items-center gap-1.5 text-body-sm text-foreground-subtle">
                          <HandHeart className="h-4 w-4" /> {prayer.prayerTally ?? 0} prayed
                        </span>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </Grid>
        )}
      </Section>

      <Section spacing="lg" className="bg-warm text-warm-foreground">
        <Grid cols={3} gap={6} className="text-center">
          {[
            { icon: Heart, value: prayerStats.requests > 0 ? `${prayerStats.requests}+` : '∞', label: 'Prayer Requests' },
            { icon: Users, value: prayerStats.people > 0 ? `${prayerStats.people}+` : '∞', label: 'People Praying' },
            { icon: Heart, value: prayerStats.prayers > 0 ? `${prayerStats.prayers}+` : '∞', label: 'Prayers Offered' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-xs">
              <stat.icon className="mx-auto mb-4 h-10 w-10 opacity-90" />
              <div className="text-display-sm">{stat.value}</div>
              <div className="mt-1 text-body-sm">{stat.label}</div>
            </div>
          ))}
        </Grid>
      </Section>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Submit Prayer Request">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Prayer Title" required placeholder="Enter a title for your prayer request" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          <Select
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            options={[
              { value: 'general', label: 'General' },
              { value: 'healing', label: 'Healing' },
              { value: 'guidance', label: 'Guidance' },
              { value: 'thanksgiving', label: 'Thanksgiving' },
              { value: 'family', label: 'Family' },
              { value: 'work', label: 'Work' },
            ]}
          />
          <Textarea label="Prayer Request" required rows={4} placeholder="Share your prayer request..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />

          <div className="space-y-3">
            <Checkbox label="Submit anonymously" checked={formData.isAnonymous} onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })} />
            {!formData.isAnonymous && (
              <Input placeholder="Your name (optional)" value={formData.authorName} onChange={(e) => setFormData({ ...formData, authorName: e.target.value })} />
            )}
            <Checkbox label="Keep this prayer private (only pastors will see it)" checked={formData.isPrivate} onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })} />
            <Checkbox
              label="Request a private follow-up check-in in about a week"
              checked={formData.followUpRequested}
              onChange={(e) => setFormData({ ...formData, followUpRequested: e.target.checked })}
            />
            {formData.followUpRequested && (
              <Input
                type="email"
                required
                placeholder="Your email for the follow-up"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" fullWidth onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" variant="warm" fullWidth loading={submitting}>Submit Prayer</Button>
          </div>
        </form>
      </Modal>

      <Section spacing="lg" className="bg-warm-subtle">
        <Container size="sm" className="text-center">
          <h2 className="text-headline-md text-foreground">The Power of Prayer</h2>
          <blockquote className="mx-auto mt-6 max-w-2xl text-body-lg italic text-foreground">
            &quot;Therefore I tell you, whatever you ask for in prayer, believe that you have received it, and it will be yours.&quot;
          </blockquote>
          <cite className="mt-3 block text-body-sm font-semibold text-warm">Mark 11:24</cite>
          <p className="mx-auto mt-6 max-w-2xl text-body-md leading-relaxed text-foreground-muted">
            We believe in the power of prayer and the strength that comes from praying together as a community. Your prayers matter, and we are honored to lift each other up before God.
          </p>
        </Container>
      </Section>
    </div>
  );
}
