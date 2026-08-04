'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Heart, Users, Sparkles } from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Grid } from '@/components/ui/Grid';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

const CATEGORIES = ['all', 'healing', 'guidance', 'thanksgiving', 'family', 'work'];

export default function PrayerPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [prayerStats, setPrayerStats] = useState({ requests: 0, people: 0, prayers: 0 });
  const [formData, setFormData] = useState({
    title: '',
    category: 'general',
    description: '',
    isPrivate: false,
    isAnonymous: false,
    authorName: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch('/api/prayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        setFormData({ title: '', category: 'general', description: '', isPrivate: false, isAnonymous: false, authorName: '' });
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
        <Card variant="raised" padding="lg" className="mx-auto max-w-2xl text-center">
          <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 3, repeat: Infinity }}>
            <Heart className="mx-auto mb-4 h-12 w-12 text-warm" />
          </motion.div>
          <h2 className="text-title-lg text-foreground">Prayer requests will appear here</h2>
          <p className="mt-2 text-body-sm text-foreground-muted">Submit a prayer request to get started</p>
        </Card>
      </Section>

      <Section spacing="lg" className="bg-warm text-warm-foreground">
        <Grid cols={3} gap={6} className="text-center">
          {[
            { icon: Heart, value: prayerStats.requests > 0 ? `${prayerStats.requests}+` : '∞', label: 'Prayer Requests' },
            { icon: Users, value: prayerStats.people > 0 ? `${prayerStats.people}+` : '∞', label: 'People Praying' },
            { icon: Heart, value: prayerStats.prayers > 0 ? `${prayerStats.prayers}+` : '∞', label: 'Prayers Offered' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
              <stat.icon className="mx-auto mb-4 h-10 w-10 opacity-90" />
              <div className="text-display-sm">{stat.value}</div>
              <div className="mt-1 opacity-80">{stat.label}</div>
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
