'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Clock, MapPin, Link as LinkIcon, ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import { getSmallGroupById, SmallGroup } from '@/lib/content';
import { PageHero } from '@/components/ui-legacy/PageHero';
import { Section } from '@/components/ui-legacy/Section';
import { Card } from '@/components/ui-legacy/Card';
import { Badge } from '@/components/ui-legacy/Badge';
import { Input } from '@/components/ui-legacy/Input';
import { Textarea } from '@/components/ui-legacy/Textarea';
import { Button, LinkButton } from '@/components/ui-legacy/Button';
import { LoadingState, EmptyState } from '@/components/ui-legacy/States';

function parseResourceLinks(raw?: string): { title: string; url: string }[] {
  return (raw ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, url] = line.split('|').map((part) => part.trim());
      return { title: title || 'Resource', url: url || '' };
    })
    .filter((r) => r.url);
}

export default function SmallGroupDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const [group, setGroup] = useState<SmallGroup | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (!id) return;
    getSmallGroupById(id)
      .then(setGroup)
      .catch((error) => console.error('Error fetching small group:', error))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingState label="Loading group..." />;

  if (!group) {
    return (
      <Section spacing="lg">
        <EmptyState icon={Users} title="Group not found" description="This small group may have been removed or renamed." />
        <div className="mt-6 text-center">
          <LinkButton href="/small-groups" variant="outline">Back to Small Groups</LinkButton>
        </div>
      </Section>
    );
  }

  const resources = parseResourceLinks(group.resourceLinks);
  const isFull = typeof group.capacity === 'number' && typeof group.currentMembers === 'number' && group.currentMembers >= group.capacity;
  const spotsLeft = typeof group.capacity === 'number' && typeof group.currentMembers === 'number' ? Math.max(group.capacity - group.currentMembers, 0) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus('idle');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          message: formData.message || `I'd like to join the "${group.name}" small group.`,
          department: 'small-group-join',
          smallGroup: group.name,
          waitlist: isFull,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSubmitStatus('success');
        setFormData({ firstName: '', lastName: '', email: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting join request:', error);
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHero
        icon={<Users />}
        eyebrow={group.lifeStage || group.category || 'Small Group'}
        title={group.name}
        description={group.description}
        actions={<LinkButton href="/small-groups" variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>Back to Small Groups</LinkButton>}
      />

      <Section spacing="lg">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="flex flex-wrap gap-4 text-body-sm text-foreground-muted">
              {group.leaderName && <span className="flex items-center gap-2"><Users className="h-4 w-4" /> Led by {group.leaderName}</span>}
              {group.meetingSchedule && <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {group.meetingSchedule}</span>}
              {group.location && <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {group.location}</span>}
            </div>

            {spotsLeft !== null && (
              <Card variant="outline" padding="lg">
                <div className="flex items-center justify-between text-body-sm">
                  <span className="font-medium text-foreground">Group Capacity</span>
                  <span className="text-foreground-muted">{group.currentMembers} of {group.capacity} spots filled</span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-active">
                  <div
                    className={`h-full rounded-full ${isFull ? 'bg-danger' : 'bg-accent'}`}
                    style={{ width: `${Math.min(100, ((group.currentMembers ?? 0) / (group.capacity ?? 1)) * 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-body-sm text-foreground-muted">
                  {isFull ? 'This group is currently full — join the waitlist below.' : `${spotsLeft} ${spotsLeft === 1 ? 'spot' : 'spots'} left`}
                </p>
              </Card>
            )}

            {resources.length > 0 && (
              <div>
                <h2 className="text-title-lg text-foreground">Group Resources</h2>
                <ul className="mt-4 space-y-2">
                  {resources.map((resource) => (
                    <li key={resource.url}>
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-body-sm text-accent hover:text-accent-hover">
                        <LinkIcon className="h-4 w-4 shrink-0" /> {resource.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <Card variant="raised" padding="lg">
              <h2 className="text-title-md text-foreground">{isFull ? 'Join the Waitlist' : 'Request to Join'}</h2>
              {group.leaderEmail && (
                <a href={`mailto:${group.leaderEmail}`} className="mt-2 flex items-center gap-2 text-body-sm text-accent hover:text-accent-hover">
                  <Mail className="h-4 w-4" /> {group.leaderEmail}
                </a>
              )}
              {submitStatus === 'success' ? (
                <div className="py-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success-subtle">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  </div>
                  <p className="text-body-md font-medium text-foreground">{isFull ? "You're on the waitlist!" : 'Request sent!'}</p>
                  <p className="mt-1 text-body-sm text-foreground-muted">The group leader will be in touch soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input label="First Name" required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                    <Input label="Last Name" required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                  </div>
                  <Input label="Email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  <Textarea label="Message (optional)" rows={3} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
                  {submitStatus === 'error' && (
                    <p className="rounded-lg border border-danger/30 bg-danger-subtle p-3 text-body-sm text-danger">Something went wrong. Please try again.</p>
                  )}
                  <Button type="submit" fullWidth loading={submitting}>
                    {submitting ? 'Sending...' : isFull ? 'Join Waitlist' : 'Request to Join'}
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </Section>
    </div>
  );
}
